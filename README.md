# GramAlert — Telegram Mini App

A modern, dark-themed Telegram Mini App for GRAM (TON) tracking. Connects to your existing GramAlert Telegram bot backend via API.

## 📁 File Structure

```
miniapp/
├── index.html                  # Main HTML entry point
├── css/
│   └── style.css               # Dark crypto theme styles
├── js/
│   ├── config.js               # API URLs & configuration
│   ├── i18n.js                 # English + Myanmar translations
│   ├── api.js                  # API client (with mock data fallback)
│   ├── wallet.js               # TON Connect wallet integration
│   └── app.js                  # Main app logic & page renderers
├── tonconnect-manifest.json    # TON Connect wallet manifest
└── README.md                   # This file
```

## 🚀 Deployment (GitHub Pages)

1. **Upload files** to your GitHub repository (e.g. `gramalert-miniapp`)

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / root
   - Save

3. **Update config.js** with your URLs:
   ```javascript
   API_BASE_URL: 'https://your-vps-domain.com/api',
   TON_CONNECT_MANIFEST: 'https://your-username.github.io/gramalert-miniapp/tonconnect-manifest.json',
   ```

4. **Update tonconnect-manifest.json** with your GitHub Pages URL

## 🔗 Backend API Setup (Your VPS)

The Mini App sends all requests to your VPS backend. Implement these endpoints:

### Authentication
- `POST /api/auth/telegram` — Receives Telegram `initData`, verifies it, returns user session

### Price
- `GET /api/price/gram` — Current GRAM price + 24h stats
- `GET /api/price/history?days=N` — Price history for charts

### Alerts
- `GET /api/alerts` — User's active alerts
- `POST /api/alerts` — Create alert `{ target, direction }`
- `DELETE /api/alerts/:id` — Delete alert

### Portfolio
- `GET /api/portfolio` — User's holdings
- `POST /api/portfolio` — Add holding `{ gram_amount, buy_price }`
- `DELETE /api/portfolio/:id` — Delete holding

### Wallet (TON Connect)
- `POST /api/wallet/connect` — `{ telegram_user_id, wallet_address, provider }`
- `POST /api/wallet/disconnect` — Disconnect wallet
- `GET /api/wallet/info` — Returns `{ connected, address, balance_ton, balance_usd, transactions[] }`

### Whale Tracking
- `GET /api/whale/transfers` — Recent large transfers
- `GET /api/whale/summary` — Daily summary stats

### AI Summary
- `POST /api/ai/summary` — Returns `{ market_summary, whale_analysis, news_summary }`

### Prediction Game
- `GET /api/prediction/status` — Today's status `{ is_open, deadline, participants, current_price, user_prediction }`
- `POST /api/prediction/submit` — `{ predicted_price }`
- `GET /api/prediction/leaderboard` — Top players
- `GET /api/prediction/mystats` — User's stats

### News & Notices
- `GET /api/news` — Latest news posts
- `GET /api/notices` — Announcements

### Settings
- `GET /api/settings` — User settings
- `PUT /api/settings` — Update settings `{ language, notifications_on, update_frequency }`

## 🔐 Authentication

The Mini App uses Telegram Web App's `initData` for authentication:

1. Telegram provides `window.Telegram.WebApp.initData` (signed string)
2. This is sent as `X-Telegram-Init-Data` header on every API request
3. Your backend verifies the `initData` using your bot token (HMAC-SHA256)
4. Extract `user.id` from the verified data for user identification

**Python verification example:**
```python
import hmac, hashlib, json

def verify_init_data(init_data: str, bot_token: str) -> dict:
    """Verify Telegram WebApp initData and return user data."""
    parsed = dict(urllib.parse.parse_qsl(init_data))
    received_hash = parsed.pop('hash', '')
    data_check_string = '\n'.join(f'{k}={v}' for k, v in sorted(parsed.items()))
    secret_key = hmac.new(b'WebAppData', bot_token.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if computed_hash == received_hash:
        return json.loads(parsed.get('user', '{}'))
    return None
```

## 👛 TON Connect Wallet

The wallet integration uses [TON Connect UI SDK](https://github.com/ton-connect/sdk/tree/main/packages/ui).

When a user connects their wallet:
1. TON Connect returns the wallet address
2. The Mini App sends `{ telegram_user_id, wallet_address, provider }` to `POST /api/wallet/connect`
3. Your backend stores the mapping (Telegram user → wallet address)
4. Your Telegram bot can now recognize the connected wallet

**Supported wallets:** Tonkeeper, MyTonWallet, TON Wallet, and any TON Connect compatible wallet.

## 📱 Telegram Bot Configuration

Add the Mini App URL to your bot:

1. Talk to [@BotFather](https://t.me/BotFather)
2. Send `/newapp` or `/editapp`
3. Provide your GitHub Pages URL (e.g. `https://your-username.github.io/gramalert-miniapp/`)
4. Set the Mini App button in your bot's menu

**Or configure via Bot API:**
```python
# In your Python bot (GramV56.py)
await bot.set_chat_menu_button(
    chat_id=chat_id,
    menu_button=MenuButtonWebApp(
        text="🚀 Open GramAlert",
        web_app=WebAppInfo(url="https://your-username.github.io/gramalert-miniapp/")
    )
)
```

## 🎨 Features

- ✅ Dark crypto dashboard theme
- ✅ Mobile-first Telegram Mini App
- ✅ 11 fully functional sections
- ✅ TON Connect wallet (Tonkeeper, MyTonWallet)
- ✅ Live GRAM price with charts (Chart.js)
- ✅ GRAM ↔ USDT converter
- ✅ Price alerts management
- ✅ Portfolio with P&L tracking
- ✅ Whale transfer tracking
- ✅ AI market summary
- ✅ Prediction game with leaderboard
- ✅ News & notices
- ✅ English + Myanmar language support
- ✅ API placeholders ready for VPS backend
- ✅ Mock data fallback (works without backend)

## ⚠️ Important Notes

- The Mini App is an **additional interface** — your Telegram bot continues working independently
- All backend API calls include Telegram `initData` for authentication
- Mock data is shown when the backend is not connected (useful for development)
- Update all placeholder URLs in `config.js` and `tonconnect-manifest.json` before deploying

## 📞 Support

- Admin: [@Maxiumlyrx](https://t.me/Maxiumlyrx)
- Price Channel: [@GramAlert11](https://t.me/GramAlert11)
- News Channel: [@PePeMission](https://t.me/PePeMission)

---

⚠️ Not financial advice. Always do your own research.
