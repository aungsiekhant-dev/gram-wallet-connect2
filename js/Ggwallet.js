// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — TON Connect Wallet Integration (unified with bot)
// ═══════════════════════════════════════════════════════════
// Uses the TON Connect UI SDK. When a wallet is connected here, the address +
// verified Telegram user are sent to the backend, which stores them in the SAME
// wallets row the Telegram bot uses. syncFromBackend() pulls the bot-side wallet
// so a wallet connected via the bot button also appears connected here.

const Wallet = {
  tonConnectUI: null,
  initialized: false,

  async init() {
    if (this.initialized) return;
    if (typeof TONConnectUI === 'undefined') {
      console.warn('[Wallet] TON Connect SDK not loaded');
      // still try to restore a bot-side wallet
      await this.syncFromBackend();
      return;
    }
    try {
      this.tonConnectUI = new TONConnectUI.TonConnectUI({
        manifestUrl: CONFIG.TON_CONNECT_MANIFEST,
        uiPreferences: { theme: 'DARK' },
      });
      this.tonConnectUI.onStatusChange((wallet) => this.handleStatusChange(wallet));
      const restored = await this.tonConnectUI.connectionRestored;
      if (restored && this.tonConnectUI.wallet) {
        this.handleStatusChange(this.tonConnectUI.wallet);
      } else {
        // no local wallet — check if the bot already has one for this user
        await this.syncFromBackend();
      }
      this.initialized = true;
    } catch (err) {
      console.error('[Wallet] Init failed:', err);
      await this.syncFromBackend();
    }
  },

  // Pull the wallet from the bot's database (shared record).
  async syncFromBackend() {
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
      // backend unavailable — leave wallet state as-is
      console.warn('[Wallet] backend sync failed:', e);
    }
  },

  async handleStatusChange(wallet) {
    if (wallet) {
      const address = wallet.account.address;
      const provider = wallet.device?.appName || 'TON Wallet';
      App.state.wallet = { address, provider, chain: wallet.account.chain };
      try {
        await API.connectWallet(address, provider);
        App.showToast('Wallet connected & synced with bot', 'success');
      } catch (err) {
        console.warn('[Wallet] Failed to notify backend:', err);
        App.showToast('Connected locally, backend sync failed', 'error');
      }
      App.updateWalletIndicator(true);
    } else {
      App.state.wallet = null;
      try { await API.disconnectWallet(); } catch (err) { console.warn('[Wallet] disconnect notify failed:', err); }
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
    if (this.tonConnectUI) {
      try { await this.tonConnectUI.disconnect(); } catch (e) {}
    }
    App.state.wallet = null;
    try { await API.disconnectWallet(); } catch (e) {}
    App.updateWalletIndicator(false);
    if (App.state.page === 'wallet') App.render();
  },

  isConnected() {
    return (this.tonConnectUI?.connected) || App.state.wallet !== null;
  },

  getShortAddress(address) {
    if (!address) return 'N/A';
    if (address.length <= 12) return address;
    return address.slice(0, 4) + '...' + address.slice(-4);
  },
};
