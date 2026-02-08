const cron = require('node-cron');
const https = require('https');
const db = require('../database');
const { sendEmailNotification, sendSMSNotification, generateDomainExpiryEmail, generateSSLExpiryEmail } = require('../notificationService');
const { TOP_50_DOMAINS } = require('../domainCache');

function setupNotificationCron() {
    // Run every day at 9 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('[Cron] Running scheduled notification check...');

        db.all('SELECT * FROM users WHERE email_notifications = 1 OR sms_notifications = 1', [], async (err, users) => {
            if (err) {
                console.error('[Cron] Error fetching users:', err);
                return;
            }

            for (const user of users) {
                db.all('SELECT * FROM domains WHERE user_id = ?', [user.id], async (err, domains) => {
                    if (err || !domains || domains.length === 0) return;

                    const expiringDomains = [];
                    const expiringSSL = [];

                    for (const domain of domains) {
                        if (TOP_50_DOMAINS.includes(domain.name)) {
                            continue;
                        }

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

    console.log('[Cron] Daily notification job scheduled for 9:00 AM');
}

module.exports = { setupNotificationCron };
