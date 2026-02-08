const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const db = require('../database');
const { sendEmailNotification, emailTemplates } = require('../notificationService');
const { SECRET_KEY } = require('../middleware/auth');

// In-memory OTP storage
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

// Register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

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

        const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: "User created", token, user: { name, email } });
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

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
router.post('/demo-login', (req, res) => {
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
router.post('/send-otp', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail], async (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }

        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + (10 * 60 * 1000);

        otpStore.set(normalizedEmail, {
            otp,
            userData: { name, email: normalizedEmail, password },
            expiresAt
        });

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
            otpStore.delete(normalizedEmail);
            console.error(`[OTP] Failed to send email: ${emailResult.error}`);
            res.status(500).json({
                error: emailResult.error || "Failed to send OTP email. Please try again.",
                details: "Check server email configuration"
            });
        }
    });
});

// Verify OTP and complete registration
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Missing email or OTP" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedData = otpStore.get(normalizedEmail);

    if (!storedData) {
        return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    }

    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (storedData.otp !== otp.trim()) {
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

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

        otpStore.delete(normalizedEmail);

        const token = jwt.sign({ id: this.lastID, email: normalizedEmail }, SECRET_KEY, { expiresIn: '24h' });

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
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.redirect(`http://localhost:3000/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}`);
  }
);

module.exports = router;
