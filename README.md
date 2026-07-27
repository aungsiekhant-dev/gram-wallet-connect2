# GramAlert Mini App v6.1

A Telegram Mini App for tracking GRAM price, whale movements, TON wallet,
and predictions. Connects to the GramAlert bot backend for real data.

## Setup

### 1 — Configure the backend URL

Open `js/config.js` and set:

```js
API_BASE_URL: 'https://YOUR-SUBDOMAIN.vortexa.cloud/api',
TON_CONNECT_MANIFEST: 'https://YOUR-USERNAME.github.io/YOUR-REPO/tonconnect-manifest.json',
```

### 2 — Update tonconnect-manifest.json

Edit `tonconnect-manifest.json` to point to your hosting URL:

```json
{
  "url": "https://YOUR-USERNAME.github.io/YOUR-REPO/",
  "name": "GramAlert",
  "iconUrl": "https://YOUR-USERNAME.github.io/YOUR-REPO/icon.png"
}
```

### 3 — Host the Mini App

**Option A — GitHub Pages:**
1. Push these files to a GitHub repository.
2. Enable GitHub Pages in Settings → Pages → Branch: main.
3. Your app will be at: `https://USERNAME.github.io/REPO/`

**Option B — Any static host (Vercel, Netlify, Cloudflare Pages):**
Upload the files and get the public URL.

### 4 — Register with the Telegram Bot

In BotFather:
1. `/mybots` → select your bot
2. `Bot Settings` → `Menu Button`
3. Set the URL to your hosting URL

OR use the bot command `/menu` which has an "Open Mini App" button.

## Features

| Page | Description |
|------|-------------|
| Dashboard | Live price, whale activity overview, quick navigation |
| Price | Real-time chart (24H/7D/30D/90D), market stats |
| Portfolio | Holdings with P&L calculation |
| Wallet | TON wallet connection (Tonkeeper, MyTonWallet, etc.) |
| Alerts | Price alert management |
| Converter | GRAM ↔ USDT converter |
| Whale | Large transfer tracking + daily summary |
| AI Summary | Market analysis from real bot data |
| Prediction | Daily price prediction game + leaderboard |
| News | Latest channel posts + admin notices |
| Settings | Language (EN/MM), notifications, update frequency |
| Stats | Your prediction stats + global leaderboard |
| Profit | P&L calculator + portfolio breakdown |

## Architecture

```
Mini App (GitHub Pages)
    │
    │  HTTPS + X-Telegram-Init-Data header (HMAC-verified)
    │
    ▼
GramAlert Bot API (Vortexacloud)
    │
    │  Same process, same SQLite DB
    │
    ▼
gramalert.db ← shared with Telegram bot
```

Every API call includes the `X-Telegram-Init-Data` header.
The backend HMAC-verifies it using your bot token before trusting any user data.
The user ID is never sent from the client — it's extracted from the verified initData.

## Backend Status Indicator

- 🟢 **Connected to backend** — real data, all features work
- 🟡 **Demo mode** — backend URL not configured or unreachable

## Bugs Fixed vs v5.97

| Bug | Fix |
|-----|-----|
| `stats` and `profit` pages had no content | Both pages now fully implemented |
| API.authenticate() sent user data in body (security issue) | Auth now uses only initData header; body is empty |
| Wallet.init() not idempotent | Uses promise-based singleton pattern |
| Toast on close-more overlay click only when clicking grid | Clicking overlay background now closes menu |
| fmtTime() broke on Unix timestamps (seconds vs ms) | Handles both seconds and milliseconds |
| Missing `rel="noopener"` on external links | Added |
| Chart destroyed but not reset on page re-render | Properly destroyed before rebuilding |
