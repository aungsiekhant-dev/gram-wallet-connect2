// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — API Client (real backend, no mock data)
// ═══════════════════════════════════════════════════════════
// All calls go to the GramAlert bot's web_api.py, which shares the same
// gramalert.db + WalletManager as the Telegram bot. One wallet per user.
// The Telegram user is identified by the verified initData header, so the
// backend always knows who you are — no user id is trusted from the client.

const API = {
  _backendAvailable: null,

  async request(endpoint, options = {}) {
    const url = CONFIG.API_BASE_URL + endpoint;
    const initData = window.Telegram?.WebApp?.initData || '';
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      this._backendAvailable = false;
      throw new Error('HTTP ' + res.status);
    }
    const ct = res.headers.get('Content-Type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    this._backendAvailable = true;
    return data;
  },

  async ping() {
    try { await this.request('/health'); return true; } catch (e) { return false; }
  },

  isBackendAvailable() { return this._backendAvailable === true; },

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
  async getPrice() { return this.request('/price/gram'); },
  async getPriceHistory(days = 7) { return this.request('/price/history?days=' + days); },

  // ─── Alerts ───
  async getAlerts() { return this.request('/alerts'); },
  async createAlert(target, direction) {
    return this.request('/alerts', { method: 'POST', body: JSON.stringify({ target, direction }) });
  },
  async deleteAlert(id) { return this.request('/alerts/' + id, { method: 'DELETE' }); },

  // ─── Portfolio ───
  async getPortfolio() { return this.request('/portfolio'); },
  async addHolding(gramAmount, buyPrice) {
    return this.request('/portfolio', { method: 'POST', body: JSON.stringify({ gram_amount: gramAmount, buy_price: buyPrice }) });
  },
  async deleteHolding(id) { return this.request('/portfolio/' + id, { method: 'DELETE' }); },

  // ─── Wallet (unified with the Telegram bot) ───
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
  async disconnectWallet() { return this.request('/wallet/disconnect', { method: 'POST' }); },
  async getWalletInfo() { return this.request('/wallet/info'); },

  // ─── Whale Tracking ───
  async getWhaleTransfers() { return this.request('/whale/transfers'); },
  async getWhaleSummary() { return this.request('/whale/summary'); },

  // ─── AI Summary ───
  async getAISummary() { return this.request('/ai/summary', { method: 'POST' }); },

  // ─── Prediction ───
  async getPredictionStatus() { return this.request('/prediction/status'); },
  async submitPrediction(price) {
    return this.request('/prediction/submit', { method: 'POST', body: JSON.stringify({ predicted_price: price }) });
  },
  async getLeaderboard() { return this.request('/prediction/leaderboard'); },
  async getMyStats() { return this.request('/prediction/mystats'); },

  // ─── News & Notices ───
  async getNews() { return this.request('/news'); },
  async getNotices() { return this.request('/notices'); },

  // ─── Settings ───
  async getSettings() { return this.request('/settings'); },
  async updateSettings(settings) {
    return this.request('/settings', { method: 'PUT', body: JSON.stringify(settings) });
  },
};
