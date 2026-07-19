// ═══════════════════════════════════════════════════════════
// GramAlert Mini App — Internationalization (i18n)
// English + Myanmar (Burmese)
// ═══════════════════════════════════════════════════════════

const I18N = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    price: 'GRAM Price',
    converter: 'Converter',
    alerts: 'Alerts',
    portfolio: 'Portfolio',
    wallet: 'Wallet',
    whale: 'Whale Tracking',
    ai: 'AI Summary',
    prediction: 'Prediction Game',
    news: 'News & Notices',
    settings: 'Settings',

    // Common
    loading: 'Loading...',
    refresh: 'Refresh',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    connect: 'Connect',
    disconnect: 'Disconnect',
    submit: 'Submit',
    close: 'Close',
    today: 'Today',
    not_available: 'N/A',
    no_data: 'No data available',
    coming_soon: 'Coming soon',
    not_financial_advice: 'Not financial advice. Always DYOR.',

    // Dashboard
    market_overview: 'Market Overview',
    user_summary: 'User Summary',
    recent_alerts: 'Recent Alerts',
    whale_activity: 'Whale Activity',
    quick_access: 'Quick Access',
    view_all: 'View All',

    // Price
    live_price: 'Live GRAM Price',
    price_change: '24H Change',
    high_24h: '24H High',
    low_24h: '24H Low',
    volume_24h: '24H Volume',
    market_cap: 'Market Cap',
    ath: 'All-Time High',
    atl: 'All-Time Low',
    last_updated: 'Last Updated',

    // Converter
    gram_to_usdt: 'GRAM → USDT',
    usdt_to_gram: 'USDT → GRAM',
    enter_amount: 'Enter Amount',
    exchange_rate: 'Exchange Rate',

    // Alerts
    price_alerts: 'Price Alerts',
    wallet_alerts: 'Wallet Alerts',
    whale_alerts: 'Whale Movement Alerts',
    notification_settings: 'Notification Settings',
    add_alert: 'Add Alert',
    target_price: 'Target Price',
    direction: 'Direction',
    above: 'Above',
    below: 'Below',
    no_alerts: 'No alerts set. Create one to get notified!',
    notifications_on: 'Notifications On',
    notifications_off: 'Notifications Off',

    // Portfolio
    holdings: 'Holdings',
    total_invested: 'Total Invested',
    current_value: 'Current Value',
    profit_loss: 'Profit / Loss',
    roi: 'ROI',
    add_holding: 'Add Holding',
    gram_amount: 'GRAM Amount',
    buy_price: 'Buy Price',
    no_holdings: 'No holdings yet. Add your first GRAM position!',

    // Wallet
    connect_wallet: 'Connect Wallet',
    wallet_connected: 'Wallet Connected',
    wallet_address: 'Wallet Address',
    wallet_balance: 'Balance',
    transactions: 'Transactions',
    disconnect_wallet: 'Disconnect Wallet',
    wallet_not_connected: 'No wallet connected',
    connect_description: 'Connect your TON wallet to track your GRAM balance and transactions. Supports Tonkeeper and MyTonWallet.',
    tx_hash: 'Transaction',
    amount: 'Amount',
    time: 'Time',

    // Whale
    large_transfers: 'Large Transfers',
    whale_summary: 'Daily Summary',
    largest_transfer: 'Largest Transfer',
    total_volume: 'Total Volume',
    transfer_count: 'Transfer Count',
    exchange_inflow: 'Exchange Inflow',
    exchange_outflow: 'Exchange Outflow',
    net_flow: 'Net Flow',
    alert_threshold: 'Alert Threshold',
    from: 'From',
    to: 'To',

    // AI Summary
    market_summary: 'Market Summary',
    whale_explanation: 'Whale Activity Analysis',
    news_summary: 'News Summary',
    generate_summary: 'Generate Summary',
    ai_generating: 'AI is analyzing the market...',

    // Prediction
    predict_price: 'Predict GRAM Price',
    your_prediction: 'Your Prediction',
    deadline: 'Deadline',
    participants: 'Participants',
    leaderboard: 'Leaderboard',
    my_stats: 'My Stats',
    history: 'History',
    rank: 'Rank',
    points: 'Points',
    wins: 'Wins',
    accuracy: 'Accuracy',
    streak: 'Streak',
    submit_prediction: 'Submit Prediction',

    // News
    announcements: 'Announcements',
    crypto_updates: 'Crypto Updates',
    latest_news: 'Latest News',
    pinned: 'Pinned',
    no_news: 'No news yet. Check back later!',

    // Settings
    language: 'Language',
    english: 'English',
    myanmar: 'မြန်မာ',
    account_settings: 'Account Settings',
    update_frequency: 'Update Frequency',
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    about: 'About',
    version: 'Version',
    contact_admin: 'Contact Admin',
  },

  my: {
    // Nav
    dashboard: 'ဒက်ရှ်ဘုတ်',
    price: 'GRAM စျေးနှုန်း',
    converter: 'ကွန်ဗာတာ',
    alerts: 'သတိပေးချက်',
    portfolio: 'ပိုင်ဆိုင်မှု',
    wallet: 'ဝောလက်',
    whale: 'ဝေးလ်ခြေရာခံခြင်း',
    ai: 'AI အကျဉ်းချုပ်',
    prediction: 'ခန့်မှန်းခြင်းဂိမ်း',
    news: 'သတင်းနှင့် ကြေညာချက်',
    settings: 'ဆက်တင်များ',

    // Common
    loading: 'တင်နေသည်...',
    refresh: 'ပြန်လည်',
    back: 'နောက်သို့',
    save: 'သိမ်းဆည်း',
    cancel: 'မလုပ်တော့',
    delete: 'ဖျက်',
    edit: 'ပြင်ဆင်',
    add: 'ထည့်',
    connect: 'ချိတ်ဆက်',
    disconnect: 'ချိတ်ဆက်ဖြတ်',
    submit: 'စာရင်းသွင်း',
    close: 'ပိတ်',
    today: 'ယနေ့',
    not_available: 'မရှိ',
    no_data: 'ဒေတာမရှိပါ',
    coming_soon: 'မကြာမီလာမည်',
    not_financial_advice: 'ငွေကြေးအကြံပြုချက်မဟုတ်ပါ။ ကိုယ်တိုင်သုတေသနလုပ်ပါ။',

    // Dashboard
    market_overview: 'စျေးကွက်အကျဉ်းချုပ်',
    user_summary: 'အသုံးပြုသူအကျဉ်းချုပ်',
    recent_alerts: 'မကြာသေးမီသတိပေးချက်',
    whale_activity: 'ဝေးလ်လှုပ်ရှားမှု',
    quick_access: 'အမြန်ဝင်ရောက်',
    view_all: 'အားလုံးကြည့်',

    // Price
    live_price: 'GRAM စျေးနှုန်း',
    price_change: '၂၄ နာရီပြောင်းလဲမှု',
    high_24h: '၂၄ နာရီအမြင့်',
    low_24h: '၂၄ နာရီအနိမ့်',
    volume_24h: '၂၄ နာရီပမာဏ',
    market_cap: 'စျေးကွက်တန်ဖိုး',
    ath: 'အမြင့်မြတ်ဆုံး',
    atl: 'အနိမ့်ဆုံး',
    last_updated: 'နောက်ဆုံးအပ်ဒိတ်',

    // Converter
    gram_to_usdt: 'GRAM → USDT',
    usdt_to_gram: 'USDT → GRAM',
    enter_amount: 'ပမာဏထည့်ပါ',
    exchange_rate: 'လဲလှယ်နှုန်း',

    // Alerts
    price_alerts: 'စျေးနှုန်းသတိပေးချက်',
    wallet_alerts: 'ဝောလက်သတိပေးချက်',
    whale_alerts: 'ဝေးလ်လှုပ်ရှားမှုသတိပေးချက်',
    notification_settings: 'အသိပေးချက်ဆက်တင်',
    add_alert: 'သတိပေးချက်ထည့်',
    target_price: 'ပစ်မှတ်စျေးနှုန်း',
    direction: 'ဦးတည်ချက်',
    above: 'အထက်',
    below: 'အောက်',
    no_alerts: 'သတိပေးချက်မရှိပါ။ တစ်ခုဖန်တီးပါ!',
    notifications_on: 'အသိပေးချက်ဖွင့်',
    notifications_off: 'အသိပေးချက်ပိတ်',

    // Portfolio
    holdings: 'ပိုင်ဆိုင်မှု',
    total_invested: 'စုစုပေါင်းရင်းနှီးမြုပ်နှံမှု',
    current_value: 'လက်ရှိတန်ဖိုး',
    profit_loss: 'အမြတ်/ဆုံးရှုံး',
    roi: 'ROI',
    add_holding: 'ပိုင်ဆိုင်မှုထည့်',
    gram_amount: 'GRAM ပမာဏ',
    buy_price: 'ဝယ်စျေးနှုန်း',
    no_holdings: 'ပိုင်ဆိုင်မှုမရှိသေးပါ။ ပထမဆုံး GRAM ထည့်ပါ!',

    // Wallet
    connect_wallet: 'ဝောလက်ချိတ်ဆက်',
    wallet_connected: 'ဝောလက်ချိတ်ဆက်ပြီး',
    wallet_address: 'ဝောလက်လိပ်စာ',
    wallet_balance: 'လက်ကျန်',
    transactions: 'လုပ်ငန်းဆောင်ရွက်မှုများ',
    disconnect_wallet: 'ဝောလက်ချိတ်ဆက်ဖြတ်',
    wallet_not_connected: 'ဝောလက်ချိတ်ဆက်မထားပါ',
    connect_description: 'GRAM လက်ကျန်နှင့် လုပ်ငန်းဆောင်ရွက်မှုများကို ခြေရာခံရန် သင့် TON ဝောလက်ကို ချိတ်ဆက်ပါ။ Tonkeeper နှင့် MyTonWallet ကို ထောက်ပံ့ပါသည်။',
    tx_hash: 'လုပ်ငန်းဆောင်ရွက်မှု',
    amount: 'ပမာဏ',
    time: 'အချိန်',

    // Whale
    large_transfers: 'ကြီးမားသောငွေလွှဲမှု',
    whale_summary: 'နေ့စဉ်အကျဉ်းချုပ်',
    largest_transfer: 'အကြီးဆုံးငွေလွှဲ',
    total_volume: 'စုစုပေါင်းပမာဏ',
    transfer_count: 'ငွေလွှဲအရေအတွက်',
    exchange_inflow: 'အသယ်ဝင်',
    exchange_outflow: 'အသယ်ထွက်',
    net_flow: 'သန့်စင်စီးကြောင်း',
    alert_threshold: 'သတိပေးအဆင့်',
    from: 'မှ',
    to: 'သို့',

    // AI Summary
    market_summary: 'စျေးကွက်အကျဉ်းချုပ်',
    whale_explanation: 'ဝေးလ်လှုပ်ရှားမှုဆန်းစစ်ချက်',
    news_summary: 'သတင်းအကျဉ်းချုပ်',
    generate_summary: 'အကျဉ်းချုပ်ဖန်တီး',
    ai_generating: 'AI စျေးကွက်ကို ဆန်းစစ်နေသည်...',

    // Prediction
    predict_price: 'GRAM စျေးနှုန်းခန့်မှန်း',
    your_prediction: 'သင့်ခန့်မှန်းချက်',
    deadline: 'နောက်ဆုံးသတ်',
    participants: 'ပါဝင်သူများ',
    leaderboard: 'ဦးဆောင်ဇယား',
    my_stats: 'ကျွန်ုပ်စာရင်းအင်း',
    history: 'မှတ်တမ်း',
    rank: 'အဆင့်',
    points: 'အမှတ်များ',
    wins: 'အနိုင်များ',
    accuracy: 'တိကျမှု',
    streak: 'အဆက်',
    submit_prediction: 'ခန့်မှန်းချက်သွင်း',

    // News
    announcements: 'ကြေညာချက်များ',
    crypto_updates: 'ကရစ်ပတိုးအပ်ဒိတ်',
    latest_news: 'နောက်ဆုံးသတင်း',
    pinned: 'ပင်တွဲ',
    no_news: 'သတင်းမရှိသေးပါ။ နောက်မှပြန်စစ်ပါ!',

    // Settings
    language: 'ဘာသာစကား',
    english: 'English',
    myanmar: 'မြန်မာ',
    account_settings: 'အကောင့်ဆက်တင်',
    update_frequency: 'အပ်ဒိတ်နှုန်း',
    low: 'နည်း',
    normal: 'သာမန်',
    high: 'မြင့်',
    about: 'အကြောင်း',
    version: 'ဗားရှင်း',
    contact_admin: 'အုပ်ချုပ်သူဆက်သွယ်',
  },
};

function t(key) {
  const lang = App?.state?.settings?.language || 'en';
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}
