const db = require('./database');
const axios = require('axios');

// Top 50 most popular websites (based on global traffic)
const TOP_50_DOMAINS = [
    'google.com',
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'linkedin.com',
    'reddit.com',
    'wikipedia.org',
    'amazon.com',
    'ebay.com',
    'netflix.com',
    'microsoft.com',
    'apple.com',
    'zoom.us',
    'tiktok.com',
    'whatsapp.com',
    'pinterest.com',
    'yahoo.com',
    'twitch.tv',
    'discord.com',
    'github.com',
    'stackoverflow.com',
    'wordpress.com',
    'tumblr.com',
    'shopify.com',
    'paypal.com',
    'adobe.com',
    'salesforce.com',
    'dropbox.com',
    'slack.com',
    'medium.com',
    'quora.com',
    'vimeo.com',
    'cloudflare.com',
    'nvidia.com',
    'spotify.com',
    'airbnb.com',
    'uber.com',
    'booking.com',
    'tripadvisor.com',
    'expedia.com',
    'yelp.com',
    'imdb.com',
    'cnn.com',
    'bbc.com',
    'nytimes.com',
    'espn.com',
    'walmart.com',
    'target.com',
    'bestbuy.com'
];

// Fetch WHOIS data for a domain
async function fetchWhoisData(domain, apiKey) {
    try {
        const response = await axios.get(`https://api.whoxy.com/?key=${apiKey}&whois=${domain}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching WHOIS for ${domain}:`, error.message);
        return null;
    }
}

// Check if domain exists in cache
function isDomainCached(domain) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM cached_domains WHERE name = ?', [domain], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Get cached domain data
function getCachedDomain(domain) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM cached_domains WHERE name = ?', [domain], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Update or insert cached domain
function upsertCachedDomain(domainData) {
    return new Promise((resolve, reject) => {
        const { name, created_date, expiry_date, registrar, status, full_details } = domainData;

        db.run(`
            INSERT INTO cached_domains (name, created_date, expiry_date, registrar, status, full_details, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(name) DO UPDATE SET
                created_date = excluded.created_date,
                expiry_date = excluded.expiry_date,
                registrar = excluded.registrar,
                status = excluded.status,
                full_details = excluded.full_details,
                last_updated = CURRENT_TIMESTAMP
        `, [name, created_date, expiry_date, registrar, status, full_details], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

// Refresh cache for all top 50 domains
async function refreshDomainCache(apiKey) {
    console.log('🔄 Starting domain cache refresh...');
    let successCount = 0;
    let failCount = 0;

    for (const domain of TOP_50_DOMAINS) {
        try {
            console.log(`Fetching data for ${domain}...`);
            const whoisData = await fetchWhoisData(domain, apiKey);

            if (whoisData && whoisData.status === 1 && whoisData.domain_registered !== 'no') {
                const domainData = {
                    name: domain,
                    created_date: whoisData.create_date || 'N/A',
                    expiry_date: whoisData.expiry_date || 'N/A',
                    registrar: (whoisData.domain_registrar && whoisData.domain_registrar.registrar_name)
                        ? whoisData.domain_registrar.registrar_name
                        : 'Unknown',
                    status: (whoisData.domain_status && whoisData.domain_status.length > 0)
                        ? 'Active'
                        : 'Unknown',
                    full_details: JSON.stringify(whoisData)
                };

                await upsertCachedDomain(domainData);
                successCount++;
                console.log(`✅ Successfully cached ${domain}`);
            } else {
                failCount++;
                console.log(`❌ Failed to fetch valid data for ${domain}`);
            }

            // Add delay to avoid rate limiting (2 seconds between requests)
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            failCount++;
            console.error(`❌ Error processing ${domain}:`, error.message);
        }
    }

    const timestamp = new Date().toISOString();
    console.log(`\n📊 Cache refresh completed at ${timestamp}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

    return { successCount, failCount, timestamp };
}

// Get all cached domains
function getAllCachedDomains() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM cached_domains ORDER BY name', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Check if cache needs refresh (older than 24 hours)
function shouldRefreshCache() {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT MAX(last_updated) as last_update
            FROM cached_domains
        `, [], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row || !row.last_update) {
                // No cache exists
                resolve(true);
            } else {
                const lastUpdate = new Date(row.last_update);
                const now = new Date();
                const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
                resolve(hoursSinceUpdate >= 24);
            }
        });
    });
}

module.exports = {
    TOP_50_DOMAINS,
    isDomainCached,
    getCachedDomain,
    refreshDomainCache,
    getAllCachedDomains,
    shouldRefreshCache
};
