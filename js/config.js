// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — Configuration
// ═══════════════════════════════════════════════════════════
// HOW TO CONFIGURE:
//   1. Deploy your bot to Vortexacloud.
//   2. Set API_BASE_URL to: https://YOUR-SUBDOMAIN.vortexa.cloud/api
//   3. Set TON_CONNECT_MANIFEST to the URL where you host this Mini App
//      followed by /tonconnect-manifest.json
//   4. Upload this Mini App to your hosting (GitHub Pages, Vercel, etc.)

const CONFIG = {
  // ─── Backend API (your GramAlert bot on Vortexacloud) ───
  // Replace YOUR-SUBDOMAIN with the actual subdomain assigned to your bot.
  // Example: https://abc123.vortexa.cloud/api
  API_BASE_URL: 'https://YOUR-SUBDOMAIN.vortexa.cloud/api',

  // ─── TON Connect Manifest ───
  // Should point to the tonconnect-manifest.json file served alongside this Mini App.
  // If hosting on GitHub Pages: https://YOUR-USERNAME.github.io/YOUR-REPO/tonconnect-manifest.json
  TON_CONNECT_MANIFEST: 'https://aungsiekhant-dev.github.io/gram-wallet-connect2/tonconnect-manifest.json',

  // ─── Intervals ───
  PRICE_REFRESH_INTERVAL: 30000, // 30 seconds
  CHART_MAX_POINTS: 30,

  // ─── Telegram Bot Info ───
  BOT_USERNAME: 'grampricetrackbot',
  PRICE_CHANNEL: '@GramAlert11',
  NEWS_CHANNEL: '@PePeMission',
  ADMIN_USERNAME: '@Maxiumlyrx',

  // ─── Supported Languages ───
  LANGUAGES: ['en', 'my'],
};
