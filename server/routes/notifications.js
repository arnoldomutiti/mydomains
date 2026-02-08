const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sendEmailNotification, sendSMSNotification } = require('../notificationService');

// Get user notification preferences
router.get('/preferences', authenticateToken, (req, res) => {
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
router.put('/preferences', authenticateToken, (req, res) => {
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
router.post('/test', authenticateToken, async (req, res) => {
    const { type } = req.body;

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

module.exports = router;
