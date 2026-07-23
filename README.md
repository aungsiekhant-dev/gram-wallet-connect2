# GramAlert — Unified Production System

GRAM price tracking Telegram bot **+** Telegram Mini App, sharing **one backend** (`web_api.py`), **one database** (`gramalert.db`), and **one wallet system** per Telegram user.

## Architecture

The Mini App is a static site (GitHub Pages). Every API call goes to the bot's `web_api.py`, which runs **inside the same Python process** as the bot and shares the same `Database`, `WalletManager`, `TonCenter`, `CoinGeckoClient`, and `Portfolio` objects. There is exactly **one wallet record per Telegram user** — whether connected from the bot or the Mini App.

## Environment Variables

All secrets are read from environment variables with **safe fallbacks** (existing deployments keep working). Set these in your hosting panel:

| Variable               | Default                          | Description                                  |
|------------------------|----------------------------------|----------------------------------------------|
| `BOT_TOKEN`          | *(embedded fallback)*           | Telegram bot token from @BotFather           |
| `TON_API_KEY`        | *(embedded fallback)*           | TON Center API key                           |
| `WEB_API_PORT`       | `8080`                         | Port for the web API HTTP server             |
| `WEB_API_PUBLIC_URL` | `https://your-bot-domain.example`| Your bot's public HTTPS URL (no trailing /) |

> ⚠️ Set `BOT_TOKEN`, `WEB_API_PORT`, and `WEB_API_PUBLIC_URL` in your hosting panel. Never commit real tokens to Git.

## Startup

```bash
python3 main.py
```

On startup, the bot logs a structured ✅/❌ checklist for each component:

```
✅ Database Connected (gramalert.db)
✅ Price Engine Running
✅ News Sync Running
✅ Whale Tracker Running
✅ News Sync — N posts recovered
✅ Web API Started (port 8080)
✅ Mini App Backend Ready — https://your-domain/api
✅ Background Tasks Running (8 scheduler tasks)
✅ Wallet Monitor Running
✅ Smart Alert Engine Running
✅ Telegram Bot Started — 9 background tasks active
```

If a component fails, you'll see `❌ <component> — <error>` and the bot continues serving cached data. No manual recovery needed after restart.

## Health Check

```bash
curl https://your-bot-domain/api/health
```

Returns backend, database, bot, wallet manager, and price engine status.

## Mini App Configuration

1. Upload `miniapp/` contents to your GitHub Pages repo.
2. Set `API_BASE_URL` in `miniapp/js/config.js` to your bot domain.
3. The Mini App authenticates every request via Telegram `initData` HMAC — no passwords.

## Deployment (Bot)

1. Upload all `.py` files + `ton/` folder + `ton_connect_webapp.html` to the server.
2. **Do NOT upload `gramalert.db`** — preserve the existing database.
3. Set environment variables (see above).
4. `pip install -r requirements.txt`
5. `python3 main.py`
6. Open the assigned port (`WEB_API_PORT`) in the panel firewall.

## Compatibility

- Python 3.12 (also works on 3.10+)
- python-telegram-bot 21.6
- No external HTTP framework — `web_api.py` uses only Python stdlib
