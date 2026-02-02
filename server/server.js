const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cron = require('node-cron');
const { sendEmailNotification, sendSMSNotification, generateDomainExpiryEmail, generateSSLExpiryEmail, emailTemplates } = require('./notificationService');
const { isDomainCached, getCachedDomain, refreshDomainCache, getAllCachedDomains, shouldRefreshCache, TOP_50_DOMAINS } = require('./domainCache');

const app = express();
const PORT = process.env.PORT || 5000;
const WHOXY_API_KEY = process.env.WHOXY_API_KEY;
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY;
const SECRET_KEY = process.env.JWT_SECRET || "supervalidsecrekey123"; // In prod, use .env

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = profile.emails[0].value.toLowerCase().trim();

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
      if (err) return done(err);

      if (user) {
        // User exists, return user
        return done(null, user);
      } else {
        // Create new user
        const email = normalizedEmail;
        const name = profile.displayName;

        db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, 'google-oauth'], // Password placeholder for OAuth users
          function(err) {
            if (err) return done(err);

            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
              return done(err, newUser);
            });
          }
        );
      }
    });
  }
));

// === OTP Storage and Helper Functions ===
// In-memory OTP storage (email -> {otp, userData, expiresAt})
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
      console.log(`[OTP] Expired OTP removed for: ${email}`);
    }
  }
}, 5 * 60 * 1000);

// === Auth Endpoints ===

// Register
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    // Normalize email to lowercase for case-insensitive storage
    const normalizedEmail = email.toLowerCase().trim();

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [name, normalizedEmail, hashedPassword], function (err) {
        if (err) {
            console.error(err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: "Database error" });
        }

        // Generate token immediately for better UX
        const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: "User created", token, user: { name, email } });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [normalizedEmail], (err, user) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: "Login successful", token, user: { name: user.name, email: user.email } });
    });
});

// Demo Account Login
app.post('/api/demo-login', (req, res) => {
    // Create a demo user token (user ID = -1 for demo)
    const demoUser = {
        id: -1,
        name: 'Demo User',
        email: 'demo@domaincentral.com'
    };

    const token = jwt.sign(
        { id: demoUser.id, email: demoUser.email, isDemo: true },
        SECRET_KEY,
        { expiresIn: '24h' }
    );

    res.json({
        message: "Demo login successful",
        token,
        user: { name: demoUser.name, email: demoUser.email }
    });
});

// Send OTP for email verification
app.post('/api/send-otp', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail], async (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }

        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

        // Store OTP with user data
        otpStore.set(normalizedEmail, {
            otp,
            userData: { name, email: normalizedEmail, password },
            expiresAt
        });

        // Send OTP email using branded template
        const emailHTML = emailTemplates.verificationEmail(otp, 10);

        const emailResult = await sendEmailNotification(
            normalizedEmail,
            'Verify Your Email - Domain Dashboard',
            emailHTML
        );

        if (emailResult.success) {
            console.log(`[OTP] Sent OTP to ${normalizedEmail}`);
            res.json({
                message: "OTP sent successfully",
                email: normalizedEmail
            });
        } else {
            otpStore.delete(normalizedEmail); // Clean up if email fails
            console.error(`[OTP] Failed to send email: ${emailResult.error}`);
            res.status(500).json({
                error: emailResult.error || "Failed to send OTP email. Please try again.",
                details: "Check server email configuration"
            });
        }
    });
});

// Verify OTP and complete registration
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Missing email or OTP" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedData = otpStore.get(normalizedEmail);

    if (!storedData) {
        return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // Verify OTP
    if (storedData.otp !== otp.trim()) {
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // OTP is valid, create user account
    const { name, password } = storedData.userData;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [name, normalizedEmail, hashedPassword], function (err) {
        if (err) {
            console.error(err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: "Database error" });
        }

        // Clear OTP from storage
        otpStore.delete(normalizedEmail);

        // Generate token for automatic login
        const token = jwt.sign({ id: this.lastID, email: normalizedEmail }, SECRET_KEY, { expiresIn: '24h' });

        // Send welcome email (non-blocking)
        sendEmailNotification(
            normalizedEmail,
            'Welcome to Domain Dashboard!',
            emailTemplates.welcomeEmail(name)
        ).then(() => {
            console.log(`[Welcome] Welcome email sent to ${normalizedEmail}`);
        }).catch(err => {
            console.log(`[Welcome] Failed to send welcome email: ${err.message}`);
        });

        console.log(`[Registration] User created with email verification: ${normalizedEmail}`);
        res.json({
            message: "Email verified and account created successfully",
            token,
            user: { name, email: normalizedEmail }
        });
    });
});

// Google OAuth Routes
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),
  (req, res) => {
    // Successful authentication
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`);
  }
);

// === Middleware ===
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// === Domain Endpoints ===

// Get User's Domains
app.get('/api/domains', authenticateToken, async (req, res) => {
    // Check if demo account
    if (req.user.id === -1 || req.user.isDemo) {
        try {
            const cachedDomains = await getAllCachedDomains();

            // Transform cached domains to match user domain format
            const domains = cachedDomains.map(row => ({
                id: row.id,
                user_id: -1,
                name: row.name,
                created: row.created_date,
                created_date: row.created_date,
                expires: row.expiry_date,
                expiry_date: row.expiry_date,
                registrar: row.registrar,
                status: row.status,
                full_details: row.full_details,
                fullDetails: JSON.parse(row.full_details || '{}')
            }));

            return res.json(domains);
        } catch (error) {
            console.error('Error fetching cached domains:', error);
            return res.status(500).json({ error: "Error loading demo data" });
        }
    }

    // Regular user - fetch their domains
    const sql = `SELECT * FROM domains WHERE user_id = ?`;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });

        // Parse the JSON string back to object
        const domains = rows.map(row => ({
            ...row,
            fullDetails: JSON.parse(row.full_details || '{}')
        }));
        res.json(domains);
    });
});

// Save a Domain
app.post('/api/domains', authenticateToken, (req, res) => {
    // Prevent demo users from adding domains
    if (req.user.id === -1 || req.user.isDemo) {
        return res.status(403).json({ error: 'Demo account cannot add domains. Please create a free account to manage your own domains.' });
    }

    const { name, created_date, expiry_date, registrar, status, fullDetails } = req.body;

    // Normalize domain name (lowercase, remove www., trim whitespace)
    const normalizedName = name.toLowerCase().trim().replace(/^www\./, '');

    // Check if domain already exists for this user (case-insensitive)
    const checkSql = `SELECT id, name FROM domains WHERE user_id = ? AND LOWER(REPLACE(name, 'www.', '')) = ?`;
    db.get(checkSql, [req.user.id, normalizedName], (err, existing) => {
        if (err) {
            console.error('Error checking for duplicate:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (existing) {
            return res.status(409).json({
                error: `This domain is already in your dashboard as "${existing.name}"`,
                domainId: existing.id
            });
        }

        // Insert the new domain
        const sql = `INSERT INTO domains (user_id, name, created_date, expiry_date, registrar, status, full_details) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            req.user.id,
            name,
            created_date,
            expiry_date,
            registrar,
            status,
            JSON.stringify(fullDetails)
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to save domain" });
            }
            res.json({ id: this.lastID, message: "Domain saved" });
        });
    });
});

// Delete a Domain
app.delete('/api/domains/:id', authenticateToken, (req, res) => {
    // Prevent demo users from deleting domains
    if (req.user.id === -1 || req.user.isDemo) {
        return res.status(403).json({ error: 'Demo account cannot delete domains. Please create a free account to manage your own domains.' });
    }

    const sql = `DELETE FROM domains WHERE id = ? AND user_id = ?`;
    db.run(sql, [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Domain deleted" });
    });
});

// Endpoint to fetch Whois data (Public but usually called by authenticated user)
app.get('/api/whois/:domain', async (req, res) => {
    const { domain } = req.params;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    // Check if domain is in the top 50 and return cached data
    try {
        const cachedDomain = await getCachedDomain(domain);
        if (cachedDomain) {
            console.log(`📦 Serving cached data for ${domain}`);
            const fullDetails = JSON.parse(cachedDomain.full_details);
            return res.json({
                ...fullDetails,
                cached: true,
                last_updated: cachedDomain.last_updated
            });
        }
    } catch (error) {
        console.error('Error checking cache:', error);
    }

    // If not cached, fetch from API
    if (!WHOXY_API_KEY) {
        console.error('[Config Error] WHOXY_API_KEY is missing from .env');
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    try {
        console.log(`🌐 Fetching fresh data for ${domain}`);
        const url = `http://api.whoxy.com/?key=${WHOXY_API_KEY}&whois=${domain}`;
        const response = await axios.get(url);

        console.log(`[Whoxy] Fetching ${domain} | Status: ${response.data.status}`);

        if (response.data.status !== 1) {
            console.warn(`[Whoxy Error] Response for ${domain}:`, JSON.stringify(response.data, null, 2));
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Whoxy:', error.message);
        res.status(500).json({ error: 'Failed to fetch domain data' });
    }
});

// Endpoint to fetch PageSpeed Insights
app.get('/api/pagespeed/:domain', async (req, res) => {
    const { domain } = req.params;
    if (!domain) return res.status(400).json({ error: "Domain required" });

    // Debug API Key (don't log full key)
    console.log(`[PageSpeed] Request for ${domain}`);
    console.log(`[PageSpeed] Key Configured: ${PAGESPEED_API_KEY ? 'Yes' : 'No'}`);

    try {
        const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${domain}&strategy=mobile&key=${PAGESPEED_API_KEY}`;
        const response = await axios.get(url);
        
        // Extract key metrics only
        const lhs = response.data.lighthouseResult;
        const metrics = {
            score: lhs.categories.performance.score * 100,
            fcp: lhs.audits['first-contentful-paint'].displayValue,
            lcp: lhs.audits['largest-contentful-paint'].displayValue,
            cls: lhs.audits['cumulative-layout-shift'].displayValue,
            speedIndex: lhs.audits['speed-index'].displayValue
        };

        res.json(metrics);
    } catch (err) {
        console.error("[PageSpeed] API Request Failed:", err.response ? err.response.data : err.message);
        res.status(500).json({ error: "Failed to fetch PageSpeed data", details: err.message });
    }
});

// === Notification Endpoints ===

// Get user notification preferences
app.get('/api/notifications/preferences', authenticateToken, (req, res) => {
    db.get('SELECT email_notifications, sms_notifications, phone FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            emailNotifications: user.email_notifications === 1,
            smsNotifications: user.sms_notifications === 1,
            phone: user.phone || ''
        });
    });
});

// Update user notification preferences
app.put('/api/notifications/preferences', authenticateToken, (req, res) => {
    const { emailNotifications, smsNotifications, phone } = req.body;

    db.run(
        'UPDATE users SET email_notifications = ?, sms_notifications = ?, phone = ? WHERE id = ?',
        [emailNotifications ? 1 : 0, smsNotifications ? 1 : 0, phone || null, req.user.id],
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Preferences updated successfully' });
        }
    );
});

// Test notification endpoint
app.post('/api/notifications/test', authenticateToken, async (req, res) => {
    const { type } = req.body; // 'email' or 'sms'

    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (type === 'email') {
            const result = await sendEmailNotification(
                user.email,
                'Test Notification - Domain Dashboard',
                '<h2>Test Email</h2><p>This is a test notification from Domain Dashboard. Your email notifications are working!</p>'
            );
            res.json(result);
        } else if (type === 'sms') {
            if (!user.phone) {
                return res.status(400).json({ error: 'Phone number not set' });
            }
            const result = await sendSMSNotification(
                user.phone,
                'Test SMS from Domain Dashboard. Your SMS notifications are working!'
            );
            res.json(result);
        } else {
            res.status(400).json({ error: 'Invalid notification type' });
        }
    });
});

// Endpoint to check SSL certificate status
app.get('/api/ssl/:domain', async (req, res) => {
    const { domain } = req.params;
    if (!domain) return res.status(400).json({ error: "Domain required" });

    console.log(`[SSL Check] Request for ${domain}`);

    try {
        const https = require('https');
        const url = `https://${domain}`;

        const checkCertificate = new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                method: 'GET',
                rejectUnauthorized: false, // Allow checking even invalid certs
                agent: false
            };

            const request = https.get(options, (response) => {
                const cert = response.socket.getPeerCertificate();

                if (!cert || Object.keys(cert).length === 0) {
                    reject(new Error('No certificate found'));
                    return;
                }

                const now = new Date();
                const validFrom = new Date(cert.valid_from);
                const validTo = new Date(cert.valid_to);
                const isValid = now >= validFrom && now <= validTo;
                const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

                resolve({
                    valid: isValid,
                    issuer: cert.issuer.O || cert.issuer.CN || 'Unknown',
                    subject: cert.subject.CN || domain,
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    daysRemaining: daysRemaining,
                    serialNumber: cert.serialNumber,
                    fingerprint: cert.fingerprint
                });

                response.destroy();
            });

            request.on('error', (err) => {
                reject(err);
            });

            request.setTimeout(5000, () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });

        const certInfo = await checkCertificate;
        res.json(certInfo);

    } catch (err) {
        console.error("[SSL Check] Failed:", err.message);
        res.status(500).json({
            error: "Failed to check SSL certificate",
            details: err.message,
            valid: false
        });
    }
});

// === Scheduled Notifications ===
// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running scheduled notification check...');

    db.all('SELECT * FROM users WHERE email_notifications = 1 OR sms_notifications = 1', [], async (err, users) => {
        if (err) {
            console.error('[Cron] Error fetching users:', err);
            return;
        }

        for (const user of users) {
            // Get user's domains
            db.all('SELECT * FROM domains WHERE user_id = ?', [user.id], async (err, domains) => {
                if (err || !domains || domains.length === 0) return;

                const expiringDomains = [];
                const expiringSSL = [];
                const https = require('https');

                for (const domain of domains) {
                    // Skip top 50 cached domains from notifications
                    if (TOP_50_DOMAINS.includes(domain.name)) {
                        continue;
                    }

                    // Check domain expiry
                    if (domain.expiry_date && domain.expiry_date !== 'N/A') {
                        const expiryDate = new Date(domain.expiry_date);
                        const today = new Date();
                        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                        if (diffDays <= 30 && diffDays > 0) {
                            expiringDomains.push({
                                name: domain.name,
                                daysUntilExpiry: diffDays,
                                expiryDate: domain.expiry_date
                            });
                        }
                    }

                    // Check SSL expiry
                    try {
                        const checkSSL = () => {
                            return new Promise((resolve, reject) => {
                                const request = https.get({
                                    hostname: domain.name,
                                    port: 443,
                                    method: 'GET',
                                    rejectUnauthorized: false,
                                    agent: false
                                }, (response) => {
                                    const cert = response.socket.getPeerCertificate();
                                    if (cert && Object.keys(cert).length > 0) {
                                        const validTo = new Date(cert.valid_to);
                                        const daysRemaining = Math.floor((validTo - new Date()) / (1000 * 60 * 60 * 24));
                                        resolve({ daysRemaining, validTo: cert.valid_to });
                                    } else {
                                        reject(new Error('No certificate'));
                                    }
                                    response.destroy();
                                });
                                request.on('error', () => reject());
                                request.setTimeout(3000, () => {
                                    request.destroy();
                                    reject();
                                });
                            });
                        };

                        const sslInfo = await checkSSL();
                        if (sslInfo.daysRemaining <= 30 && sslInfo.daysRemaining > 0) {
                            expiringSSL.push({
                                name: domain.name,
                                daysUntilExpiry: sslInfo.daysRemaining,
                                expiryDate: sslInfo.validTo
                            });
                        }
                    } catch (err) {
                        // Silently skip SSL check errors
                    }
                }

                // Send notifications
                if ((expiringDomains.length > 0 || expiringSSL.length > 0)) {
                    if (user.email_notifications && user.email) {
                        if (expiringDomains.length > 0) {
                            await sendEmailNotification(
                                user.email,
                                `Domain Expiry Alert - ${expiringDomains.length} domain(s) expiring soon`,
                                generateDomainExpiryEmail(expiringDomains)
                            );
                        }
                        if (expiringSSL.length > 0) {
                            await sendEmailNotification(
                                user.email,
                                `SSL Certificate Expiry Alert - ${expiringSSL.length} certificate(s) expiring soon`,
                                generateSSLExpiryEmail(expiringSSL)
                            );
                        }
                    }

                    if (user.sms_notifications && user.phone) {
                        const totalExpiring = expiringDomains.length + expiringSSL.length;
                        await sendSMSNotification(
                            user.phone,
                            `Domain Dashboard Alert: ${totalExpiring} item(s) expiring soon. Check your email for details.`
                        );
                    }
                }
            });
        }
    });
});

// === Domain Cache Management ===

// Get all cached domains (admin/debug endpoint)
app.get('/api/cached-domains', async (req, res) => {
    try {
        const cachedDomains = await getAllCachedDomains();
        res.json({
            count: cachedDomains.length,
            domains: cachedDomains.map(d => ({
                name: d.name,
                registrar: d.registrar,
                expiry_date: d.expiry_date,
                last_updated: d.last_updated
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cached domains' });
    }
});

// Manual cache refresh endpoint (admin only)
app.post('/api/refresh-cache', async (req, res) => {
    if (!WHOXY_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        console.log('🔄 Manual cache refresh initiated...');
        const result = await refreshDomainCache(WHOXY_API_KEY);
        res.json({
            message: 'Cache refresh completed',
            ...result
        });
    } catch (error) {
        console.error('Cache refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh cache' });
    }
});

// Check if specific domain is cached
app.get('/api/is-cached/:domain', async (req, res) => {
    try {
        const cachedDomain = await getCachedDomain(req.params.domain);
        res.json({
            domain: req.params.domain,
            cached: !!cachedDomain,
            isTopDomain: TOP_50_DOMAINS.includes(req.params.domain),
            lastUpdated: cachedDomain ? cachedDomain.last_updated : null
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check cache' });
    }
});

// === Cron Jobs ===

// Daily cache refresh at 8:00 AM
cron.schedule('0 8 * * *', async () => {
    console.log('\n⏰ [Cron] Starting scheduled cache refresh at 8:00 AM...');

    if (!WHOXY_API_KEY) {
        console.error('❌ Cannot refresh cache: API key not configured');
        return;
    }

    try {
        const needsRefresh = await shouldRefreshCache();
        if (needsRefresh) {
            const result = await refreshDomainCache(WHOXY_API_KEY);
            console.log(`✅ [Cron] Cache refresh completed: ${result.successCount} successful, ${result.failCount} failed`);
        } else {
            console.log('ℹ️  [Cron] Cache is still fresh, skipping refresh');
        }
    } catch (error) {
        console.error('❌ [Cron] Cache refresh failed:', error);
    }
});

// Initial cache check on server start
(async () => {
    if (WHOXY_API_KEY) {
        try {
            const needsRefresh = await shouldRefreshCache();
            if (needsRefresh) {
                console.log('\n🚀 Initializing domain cache on server start...');
                console.log('⚠️  This may take a few minutes for 50 domains...\n');
                const result = await refreshDomainCache(WHOXY_API_KEY);
                console.log(`\n✅ Initial cache setup completed: ${result.successCount} successful, ${result.failCount} failed\n`);
            } else {
                console.log('✅ Domain cache is already up to date');
            }
        } catch (error) {
            console.error('❌ Error during initial cache setup:', error);
        }
    } else {
        console.warn('⚠️  WHOXY_API_KEY not configured - domain cache will not be available');
    }
})();

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log('📅 [Cron] Daily notification job scheduled for 9:00 AM');
    console.log('📅 [Cron] Daily cache refresh scheduled for 8:00 AM');
    console.log(`📦 Top ${TOP_50_DOMAINS.length} domains will be cached for instant access\n`);
});
