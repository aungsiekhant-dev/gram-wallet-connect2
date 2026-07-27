// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — API Client
// ═══════════════════════════════════════════════════════════
// All calls go to the GramAlert bot's FastAPI backend which shares the
// same gramalert.db + WalletManager as the Telegram bot.
// The Telegram user is identified by the HMAC-verified initData header —
// no user ID is ever trusted from the client body.

const API = {
  _backendAvailable: null,
  _lastPing: 0,

  // ─── Core fetch wrapper ───
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
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.detail || body.error || `HTTP ${res.status}`;
        this._backendAvailable = false;
        throw new Error(msg);
      }
      const ct = res.headers.get('Content-Type') || '';
      const data = ct.includes('application/json') ? await res.json() : await res.text();
      this._backendAvailable = true;
      return data;
    } catch (err) {
      // Network-level error — don't mark offline on auth errors (401)
      if (err.message && !err.message.startsWith('HTTP 401')) {
        this._backendAvailable = false;
      }
      throw err;
    }
  },

  // Ping the health endpoint to check backend availability (cached 30s)
  async ping() {
    if (Date.now() - this._lastPing < 30000 && this._backendAvailable !== null) {
      return this._backendAvailable;
    }
    try {
      const url = CONFIG.API_BASE_URL + '/health';
      const r = await fetch(url, { method: 'GET' });
      this._backendAvailable = r.ok;
      this._lastPing = Date.now();
      return r.ok;
    } catch {
      this._backendAvailable = false;
      this._lastPing = Date.now();
      return false;
    }
  },

  isBackendAvailable() {
    return this._backendAvailable === true;
  },

  // ─── Auth ───
  async authenticate() {
    return this.request('/auth/telegram', { method: 'POST', body: JSON.stringify({}) });
  },

  // ─── Price (no auth needed) ───
  async getPrice() { return this.request('/price/gram'); },
  async getPriceHistory(days = 7) { return this.request('/price/history?days=' + days); },

  // ─── Alerts ───
  async getAlerts() { return this.request('/alerts'); },
  async createAlert(target, direction) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ target, direction }),
    });
  },
  async deleteAlert(id) { return this.request('/alerts/' + id, { method: 'DELETE' }); },

  // ─── Portfolio ───
  async getPortfolio() { return this.request('/portfolio'); },
  async addHolding(gramAmount, buyPrice) {
    return this.request('/portfolio', {
      method: 'POST',
      body: JSON.stringify({ gram_amount: gramAmount, buy_price: buyPrice }),
    });
  },
  async deleteHolding(id) { return this.request('/portfolio/' + id, { method: 'DELETE' }); },

  // ─── Wallet (unified with the Telegram bot) ───
  async connectWallet(walletAddress, provider) {
    return this.request('/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress, provider: provider }),
    });
  },
  async disconnectWallet() { return this.request('/wallet/disconnect', { method: 'POST' }); },
  async getWalletInfo() { return this.request('/wallet/info'); },

  // ─── Whale Tracking ───
  async getWhaleTransfers(threshold) {
    const qs = threshold ? '?threshold=' + threshold : '';
    return this.request('/whale/transfers' + qs);
  },
  async getWhaleSummary() { return this.request('/whale/summary'); },

  // ─── AI Summary ───
  async getAISummary() { return this.request('/ai/summary', { method: 'POST', body: '{}' }); },

  // ─── Prediction ───
  async getPredictionStatus() { return this.request('/prediction/status'); },
  async submitPrediction(price) {
    return this.request('/prediction/submit', {
      method: 'POST',
      body: JSON.stringify({ predicted_price: price }),
    });
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
