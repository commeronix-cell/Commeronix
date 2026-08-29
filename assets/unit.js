/**
 * COMMERONIX - UNIT CONVERTER ENGINE
 * High-precision metric and imperial conversions across Length, Weight, and Temperature.
 * Includes formula breakdown, unit swapping, and dynamic category updating.
 */

(function () {
  'use strict';

  // --- Conversion Configuration & Definitions ---
  const UNIT_CONFIG = {
    length: {
      name: 'Length & Distance',
      defaultFrom: 'm',
      defaultTo: 'foot',
      units: [
        { id: 'mm', name: 'Millimeter (mm)', factor: 0.001, symbol: 'mm' },
        { id: 'cm', name: 'Centimeter (cm)', factor: 0.01, symbol: 'cm' },
        { id: 'm', name: 'Meter (m)', factor: 1.0, symbol: 'm' },
        { id: 'km', name: 'Kilometer (km)', factor: 1000.0, symbol: 'km' },
        { id: 'inch', name: 'Inch (in)', factor: 0.0254, symbol: 'in' },
        { id: 'foot', name: 'Foot (ft)', factor: 0.3048, symbol: 'ft' },
        { id: 'yard', name: 'Yard (yd)', factor: 0.9144, symbol: 'yd' },
        { id: 'mile', name: 'Mile (mi)', factor: 1609.344, symbol: 'mi' }
      ]
    },
    weight: {
      name: 'Weight & Mass',
      defaultFrom: 'kg',
      defaultTo: 'pound',
      units: [
        { id: 'mg', name: 'Milligram (mg)', factor: 0.000001, symbol: 'mg' },
        { id: 'g', name: 'Gram (g)', factor: 0.001, symbol: 'g' },
        { id: 'kg', name: 'Kilogram (kg)', factor: 1.0, symbol: 'kg' },
        { id: 'tonne', name: 'Metric Tonne (t)', factor: 1000.0, symbol: 't' },
        { id: 'ounce', name: 'Ounce (oz)', factor: 0.028349523125, symbol: 'oz' },
        { id: 'pound', name: 'Pound (lb)', factor: 0.45359237, symbol: 'lb' }
      ]
    },
    temperature: {
      name: 'Temperature',
      defaultFrom: 'celsius',
      defaultTo: 'fahrenheit',
      units: [
        { id: 'celsius', name: 'Celsius (°C)', symbol: '°C' },
        { id: 'fahrenheit', name: 'Fahrenheit (°F)', symbol: '°F' },
        { id: 'kelvin', name: 'Kelvin (K)', symbol: 'K' }
      ]
    }
  };

  // State Variables
  let currentCategory = 'length';

  // DOM References
  let categoryTabs, fromSelect, toSelect, valueInput, swapBtn, convertBtn;
  let resultBox, resultValueElem, resultFormulaElem, alertBox;

  /**
   * Updates From and To dropdowns when category changes
   */
  function populateUnitDropdowns(catKey) {
    if (!fromSelect || !toSelect || !UNIT_CONFIG[catKey]) return;

    const catData = UNIT_CONFIG[catKey];
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    catData.units.forEach((u) => {
      const optFrom = document.createElement('option');
      optFrom.value = u.id;
      optFrom.textContent = u.name;
      if (u.id === catData.defaultFrom) optFrom.selected = true;
      fromSelect.appendChild(optFrom);

      const optTo = document.createElement('option');
      optTo.value = u.id;
      optTo.textContent = u.name;
      if (u.id === catData.defaultTo) optTo.selected = true;
      toSelect.appendChild(optTo);
    });
  }

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
   * Formats numbers cleanly without trailing zeros
   */
  function formatNumber(num) {
    if (Math.abs(num) >= 1e7 || (Math.abs(num) > 0 && Math.abs(num) < 1e-4)) {
      return num.toExponential(5).replace(/\.?0+e/, 'e');
    }
    return Number(num.toPrecision(8)).toLocaleString(undefined, {
      maximumFractionDigits: 6
    });
  }

  /**
   * Temperature conversion formulas
   */
  function convertTemperature(val, from, to) {
    let result = val;
    let formulaText = '';

    if (from === to) {
      return {
        value: val,
        formula: `${val} ${UNIT_CONFIG.temperature.units.find(u => u.id === from).symbol} = ${val} ${UNIT_CONFIG.temperature.units.find(u => u.id === to).symbol}`
      };
    }

    if (from === 'celsius' && to === 'fahrenheit') {
      result = (val * 9) / 5 + 32;
      formulaText = `(${val}°C × 9/5) + 32 = ${result.toFixed(4)}°F`;
    } else if (from === 'fahrenheit' && to === 'celsius') {
      result = ((val - 32) * 5) / 9;
      formulaText = `(${val}°F - 32) × 5/9 = ${result.toFixed(4)}°C`;
    } else if (from === 'celsius' && to === 'kelvin') {
      result = val + 273.15;
      formulaText = `${val}°C + 273.15 = ${result.toFixed(4)} K`;
    } else if (from === 'kelvin' && to === 'celsius') {
      result = val - 273.15;
      formulaText = `${val} K - 273.15 = ${result.toFixed(4)}°C`;
    } else if (from === 'fahrenheit' && to === 'kelvin') {
      result = ((val - 32) * 5) / 9 + 273.15;
      formulaText = `((${val}°F - 32) × 5/9) + 273.15 = ${result.toFixed(4)} K`;
    } else if (from === 'kelvin' && to === 'fahrenheit') {
      result = ((val - 273.15) * 9) / 5 + 32;
      formulaText = `((${val} K - 273.15) × 9/5) + 32 = ${result.toFixed(4)}°F`;
    }

    return { value: result, formula: formulaText };
  }

  /**
   * Length & Weight conversion using factor base
   */
  function convertFactorBased(val, fromId, toId, catKey) {
    const units = UNIT_CONFIG[catKey].units;
    const fromUnit = units.find((u) => u.id === fromId);
    const toUnit = units.find((u) => u.id === toId);

    if (!fromUnit || !toUnit) return null;

    // Convert input to base unit, then to target unit
    const valueInBase = val * fromUnit.factor;
    const convertedValue = valueInBase / toUnit.factor;

    const ratio = fromUnit.factor / toUnit.factor;
    const formulaText = `Multiply ${val} ${fromUnit.symbol} by conversion ratio (${ratio.toFixed(6)}...) = ${formatNumber(convertedValue)} ${toUnit.symbol}`;

    return {
      value: convertedValue,
      formula: formulaText,
      fromSymbol: fromUnit.symbol,
      toSymbol: toUnit.symbol
    };
  }

  /**
   * Main Conversion Handler
   */
  function performConversion() {
    clearAlert();

    const rawVal = valueInput.value.trim();
    if (rawVal === '') {
      showAlert('Please enter a value to convert.');
      if (resultBox) resultBox.style.display = 'none';
      return;
    }

    const val = parseFloat(rawVal);
    if (isNaN(val)) {
      showAlert('Please enter a valid numeric value.');
      if (resultBox) resultBox.style.display = 'none';
      return;
    }

    const fromId = fromSelect.value;
    const toId = toSelect.value;

    let res;
    let unitSymbol = '';

    if (currentCategory === 'temperature') {
      res = convertTemperature(val, fromId, toId);
      const toObj = UNIT_CONFIG.temperature.units.find((u) => u.id === toId);
      unitSymbol = toObj ? toObj.symbol : '';
    } else {
      res = convertFactorBased(val, fromId, toId, currentCategory);
      unitSymbol = res ? res.toSymbol : '';
    }

    if (res && resultBox) {
      resultValueElem.textContent = `${formatNumber(res.value)} ${unitSymbol}`;
      resultFormulaElem.textContent = res.formula;
      resultBox.style.display = 'block';

      // Dynamic result pulse animation
      resultValueElem.classList.remove('value-updated');
      void resultValueElem.offsetWidth;
      resultValueElem.classList.add('value-updated');
    }
  }

  /**
   * Swaps From and To Units with 360 spin animation
   */
  function swapUnits() {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

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
   * Handles Category Tab Switching
   */
  function switchCategory(newCategory) {
    if (!UNIT_CONFIG[newCategory]) return;
    currentCategory = newCategory;

    // Update Tab UI
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === newCategory);
    });

    // Populate new unit options
    populateUnitDropdowns(currentCategory);

    // Auto calculate
    performConversion();
  }

  /**
   * Initializes Unit Converter DOM and Events
   */
  function initUnitConverter() {
    categoryTabs = document.querySelectorAll('.tab-btn');
    fromSelect = document.getElementById('unit-from');
    toSelect = document.getElementById('unit-to');
    valueInput = document.getElementById('unit-value');
    swapBtn = document.getElementById('unit-swap-btn');
    convertBtn = document.getElementById('unit-convert-btn');
    resultBox = document.getElementById('unit-result-box');
    resultValueElem = document.getElementById('unit-result-value');
    resultFormulaElem = document.getElementById('unit-result-formula');
    alertBox = document.getElementById('unit-alert');

    if (!fromSelect || !toSelect || !valueInput || !convertBtn) return;

    // Set initial category from active tab or default
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
      currentCategory = activeTab.getAttribute('data-category') || 'length';
    }

    populateUnitDropdowns(currentCategory);

    // Event listeners
    categoryTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const cat = tab.getAttribute('data-category');
        if (cat) switchCategory(cat);
      });
    });

    convertBtn.addEventListener('click', performConversion);
    if (swapBtn) swapBtn.addEventListener('click', swapUnits);

    valueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performConversion();
    });

    fromSelect.addEventListener('change', performConversion);
    toSelect.addEventListener('change', performConversion);

    // Initial conversion trigger (e.g. 10 meters to feet)
    performConversion();
  }

  document.addEventListener('DOMContentLoaded', initUnitConverter);
})();
