const cron = require('node-cron');
const { refreshDomainCache, shouldRefreshCache, TOP_50_DOMAINS } = require('../domainCache');

function setupCacheCron(apiKey) {
    // Daily cache refresh at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('\n[Cron] Starting scheduled cache refresh at 8:00 AM...');

        if (!apiKey) {
            console.error('Cannot refresh cache: API key not configured');
            return;
        }

        try {
            const needsRefresh = await shouldRefreshCache();
            if (needsRefresh) {
                const result = await refreshDomainCache(apiKey);
                console.log(`[Cron] Cache refresh completed: ${result.successCount} successful, ${result.failCount} failed`);
            } else {
                console.log('[Cron] Cache is still fresh, skipping refresh');
            }
        } catch (error) {
            console.error('[Cron] Cache refresh failed:', error);
        }
    });

    console.log('[Cron] Daily cache refresh scheduled for 8:00 AM');
    console.log(`Top ${TOP_50_DOMAINS.length} domains will be cached for instant access`);
}

async function initialCacheSetup(apiKey) {
    if (apiKey) {
        try {
            const needsRefresh = await shouldRefreshCache();
            if (needsRefresh) {
                console.log('\nInitializing domain cache on server start...');
                console.log('This may take a few minutes for 50 domains...\n');
                const result = await refreshDomainCache(apiKey);
                console.log(`\nInitial cache setup completed: ${result.successCount} successful, ${result.failCount} failed\n`);
            } else {
                console.log('Domain cache is already up to date');
            }
        } catch (error) {
            console.error('Error during initial cache setup:', error);
        }
    } else {
        console.warn('WHOXY_API_KEY not configured - domain cache will not be available');
    }
}

module.exports = { setupCacheCron, initialCacheSetup };
