// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — Configuration (connected to real backend)
// ═══════════════════════════════════════════════════════════
// API_BASE_URL = your GramAlert bot's public URL on Vortexacloud + "/api".
// Replace YOUR-BOT-DOMAIN with the domain Vortexacloud assigns your bot.
// The bot runs web_api.py on the same process (shared gramalert.db + WalletManager),
// so the Mini App and the Telegram bot use ONE wallet record per user.

const CONFIG = {
  // ─── Backend API (your bot on Vortexacloud) ───
  API_BASE_URL: 'https://YOUR-BOT-DOMAIN/api',

  // ─── TON Connect Manifest (this GitHub Pages site) ───
  TON_CONNECT_MANIFEST: 'https://aungsiekhant-dev.github.io/gram-wallet-connect2/tonconnect-manifest.json',

  // ─── CoinGecko (only used if you want a client-side price fallback) ───
  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  COINGECKO_COIN_ID: 'the-open-network',

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
