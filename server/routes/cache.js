const express = require('express');
const router = express.Router();
const { getAllCachedDomains, getCachedDomain, refreshDomainCache, TOP_50_DOMAINS } = require('../domainCache');

const WHOXY_API_KEY = process.env.WHOXY_API_KEY;

// Get all cached domains
router.get('/cached-domains', async (req, res) => {
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

// Manual cache refresh endpoint
router.post('/refresh-cache', async (req, res) => {
    if (!WHOXY_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        console.log('Manual cache refresh initiated...');
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
router.get('/is-cached/:domain', async (req, res) => {
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

module.exports = router;
