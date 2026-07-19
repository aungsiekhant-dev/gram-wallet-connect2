// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — TON Connect Wallet Integration
// ═══════════════════════════════════════════════════════════
// Uses TON Connect UI SDK for wallet connections.
// Supports Tonkeeper, MyTonWallet, and other TON wallets.
//
// When a wallet is connected, the wallet address + Telegram user ID
// are sent to the backend API so the bot can recognize the wallet.

const Wallet = {
  tonConnectUI: null,
  initialized: false,

  // ─── Initialize TON Connect ───
  async init() {
    if (this.initialized) return;
    if (typeof TONConnectUI === 'undefined') {
      console.warn('[Wallet] TON Connect SDK not loaded');
      return;
    }

    try {
      this.tonConnectUI = new TONConnectUI.TonConnectUI({
        manifestUrl: CONFIG.TON_CONNECT_MANIFEST,
        uiPreferences: { theme: 'DARK' },
      });

      this.tonConnectUI.onStatusChange((wallet) => {
        this.handleStatusChange(wallet);
      });

      // Check if already connected (restored from storage)
      const restored = await this.tonConnectUI.connectionRestored;
      if (restored && this.tonConnectUI.wallet) {
        this.handleStatusChange(this.tonConnectUI.wallet);
      }

      this.initialized = true;
      console.log('[Wallet] TON Connect initialized');
    } catch (err) {
      console.error('[Wallet] Init failed:', err);
    }
  },

  // ─── Handle wallet connect/disconnect ───
  async handleStatusChange(wallet) {
    if (wallet) {
      const address = wallet.account.address;
      const provider = wallet.device?.appName || 'Unknown';

      App.state.wallet = {
        address: address,
        provider: provider,
        chain: wallet.account.chain,
      };

      // Send to backend so the Telegram bot can recognize this wallet
      try {
        await API.connectWallet(address, provider);
        App.showToast('✅ Wallet connected!', 'success');
      } catch (err) {
        console.warn('[Wallet] Failed to notify backend:', err);
      }

      App.updateWalletIndicator(true);
    } else {
      App.state.wallet = null;

      try {
        await API.disconnectWallet();
      } catch (err) {
        console.warn('[Wallet] Failed to notify backend:', err);
      }

      App.updateWalletIndicator(false);
    }

    // Re-render wallet page if currently viewing it
    if (App.state.page === 'wallet') {
      App.render();
    }
  },

  // ─── Open wallet connection modal ───
  openModal() {
    if (this.tonConnectUI) {
      this.tonConnectUI.openModal();
    } else {
      App.showToast('Wallet SDK not loaded. Please refresh.', 'error');
    }
  },

  // ─── Disconnect wallet ───
  async disconnect() {
    if (this.tonConnectUI) {
      await this.tonConnectUI.disconnect();
    }
  },

  // ─── Check if connected ───
  isConnected() {
    return this.tonConnectUI?.connected || App.state.wallet !== null;
  },

  // ─── Get friendly address (short format for display) ───
  getShortAddress(address) {
    if (!address) return 'N/A';
    if (address.length <= 12) return address;
    return address.slice(0, 4) + '...' + address.slice(-4);
  },
};
