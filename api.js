// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — API Client
// ═══════════════════════════════════════════════════════════
// All API calls to your VPS backend go through this client.
// When the backend is not connected, mock data is used so the
// UI is fully functional during development.
//
// Backend endpoint reference (implement these on your VPS):
//   POST /api/auth/telegram          — Verify Telegram initData
//   GET  /api/price/gram             — Current GRAM price + stats
//   GET  /api/price/history?days=N   — Price history for charts
//   GET  /api/alerts                 — User's alerts
//   POST /api/alerts                 — Create alert
//   DELETE /api/alerts/:id           — Delete alert
//   GET  /api/portfolio              — User's portfolio
//   POST /api/portfolio              — Add holding
//   DELETE /api/portfolio/:id        — Delete holding
//   POST /api/wallet/connect         — Connect wallet (telegram_user_id + wallet_address)
//   POST /api/wallet/disconnect      — Disconnect wallet
//   GET  /api/wallet/info            — Wallet info + balance + transactions
//   GET  /api/whale/transfers        — Whale transfers
//   GET  /api/whale/summary          — Daily whale summary
//   POST /api/ai/summary             — AI market summary
//   GET  /api/prediction/status      — Today's prediction status
//   POST /api/prediction/submit     — Submit prediction
//   GET  /api/prediction/leaderboard — Leaderboard
//   GET  /api/prediction/mystats    — User's prediction stats
//   GET  /api/news                   — Latest news
//   GET  /api/notices                — Notices
//   GET  /api/settings               — User settings
//   PUT  /api/settings               — Update settings
// ═══════════════════════════════════════════════════════════

const API = {
  _cache: {},
  _backendAvailable: null,

  // ─── Core request method ───
  async request(endpoint, options = {}) {
    const url = CONFIG.API_BASE_URL + endpoint;
    const initData = window.Telegram?.WebApp?.initData || '';

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
          ...(options.headers || {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._backendAvailable = true;
      return data;
    } catch (err) {
      console.warn(`[API] ${endpoint} failed, using mock:`, err.message);
      this._backendAvailable = false;
      return this._getMock(endpoint, options);
    }
  },

  isBackendAvailable() {
    return this._backendAvailable === true;
  },

  // ═══════════════════════════════════════════════════════════
  // API Methods — call these from app.js
  // ═══════════════════════════════════════════════════════════

  // ─── Auth ───
  async authenticate(telegramUser) {
    return this.request('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({
        user_id: telegramUser?.id,
        username: telegramUser?.username,
        first_name: telegramUser?.first_name,
        init_data: window.Telegram?.WebApp?.initData || '',
      }),
    });
  },

  // ─── Price ───
  async getPrice() {
    return this.request('/price/gram');
  },

  async getPriceHistory(days = 7) {
    return this.request(`/price/history?days=${days}`);
  },

  // ─── Alerts ───
  async getAlerts() {
    return this.request('/alerts');
  },

  async createAlert(target, direction) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ target, direction }),
    });
  },

  async deleteAlert(id) {
    return this.request(`/alerts/${id}`, { method: 'DELETE' });
  },

  // ─── Portfolio ───
  async getPortfolio() {
    return this.request('/portfolio');
  },

  async addHolding(gramAmount, buyPrice) {
    return this.request('/portfolio', {
      method: 'POST',
      body: JSON.stringify({ gram_amount: gramAmount, buy_price: buyPrice }),
    });
  },

  async deleteHolding(id) {
    return this.request(`/portfolio/${id}`, { method: 'DELETE' });
  },

  // ─── Wallet ───
  async connectWallet(walletAddress, provider) {
    return this.request('/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({
        telegram_user_id: App.state.user?.id,
        wallet_address: walletAddress,
        provider: provider,
      }),
    });
  },

  async disconnectWallet() {
    return this.request('/wallet/disconnect', { method: 'POST' });
  },

  async getWalletInfo() {
    return this.request('/wallet/info');
  },

  // ─── Whale Tracking ───
  async getWhaleTransfers() {
    return this.request('/whale/transfers');
  },

  async getWhaleSummary() {
    return this.request('/whale/summary');
  },

  // ─── AI Summary ───
  async getAISummary() {
    return this.request('/ai/summary', { method: 'POST' });
  },

  // ─── Prediction ───
  async getPredictionStatus() {
    return this.request('/prediction/status');
  },

  async submitPrediction(price) {
    return this.request('/prediction/submit', {
      method: 'POST',
      body: JSON.stringify({ predicted_price: price }),
    });
  },

  async getLeaderboard() {
    return this.request('/prediction/leaderboard');
  },

  async getMyStats() {
    return this.request('/prediction/mystats');
  },

  // ─── News & Notices ───
  async getNews() {
    return this.request('/news');
  },

  async getNotices() {
    return this.request('/notices');
  },

  // ─── Settings ───
  async getSettings() {
    return this.request('/settings');
  },

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // ═══════════════════════════════════════════════════════════
  // Mock Data — used when backend is not available
  // ═══════════════════════════════════════════════════════════
  _getMock(endpoint, options) {
    const method = options.method || 'GET';
    const key = method + endpoint.split('?')[0];

    // Price
    if (endpoint.startsWith('/price/gram'))
      return {
        price: 3.8421,
        change_24h: 2.54,
        high_24h: 3.9210,
        low_24h: 3.7100,
        volume_24h: 125_400_000,
        market_cap: 9_580_000_000,
        ath: 7.2410,
        atl: 0.3911,
        last_updated: new Date().toISOString(),
        stale: false,
      };

    if (endpoint.startsWith('/price/history')) {
      const days = parseInt(endpoint.match(/days=(\d+)/)?.[1] || 7);
      const count = days <= 1 ? 24 : days <= 7 ? 7 : days <= 30 ? 30 : 90;
      const prices = [];
      let p = 3.5;
      for (let i = 0; i < count; i++) {
        p += (Math.random() - 0.48) * 0.15;
        p = Math.max(2.5, Math.min(4.5, p));
        prices.push({ time: Date.now() - (count - i) * 3600000, price: parseFloat(p.toFixed(4)) });
      }
      return prices;
    }

    // Alerts
    if (endpoint.startsWith('/alerts') && method === 'GET')
      return [
        { id: 1, target: 4.00, direction: 'above', triggered: false, created_at: '2025-07-18T10:00:00Z' },
        { id: 2, target: 3.50, direction: 'below', triggered: false, created_at: '2025-07-17T14:00:00Z' },
      ];
    if (endpoint.startsWith('/alerts') && method === 'POST')
      return { id: Math.floor(Math.random() * 1000), target: JSON.parse(options.body).target, direction: JSON.parse(options.body).direction, triggered: false, created_at: new Date().toISOString() };

    // Portfolio
    if (endpoint.startsWith('/portfolio') && method === 'GET')
      return [
        { id: 1, gram_amount: 500, buy_price: 2.8500, created_at: '2025-07-01T00:00:00Z' },
        { id: 2, gram_amount: 200, buy_price: 3.2100, created_at: '2025-07-10T00:00:00Z' },
      ];
    if (endpoint.startsWith('/portfolio') && method === 'POST')
      return { id: Math.floor(Math.random() * 1000), ...JSON.parse(options.body), created_at: new Date().toISOString() };

    // Wallet
    if (endpoint === '/wallet/connect')
      return { success: true, message: 'Wallet connected successfully' };
    if (endpoint === '/wallet/disconnect')
      return { success: true };
    if (endpoint === '/wallet/info')
      return {
        connected: true,
        address: 'EQDrjaLahLk64-hHhY7qS2FZPrAFDMQF-8p5gAWGymqWcH_A',
        balance_ton: 1250.43,
        balance_usd: 4803.27,
        transactions: [
          { hash: 'a1b2c3d4...', type: 'in', amount: 100.5, time: '2025-07-19T15:30:00Z' },
          { hash: 'e5f6g7h8...', type: 'out', amount: 50.0, time: '2025-07-18T10:15:00Z' },
          { hash: 'i9j0k1l2...', type: 'in', amount: 250.0, time: '2025-07-17T08:45:00Z' },
        ],
      };

    // Whale
    if (endpoint.startsWith('/whale/transfers'))
      return [
        { amount: 45000, from_addr: 'EQAbc...xK9', to_addr: 'EQDef...mN2', tx_hash: 'a1b2c3...', timestamp: Date.now() - 300000, from_exchange: '', to_exchange: 'Binance' },
        { amount: 28000, from_addr: 'EQGhi...pQ4', to_addr: 'EQJkl...rS6', tx_hash: 'd4e5f6...', timestamp: Date.now() - 900000, from_exchange: 'OKX', to_exchange: '' },
        { amount: 15000, from_addr: 'EQMno...tU8', to_addr: 'EQpqr...vW0', tx_hash: 'g7h8i9...', timestamp: Date.now() - 1800000, from_exchange: '', to_exchange: '' },
        { amount: 8200, from_addr: 'EQStu...xY2', to_addr: 'EQvwx...zA4', tx_hash: 'j0k1l2...', timestamp: Date.now() - 3600000, from_exchange: '', to_exchange: 'Bybit' },
      ];
    if (endpoint.startsWith('/whale/summary'))
      return {
        largest_transfer: 45000,
        total_volume: 96200,
        transfer_count: 12,
        exchange_inflow: 28000,
        exchange_outflow: 45000,
        net_flow: -17000,
      };

    // AI Summary
    if (endpoint.startsWith('/ai/summary'))
      return {
        market_summary: '🤖 GRAM is currently trading at $3.84, up 2.54% in the last 24 hours. The price is testing resistance near $3.92. Volume is moderate at $125M. Market sentiment appears bullish with steady accumulation.',
        whale_analysis: '🐋 Whale activity shows net exchange outflow of 17,000 GRAM, suggesting accumulation by large holders. The largest transfer today was 45,000 GRAM into Binance, which could indicate potential selling pressure.',
        news_summary: '📰 Recent developments include TON blockchain integration updates and growing ecosystem adoption. Community sentiment remains positive with increased social activity.',
      };

    // Prediction
    if (endpoint.startsWith('/prediction/status'))
      return {
        is_open: true,
        deadline: '23:30 UTC',
        participants: 42,
        current_price: 3.8421,
        user_prediction: null,
      };
    if (endpoint.startsWith('/prediction/submit'))
      return { success: true, message: 'Prediction submitted!' };
    if (endpoint.startsWith('/prediction/leaderboard'))
      return [
        { rank: 1, username: 'crypto_whale', wins: 15, total_predictions: 28, total_points: 1850, accuracy: 66, current_streak: 5 },
        { rank: 2, username: 'gram_master', wins: 12, total_predictions: 25, total_points: 1420, accuracy: 48, current_streak: 3 },
        { rank: 3, username: 'moon_hunter', wins: 10, total_predictions: 22, total_points: 1180, accuracy: 45, current_streak: 2 },
        { rank: 4, username: 'ton_driver', wins: 8, total_predictions: 20, total_points: 950, accuracy: 40, current_streak: 0 },
        { rank: 5, username: 'diamond_hands', wins: 7, total_predictions: 18, total_points: 820, accuracy: 39, current_streak: 1 },
      ];
    if (endpoint.startsWith('/prediction/mystats'))
      return { total_predictions: 15, wins: 3, total_points: 680, accuracy: 45, current_streak: 2, highest_streak: 4, best_prediction: 3.81, last_prediction_date: '2025-07-19' };

    // News
    if (endpoint.startsWith('/news'))
      return [
        { id: 1, text: '🚀 TON ecosystem announces new partnership with major exchange for GRAM liquidity.', date: '2025-07-19', link: 'https://t.me/PePeMission/101', pinned: false },
        { id: 2, text: '📈 GRAM price breaks through key resistance level at $3.80.', date: '2025-07-19', link: 'https://t.me/PePeMission/100', pinned: false },
        { id: 3, text: '🐋 Large whale transfer detected — 45,000 GRAM moved to Binance.', date: '2025-07-18', link: 'https://t.me/PePeMission/99', pinned: false },
      ];
    if (endpoint.startsWith('/notices'))
      return [
        { id: 1, text: 'GramAlert v6.1 released with Mini App support!', pinned: true, created_at: '2025-07-19T00:00:00Z' },
        { id: 2, text: 'New whale alert thresholds available in settings.', pinned: false, created_at: '2025-07-18T00:00:00Z' },
      ];

    // Settings
    if (endpoint.startsWith('/settings') && method === 'GET')
      return { language: 'en', notifications_on: true, update_frequency: 'normal' };
    if (endpoint.startsWith('/settings') && method === 'PUT')
      return { success: true };

    // Auth
    if (endpoint.startsWith('/auth'))
      return { success: true, user: { id: App.state.user?.id, settings: { language: 'en', notifications_on: true, update_frequency: 'normal' } } };

    return null;
  },
};
