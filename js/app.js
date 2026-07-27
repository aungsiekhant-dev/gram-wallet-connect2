// ═══════════════════════════════════════════════════════════
// GramAlert Mini App v6.1 — Main Application Logic
// ═══════════════════════════════════════════════════════════

const App = {
  state: {
    page: 'dashboard',
    user: null,
    wallet: null,
    price: null,
    settings: { language: 'en', notifications_on: true, update_frequency: 'normal' },
    chartInstance: null,
    chartDays: 7,
  },

  // ═══════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════
  async init() {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#0a0e17');
      tg.setBackgroundColor?.('#0a0e17');
      this.state.user = tg.initDataUnsafe?.user || null;
      tg.BackButton.onClick(() => this.navigate('dashboard'));
    }

    // Ping backend to establish availability
    API.ping().catch(() => {});

    // Initialize TON wallet
    await Wallet.init();

    // Load user settings from backend
    try {
      if (tg?.initData) {
        const settings = await API.getSettings();
        if (settings) this.state.settings = { ...this.state.settings, ...settings };
      }
    } catch (e) { console.warn('Settings load failed', e.message); }

    // Load initial price
    this.loadPrice();

    // Wire up navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.page));
    });

    // Authenticate with backend (upserts the user record)
    if (this.state.user) {
      API.authenticate().catch(e => console.warn('Auth failed', e.message));
    }

    // Render the dashboard
    this.navigate('dashboard');

    // Price auto-refresh
    setInterval(() => this.loadPrice(), CONFIG.PRICE_REFRESH_INTERVAL);
  },

  // ═══════════════════════════════════════════════════════════
  // Navigation
  // ═══════════════════════════════════════════════════════════
  navigate(page) {
    this.state.page = page;
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = t(page);
    const tg = window.Telegram?.WebApp;
    if (tg) {
      if (page !== 'dashboard') tg.BackButton.show();
      else tg.BackButton.hide();
    }
    this.haptic('light');
    this.render();
  },

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════
  render() {
    const content = document.getElementById('app-content');
    const renderer = this.pages[this.state.page];
    if (renderer) {
      content.innerHTML = renderer.call(this);
      this.postRender();
    } else {
      content.innerHTML = `<div class="empty-state"><div class="icon">🚧</div><p>Page not found</p></div>`;
    }
  },

  postRender() {
    const page = this.state.page;
    if (page === 'dashboard')  this.setupDashboard();
    if (page === 'price')      this.setupPricePage();
    if (page === 'converter')  this.setupConverter();
    if (page === 'alerts')     this.setupAlerts();
    if (page === 'portfolio')  this.setupPortfolio();
    if (page === 'wallet')     this.setupWalletPage();
    if (page === 'whale')      this.loadWhaleData();
    if (page === 'ai')         this.setupAI();
    if (page === 'prediction') this.setupPrediction();
    if (page === 'news')       this.loadNewsData();
    if (page === 'settings')   this.setupSettings();
    if (page === 'stats')      this.setupStats();
    if (page === 'profit')     this.setupProfit();
  },

  // ═══════════════════════════════════════════════════════════
  // Pages
  // ═══════════════════════════════════════════════════════════
  pages: {

    dashboard() {
      const p = this.state.price || {};
      const priceVal = p.price ? this.fmtPrice(p.price) : '...';
      const change = p.change_24h ?? 0;
      const changeClass = change >= 0 ? 'positive' : 'negative';
      const changeIcon = change >= 0 ? '📈' : '📉';
      return `
        ${this.backendStatusBar()}
        <div class="card">
          <div class="card-header"><span class="card-title">${t('live_price')}</span><span class="card-link" onclick="App.refreshPrice()">🔄 ${t('refresh')}</span></div>
          <div class="price-display">
            <div class="price-main" id="price-main">${priceVal}</div>
            <div class="price-change-badge ${changeClass}">${changeIcon} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
          </div>
        </div>
        <div class="section-title">${t('market_overview')}</div>
        <div class="card">
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-label">${t('high_24h')}</div><div class="stat-value">${this.fmtPrice(p.high_24h)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('low_24h')}</div><div class="stat-value">${this.fmtPrice(p.low_24h)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('volume_24h')}</div><div class="stat-value">${this.fmtVol(p.volume_24h)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('market_cap')}</div><div class="stat-value">${this.fmtVol(p.market_cap)}</div></div>
          </div>
        </div>
        <div class="section-title">${t('quick_access')}</div>
        <div class="dash-grid">
          ${this.dashTile('📈', 'price')}
          ${this.dashTile('🔄', 'converter')}
          ${this.dashTile('🔔', 'alerts')}
          ${this.dashTile('💼', 'portfolio')}
          ${this.dashTile('👛', 'wallet')}
          ${this.dashTile('🐋', 'whale')}
          ${this.dashTile('🤖', 'ai')}
          ${this.dashTile('🎯', 'prediction')}
          ${this.dashTile('📰', 'news')}
          ${this.dashTile('⚙️', 'settings')}
          ${this.dashTile('📊', 'stats')}
          ${this.dashTile('📈', 'profit')}
        </div>
        <div class="section-title">${t('whale_activity')}</div>
        <div class="card" id="dash-whale-card">
          <div class="empty-state"><div class="icon">🐋</div><p>${t('loading')}</p></div>
        </div>
        <p style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:16px;">⚠️ ${t('not_financial_advice')}</p>
      `;
    },

    price() {
      const p = this.state.price || {};
      const change = p.change_24h ?? 0;
      return `
        ${this.backendStatusBar()}
        <div class="card">
          <div class="card-header"><span class="card-title">${t('live_price')}</span><span class="card-link" onclick="App.refreshPrice()">🔄 ${t('refresh')}</span></div>
          <div class="price-display">
            <div class="price-main" id="price-main">${p.price ? this.fmtPrice(p.price) : '...'}</div>
            <div class="price-change-badge ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '📈' : '📉'} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
          </div>
        </div>
        <div class="card">
          <div class="chart-tabs">
            ${['24H','7D','30D','90D'].map((tab, i) => `<button class="chart-tab ${i===1?'active':''}" data-days="${[1,7,30,90][i]}">${tab}</button>`).join('')}
          </div>
          <div class="chart-container"><canvas id="price-chart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">📊 ${t('market_overview')}</span></div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-label">${t('high_24h')}</div><div class="stat-value">${this.fmtPrice(p.high_24h)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('low_24h')}</div><div class="stat-value">${this.fmtPrice(p.low_24h)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('volume_24h')}</div><div class="stat-value">${this.fmtVol(p.volume_24h)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('market_cap')}</div><div class="stat-value">${this.fmtVol(p.market_cap)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('ath')}</div><div class="stat-value">${this.fmtPrice(p.ath)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('atl')}</div><div class="stat-value">${this.fmtPrice(p.atl)}</div></div>
          </div>
        </div>
      `;
    },

    converter() {
      const p = this.state.price;
      const rate = p?.price || 0;
      return `
        ${this.backendStatusBar()}
        <div class="card">
          <div class="card-header"><span class="card-title">🧮 ${t('converter')}</span></div>
          <div class="conv-box">
            <div class="input-label">${t('gram_to_usdt')}</div>
            <div class="conv-row">
              <input type="number" class="input" id="conv-gram" placeholder="0.00" oninput="App.convertGram()" min="0" />
              <span class="conv-token">GRAM</span>
            </div>
          </div>
          <div class="conv-swap" onclick="App.swapConverter()">⇅</div>
          <div class="conv-box">
            <div class="input-label">${t('usdt_to_gram')}</div>
            <div class="conv-row">
              <input type="number" class="input" id="conv-usdt" placeholder="0.00" oninput="App.convertUsdt()" min="0" />
              <span class="conv-token">USDT</span>
            </div>
          </div>
          <div class="conv-rate">1 GRAM = ${this.fmtPrice(rate)} | 1 USDT = ${rate ? (1/rate).toFixed(4) : '...'} GRAM</div>
        </div>
      `;
    },

    alerts() {
      return `
        ${this.backendStatusBar()}
        <div class="card">
          <div class="card-header"><span class="card-title">🔔 ${t('price_alerts')}</span></div>
          <div id="alerts-list"><div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">➕ ${t('add_alert')}</span></div>
          <div class="input-group">
            <label class="input-label">${t('target_price')} (USDT)</label>
            <input type="number" class="input" id="alert-target" placeholder="e.g. 4.00" step="0.01" min="0" />
          </div>
          <div class="input-group">
            <label class="input-label">${t('direction')}</label>
            <select class="input" id="alert-direction">
              <option value="above">⬆️ ${t('above')}</option>
              <option value="below">⬇️ ${t('below')}</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="App.createAlert()">➕ ${t('add_alert')}</button>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">⚙️ ${t('notification_settings')}</span></div>
          <div class="settings-row">
            <span class="settings-label">${t('notifications_on')}</span>
            <label class="toggle">
              <input type="checkbox" id="notif-toggle" ${this.state.settings.notifications_on ? 'checked' : ''} onchange="App.toggleNotifications()" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      `;
    },

    portfolio() {
      return `
        ${this.backendStatusBar()}
        <div class="card" id="portfolio-summary">
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">➕ ${t('add_holding')}</span></div>
          <div class="input-group">
            <label class="input-label">${t('gram_amount')}</label>
            <input type="number" class="input" id="port-gram" placeholder="e.g. 100" step="0.01" min="0" />
          </div>
          <div class="input-group">
            <label class="input-label">${t('buy_price')} (USDT)</label>
            <input type="number" class="input" id="port-price" placeholder="e.g. 3.50" step="0.001" min="0" />
          </div>
          <button class="btn btn-primary" onclick="App.addHolding()">➕ ${t('add_holding')}</button>
        </div>
      `;
    },

    wallet() {
      const w = this.state.wallet;
      if (w) {
        return `
          ${this.backendStatusBar()}
          <div class="card">
            <div class="card-header"><span class="card-title">✅ ${t('wallet_connected')}</span></div>
            <div class="wallet-addr-box">
              <div>
                <div class="stat-label">${t('wallet_address')}</div>
                <div class="addr">${Wallet.getShortAddress(w.address)}</div>
              </div>
              <button class="btn btn-sm btn-secondary" onclick="App.copyAddress()">📋</button>
            </div>
            <div class="badge-row">
              <span class="badge badge-success">🟢 ${w.provider || 'Connected'}</span>
              <span class="badge badge-accent">${w.chain || 'mainnet'}</span>
            </div>
          </div>
          <div class="card" id="wallet-info-card">
            <div class="card-header"><span class="card-title">💰 ${t('wallet_balance')}</span></div>
            <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">📋 ${t('transactions')}</span></div>
            <div id="wallet-tx-list"><div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div></div>
          </div>
          <button class="btn btn-danger" onclick="App.disconnectWallet()" style="margin-top:4px;">🔌 ${t('disconnect_wallet')}</button>
        `;
      }
      return `
        ${this.backendStatusBar()}
        <div class="card" style="text-align:center;padding:32px 16px;">
          <div style="font-size:56px;margin-bottom:16px;">👛</div>
          <h2 style="font-size:20px;margin-bottom:8px;">${t('wallet_not_connected')}</h2>
          <p style="font-size:14px;color:var(--text-secondary);line-height:1.5;margin-bottom:20px;">${t('connect_description')}</p>
          <button class="btn btn-primary" onclick="Wallet.openModal()">🔗 ${t('connect_wallet')}</button>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Supported Wallets</span></div>
          <div class="list-item"><div class="list-item-left"><div class="list-item-icon">🦊</div><div class="list-item-info"><span class="list-item-title">Tonkeeper</span><span class="list-item-sub">Most popular TON wallet</span></div></div><span class="badge badge-success">✅</span></div>
          <div class="list-item"><div class="list-item-left"><div class="list-item-icon">💎</div><div class="list-item-info"><span class="list-item-title">MyTonWallet</span><span class="list-item-sub">Browser extension & web</span></div></div><span class="badge badge-success">✅</span></div>
          <div class="list-item"><div class="list-item-left"><div class="list-item-icon">📱</div><div class="list-item-info"><span class="list-item-title">TON Wallet</span><span class="list-item-sub">Official TON wallet</span></div></div><span class="badge badge-success">✅</span></div>
        </div>
      `;
    },

    whale() {
      return `
        ${this.backendStatusBar()}
        <div class="card" id="whale-summary-card">
          <div class="card-header"><span class="card-title">📊 ${t('whale_summary')}</span></div>
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
        <div class="section-title">🐋 ${t('large_transfers')}</div>
        <div id="whale-transfers-list"><div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div></div>
      `;
    },

    ai() {
      return `
        ${this.backendStatusBar()}
        <div class="card" id="ai-card">
          <div class="card-header"><span class="card-title">🤖 ${t('market_summary')}</span></div>
          <div class="empty-state"><div class="icon">🤖</div><p>${t('ai_generating')}</p></div>
        </div>
      `;
    },

    prediction() {
      return `
        ${this.backendStatusBar()}
        <div class="card" id="pred-status-card">
          <div class="card-header"><span class="card-title">🎯 ${t('predict_price')}</span></div>
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
        <div class="section-title">🏆 ${t('leaderboard')}</div>
        <div class="card" id="pred-lb-card">
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
        <div class="section-title">📊 ${t('my_stats')}</div>
        <div class="card" id="pred-stats-card">
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
      `;
    },

    news() {
      return `
        ${this.backendStatusBar()}
        <div class="section-title">📢 ${t('announcements')}</div>
        <div class="card" id="notices-card">
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
        <div class="section-title">📰 ${t('latest_news')}</div>
        <div class="card" id="news-card">
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
      `;
    },

    settings() {
      const s = this.state.settings;
      return `
        ${this.backendStatusBar()}
        <div class="card">
          <div class="card-header"><span class="card-title">🌍 ${t('language')}</span></div>
          <div class="lang-options">
            <button class="lang-btn ${s.language === 'en' ? 'active' : ''}" onclick="App.setLanguage('en')">🇬🇧 ${t('english')}</button>
            <button class="lang-btn ${s.language === 'my' ? 'active' : ''}" onclick="App.setLanguage('my')">🇲🇲 ${t('myanmar')}</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">🔔 ${t('notification_settings')}</span></div>
          <div class="settings-row">
            <div><div class="settings-label">${t('notifications_on')}</div><div class="settings-sub">Receive push notifications from the bot</div></div>
            <label class="toggle"><input type="checkbox" ${s.notifications_on ? 'checked' : ''} onchange="App.toggleNotifications()" /><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-row">
            <div><div class="settings-label">${t('update_frequency')}</div><div class="settings-sub">How often to receive updates</div></div>
            <select class="input" style="width:auto;" onchange="App.setFrequency(this.value)">
              <option value="low" ${s.update_frequency === 'low' ? 'selected' : ''}>${t('low')}</option>
              <option value="normal" ${s.update_frequency === 'normal' ? 'selected' : ''}>${t('normal')}</option>
              <option value="high" ${s.update_frequency === 'high' ? 'selected' : ''}>${t('high')}</option>
            </select>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">ℹ️ ${t('about')}</span></div>
          <div class="settings-row"><span class="settings-label">${t('version')}</span><span class="settings-sub">GramAlert v6.1 Mini App</span></div>
          <div class="settings-row"><span class="settings-label">📡 Price Channel</span><a href="https://t.me/GramAlert11" class="news-link">@GramAlert11</a></div>
          <div class="settings-row"><span class="settings-label">📰 News Channel</span><a href="https://t.me/PePeMission" class="news-link">@PePeMission</a></div>
          <div class="settings-row"><span class="settings-label">${t('contact_admin')}</span><a href="https://t.me/Maxiumlyrx" class="news-link">@Maxiumlyrx</a></div>
        </div>
        <p style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:16px;">⚠️ ${t('not_financial_advice')}</p>
      `;
    },

    // ── Stats page (community/bot statistics) ──
    stats() {
      return `
        ${this.backendStatusBar()}
        <div class="card" id="pred-stats-card">
          <div class="card-header"><span class="card-title">📊 ${t('my_stats')}</span></div>
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
        <div class="section-title">🏆 ${t('leaderboard')}</div>
        <div class="card" id="stats-lb-card">
          <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
        </div>
      `;
    },

    // ── Profit Calculator ──
    profit() {
      const p = this.state.price;
      const currentPrice = p?.price || 0;
      return `
        ${this.backendStatusBar()}
        <div class="card">
          <div class="card-header"><span class="card-title">📈 Profit Calculator</span></div>
          <div class="input-group">
            <label class="input-label">GRAM Amount</label>
            <input type="number" class="input" id="prof-gram" placeholder="e.g. 1000" step="0.01" min="0" oninput="App.calcProfit()" />
          </div>
          <div class="input-group">
            <label class="input-label">Buy Price (USDT)</label>
            <input type="number" class="input" id="prof-buy" placeholder="e.g. 3.00" step="0.001" min="0" oninput="App.calcProfit()" />
          </div>
          <div class="input-group">
            <label class="input-label">Sell Price (USDT)</label>
            <input type="number" class="input" id="prof-sell" placeholder="Current: ${this.fmtPrice(currentPrice)}" step="0.001" min="0" oninput="App.calcProfit()" value="${currentPrice ? currentPrice.toFixed(4) : ''}" />
          </div>
          <div class="card" id="profit-result" style="background:var(--bg-secondary);border:1px solid var(--border-light);margin-top:4px;">
            <p style="text-align:center;color:var(--text-muted);font-size:13px;">Enter amounts to calculate profit</p>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">💼 Portfolio P&L</span></div>
          <div id="portfolio-pnl">
            <div class="empty-state"><div class="icon">⏳</div><p>${t('loading')}</p></div>
          </div>
        </div>
        <p style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:16px;">⚠️ ${t('not_financial_advice')}</p>
      `;
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Helper Components
  // ═══════════════════════════════════════════════════════════
  dashTile(icon, page) {
    return `<div class="dash-tile" onclick="App.navigate('${page}')"><span class="icon">${icon}</span><span class="label">${t(page)}</span></div>`;
  },

  backendStatusBar() {
    const available = API.isBackendAvailable();
    return `<div class="backend-status"><span class="dot ${available ? 'online' : 'offline'}"></span>${available ? 'Connected to backend' : 'Demo mode — connect your backend'}</div>`;
  },

  // ═══════════════════════════════════════════════════════════
  // Formatting
  // ═══════════════════════════════════════════════════════════
  fmtPrice(p) {
    if (p == null) return 'N/A';
    if (p >= 100)  return `$${p.toFixed(2)}`;
    if (p >= 1)    return `$${p.toFixed(3)}`;
    return `$${p.toFixed(4)}`;
  },
  fmtVol(v) {
    if (v == null) return 'N/A';
    if (v >= 1e9) return `$${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v/1e3).toFixed(1)}K`;
    return `$${v.toFixed(2)}`;
  },
  fmtGram(a) {
    if (a == null) return 'N/A';
    if (a >= 1e9) return `${(a/1e9).toFixed(2)}B GRAM`;
    if (a >= 1e6) return `${(a/1e6).toFixed(2)}M GRAM`;
    if (a >= 1e3) return `${(a/1e3).toFixed(2)}K GRAM`;
    return `${Number(a).toFixed(2)} GRAM`;
  },
  fmtTime(ts) {
    if (!ts) return 'N/A';
    // Handle both seconds and milliseconds timestamps
    const ms = ts > 9e11 ? ts : ts * 1000;
    const diff = Date.now() - ms;
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(ms).toLocaleDateString();
  },
  shortAddr(a) {
    if (!a) return 'Unknown';
    return a.length <= 12 ? a : a.slice(0,6) + '…' + a.slice(-4);
  },

  // ═══════════════════════════════════════════════════════════
  // Page setups
  // ═══════════════════════════════════════════════════════════
  setupDashboard() {
    this.loadDashWhale();
  },

  async loadDashWhale() {
    const card = document.getElementById('dash-whale-card');
    if (!card) return;
    try {
      const [summary, transfers] = await Promise.all([API.getWhaleSummary(), API.getWhaleTransfers()]);
      let html = '';
      if (summary) {
        html += `<div class="stat-grid" style="margin-bottom:12px;">
          <div class="stat-item"><div class="stat-label">${t('largest_transfer')}</div><div class="stat-value" style="font-size:14px;">${this.fmtGram(summary.largest_transfer)}</div></div>
          <div class="stat-item"><div class="stat-label">${t('transfer_count')}</div><div class="stat-value" style="font-size:14px;">${summary.transfer_count || 0}</div></div>
        </div>`;
      }
      if (transfers && transfers.length) {
        html += transfers.slice(0,2).map(tx => this.whaleTransferHtml(tx)).join('');
      } else {
        html += `<div class="empty-state"><div class="icon">🐋</div><p>${t('no_data')}</p></div>`;
      }
      card.innerHTML = html;
    } catch (e) {
      card.innerHTML = `<div class="empty-state"><div class="icon">🐋</div><p>${t('no_data')}</p></div>`;
    }
  },

  whaleTransferHtml(tx) {
    return `<div class="whale-transfer">
      <div class="wt-top"><span class="wt-amount">🐋 ${this.fmtGram(tx.amount)}</span><span class="wt-time">${this.fmtTime(tx.timestamp)}</span></div>
      <div class="wt-addrs"><span>${this.shortAddr(tx.from_addr)}</span><span class="wt-arrow">→</span><span>${this.shortAddr(tx.to_addr)}</span>${tx.to_exchange ? ` <span class="badge badge-info">${tx.to_exchange}</span>` : ''}${tx.from_exchange ? ` <span class="badge badge-warning">${tx.from_exchange}</span>` : ''}</div>
    </div>`;
  },

  async setupPricePage() {
    document.querySelectorAll('.chart-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.state.chartDays = parseInt(tab.dataset.days);
        this.loadChart();
      });
    });
    this.loadChart();
  },

  async loadChart() {
    const canvas = document.getElementById('price-chart');
    if (!canvas) return;
    try {
      const history = await API.getPriceHistory(this.state.chartDays);
      if (!history || !history.length) {
        canvas.parentElement.innerHTML = `<div class="empty-state"><p>No chart data available</p></div>`;
        return;
      }
      const labels = history.map(h => new Date(h.time).toLocaleDateString([], {month:'short',day:'numeric'}));
      const prices = history.map(h => h.price);
      if (this.state.chartInstance) this.state.chartInstance.destroy();
      this.state.chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'GRAM Price',
            data: prices,
            borderColor: '#0098ea',
            backgroundColor: 'rgba(0,152,234,0.1)',
            fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', maxTicksLimit: 5 } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', callback: v => '$' + v.toFixed(3) } },
          },
        },
      });
    } catch (e) { console.warn('Chart load failed', e); }
  },

  setupConverter() {},
  convertGram() {
    const gram = parseFloat(document.getElementById('conv-gram')?.value || 0);
    const rate = this.state.price?.price || 0;
    const el = document.getElementById('conv-usdt');
    if (el && rate) el.value = (gram * rate).toFixed(4);
  },
  convertUsdt() {
    const usdt = parseFloat(document.getElementById('conv-usdt')?.value || 0);
    const rate = this.state.price?.price || 0;
    const el = document.getElementById('conv-gram');
    if (el && rate) el.value = (usdt / rate).toFixed(4);
  },
  swapConverter() {
    const g = document.getElementById('conv-gram');
    const u = document.getElementById('conv-usdt');
    if (g && u) { const gv = g.value; g.value = u.value; u.value = gv; }
  },

  async setupAlerts() {
    const list = document.getElementById('alerts-list');
    if (!list) return;
    try {
      const alerts = await API.getAlerts();
      if (!alerts || !alerts.length) {
        list.innerHTML = `<div class="empty-state"><div class="icon">🔔</div><p>${t('no_alerts')}</p></div>`;
        return;
      }
      list.innerHTML = alerts.map(a => `
        <div class="list-item">
          <div class="list-item-left">
            <div class="list-item-icon">${a.direction === 'above' ? '⬆️' : '⬇️'}</div>
            <div class="list-item-info">
              <span class="list-item-title">${this.fmtPrice(a.target)}</span>
              <span class="list-item-sub">${a.direction} · ${new Date(a.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="App.deleteAlert(${a.id})">🗑</button>
        </div>`).join('');
    } catch (e) {
      list.innerHTML = `<div class="empty-state"><div class="icon">🔔</div><p>${t('no_alerts')}</p></div>`;
    }
  },
  async createAlert() {
    const target = parseFloat(document.getElementById('alert-target')?.value);
    const direction = document.getElementById('alert-direction')?.value;
    if (!target || target <= 0) { this.showToast('❌ Invalid price', 'error'); return; }
    try {
      await API.createAlert(target, direction);
      this.showToast('✅ Alert created!', 'success');
      document.getElementById('alert-target').value = '';
      this.setupAlerts();
    } catch (e) { this.showToast('❌ ' + e.message, 'error'); }
  },
  async deleteAlert(id) {
    try {
      await API.deleteAlert(id);
      this.showToast('🗑 Deleted', 'success');
      this.setupAlerts();
    } catch (e) { this.showToast('❌ ' + e.message, 'error'); }
  },

  async setupPortfolio() {
    const card = document.getElementById('portfolio-summary');
    if (!card) return;
    try {
      const holdings = await API.getPortfolio();
      const price = this.state.price?.price || 0;
      let totalInvested = 0, totalValue = 0;
      let html = `<div class="card-header"><span class="card-title">💼 ${t('holdings')}</span></div>`;
      if (!holdings || !holdings.length) {
        html += `<div class="empty-state"><div class="icon">💼</div><p>${t('no_holdings')}</p></div>`;
      } else {
        holdings.forEach(h => {
          const inv = h.gram_amount * h.buy_price;
          const val = h.gram_amount * price;
          const pnl = val - inv;
          const roi = inv ? (pnl / inv * 100) : 0;
          totalInvested += inv; totalValue += val;
          const cls = pnl >= 0 ? 'positive' : 'negative';
          html += `<div class="list-item">
            <div class="list-item-left">
              <div class="list-item-icon">🪙</div>
              <div class="list-item-info">
                <span class="list-item-title">${h.gram_amount} GRAM @ ${this.fmtPrice(h.buy_price)}</span>
                <span class="list-item-sub">Now: ${this.fmtPrice(val)}</span>
              </div>
            </div>
            <div class="list-item-right">
              <div class="list-item-value ${cls}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</div>
              <span class="stat-change ${cls}">${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%</span>
            </div>
          </div>`;
        });
      }
      if (totalInvested > 0) {
        const pnl = totalValue - totalInvested;
        const roi = pnl / totalInvested * 100;
        const cls = pnl >= 0 ? 'positive' : 'negative';
        html += `<div class="stat-grid" style="margin-top:12px;">
          <div class="stat-item"><div class="stat-label">${t('total_invested')}</div><div class="stat-value">${this.fmtPrice(totalInvested)}</div></div>
          <div class="stat-item"><div class="stat-label">${t('current_value')}</div><div class="stat-value">${this.fmtPrice(totalValue)}</div></div>
          <div class="stat-item"><div class="stat-label">${t('profit_loss')}</div><div class="stat-value ${cls}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">${t('roi')}</div><div class="stat-value ${cls}">${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%</div></div>
        </div>`;
      }
      card.innerHTML = html;
    } catch (e) {
      card.innerHTML = `<div class="empty-state"><div class="icon">💼</div><p>${t('no_holdings')}</p></div>`;
    }
  },
  async addHolding() {
    const gram = parseFloat(document.getElementById('port-gram')?.value);
    const price = parseFloat(document.getElementById('port-price')?.value);
    if (!gram || gram <= 0 || !price || price <= 0) { this.showToast('❌ Invalid input', 'error'); return; }
    try {
      await API.addHolding(gram, price);
      this.showToast('✅ Holding added!', 'success');
      document.getElementById('port-gram').value = '';
      document.getElementById('port-price').value = '';
      this.setupPortfolio();
    } catch (e) { this.showToast('❌ ' + e.message, 'error'); }
  },

  setupWalletPage() {
    if (this.state.wallet) this.loadWalletInfo();
  },
  async loadWalletInfo() {
    const card = document.getElementById('wallet-info-card');
    const txList = document.getElementById('wallet-tx-list');
    try {
      const info = await API.getWalletInfo();
      if (card && info) {
        card.innerHTML = `
          <div class="card-header"><span class="card-title">💰 ${t('wallet_balance')}</span></div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-label">TON</div><div class="stat-value">${info.balance_ton != null ? Number(info.balance_ton).toFixed(3) : '—'}</div></div>
            <div class="stat-item"><div class="stat-label">GRAM</div><div class="stat-value">${Number(info.balance_gram || 0).toFixed(2)}</div></div>
            <div class="stat-item"><div class="stat-label">Portfolio</div><div class="stat-value">${this.fmtPrice(info.portfolio_value)}</div></div>
            <div class="stat-item"><div class="stat-label">USD Value</div><div class="stat-value">${this.fmtPrice(info.balance_usd)}</div></div>
          </div>`;
      }
      if (txList && info?.transactions?.length) {
        txList.innerHTML = info.transactions.map(tx => `
          <div class="list-item">
            <div class="list-item-left">
              <div class="list-item-icon">${tx.type === 'in' ? '📥' : '📤'}</div>
              <div class="list-item-info">
                <span class="list-item-title">${tx.type === 'in' ? 'Received' : 'Sent'} ${tx.amount} TON</span>
                <span class="list-item-sub">${this.shortAddr(tx.hash)}</span>
              </div>
            </div>
            <div class="list-item-right"><span class="list-item-sub">${this.fmtTime(tx.time)}</span></div>
          </div>`).join('');
      } else if (txList) {
        txList.innerHTML = `<div class="empty-state"><div class="icon">📋</div><p>No transactions yet</p></div>`;
      }
    } catch (e) { console.warn('Wallet info load failed', e); }
  },
  async copyAddress() {
    try {
      await navigator.clipboard.writeText(this.state.wallet?.address || '');
      this.showToast('📋 Copied!', 'success');
    } catch (e) { this.showToast('Copy failed', 'error'); }
  },
  async disconnectWallet() {
    await Wallet.disconnect();
    this.showToast('🔌 Disconnected', 'success');
  },

  async loadWhaleData() {
    const summaryCard = document.getElementById('whale-summary-card');
    const transfersList = document.getElementById('whale-transfers-list');
    try {
      const [summary, transfers] = await Promise.all([API.getWhaleSummary(), API.getWhaleTransfers()]);
      if (summaryCard && summary) {
        const net = (summary.exchange_inflow || 0) - (summary.exchange_outflow || 0);
        summaryCard.innerHTML = `
          <div class="card-header"><span class="card-title">📊 ${t('whale_summary')}</span></div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-label">${t('largest_transfer')}</div><div class="stat-value" style="font-size:14px;">${this.fmtGram(summary.largest_transfer)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('total_volume')}</div><div class="stat-value" style="font-size:14px;">${this.fmtGram(summary.total_volume)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('transfer_count')}</div><div class="stat-value" style="font-size:14px;">${summary.transfer_count || 0}</div></div>
            <div class="stat-item"><div class="stat-label">${t('net_flow')}</div><div class="stat-value ${net >= 0 ? 'positive' : 'negative'}" style="font-size:14px;">${net >= 0 ? '+' : ''}${this.fmtGram(Math.abs(net))}</div></div>
          </div>
          <div style="margin-top:12px;display:flex;gap:8px;">
            <div class="stat-item" style="flex:1;"><div class="stat-label">📥 ${t('exchange_inflow')}</div><div class="stat-value" style="font-size:13px;color:var(--success);">${this.fmtGram(summary.exchange_inflow)}</div></div>
            <div class="stat-item" style="flex:1;"><div class="stat-label">📤 ${t('exchange_outflow')}</div><div class="stat-value" style="font-size:13px;color:var(--danger);">${this.fmtGram(summary.exchange_outflow)}</div></div>
          </div>`;
      }
      if (transfersList && transfers?.length) {
        transfersList.innerHTML = transfers.map(tx => this.whaleTransferHtml(tx)).join('');
      } else if (transfersList) {
        transfersList.innerHTML = `<div class="empty-state"><div class="icon">🐋</div><p>${t('no_data')}</p></div>`;
      }
    } catch (e) { console.warn('Whale data load failed', e); }
  },

  async setupAI() {
    const card = document.getElementById('ai-card');
    if (!card) return;
    try {
      const data = await API.getAISummary();
      if (data) {
        card.innerHTML = `
          <div class="card-header"><span class="card-title">🤖 ${t('market_summary')}</span></div>
          <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.market_summary || ''}</div>
          ${data.whale_analysis ? `<div class="section-title">🐋 ${t('whale_explanation')}</div><div style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.whale_analysis}</div>` : ''}
          ${data.news_summary ? `<div class="section-title">📰 ${t('news_summary')}</div><div style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.news_summary}</div>` : ''}
          <p style="font-size:11px;color:var(--text-muted);margin-top:12px;">⚠️ ${t('not_financial_advice')}</p>`;
      }
    } catch (e) {
      card.innerHTML = `<div class="empty-state"><div class="icon">🤖</div><p>Failed to generate summary</p></div>`;
    }
  },

  async setupPrediction() {
    const statusCard = document.getElementById('pred-status-card');
    const lbCard = document.getElementById('pred-lb-card');
    const statsCard = document.getElementById('pred-stats-card');
    try {
      const [status, lb, stats] = await Promise.all([
        API.getPredictionStatus(), API.getLeaderboard(), API.getMyStats(),
      ]);
      if (statusCard && status) {
        let html = `
          <div class="card-header"><span class="card-title">🎯 ${t('predict_price')}</span></div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-label">${t('live_price')}</div><div class="stat-value" style="font-size:16px;">${this.fmtPrice(status.current_price)}</div></div>
            <div class="stat-item"><div class="stat-label">${t('participants')}</div><div class="stat-value" style="font-size:16px;">${status.participants || 0}</div></div>
          </div>`;
        if (status.user_prediction) {
          html += `<div class="badge-row" style="margin-top:10px;"><span class="badge badge-accent">🎯 ${t('your_prediction')}: ${this.fmtPrice(status.user_prediction)}</span></div>`;
        } else if (status.is_open) {
          html += `
            <div class="input-group" style="margin-top:12px;">
              <label class="input-label">${t('your_prediction')} (USDT)</label>
              <input type="number" class="input" id="pred-input" placeholder="e.g. 3.850" step="0.001" min="0" />
            </div>
            <button class="btn btn-primary" onclick="App.submitPrediction()">🎯 ${t('submit_prediction')}</button>`;
        } else {
          html += `<p style="font-size:13px;color:var(--text-muted);margin-top:8px;">⏰ ${t('deadline')}: ${status.deadline}</p>`;
        }
        statusCard.innerHTML = html;
      }
      if (lbCard && lb?.length) {
        lbCard.innerHTML = `<div class="card-header"><span class="card-title">🏆 ${t('leaderboard')}</span></div>` +
          lb.map(r => {
            const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`;
            return `<div class="lb-row"><span class="lb-rank">${medal}</span><div class="lb-info"><div class="lb-name">@${r.username}</div><div class="lb-stats">🏆 ${r.wins} wins | 🎯 ${r.accuracy}% | 🔥 ${r.current_streak} streak</div></div></div>`;
          }).join('');
      } else if (lbCard) {
        lbCard.innerHTML = `<div class="empty-state"><div class="icon">🏆</div><p>No predictions yet</p></div>`;
      }
      if (statsCard && stats) {
        statsCard.innerHTML = `
          <div class="card-header"><span class="card-title">📊 ${t('my_stats')}</span></div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-label">${t('wins')}</div><div class="stat-value" style="font-size:16px;">${stats.wins || 0}</div></div>
            <div class="stat-item"><div class="stat-label">${t('accuracy')}</div><div class="stat-value" style="font-size:16px;">${stats.accuracy || 0}%</div></div>
            <div class="stat-item"><div class="stat-label">${t('streak')}</div><div class="stat-value" style="font-size:16px;">🔥 ${stats.current_streak || 0}</div></div>
            <div class="stat-item"><div class="stat-label">${t('points')}</div><div class="stat-value" style="font-size:16px;">${stats.total_points || 0}</div></div>
          </div>`;
      }
    } catch (e) { console.warn('Prediction load failed', e); }
  },
  async submitPrediction() {
    const price = parseFloat(document.getElementById('pred-input')?.value);
    if (!price || price <= 0) { this.showToast('❌ Invalid price', 'error'); return; }
    try {
      await API.submitPrediction(price);
      this.showToast('🎯 Prediction submitted!', 'success');
      this.render();
    } catch (e) { this.showToast('❌ ' + e.message, 'error'); }
  },

  async loadNewsData() {
    const noticesCard = document.getElementById('notices-card');
    const newsCard = document.getElementById('news-card');
    try {
      const [notices, news] = await Promise.all([API.getNotices(), API.getNews()]);
      if (noticesCard) {
        noticesCard.innerHTML = notices?.length
          ? `<div class="card-header"><span class="card-title">📢 ${t('announcements')}</span></div>` +
            notices.map(n => `<div class="news-item">${n.pinned ? '<span class="badge badge-accent">📌</span> ' : ''}<div class="news-text">${n.text}</div><div class="news-date">${new Date(n.created_at).toLocaleDateString()}</div></div>`).join('')
          : `<div class="empty-state"><div class="icon">📢</div><p>${t('no_news')}</p></div>`;
      }
      if (newsCard) {
        newsCard.innerHTML = news?.length
          ? `<div class="card-header"><span class="card-title">📰 ${t('latest_news')}</span></div>` +
            news.map(n => `<div class="news-item"><div class="news-text">${n.text || ''}</div><div class="news-date">${n.date || ''}</div>${n.link ? `<a href="${n.link}" class="news-link" target="_blank" rel="noopener">🔗 Source</a>` : ''}</div>`).join('')
          : `<div class="empty-state"><div class="icon">📰</div><p>${t('no_news')}</p></div>`;
      }
    } catch (e) { console.warn('News load failed', e); }
  },

  setupSettings() {},
  async setLanguage(lang) {
    this.state.settings.language = lang;
    try { await API.updateSettings({ language: lang }); } catch (e) {}
    this.showToast('✅ Language updated', 'success');
    this.render();
  },
  async toggleNotifications() {
    this.state.settings.notifications_on = !this.state.settings.notifications_on;
    try { await API.updateSettings({ notifications_on: this.state.settings.notifications_on }); } catch (e) {}
    this.showToast(this.state.settings.notifications_on ? '🔔 Notifications ON' : '🔕 Notifications OFF', 'success');
  },
  async setFrequency(freq) {
    this.state.settings.update_frequency = freq;
    try { await API.updateSettings({ update_frequency: freq }); } catch (e) {}
    this.showToast('✅ Updated', 'success');
  },

  // Stats page setup
  async setupStats() {
    const statsCard = document.getElementById('pred-stats-card');
    const lbCard = document.getElementById('stats-lb-card');
    try {
      const [stats, lb] = await Promise.all([API.getMyStats(), API.getLeaderboard()]);
      if (statsCard && stats) {
        statsCard.innerHTML = `
          <div class="card-header"><span class="card-title">📊 ${t('my_stats')}</span></div>
          <div class="stat-grid">
            <div class="stat-item"><div class="stat-label">Total Predictions</div><div class="stat-value" style="font-size:16px;">${stats.total_predictions || 0}</div></div>
            <div class="stat-item"><div class="stat-label">${t('wins')}</div><div class="stat-value" style="font-size:16px;">${stats.wins || 0}</div></div>
            <div class="stat-item"><div class="stat-label">${t('accuracy')}</div><div class="stat-value" style="font-size:16px;">${stats.accuracy || 0}%</div></div>
            <div class="stat-item"><div class="stat-label">Best Streak</div><div class="stat-value" style="font-size:16px;">🔥 ${stats.highest_streak || 0}</div></div>
            <div class="stat-item"><div class="stat-label">Current Streak</div><div class="stat-value" style="font-size:16px;">🔥 ${stats.current_streak || 0}</div></div>
            <div class="stat-item"><div class="stat-label">${t('points')}</div><div class="stat-value" style="font-size:16px;">${stats.total_points || 0}</div></div>
          </div>`;
      }
      if (lbCard && lb?.length) {
        lbCard.innerHTML = `<div class="card-header"><span class="card-title">🏆 ${t('leaderboard')}</span></div>` +
          lb.map(r => {
            const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`;
            return `<div class="lb-row"><span class="lb-rank">${medal}</span><div class="lb-info"><div class="lb-name">@${r.username || 'anonymous'}</div><div class="lb-stats">🏆 ${r.wins} wins · 🎯 ${r.accuracy}% · ${r.total_points} pts</div></div></div>`;
          }).join('');
      } else if (lbCard) {
        lbCard.innerHTML = `<div class="empty-state"><div class="icon">🏆</div><p>No data yet</p></div>`;
      }
    } catch (e) { console.warn('Stats load failed', e); }
  },

  // Profit calculator setup
  async setupProfit() {
    const pnlDiv = document.getElementById('portfolio-pnl');
    if (!pnlDiv) return;
    try {
      const holdings = await API.getPortfolio();
      const price = this.state.price?.price || 0;
      if (!holdings || !holdings.length) {
        pnlDiv.innerHTML = `<div class="empty-state"><div class="icon">💼</div><p>${t('no_holdings')}</p></div>`;
        return;
      }
      let totalInvested = 0, totalValue = 0;
      let html = '';
      holdings.forEach(h => {
        const inv = h.gram_amount * h.buy_price;
        const val = h.gram_amount * price;
        const pnl = val - inv;
        const roi = inv ? (pnl / inv * 100) : 0;
        totalInvested += inv; totalValue += val;
        const cls = pnl >= 0 ? 'positive' : 'negative';
        html += `<div class="list-item">
          <div class="list-item-left"><div class="list-item-icon">🪙</div><div class="list-item-info"><span class="list-item-title">${h.gram_amount} GRAM</span><span class="list-item-sub">@ ${this.fmtPrice(h.buy_price)}</span></div></div>
          <div class="list-item-right"><div class="list-item-value ${cls}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</div><span class="stat-change ${cls}">${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%</span></div>
        </div>`;
      });
      const totalPnl = totalValue - totalInvested;
      const totalRoi = totalInvested ? (totalPnl / totalInvested * 100) : 0;
      const cls = totalPnl >= 0 ? 'positive' : 'negative';
      html += `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);">
        <div class="stat-grid">
          <div class="stat-item"><div class="stat-label">Invested</div><div class="stat-value">${this.fmtPrice(totalInvested)}</div></div>
          <div class="stat-item"><div class="stat-label">Value Now</div><div class="stat-value">${this.fmtPrice(totalValue)}</div></div>
          <div class="stat-item"><div class="stat-label">P&L</div><div class="stat-value ${cls}">${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">ROI</div><div class="stat-value ${cls}">${totalRoi >= 0 ? '+' : ''}${totalRoi.toFixed(1)}%</div></div>
        </div>
      </div>`;
      pnlDiv.innerHTML = html;
    } catch (e) {
      pnlDiv.innerHTML = `<div class="empty-state"><div class="icon">💼</div><p>${t('no_holdings')}</p></div>`;
    }
  },

  calcProfit() {
    const gram  = parseFloat(document.getElementById('prof-gram')?.value || 0);
    const buy   = parseFloat(document.getElementById('prof-buy')?.value || 0);
    const sell  = parseFloat(document.getElementById('prof-sell')?.value || 0);
    const result = document.getElementById('profit-result');
    if (!result) return;
    if (!gram || !buy || !sell) {
      result.innerHTML = `<p style="text-align:center;color:var(--text-muted);font-size:13px;">Enter all three values</p>`;
      return;
    }
    const invested = gram * buy;
    const revenue  = gram * sell;
    const pnl = revenue - invested;
    const roi = (pnl / invested) * 100;
    const cls = pnl >= 0 ? 'positive' : 'negative';
    result.innerHTML = `
      <div class="stat-grid">
        <div class="stat-item"><div class="stat-label">Invested</div><div class="stat-value">${this.fmtPrice(invested)}</div></div>
        <div class="stat-item"><div class="stat-label">Revenue</div><div class="stat-value">${this.fmtPrice(revenue)}</div></div>
        <div class="stat-item"><div class="stat-label">Profit / Loss</div><div class="stat-value ${cls}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</div></div>
        <div class="stat-item"><div class="stat-label">ROI</div><div class="stat-value ${cls}">${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%</div></div>
      </div>`;
  },

  // ═══════════════════════════════════════════════════════════
  // Price Loading
  // ═══════════════════════════════════════════════════════════
  async loadPrice() {
    try {
      const data = await API.getPrice();
      if (data && data.price) {
        this.state.price = data;
        this.updatePriceDisplay();
      }
    } catch (e) { /* fail silently — price loaded on next interval */ }
  },
  updatePriceDisplay() {
    const main = document.getElementById('price-main');
    if (main && this.state.price?.price) main.textContent = this.fmtPrice(this.state.price.price);
  },
  async refreshPrice() {
    this.haptic('medium');
    await this.loadPrice();
    this.showToast('🔄 Refreshed', 'success');
  },

  // ═══════════════════════════════════════════════════════════
  // Wallet Indicator
  // ═══════════════════════════════════════════════════════════
  updateWalletIndicator(connected) {
    const dot = document.querySelector('#wallet-indicator .dot');
    if (dot) {
      dot.classList.toggle('connected', connected);
      dot.classList.toggle('disconnected', !connected);
    }
  },

  // ═══════════════════════════════════════════════════════════
  // More Menu
  // ═══════════════════════════════════════════════════════════
  openMoreMenu() {
    const overlay = document.getElementById('more-menu-overlay');
    const grid = document.getElementById('more-menu-grid');
    const items = [
      { icon: '🔄', page: 'converter' }, { icon: '🔔', page: 'alerts' },
      { icon: '🐋', page: 'whale'     }, { icon: '🤖', page: 'ai'         },
      { icon: '🎯', page: 'prediction'}, { icon: '📰', page: 'news'       },
      { icon: '📊', page: 'stats'     }, { icon: '📈', page: 'profit'     },
    ];
    grid.innerHTML = items.map(i =>
      `<button class="more-menu-item" onclick="App.navigate('${i.page}');App.closeMoreMenu()"><span class="icon">${i.icon}</span><span class="label">${t(i.page)}</span></button>`
    ).join('');
    overlay.classList.add('show');
  },
  closeMoreMenu() {
    document.getElementById('more-menu-overlay')?.classList.remove('show');
  },

  // ═══════════════════════════════════════════════════════════
  // Utilities
  // ═══════════════════════════════════════════════════════════
  haptic(style = 'light') {
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style); } catch (e) {}
  },
  showToast(msg, type = '') {
    document.querySelector('.toast')?.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
