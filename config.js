// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — Configuration
// ═══════════════════════════════════════════════════════════
// Replace the placeholder values below with your actual URLs
// after deploying to GitHub Pages and setting up your VPS backend.

const CONFIG = {
  // ─── Backend API (Your VPS) ───
  // Replace with your VPS API base URL
  // Example: 'https://api.gramalert.com/api'
  API_BASE_URL: 'https://your-vps-domain.com/api',

  // ─── TON Connect Manifest ───
  // Replace with your GitHub Pages URL after deployment
  // Example: 'https://maxiumlyrx.github.io/gramalert/tonconnect-manifest.json'
  TON_CONNECT_MANIFEST: 'https://your-username.github.io/gramalert-miniapp/tonconnect-manifest.json',

  // ─── CoinGecko (Fallback price source when backend is down) ───
  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  COINGECKO_COIN_ID: 'the-open-network',

  // ─── Intervals ───
  PRICE_REFRESH_INTERVAL: 30000,   // 30 seconds
  CHART_MAX_POINTS: 30,

  // ─── Telegram Bot Info ───
  BOT_USERNAME: 'grampricetrackbot',
  PRICE_CHANNEL: '@GramAlert11',
  NEWS_CHANNEL: '@PePeMission',
  ADMIN_USERNAME: '@Maxiumlyrx',

  // ─── Supported Languages ───
  LANGUAGES: ['en', 'my'],
};
