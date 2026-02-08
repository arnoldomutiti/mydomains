const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { getAllCachedDomains } = require('../domainCache');

// Get User's Domains
router.get('/', authenticateToken, async (req, res) => {
    if (req.user.id === -1 || req.user.isDemo) {
        try {
            const cachedDomains = await getAllCachedDomains();

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

    const sql = `SELECT * FROM domains WHERE user_id = ?`;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const domains = rows.map(row => ({
            ...row,
            fullDetails: JSON.parse(row.full_details || '{}')
        }));
        res.json(domains);
    });
});

// Save a Domain
router.post('/', authenticateToken, (req, res) => {
    if (req.user.id === -1 || req.user.isDemo) {
        return res.status(403).json({ error: 'Demo account cannot add domains. Please create a free account to manage your own domains.' });
    }

    const { name, created_date, expiry_date, registrar, status, fullDetails } = req.body;

    const checkSql = `SELECT id FROM domains WHERE user_id = ? AND name = ?`;
    db.get(checkSql, [req.user.id, name], (err, existing) => {
        if (err) {
            console.error('Error checking for duplicate:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (existing) {
            return res.status(409).json({ error: 'Domain already exists', domainId: existing.id });
        }

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
router.delete('/:id', authenticateToken, (req, res) => {
    if (req.user.id === -1 || req.user.isDemo) {
        return res.status(403).json({ error: 'Demo account cannot delete domains. Please create a free account to manage your own domains.' });
    }

    const sql = `DELETE FROM domains WHERE id = ? AND user_id = ?`;
    db.run(sql, [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Domain deleted" });
    });
});

module.exports = router;
