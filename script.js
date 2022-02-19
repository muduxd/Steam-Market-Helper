window.postMessage({ type: "STEAM_DATA", steamData : {
    country: g_strCountryCode,
    language: g_strLanguage,
    currency: typeof g_rgWalletInfo === 'undefined' ? 1 : g_rgWalletInfo.wallet_currency
}})  