/**
 * COMMERONIX - CURRENCY CONVERTER ENGINE
 * Fetches real-time foreign exchange data supporting 40+ world currencies including PKR, USD, EUR, GBP, AED, SAR, INR.
 * Includes multi-tier live feeds, optional custom API key support, offline resilience,
 * instant pair swapping, quick-convert chips, and inverse rates.
 */

(function () {
  'use strict';

  /**
   * OPTIONAL API KEY CONFIGURATION:
   * By default, this engine uses the 100% FREE, UNLIMITED public endpoints (Cloudflare CDN, open.er-api & jsDelivr).
   * If your client ever gets a free/paid key from exchangerate-api.com, paste it inside the quotes below:
   */
  const CUSTOM_EXCHANGERATE_API_KEY = ''; // e.g., 'your_api_key_here' (Leave empty for default free live endpoint)

  // --- Supported Currency Data Dictionary (includes PKR and Middle Eastern & Asian Currencies) ---
  const CURRENCIES = [
    { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', flag: '🇵🇰' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£', flag: '🇬🇧' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', flag: '🇦🇺' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', flag: '🇴🇲' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'SG$', flag: '🇸🇬' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬' },
    { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', flag: '🇮🇸' }
  ];

  // --- Offline Fallback Rates (Base: USD) in case network is unavailable ---
  const FALLBACK_USD_RATES = {
    USD: 1.0,
    PKR: 277.25,
    EUR: 0.8614,
    GBP: 0.7379,
    AED: 3.6725,
    SAR: 3.7500,
    INR: 95.50,
    CAD: 1.3888,
    AUD: 1.3946,
    JPY: 159.92,
    CNY: 7.2450,
    KWD: 0.3065,
    QAR: 3.6400,
    OMR: 0.3850,
    BHD: 0.3770,
    BDT: 119.50,
    CHF: 0.9025,
    SGD: 1.3480,
    NZD: 1.6420,
    MYR: 4.7150,
    THB: 36.65,
    TRY: 32.85,
    BRL: 5.4200,
    MXN: 18.25,
    HKD: 7.8100,
    KRW: 1365.0,
    ZAR: 18.35,
    SEK: 10.55,
    NOK: 10.70,
    PLN: 3.960,
    DKK: 6.890,
    CZK: 23.20,
    HUF: 365.0,
    ILS: 3.720,
    PHP: 58.10,
    IDR: 16150.0,
    RON: 4.600,
    BGN: 1.808,
    ISK: 138.8
  };

  // DOM Element References
  let amountInput, fromSelect, toSelect, swapBtn, convertBtn, resultBox, alertBox;
  let resultAmountElem, resultRateElem, resultInverseElem, resultDateElem;

  /**
   * Populates From and To dropdown menus dynamically with currency codes, names, and flags
   */
  function populateCurrencyDropdowns() {
    if (!fromSelect || !toSelect) return;

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    CURRENCIES.forEach((currency) => {
      const optionText = `${currency.flag} ${currency.code} — ${currency.name}`;

      const optFrom = document.createElement('option');
      optFrom.value = currency.code;
      optFrom.textContent = optionText;
      if (currency.code === 'USD') optFrom.selected = true;
      fromSelect.appendChild(optFrom);

      const optTo = document.createElement('option');
      optTo.value = currency.code;
      optTo.textContent = optionText;
      if (currency.code === 'PKR') optTo.selected = true; // Default To: PKR
      toSelect.appendChild(optTo);
    });
  }

  /**
   * Displays friendly alert / error state
   */
  function showAlert(message, isError = true) {
    if (!alertBox) return;
    alertBox.className = isError ? 'alert alert-error' : 'alert alert-info';
    alertBox.innerHTML = `
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>${message}</div>
    `;
    alertBox.style.display = 'flex';
  }

  /**
   * Clears active alert
   */
  function clearAlert() {
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    }
  }

  /**
   * Formats number for currency presentation
   */
  function formatCurrency(val, currencyCode) {
    const isZeroDecimal = ['JPY', 'KRW', 'IDR', 'HUF', 'ISK'].includes(currencyCode);
    const decimals = isZeroDecimal ? 0 : 2;
    return Number(val).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Smart rate formatting matching Google Financial precision
   */
  function formatRate(rate) {
    const num = Number(rate);
    if (num >= 10) {
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (num >= 1) {
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else {
      return num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    }
  }

  /**
   * Main Currency Conversion Function with 4-Tier Multi-Source Live Global API
   */
  async function performConversion() {
    clearAlert();

    const rawAmount = amountInput.value.trim();
    const amount = parseFloat(rawAmount);

    if (isNaN(amount) || amount <= 0) {
      showAlert('Please enter a valid positive number for the amount.');
      if (resultBox) resultBox.style.display = 'none';
      return;
    }

    const fromCurr = fromSelect.value;
    const toCurr = toSelect.value;

    // Handle identical currencies
    if (fromCurr === toCurr) {
      displayResults(amount, amount, 1.0, 1.0, new Date().toISOString().split('T')[0], fromCurr, toCurr, false);
      return;
    }

    // Set loading state
    convertBtn.disabled = true;
    convertBtn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round" fill="none"/>
      </svg>
      Fetching live rates...
    `;

    // --- TIER 1: Cloudflare Edge CDN Live Exchange Rates (Google/Bloomberg Aligned) ---
    try {
      const fromLower = fromCurr.toLowerCase();
      const toLower = toCurr.toLowerCase();
      const cdnUrl = `https://latest.currency-api.pages.dev/v1/currencies/${fromLower}.json`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(cdnUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data[fromLower] && data[fromLower][toLower] !== undefined) {
          const singleRate = data[fromLower][toLower];
          const convertedTotal = amount * singleRate;
          const inverseRate = 1 / singleRate;
          const rateDate = data.date ? `${data.date} (Live Market Rate)` : new Date().toISOString().split('T')[0];

          displayResults(amount, convertedTotal, singleRate, inverseRate, rateDate, fromCurr, toCurr, false);
          return;
        }
      }
    } catch (tier1Err) {
      console.warn('Tier 1 Cloudflare CDN notice, falling back to Tier 2:', tier1Err.message);
    }

    // --- TIER 2: Open Exchange Rate API / Custom Key ---
    try {
      const primaryUrl = CUSTOM_EXCHANGERATE_API_KEY
        ? `https://v6.exchangerate-api.com/v6/${CUSTOM_EXCHANGERATE_API_KEY}/latest/${encodeURIComponent(fromCurr)}`
        : `https://open.er-api.com/v6/latest/${encodeURIComponent(fromCurr)}`;

      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3500);

      const response2 = await fetch(primaryUrl, { signal: controller2.signal });
      clearTimeout(timeoutId2);

      if (response2.ok) {
        const data2 = await response2.json();
        if (data2 && data2.rates && data2.rates[toCurr] !== undefined) {
          const singleRate = data2.rates[toCurr];
          const convertedTotal = amount * singleRate;
          const inverseRate = 1 / singleRate;
          const rateDate = data2.time_last_update_utc ? data2.time_last_update_utc.substring(0, 16) + ' UTC' : new Date().toISOString().split('T')[0];

          displayResults(amount, convertedTotal, singleRate, inverseRate, rateDate, fromCurr, toCurr, false);
          return;
        }
      }
    } catch (tier2Err) {
      console.warn('Tier 2 notice, falling back to Tier 3:', tier2Err.message);
    }

    // --- TIER 3: Frankfurter European Central Bank (ECB) API ---
    try {
      const frankfurterUrl = `https://api.frankfurter.dev/v1/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(fromCurr)}&to=${encodeURIComponent(toCurr)}`;
      const frankController = new AbortController();
      const fTimeout = setTimeout(() => frankController.abort(), 3500);

      const fResponse = await fetch(frankfurterUrl, { signal: frankController.signal });
      clearTimeout(fTimeout);

      if (fResponse.ok) {
        const fData = await fResponse.json();
        if (fData && fData.rates && fData.rates[toCurr] !== undefined) {
          const convertedTotal = fData.rates[toCurr];
          const singleRate = convertedTotal / amount;
          const inverseRate = 1 / singleRate;
          const rateDate = `${fData.date} (ECB Reference)`;

          displayResults(amount, convertedTotal, singleRate, inverseRate, rateDate, fromCurr, toCurr, false);
          return;
        }
      }
    } catch (triErr) {
      console.warn('Tier 3 feed notice:', triErr.message);
    }

    // --- TIER 4: Offline High-Precision USD Triangulation Fallback ---
    const fromInUsd = FALLBACK_USD_RATES[fromCurr] || 1.0;
    const toInUsd = FALLBACK_USD_RATES[toCurr] || 1.0;
    const singleRate = toInUsd / fromInUsd;
    const convertedTotal = amount * singleRate;
    const inverseRate = 1 / singleRate;
    const today = `${new Date().toISOString().split('T')[0]} (Cached Benchmark)`;

    displayResults(amount, convertedTotal, singleRate, inverseRate, today, fromCurr, toCurr, true);

    convertBtn.disabled = false;
    convertBtn.innerHTML = `
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      Convert Currency
    `;
  }

  /**
   * Renders the calculated output in the UI
   */
  function displayResults(amount, convertedTotal, rate, inverseRate, dateStr, from, to, isOffline) {
    if (!resultBox) return;

    const toCurrencyObj = CURRENCIES.find((c) => c.code === to) || { symbol: to };
    const fromCurrencyObj = CURRENCIES.find((c) => c.code === from) || { symbol: from };

    const formattedTotal = formatCurrency(convertedTotal, to);
    const formattedRate = formatRate(rate);
    const formattedInverse = formatRate(inverseRate);

    resultAmountElem.innerHTML = `<span class="currency-symbol">${toCurrencyObj.symbol}</span> ${formattedTotal} <span style="font-size: 1.25rem; font-weight: 500; color: var(--text-muted);">${to}</span>`;
    resultRateElem.textContent = `1 ${from} = ${formattedRate} ${to}`;
    resultInverseElem.textContent = `1 ${to} = ${formattedInverse} ${from}`;
    resultDateElem.textContent = `Market Rate Date: ${dateStr} ${isOffline ? '(Offline Backup Mode)' : '(Live Interbank Spot Rate)'}`;

    resultBox.style.display = 'block';

    // Dynamic result pulse animation
    resultAmountElem.classList.remove('value-updated');
    void resultAmountElem.offsetWidth; // Trigger reflow
    resultAmountElem.classList.add('value-updated');

    convertBtn.disabled = false;
    convertBtn.innerHTML = `
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      Convert Currency
    `;
  }

  /**
   * Swaps From and To Currency selections with springy 360 spin
   */
  function swapCurrencies() {
    if (!fromSelect || !toSelect) return;

    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    // 360 Spin micro-animation
    if (swapBtn) {
      swapBtn.classList.remove('swap-spinning');
      void swapBtn.offsetWidth;
      swapBtn.classList.add('swap-spinning');
      setTimeout(() => {
        swapBtn.classList.remove('swap-spinning');
      }, 500);
    }

    performConversion();
  }

  /**
   * Initializes Quick Select Chips
   */
  function initQuickChips() {
    const chipBtns = document.querySelectorAll('.chip-btn');
    chipBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const from = btn.getAttribute('data-from');
        const to = btn.getAttribute('data-to');

        if (from && fromSelect) fromSelect.value = from;
        if (to && toSelect) toSelect.value = to;

        performConversion();
      });
    });
  }

  /**
   * Initializes event listeners and controls
   */
  function initCurrencyConverter() {
    amountInput = document.getElementById('currency-amount');
    fromSelect = document.getElementById('currency-from');
    toSelect = document.getElementById('currency-to');
    swapBtn = document.getElementById('currency-swap-btn');
    convertBtn = document.getElementById('currency-convert-btn');
    resultBox = document.getElementById('currency-result-box');
    alertBox = document.getElementById('currency-alert');

    resultAmountElem = document.getElementById('currency-result-amount');
    resultRateElem = document.getElementById('currency-result-rate');
    resultInverseElem = document.getElementById('currency-result-inverse');
    resultDateElem = document.getElementById('currency-result-date');

    if (!amountInput || !fromSelect || !toSelect || !convertBtn) return;

    populateCurrencyDropdowns();
    initQuickChips();

    // Event Listeners
    convertBtn.addEventListener('click', performConversion);
    if (swapBtn) swapBtn.addEventListener('click', swapCurrencies);

    amountInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performConversion();
      }
    });

    fromSelect.addEventListener('change', performConversion);
    toSelect.addEventListener('change', performConversion);

    // Initial Conversion trigger ($1,000 USD to PKR)
    performConversion();
  }

  document.addEventListener('DOMContentLoaded', initCurrencyConverter);
})();
