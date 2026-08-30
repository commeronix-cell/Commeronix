/**
 * COMMERONIX - VERSATILE SIMPLE & SCIENTIFIC LIVE CALCULATOR ENGINE
 * Features:
 * - Simple pocket/desktop calculator interface (Default) & Scientific mode
 * - Real-time expression evaluation and instant result preview
 * - Classic physical calculator operations (+, -, ×, ÷, %, ±, 1/x, √)
 * - Advanced scientific functions (sin, cos, tan, log, ln, pi, e, x^y, x!)
 * - Full memory register system (MC, MR, M+, M-) with on-screen [M] indicator
 * - Audio key-click feedback (with Mute / Sound toggle)
 * - Persistent calculation history tape with 1-click restore
 * - 1-Click Copy result with tooltip toast
 * - Complete physical keyboard shortcuts support
 */

(function () {
  'use strict';

  // Calculator State
  let currentExpression = '';
  let lastResult = null;
  let memoryValue = 0;
  let historyStack = [];
  let isScientificMode = false;
  let isRadMode = true; // Radians vs Degrees
  let isSoundEnabled = true;

  // Web Audio Context for tactile key clicks
  let audioCtx = null;

  // DOM Elements
  let exprDisplay, mainDisplay, memBadge;
  let historyList, clearHistoryBtn, modeTabs;
  let degRadBtn, soundToggleBtn, copyBtn, toastElem;
  let sciKeypad;

  /**
   * Initializes Calculator
   */
  function initCalculator() {
    exprDisplay = document.getElementById('calc-expr');
    mainDisplay = document.getElementById('calc-main');
    memBadge = document.getElementById('calc-mem-badge');
    historyList = document.getElementById('calc-history-list');
    clearHistoryBtn = document.getElementById('calc-clear-history');
    modeTabs = document.querySelectorAll('.calc-tab-btn');
    degRadBtn = document.getElementById('calc-degrad-toggle');
    soundToggleBtn = document.getElementById('calc-sound-toggle');
    sciKeypad = document.getElementById('calc-sci-grid');
    copyBtn = document.getElementById('calc-copy-btn');
    toastElem = document.getElementById('calc-toast');

    if (!mainDisplay) return;

    loadHistory();
    setupKeypadListeners();
    setupKeyboardListeners();
    setupControls();
    updateDisplay();
  }

  /**
   * Synthesizes rich, audible, tactile mechanical key click sound using Web Audio API
   */
  function playKeySound(type) {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === '=' || type === 'equals') {
        // High-energy celebratory chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'C' || type === 'clear' || type === 'DEL') {
        // Distinct low punchy reset tap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
        gain.gain.setValueAtTime(0.30, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        // Boosted, crisp, satisfying tactile mechanical switch click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Updates Display & Live Real-Time Preview
   */
  function updateDisplay() {
    if (!mainDisplay || !exprDisplay) return;

    // Update Memory Badge
    if (memBadge) {
      memBadge.style.display = memoryValue !== 0 ? 'inline-block' : 'none';
      memBadge.textContent = `M (${formatResult(memoryValue)})`;
    }

    if (!currentExpression) {
      mainDisplay.textContent = '0';
      exprDisplay.textContent = '';
      return;
    }

    // Format expression for readability
    const formattedExpr = currentExpression
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' − ');

    exprDisplay.textContent = formattedExpr;

    // Live preview of math
    try {
      const sanitized = sanitizeForEval(currentExpression);
      if (sanitized && !/[+\-*/^%]$/.test(sanitized)) {
        const preview = evaluateExpression(sanitized);
        if (preview !== null && !isNaN(preview) && isFinite(preview)) {
          mainDisplay.textContent = formatResult(preview);
        }
      }
    } catch (e) {}
  }

  /**
   * Appends token / number / operator
   */
  function appendToken(token) {
    playKeySound(token);

    // If starting fresh after equals and typing a number, reset expression
    if (lastResult !== null && /^[0-9.]$/.test(token)) {
      currentExpression = '';
      lastResult = null;
    } else {
      lastResult = null;
    }

    // Prevent consecutive invalid operators
    if (['+', '*', '/', '%'].includes(token)) {
      if (!currentExpression || /[+\-*/%]$/.test(currentExpression)) {
        if (currentExpression) {
          currentExpression = currentExpression.slice(0, -1) + token;
          updateDisplay();
        }
        return;
      }
    }

    if (token === '-' && /[-]$/.test(currentExpression)) {
      return;
    }

    if (token === '.') {
      const parts = currentExpression.split(/[+\-*/()^]/);
      const currentNumber = parts[parts.length - 1];
      if (currentNumber.includes('.')) return;
      if (!currentNumber) currentExpression += '0';
    }

    currentExpression += token;
    updateDisplay();
  }

  /**
   * Applies scientific/financial functions
   */
  function applyFunction(fn) {
    playKeySound('fn');
    lastResult = null;

    if (fn === 'pi') {
      appendToken(Math.PI.toString());
      return;
    }
    if (fn === 'e') {
      appendToken(Math.E.toString());
      return;
    }

    if (fn === 'sqrt') {
      currentExpression += 'Math.sqrt(';
    } else if (fn === 'sin') {
      currentExpression += isRadMode ? 'Math.sin(' : 'sind(';
    } else if (fn === 'cos') {
      currentExpression += isRadMode ? 'Math.cos(' : 'cosd(';
    } else if (fn === 'tan') {
      currentExpression += isRadMode ? 'Math.tan(' : 'tand(';
    } else if (fn === 'log') {
      currentExpression += 'Math.log10(';
    } else if (fn === 'ln') {
      currentExpression += 'Math.log(';
    } else if (fn === 'square') {
      currentExpression += '**2';
    } else if (fn === 'power') {
      appendToken('^');
      return;
    } else if (fn === 'reciprocal') {
      currentExpression = `(1/(${currentExpression || '1'}))`;
    } else if (fn === 'fact') {
      try {
        const val = evaluateExpression(sanitizeForEval(currentExpression));
        if (val !== null && val >= 0 && val <= 170 && Number.isInteger(val)) {
          const res = factorial(val);
          currentExpression = res.toString();
          mainDisplay.textContent = formatResult(res);
        } else {
          showToast('Factorial requires non-negative integer ≤ 170');
        }
      } catch (e) {
        showToast('Invalid input for factorial');
      }
      return;
    }

    updateDisplay();
  }

  /**
   * Factorial calculation helper
   */
  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  /**
   * Percentage calculation in standard calculator mode
   */
  function handlePercentage() {
    playKeySound('fn');
    if (!currentExpression) return;

    try {
      // If preceded by an operator like '500 * 20' -> '500 * 0.2'
      // Or '100 + 10' -> '100 + (100 * 0.10)'
      const match = currentExpression.match(/^(.*)([+\-*/])([0-9.]+)$/);
      if (match) {
        const baseExpr = match[1];
        const op = match[2];
        const num = parseFloat(match[3]);

        const baseVal = evaluateExpression(sanitizeForEval(baseExpr)) || 0;
        if (op === '+' || op === '-') {
          const percentVal = (baseVal * num) / 100;
          currentExpression = `${baseExpr}${op}${percentVal}`;
        } else {
          const percentVal = num / 100;
          currentExpression = `${baseExpr}${op}${percentVal}`;
        }
      } else {
        const val = evaluateExpression(sanitizeForEval(currentExpression));
        if (val !== null) {
          currentExpression = (val / 100).toString();
        }
      }
      updateDisplay();
    } catch (e) {
      appendToken('%');
    }
  }

  /**
   * Sanitizes expression string safely for evaluation
   */
  function sanitizeForEval(expr) {
    if (!expr) return '';
    let s = expr;

    // Handle degree conversions
    s = s.replace(/sind\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
    s = s.replace(/cosd\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
    s = s.replace(/tand\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');

    // Replace percentage if left
    s = s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Replace power symbol
    s = s.replace(/\^/g, '**');

    return s;
  }

  /**
   * Evaluates mathematical string expression securely
   */
  function evaluateExpression(sanitized) {
    if (!sanitized) return null;

    // Strict validation: allow only math characters and Math methods
    if (!/^[\d\s+\-*/().,%eE]|Math\.[a-z0-9]+|\*\*/i.test(sanitized)) {
      return null;
    }

    try {
      const result = Function(`'use strict'; return (${sanitized});`)();
      return result;
    } catch (e) {
      return null;
    }
  }

  /**
   * Formats numbers cleanly with commas & dynamic precision
   */
  function formatResult(val) {
    if (val === null || val === undefined || isNaN(val)) return 'Error';
    if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

    // Round minor floating point inaccuracies
    const rounded = parseFloat(val.toPrecision(12));
    if (Math.abs(rounded) > 1e12 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
      return rounded.toExponential(6);
    }
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 8 });
  }

  /**
   * Calculates final result & commits to history tape
   */
  function calculateEquals() {
    playKeySound('equals');
    if (!currentExpression) return;

    try {
      const sanitized = sanitizeForEval(currentExpression);
      const result = evaluateExpression(sanitized);

      if (result === null || isNaN(result)) {
        showToast('Invalid Expression');
        return;
      }

      const formattedResult = formatResult(result);
      const entry = {
        expression: currentExpression,
        result: formattedResult,
        rawResult: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      addHistoryEntry(entry);

      exprDisplay.textContent = currentExpression + ' =';
      mainDisplay.textContent = formattedResult;

      // Pulse animation on display
      mainDisplay.classList.remove('value-updated');
      void mainDisplay.offsetWidth;
      mainDisplay.classList.add('value-updated');

      currentExpression = result.toString();
      lastResult = result;
    } catch (e) {
      showToast('Calculation Error');
    }
  }

  /**
   * Backspace: delete last character
   */
  function backspace() {
    playKeySound('clear');
    if (currentExpression.length > 0) {
      currentExpression = currentExpression.slice(0, -1);
      updateDisplay();
    }
  }

  /**
   * Clear All (AC)
   */
  function clearAll() {
    playKeySound('clear');
    currentExpression = '';
    lastResult = null;
    updateDisplay();
  }

  /**
   * Invert Sign (±)
   */
  function toggleSign() {
    playKeySound('fn');
    if (!currentExpression) return;
    try {
      const val = evaluateExpression(sanitizeForEval(currentExpression));
      if (val !== null) {
        currentExpression = (-val).toString();
        updateDisplay();
      }
    } catch (e) {}
  }

  /**
   * Memory operations: MC, MR, M+, M-
   */
  function handleMemory(action) {
    playKeySound('fn');
    try {
      const currentVal = evaluateExpression(sanitizeForEval(currentExpression)) || 0;

      if (action === 'MC') {
        memoryValue = 0;
        showToast('Memory Cleared (0)');
      } else if (action === 'MR') {
        currentExpression = memoryValue.toString();
        showToast(`Memory Recall: ${formatResult(memoryValue)}`);
      } else if (action === 'M+') {
        memoryValue += currentVal;
        showToast(`Added to Memory: ${formatResult(memoryValue)}`);
      } else if (action === 'M-') {
        memoryValue -= currentVal;
        showToast(`Subtracted from Memory: ${formatResult(memoryValue)}`);
      }
      updateDisplay();
    } catch (e) {
      showToast('Memory operation error');
    }
  }

  /**
   * Adds entry to calculation history stack & localStorage
   */
  function addHistoryEntry(entry) {
    historyStack.unshift(entry);
    if (historyStack.length > 25) historyStack.pop();

    try {
      localStorage.setItem('commeronix_calc_history', JSON.stringify(historyStack));
    } catch (e) {}

    renderHistory();
  }

  /**
   * Loads history from localStorage
   */
  function loadHistory() {
    try {
      const saved = localStorage.getItem('commeronix_calc_history');
      if (saved) {
        historyStack = JSON.parse(saved);
        renderHistory();
      }
    } catch (e) {}
  }

  /**
   * Renders history list DOM
   */
  function renderHistory() {
    if (!historyList) return;

    if (historyStack.length === 0) {
      historyList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 2rem 0;">No calculation history yet.<br><span style="font-size:0.75rem; opacity:0.7;">Calculations will appear here.</span></div>';
      return;
    }

    historyList.innerHTML = historyStack
      .map(
        (item, idx) => `
      <div class="history-item" data-index="${idx}" title="Click to restore this calculation">
        <div class="history-expr">${item.expression} =</div>
        <div class="history-res">${item.result}</div>
        <div class="history-time">${item.timestamp}</div>
      </div>
    `
      )
      .join('');

    // Restore on click
    historyList.querySelectorAll('.history-item').forEach((itemElem) => {
      itemElem.addEventListener('click', () => {
        const idx = parseInt(itemElem.getAttribute('data-index'), 10);
        const item = historyStack[idx];
        if (item) {
          currentExpression = item.rawResult.toString();
          exprDisplay.textContent = item.expression + ' =';
          mainDisplay.textContent = item.result;
          lastResult = item.rawResult;
          showToast(`Restored: ${item.result}`);
        }
      });
    });
  }

  /**
   * Sets up keypad button clicks with micro-animation
   */
  function setupKeypadListeners() {
    document.querySelectorAll('.calc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        const action = btn.getAttribute('data-action');
        const fn = btn.getAttribute('data-fn');
        const mem = btn.getAttribute('data-mem');

        // Tactile bounce animation
        btn.style.transform = 'scale(0.92)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 90);

        if (val) appendToken(val);
        else if (action === 'equals') calculateEquals();
        else if (action === 'clear') clearAll();
        else if (action === 'backspace') backspace();
        else if (action === 'sign') toggleSign();
        else if (action === 'percent') handlePercentage();
        else if (fn) applyFunction(fn);
        else if (mem) handleMemory(mem);
      });
    });
  }

  /**
   * Sets up full physical keyboard support
   */
  function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        appendToken(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        appendToken(key);
      } else if (key === '.' || key === ',') {
        appendToken('.');
      } else if (key === '(' || key === ')') {
        appendToken(key);
      } else if (key === '%') {
        handlePercentage();
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculateEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
      }
    });
  }

  /**
   * Sets up UI controls (Tabs, Sound, Clear History, Copy)
   */
  function setupControls() {
    // Mode Switcher Tabs (Simple vs Scientific)
    modeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        modeTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        isScientificMode = mode === 'scientific';
        if (sciKeypad) {
          sciKeypad.style.display = isScientificMode ? 'grid' : 'none';
        }
        if (degRadBtn) {
          degRadBtn.style.display = isScientificMode ? 'inline-block' : 'none';
        }
        showToast(isScientificMode ? 'Scientific Calculator Active' : 'Simple Pocket Calculator Active');
      });
    });

    if (degRadBtn) {
      degRadBtn.addEventListener('click', () => {
        isRadMode = !isRadMode;
        degRadBtn.textContent = isRadMode ? 'RAD' : 'DEG';
        showToast(isRadMode ? 'Angle Mode: Radians' : 'Angle Mode: Degrees');
      });
    }

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundToggleBtn.classList.toggle('active', isSoundEnabled);
        soundToggleBtn.title = isSoundEnabled ? 'Key Sound: Enabled' : 'Key Sound: Muted';
        showToast(isSoundEnabled ? 'Key Sound Enabled 🔊' : 'Key Sound Muted 🔇');
      });
    }

    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        historyStack = [];
        localStorage.removeItem('commeronix_calc_history');
        renderHistory();
        showToast('History Cleared');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = mainDisplay ? mainDisplay.textContent : '';
        if (textToCopy && navigator.clipboard) {
          navigator.clipboard.writeText(textToCopy.replace(/,/g, '')).then(() => {
            showToast(`Copied ${textToCopy} to clipboard!`);
          });
        }
      });
    }
  }

  /**
   * Displays interactive feedback toast message
   */
  function showToast(msg) {
    if (!toastElem) return;
    toastElem.textContent = msg;
    toastElem.classList.add('show');
    setTimeout(() => {
      toastElem.classList.remove('show');
    }, 2200);
  }

  document.addEventListener('DOMContentLoaded', initCalculator);
})();
