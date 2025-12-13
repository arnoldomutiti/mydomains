const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const WHOXY_API_KEY = process.env.WHOXY_API_KEY;
const SECRET_KEY = process.env.JWT_SECRET || "supervalidsecrekey123"; // In prod, use .env

app.use(cors());
app.use(express.json());

// === Auth Endpoints ===

// Register
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, hashedPassword], function (err) {
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

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ message: "Login successful", token, user: { name: user.name, email: user.email } });
    });
});

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
app.get('/api/domains', authenticateToken, (req, res) => {
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
    const { name, created_date, expiry_date, registrar, status, fullDetails } = req.body;
    
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

// Delete a Domain
app.delete('/api/domains/:id', authenticateToken, (req, res) => {
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

    if (!WHOXY_API_KEY) {
        console.error('[Config Error] WHOXY_API_KEY is missing from .env');
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    // console.log(`[Debug] Using Key: ${WHOXY_API_KEY.substring(0, 4)}...`);

    try {
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
