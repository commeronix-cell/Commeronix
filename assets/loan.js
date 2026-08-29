/**
 * COMMERONIX - LOAN & EMI CALCULATOR ENGINE
 * Calculates reducing-balance Equated Monthly Installment (EMI),
 * total interest payable, total repayment, visual breakdown, and full amortization schedule.
 * Supports all international & regional currencies: PKR, INR, USD, EUR, GBP, AED, SAR, etc.
 * Supports both Annual Interest Rate (% p.a.) and Monthly Interest Rate (% p.m.).
 */

(function () {
  'use strict';

  // DOM Element References
  let currencySelect, currencyPrefix;
  let amountInput, amountRange;
  let rateInput, rateRange, rateLabel, rateUnitRadios;
  let tenureInput, tenureRange, tenureUnitRadios;
  let calculateBtn, alertBox;

  let emiValueElem, interestValueElem, totalValueElem;
  let ratioPrincipalBar, ratioInterestBar, ratioPrincipalLabel, ratioInterestLabel;
  let amortizationTableBody;

  let currentCurrencySymbol = '$';
  let currentCurrencyCode = 'USD';

  /**
   * Displays an alert message
   */
  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.className = 'alert alert-error';
    alertBox.innerHTML = `
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>${msg}</div>
    `;
    alertBox.style.display = 'flex';
  }

  /**
   * Clears any active alert
   */
  function clearAlert() {
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    }
  }

  /**
   * Formats numeric currency amounts
   */
  function formatMoney(num) {
    const isZeroDecimal = ['JPY', 'KRW', 'IDR', 'HUF'].includes(currentCurrencyCode);
    const decimals = isZeroDecimal ? 0 : 2;
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Formats money with the selected currency symbol
   */
  function formatWithCurrency(num) {
    return `${currentCurrencySymbol} ${formatMoney(num)}`;
  }

  /**
   * Updates the active currency symbol and prefix
   */
  function updateCurrency() {
    if (!currencySelect) return;

    const selectedOption = currencySelect.options[currencySelect.selectedIndex];
    if (selectedOption) {
      currentCurrencyCode = selectedOption.value;
      currentCurrencySymbol = selectedOption.getAttribute('data-symbol') || selectedOption.value;
    }

    if (currencyPrefix) {
      currencyPrefix.textContent = currentCurrencySymbol;
    }

    // Adapt slider scale for high-value currencies like PKR, INR, JPY
    if (amountRange) {
      if (['PKR', 'INR', 'JPY', 'BDT'].includes(currentCurrencyCode)) {
        amountRange.max = '20000000'; // 20 million / 2 crore
        amountRange.step = '50000';
      } else {
        amountRange.max = '2000000'; // 2 million
        amountRange.step = '5000';
      }
    }

    calculateLoan();
  }

  /**
   * Main Loan EMI & Amortization Calculation
   */
  function calculateLoan() {
    clearAlert();

    const principal = parseFloat(amountInput.value);
    const enteredRate = parseFloat(rateInput.value);
    let tenure = parseFloat(tenureInput.value);

    // Validate inputs
    if (isNaN(principal) || principal <= 0) {
      showAlert('Please enter a valid loan amount greater than zero.');
      return;
    }
    if (isNaN(enteredRate) || enteredRate < 0) {
      showAlert('Please enter a valid interest rate percentage.');
      return;
    }
    if (isNaN(tenure) || tenure <= 0) {
      showAlert('Please enter a valid loan tenure.');
      return;
    }

    // Determine tenure in months
    const selectedTenureUnit = document.querySelector('input[name="tenure-unit"]:checked');
    const isYears = selectedTenureUnit ? selectedTenureUnit.value === 'years' : true;
    const totalMonths = isYears ? Math.round(tenure * 12) : Math.round(tenure);

    if (totalMonths <= 0) {
      showAlert('Total tenure must be at least 1 month.');
      return;
    }

    // Determine monthly compounding rate (Annual vs Monthly rate unit)
    const selectedRateUnit = document.querySelector('input[name="rate-unit"]:checked');
    const isMonthlyRate = selectedRateUnit ? selectedRateUnit.value === 'monthly' : false;
    
    // Monthly interest rate in decimal form
    const monthlyRate = isMonthlyRate ? (enteredRate / 100) : (enteredRate / 12 / 100);

    let monthlyEMI = 0;
    let totalRepayment = 0;
    let totalInterest = 0;

    if (monthlyRate === 0) {
      // 0% interest edge-case
      monthlyEMI = principal / totalMonths;
      totalRepayment = principal;
      totalInterest = 0;
    } else {
      // Standard Reducing Balance EMI Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
      const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyEMI = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
      totalRepayment = monthlyEMI * totalMonths;
      totalInterest = totalRepayment - principal;
    }

    // Update Summary Display with Currency and pulse animation
    if (emiValueElem) {
      emiValueElem.textContent = formatWithCurrency(monthlyEMI);
      emiValueElem.classList.remove('value-updated');
      void emiValueElem.offsetWidth;
      emiValueElem.classList.add('value-updated');
    }
    if (interestValueElem) interestValueElem.textContent = formatWithCurrency(totalInterest);
    if (totalValueElem) totalValueElem.textContent = formatWithCurrency(totalRepayment);

    // Update Visual Ratio Bar with smooth CSS transition
    const principalPercent = ((principal / totalRepayment) * 100).toFixed(1);
    const interestPercent = (100 - principalPercent).toFixed(1);

    if (ratioPrincipalBar) {
      ratioPrincipalBar.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      ratioPrincipalBar.style.width = `${principalPercent}%`;
    }
    if (ratioInterestBar) {
      ratioInterestBar.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      ratioInterestBar.style.width = `${interestPercent}%`;
    }
    if (ratioPrincipalLabel) ratioPrincipalLabel.textContent = `Principal: ${principalPercent}% (${formatWithCurrency(principal)})`;
    if (ratioInterestLabel) ratioInterestLabel.textContent = `Interest: ${interestPercent}% (${formatWithCurrency(totalInterest)})`;

    // Generate Yearly Amortization Schedule
    generateAmortizationSchedule(principal, monthlyRate, monthlyEMI, totalMonths);
  }

  /**
   * Builds the yearly amortization breakdown table with chosen currency
   */
  function generateAmortizationSchedule(principal, monthlyRate, emi, totalMonths) {
    if (!amortizationTableBody) return;

    amortizationTableBody.innerHTML = '';

    let balance = principal;
    let currentYear = 1;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let yearlyEmi = 0;
    let openingBalance = principal;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = emi - interestPayment;

      // Adjustment for final month rounding
      if (month === totalMonths || balance < principalPayment) {
        principalPayment = balance;
        balance = 0;
      } else {
        balance -= principalPayment;
      }

      yearlyPrincipal += principalPayment;
      yearlyInterest += interestPayment;
      yearlyEmi += (principalPayment + interestPayment);

      // Render row at end of year or at final month
      if (month % 12 === 0 || month === totalMonths) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>Year ${currentYear}</strong></td>
          <td>${formatWithCurrency(openingBalance)}</td>
          <td>${formatWithCurrency(yearlyEmi)}</td>
          <td style="color: var(--accent-primary);">${formatWithCurrency(yearlyPrincipal)}</td>
          <td style="color: var(--accent-cyan);">${formatWithCurrency(yearlyInterest)}</td>
          <td>${formatWithCurrency(Math.max(0, balance))}</td>
        `;
        amortizationTableBody.appendChild(tr);

        // Reset yearly accumulators for next year
        currentYear++;
        openingBalance = balance;
        yearlyPrincipal = 0;
        yearlyInterest = 0;
        yearlyEmi = 0;
      }
    }
  }

  /**
   * Synchronizes range sliders with numeric inputs
   */
  function setupSynchronizedInputs() {
    // Amount
    if (amountInput && amountRange) {
      amountInput.addEventListener('input', () => {
        amountRange.value = amountInput.value;
        calculateLoan();
      });
      amountRange.addEventListener('input', () => {
        amountInput.value = amountRange.value;
        calculateLoan();
      });
    }

    // Interest Rate input & slider synchronization
    if (rateInput && rateRange) {
      rateInput.addEventListener('input', () => {
        rateRange.value = rateInput.value;
        calculateLoan();
      });
      rateRange.addEventListener('input', () => {
        rateInput.value = rateRange.value;
        calculateLoan();
      });
    }

    // Interest Rate Unit Radios (Annual % p.a. vs Monthly % p.m.)
    if (rateUnitRadios) {
      rateUnitRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          const currentVal = parseFloat(rateInput.value) || 8.0;
          if (radio.value === 'monthly') {
            // Switch to Monthly Rate
            rateRange.min = '0.05';
            rateRange.max = '5.0';
            rateRange.step = '0.05';
            rateInput.step = '0.01';
            const monthlyVal = (currentVal / 12).toFixed(2);
            rateInput.value = monthlyVal;
            rateRange.value = monthlyVal;
            if (rateLabel) rateLabel.textContent = 'Monthly Interest Rate (% p.m.)';
          } else {
            // Switch to Annual Rate
            rateRange.min = '0.5';
            rateRange.max = '35.0';
            rateRange.step = '0.1';
            rateInput.step = '0.05';
            const annualVal = (currentVal * 12).toFixed(1);
            rateInput.value = annualVal;
            rateRange.value = annualVal;
            if (rateLabel) rateLabel.textContent = 'Annual Interest Rate (% p.a.)';
          }
          calculateLoan();
        });
      });
    }

    // Tenure input & slider synchronization
    if (tenureInput && tenureRange) {
      tenureInput.addEventListener('input', () => {
        tenureRange.value = tenureInput.value;
        calculateLoan();
      });
      tenureRange.addEventListener('input', () => {
        tenureInput.value = tenureRange.value;
        calculateLoan();
      });
    }

    // Tenure Unit Radios (Years vs Months)
    if (tenureUnitRadios) {
      tenureUnitRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          if (radio.value === 'months') {
            tenureRange.max = '360';
            tenureRange.step = '6';
            if (parseFloat(tenureInput.value) <= 30) {
              tenureInput.value = (parseFloat(tenureInput.value) * 12).toString();
              tenureRange.value = tenureInput.value;
            }
          } else {
            tenureRange.max = '30';
            tenureRange.step = '1';
            if (parseFloat(tenureInput.value) > 30) {
              tenureInput.value = Math.max(1, Math.round(parseFloat(tenureInput.value) / 12)).toString();
              tenureRange.value = tenureInput.value;
            }
          }
          calculateLoan();
        });
      });
    }
  }

  /**
   * Initializes the Loan Calculator
   */
  function initLoanCalculator() {
    currencySelect = document.getElementById('loan-currency');
    currencyPrefix = document.getElementById('loan-currency-prefix');

    amountInput = document.getElementById('loan-amount');
    amountRange = document.getElementById('loan-amount-range');

    rateInput = document.getElementById('loan-rate');
    rateRange = document.getElementById('loan-rate-range');
    rateLabel = document.getElementById('loan-rate-label');
    rateUnitRadios = document.querySelectorAll('input[name="rate-unit"]');

    tenureInput = document.getElementById('loan-tenure');
    tenureRange = document.getElementById('loan-tenure-range');
    tenureUnitRadios = document.querySelectorAll('input[name="tenure-unit"]');
    calculateBtn = document.getElementById('loan-calculate-btn');
    alertBox = document.getElementById('loan-alert');

    emiValueElem = document.getElementById('loan-emi-value');
    interestValueElem = document.getElementById('loan-interest-value');
    totalValueElem = document.getElementById('loan-total-value');

    ratioPrincipalBar = document.getElementById('ratio-principal');
    ratioInterestBar = document.getElementById('ratio-interest');
    ratioPrincipalLabel = document.getElementById('ratio-principal-label');
    ratioInterestLabel = document.getElementById('ratio-interest-label');

    amortizationTableBody = document.getElementById('amortization-table-body');

    if (!amountInput || !rateInput || !tenureInput) return;

    if (currencySelect) {
      currencySelect.addEventListener('change', updateCurrency);
    }

    setupSynchronizedInputs();

    if (calculateBtn) {
      calculateBtn.addEventListener('click', calculateLoan);
    }

    // Initial Currency setup & calculation
    updateCurrency();
  }

  document.addEventListener('DOMContentLoaded', initLoanCalculator);
})();
