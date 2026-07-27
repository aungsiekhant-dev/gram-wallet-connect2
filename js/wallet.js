// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — TON Connect Wallet Integration
// ═══════════════════════════════════════════════════════════
// Uses TON Connect UI SDK. When a wallet is connected here, the address +
// verified Telegram user are sent to the backend, which stores them in the
// SAME wallets row the Telegram bot uses. syncFromBackend() pulls the
// bot-side wallet so a wallet connected via the bot button also appears here.

const Wallet = {
  tonConnectUI: null,
  initialized: false,
  _initPromise: null,

  async init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._doInit();
    return this._initPromise;
  },

  async _doInit() {
    if (this.initialized) return;
    if (typeof TONConnectUI === 'undefined') {
      console.warn('[Wallet] TON Connect SDK not loaded — syncing from backend only');
      await this.syncFromBackend();
      return;
    }
    try {
      this.tonConnectUI = new TONConnectUI.TonConnectUI({
        manifestUrl: CONFIG.TON_CONNECT_MANIFEST,
        uiPreferences: { theme: 'DARK' },
      });
      this.tonConnectUI.onStatusChange((wallet) => this.handleStatusChange(wallet));
      // Wait for connection restoration (local cache)
      const restored = await this.tonConnectUI.connectionRestored;
      if (restored && this.tonConnectUI.wallet) {
        // Wallet already connected locally — sync to backend
        this.handleStatusChange(this.tonConnectUI.wallet);
      } else {
        // No local wallet — check if the bot already has one for this user
        await this.syncFromBackend();
      }
      this.initialized = true;
    } catch (err) {
      console.error('[Wallet] Init failed:', err);
      await this.syncFromBackend();
    }
  },

  // Pull the wallet address from the bot's database (shared record).
  // This makes a wallet connected via the bot button appear here automatically.
  async syncFromBackend() {
    // Only attempt if backend is potentially reachable
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return; // No auth available

    try {
      const info = await API.getWalletInfo();
      if (info && info.connected && info.address) {
        App.state.wallet = {
          address: info.address,
          provider: info.provider || 'GramAlert Bot',
          chain: 'mainnet',
        };
        App.updateWalletIndicator(true);
        if (App.state.page === 'wallet') App.render();
      } else {
        App.state.wallet = null;
        App.updateWalletIndicator(false);
      }
    } catch (e) {
      // Backend unavailable — leave wallet state as-is
      console.warn('[Wallet] Backend sync failed:', e.message);
    }
  },

  async handleStatusChange(wallet) {
    if (wallet) {
      const address = wallet.account?.address || wallet.address;
      const provider = wallet.device?.appName || wallet.name || 'TON Wallet';
      const chain = wallet.account?.chain || 'mainnet';
      App.state.wallet = { address, provider, chain };

      try {
        await API.connectWallet(address, provider);
        App.showToast('✅ Wallet connected & synced', 'success');
      } catch (err) {
        console.warn('[Wallet] Backend sync failed:', err.message);
        App.showToast('Connected locally — backend sync failed', 'error');
      }
      App.updateWalletIndicator(true);
    } else {
      App.state.wallet = null;
      try {
        await API.disconnectWallet();
      } catch (err) {
        console.warn('[Wallet] Disconnect notify failed:', err.message);
      }
      App.updateWalletIndicator(false);
    }
    if (App.state.page === 'wallet') App.render();
  },

  openModal() {
    if (this.tonConnectUI) {
      this.tonConnectUI.openModal();
    } else {
      App.showToast('Wallet SDK not loaded. Please refresh.', 'error');
    }
  },

  async disconnect() {
    // Disconnect from TON Connect SDK
    if (this.tonConnectUI) {
      try {
        await this.tonConnectUI.disconnect();
      } catch (e) { /* ignore */ }
    }
    // Notify backend
    App.state.wallet = null;
    try {
      await API.disconnectWallet();
    } catch (e) { /* ignore */ }
    App.updateWalletIndicator(false);
    if (App.state.page === 'wallet') App.render();
  },

  isConnected() {
    return Boolean(this.tonConnectUI?.connected || App.state.wallet);
  },

  getShortAddress(address) {
    if (!address) return 'N/A';
    if (address.length <= 12) return address;
    return address.slice(0, 6) + '…' + address.slice(-4);
  },
};
