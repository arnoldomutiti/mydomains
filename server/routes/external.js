const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const { getCachedDomain } = require('../domainCache');

const WHOXY_API_KEY = process.env.WHOXY_API_KEY;
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY;

// Fetch Whois data
router.get('/whois/:domain', async (req, res) => {
    const { domain } = req.params;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    try {
        const cachedDomain = await getCachedDomain(domain);
        if (cachedDomain) {
            console.log(`Serving cached data for ${domain}`);
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

    if (!WHOXY_API_KEY) {
        console.error('[Config Error] WHOXY_API_KEY is missing from .env');
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    try {
        console.log(`Fetching fresh data for ${domain}`);
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

// Fetch PageSpeed Insights
router.get('/pagespeed/:domain', async (req, res) => {
    const { domain } = req.params;
    if (!domain) return res.status(400).json({ error: "Domain required" });

    console.log(`[PageSpeed] Request for ${domain}`);
    console.log(`[PageSpeed] Key Configured: ${PAGESPEED_API_KEY ? 'Yes' : 'No'}`);

    try {
        const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${domain}&strategy=mobile&key=${PAGESPEED_API_KEY}`;
        const response = await axios.get(url);

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

// Check SSL certificate status
router.get('/ssl/:domain', async (req, res) => {
    const { domain } = req.params;
    if (!domain) return res.status(400).json({ error: "Domain required" });

    console.log(`[SSL Check] Request for ${domain}`);

    try {
        const checkCertificate = new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                method: 'GET',
                rejectUnauthorized: false,
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

module.exports = router;
