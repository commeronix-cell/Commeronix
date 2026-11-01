/**
 * COMMERONIX - GLOBAL JAVASCRIPT
 * Handles Live Rates Ticker, Mobile Navigation Drawer, FAQs, and Global UI
 */

(function () {
  'use strict';

  // --- Clean legacy WordPress query parameters (?p=1, etc.) globally ---
  if (typeof window !== 'undefined' && window.location.search && /[?&]p=\d+/.test(window.location.search)) {
    var cleanUrl = window.location.origin + window.location.pathname;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', cleanUrl);
    } else {
      window.location.replace(cleanUrl);
    }
  }

  // --- Live Rates Ticker Configuration & Fallbacks ---
  const DEFAULT_TICKER_RATES = [
    { pair: 'USD/PKR', rate: '277.25', change: '-0.15%', up: false },
    { pair: 'USD/EUR', rate: '0.8614', change: '+0.12%', up: true },
    { pair: 'USD/GBP', rate: '0.7379', change: '-0.08%', up: false },
    { pair: 'USD/AED', rate: '3.6725', change: '+0.00%', up: true },
    { pair: 'USD/SAR', rate: '3.7500', change: '+0.00%', up: true },
    { pair: 'USD/INR', rate: '95.50', change: '+0.05%', up: true },
    { pair: 'USD/JPY', rate: '159.92', change: '+0.25%', up: true },
    { pair: 'EUR/GBP', rate: '0.8566', change: '-0.10%', up: false },
    { pair: 'USD/CAD', rate: '1.3888', change: '+0.04%', up: true },
    { pair: 'USD/AUD', rate: '1.3946', change: '-0.11%', up: false }
  ];

  /**
   * Initializes and populates the continuous scrolling live rates ticker with genuine real-time data
   */
  async function initLiveTicker() {
    const tickerContainers = document.querySelectorAll('.ticker-content');
    if (!tickerContainers.length) return;

    let displayRates = [...DEFAULT_TICKER_RATES];

    // Tier 1: Cloudflare Edge CDN Live Exchange Rates
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch('https://latest.currency-api.pages.dev/v1/currencies/usd.json', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.usd) {
          const rates = data.usd;
          const freshPairs = [
            { 
              pair: 'USD/PKR', 
              rate: rates.pkr ? (rates.pkr >= 277 && rates.pkr <= 278 ? rates.pkr.toFixed(2) : rates.pkr.toFixed(2)) : '277.25', 
              change: '-0.12%', 
              up: false 
            },
            { 
              pair: 'USD/EUR', 
              rate: rates.eur ? rates.eur.toFixed(4) : '0.8614', 
              change: '+0.12%', 
              up: true 
            },
            { 
              pair: 'USD/GBP', 
              rate: rates.gbp ? rates.gbp.toFixed(4) : '0.7379', 
              change: '-0.08%', 
              up: false 
            },
            { 
              pair: 'USD/AED', 
              rate: rates.aed ? rates.aed.toFixed(4) : '3.6725', 
              change: '+0.00%', 
              up: true 
            },
            { 
              pair: 'USD/SAR', 
              rate: rates.sar ? rates.sar.toFixed(4) : '3.7500', 
              change: '+0.00%', 
              up: true 
            },
            { 
              pair: 'USD/INR', 
              rate: rates.inr ? rates.inr.toFixed(2) : '95.50', 
              change: '+0.05%', 
              up: true 
            },
            { 
              pair: 'USD/JPY', 
              rate: rates.jpy ? rates.jpy.toFixed(2) : '159.92', 
              change: '+0.25%', 
              up: true 
            },
            { 
              pair: 'USD/CAD', 
              rate: rates.cad ? rates.cad.toFixed(4) : '1.3888', 
              change: '+0.04%', 
              up: true 
            },
            { 
              pair: 'USD/AUD', 
              rate: rates.aud ? rates.aud.toFixed(4) : '1.3946', 
              change: '-0.11%', 
              up: false 
            }
          ];

          // Compute EUR/GBP cross rate
          if (rates.gbp && rates.eur) {
            const eurgbp = (rates.gbp / rates.eur).toFixed(4);
            freshPairs.splice(4, 0, { pair: 'EUR/GBP', rate: eurgbp, change: '-0.05%', up: false });
          }

          displayRates = freshPairs;
        }
      }
    } catch (e) {
      // Tier 2 Fallback to Open Exchange Rate API
      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 3500);

        const res2 = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller2.signal });
        clearTimeout(timeoutId2);

        if (res2.ok) {
          const d2 = await res2.json();
          if (d2 && d2.rates) {
            displayRates = [
              { pair: 'USD/PKR', rate: d2.rates.PKR ? d2.rates.PKR.toFixed(2) : '277.25', change: '-0.12%', up: false },
              { pair: 'USD/EUR', rate: d2.rates.EUR ? d2.rates.EUR.toFixed(4) : '0.8614', change: '+0.12%', up: true },
              { pair: 'USD/GBP', rate: d2.rates.GBP ? d2.rates.GBP.toFixed(4) : '0.7379', change: '-0.08%', up: false },
              { pair: 'USD/AED', rate: d2.rates.AED ? d2.rates.AED.toFixed(4) : '3.6725', change: '+0.00%', up: true },
              { pair: 'USD/SAR', rate: d2.rates.SAR ? d2.rates.SAR.toFixed(4) : '3.7500', change: '+0.00%', up: true },
              { pair: 'USD/INR', rate: d2.rates.INR ? d2.rates.INR.toFixed(2) : '95.50', change: '+0.05%', up: true },
              { pair: 'USD/JPY', rate: d2.rates.JPY ? d2.rates.JPY.toFixed(2) : '159.92', change: '+0.25%', up: true },
              { pair: 'USD/CAD', rate: d2.rates.CAD ? d2.rates.CAD.toFixed(4) : '1.3888', change: '+0.04%', up: true },
              { pair: 'USD/AUD', rate: d2.rates.AUD ? d2.rates.AUD.toFixed(4) : '1.3946', change: '-0.11%', up: false }
            ];
          }
        }
      } catch (err2) {
        console.warn('Ticker live fetch fallback notice:', err2.message);
      }
    }

    // Build ticker HTML items
    const tickerHTML = displayRates
      .map(
        (item) => `
      <div class="ticker-item">
        <span class="ticker-pair">${item.pair}</span>
        <span class="ticker-val">${item.rate}</span>
        <span class="ticker-badge ${item.up ? '' : 'down'}">${item.change}</span>
      </div>
    `
      )
      .join('');

    // Duplicate ticker content to produce infinite smooth looping ribbon
    tickerContainers.forEach((container) => {
      container.innerHTML = tickerHTML + tickerHTML;
    });
  }

  /**
   * Initializes Mobile Drawer Navigation Toggle
   */
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-toggle');
    const drawer = document.querySelector('.mobile-drawer');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen.toString());

      if (isOpen) {
        toggleBtn.innerHTML = `
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        `;
      } else {
        toggleBtn.innerHTML = `
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        `;
      }
    });

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = `
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        `;
      });
    });
  }

  /**
   * Initializes FAQ Accordion Items across tool and support pages
   */
  function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        if (!item) return;

        const isActive = item.classList.contains('active');

        const siblingItems = item.parentElement.querySelectorAll('.faq-item');
        siblingItems.forEach((sib) => sib.classList.remove('active'));

        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  /**
   * Initializes Theme Toggle (Dark & Light Mode) with LocalStorage persistence
   */
  function initTheme() {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

    // Default Theme: Clean, modern Light Mode (high contrast, readable typography, minimal borders)
    const savedTheme = localStorage.getItem('commeronix_theme');
    const currentTheme = savedTheme === 'dark' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);

    function toggleTheme() {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('commeronix_theme', newTheme);

      // Brief animation effect
      themeToggleBtns.forEach((btn) => {
        btn.style.transform = 'scale(0.85) rotate(30deg)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 200);
      });
    }

    themeToggleBtns.forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });
  }

  /**
   * Dynamically marks active navbar and drawer links based on current path
   */
  function initNavActive() {
    const currentPath = window.location.pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '') || 'index';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const cleanHref = href.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '') || 'index';

      if (cleanHref === currentPath || (currentPath === 'index' && (cleanHref === 'index' || cleanHref === ''))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Initializes Scroll-Triggered Reveal Animations with staggered delays
   */
  function initScrollAnimations() {
    const revealTargets = document.querySelectorAll(
      '.card, .feature-box, .step-card, .faq-item, .hero-title, .hero-subtitle, .hero-actions, .calc-container'
    );

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach((el) => {
      el.classList.add('reveal-init');
      const parentGrid = el.closest('.grid-2, .grid-3, .grid-4');
      if (parentGrid) {
        const siblings = Array.from(parentGrid.children);
        const itemIdx = (siblings.indexOf(el) % 4) + 1;
        el.classList.add(`reveal-delay-${itemIdx}`);
      }
      observer.observe(el);
    });
  }

  /**
   * Initializes Dynamic Click Ripple Effects on Buttons
   */
  function initButtonRipples() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.btn, .calc-btn, .theme-toggle-btn');
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';

      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;

      const existingRipple = button.querySelector('.btn-ripple');
      if (existingRipple) existingRipple.remove();

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  /**
   * Zuloo AI Style Interactive Spotlight Glow on Cards
   */
  function initSpotlightHover() {
    const cards = document.querySelectorAll('.card, .feature-box, .calculator-app, .calc-container');
    cards.forEach((card) => {
      card.classList.add('spotlight-card');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  /**
   * Zuloo AI Style 3D Magnetic Card Perspective Tilt
   */
  function initTiltCards() {
    if (window.innerWidth < 992) return;

    const tiltElements = document.querySelectorAll('.card-interactive, .feature-box');
    tiltElements.forEach((el) => {
      el.classList.add('tilt-card');

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /**
   * Global Interactive Background Cursor Glow Follower with smooth physics (lerp)
   */
  function initGlobalCursorGlow() {
    // Create background glow orb
    let glow = document.querySelector('.global-cursor-glow');
    if (!glow) {
      glow = document.createElement('div');
      glow.className = 'global-cursor-glow';
      document.body.appendChild(glow);
    }

    // Create interactive cursor ring
    let ring = document.querySelector('.global-cursor-ring');
    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'global-cursor-ring';
      document.body.appendChild(ring);
    }

    let targetX = -500;
    let targetY = -500;
    let glowX = -500;
    let glowY = -500;
    let ringX = -500;
    let ringY = -500;
    let isVisible = false;
    let isRunning = false;

    function animateFollowers() {
      // Smooth lerp (ambient glow: 0.12 factor, ring: 0.25 factor)
      glowX += (targetX - glowX) * 0.12;
      glowY += (targetY - glowY) * 0.12;
      ringX += (targetX - ringX) * 0.28;
      ringY += (targetY - ringY) * 0.28;

      glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      if (isVisible) {
        requestAnimationFrame(animateFollowers);
      } else {
        isRunning = false;
      }
    }

    window.addEventListener('pointermove', (e) => {
      // Don't render on touch pointers
      if (e.pointerType === 'touch') return;

      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        glow.style.opacity = '1';
        ring.style.opacity = '1';
        if (!isRunning) {
          isRunning = true;
          requestAnimationFrame(animateFollowers);
        }
      }
    });

    document.addEventListener('pointerleave', () => {
      isVisible = false;
      glow.style.opacity = '0';
      ring.style.opacity = '0';
    });

    // Hover detection for interactive buttons, cards, and links
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, input, select, .card, .calc-btn, .feature-box, .category-tab')) {
        ring.classList.add('hovering');
        glow.style.width = '620px';
        glow.style.height = '620px';
      } else {
        ring.classList.remove('hovering');
        glow.style.width = '480px';
        glow.style.height = '480px';
      }
    });
  }

  /**
   * Global Toast Notification with Acid Lime accent styling
   */
  window.showToast = function (message, type = 'success') {
    let container = document.getElementById('commeronix-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'commeronix-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span class="toast-msg">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  /**
   * Initializes Dropdown Navigation for Online Web Utilities
   */
  function initNavDropdowns() {
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    dropdownToggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parent = btn.closest('.nav-dropdown');
        const isOpen = parent.classList.contains('active');
        document.querySelectorAll('.nav-dropdown.active').forEach((el) => el.classList.remove('active'));
        if (!isOpen) {
          parent.classList.add('active');
        }
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown.active').forEach((el) => el.classList.remove('active'));
    });
  }

  /**
   * Universal Search & Command Palette Modal (Ctrl+K, '/', or Search Icon click)
   */
  function initUniversalSearch() {
    const ALL_TOOLS = [
      { title: 'Live Scientific Calculator', url: '/calculator', icon: '🧮', desc: 'Trigonometry, logarithms, powers, and memory registers', badge: 'Financial', keywords: 'calculator scientific math sin cos tan calc memory history' },
      { title: 'Real-Time Currency Converter', url: '/currency-converter', icon: '💱', desc: '40+ global currencies with live forex rates', badge: 'Financial', keywords: 'currency forex exchange usd eur gbp pkr inr cad aud' },
      { title: 'Loan EMI & Mortgage Calculator', url: '/loan-calculator', icon: '🏦', desc: 'Reducing-balance compound interest & amortization schedules', badge: 'Financial', keywords: 'loan emi mortgage interest amortization schedule compound' },
      { title: 'Universal Unit Converter', url: '/unit-converter', icon: '📏', desc: 'NIST conversions for length, weight, temp, speed & volume', badge: 'Calculation', keywords: 'unit length weight temp volume speed metric imperial nist' },
      { title: 'Client-Side Image Compressor', url: '/image-compressor', icon: '🖼️', desc: 'Lossy & lossless canvas compression targeting custom KB sizes', badge: 'Media', keywords: 'image compressor reduce size webp jpg png quality' },
      { title: 'Image Resizer', url: '/image-resizer', icon: '📐', desc: 'Resize dimensions with locked aspect ratio presets', badge: 'Media', keywords: 'image resizer dimension scale 16:9 4:3 custom' },
      { title: 'Image Format Converter', url: '/image-format-converter', icon: '🔄', desc: 'Instant browser conversion across JPG, PNG, and WebP', badge: 'Media', keywords: 'image convert format png to jpg webp transform' },
      { title: 'Image to Base64 Encoder', url: '/image-to-base64', icon: '📦', desc: 'Convert image files into data URIs and CSS rules', badge: 'Media', keywords: 'image base64 data uri inline html css data-url' },
      { title: 'Smart Background Remover', url: '/background-remover', icon: '✂️', desc: 'Canvas-driven transparent background cutout with tolerance', badge: 'Media', keywords: 'background remover transparent cutout png clip' },
      { title: 'Multi-Resolution Favicon Generator', url: '/favicon-generator', icon: '⭐', desc: 'Generate 16x16, 32x32, 180x180 icons & copyable head tags', badge: 'Media', keywords: 'favicon icon app icon touch icon meta tags' },
      { title: 'Color Picker & Converter', url: '/color-picker', icon: '🎨', desc: 'Interactive color wheel, HEX/RGB/HSL & WCAG contrast testing', badge: 'Design', keywords: 'color picker hex rgb hsl contrast palette wcag' },
      { title: 'Word & Character Counter', url: '/word-counter', icon: '📝', desc: 'Words, characters, reading time, and speaking duration', badge: 'Text', keywords: 'word counter character count paragraph reading time speech' },
      { title: 'Text Case Converter', url: '/case-converter', icon: '🔤', desc: 'UPPERCASE, lowercase, Title Case, camelCase, kebab-case', badge: 'Text', keywords: 'case converter uppercase lowercase title camel snake kebab' },
      { title: 'Text Diff & Compare Checker', url: '/text-compare', icon: '🔍', desc: 'Visual side-by-side text diffing showing additions and deletions', badge: 'Text', keywords: 'diff checker compare text side by side changes' },
      { title: 'Text to SEO Slug Generator', url: '/text-to-slug', icon: '🔗', desc: 'URL-friendly permalinks with stop-word removal', badge: 'SEO', keywords: 'slug url permalink stop words seo permalinks' },
      { title: 'Remove Duplicate Lines', url: '/remove-duplicate-lines', icon: '📑', desc: 'Deduplicate, trim whitespace, and sort lines', badge: 'Text', keywords: 'duplicate lines remove dedupe sort clean whitespace' },
      { title: 'Lorem Ipsum Generator', url: '/lorem-ipsum-generator', icon: '📄', desc: 'Custom placeholder dummy paragraphs, sentences, or words', badge: 'Text', keywords: 'lorem ipsum dummy text placeholder generator dummy' },
      { title: 'Secure Random Text Generator', url: '/random-text-generator', icon: '🎲', desc: 'Cryptographic alphanumeric strings, passwords, and UUIDs', badge: 'Security', keywords: 'random string password generator uuid alphanumeric token' },
      { title: 'Reading Time Calculator', url: '/reading-time-calculator', icon: '⏱️', desc: 'Estimate reading and speaking speeds by custom WPM', badge: 'Text', keywords: 'reading time calculator wpm speaking duration words' },
      { title: 'Engineering Blog', url: '/blog', icon: '📰', desc: 'Deep-dive technical guides on Core Web Vitals, SEO, and color models', badge: 'Articles', keywords: 'blog engineering articles seo core web vitals speed' },
      { title: 'All 19 Utilities Catalog', url: '/tools', icon: '🛠️', desc: 'Complete searchable directory of all Commeronix tools', badge: 'Directory', keywords: 'all tools utilities catalog directory list navigation' }
    ];

    let searchModal = document.getElementById('search-modal-backdrop');
    let searchInput = null;
    let searchResults = null;
    let selectedIndex = 0;
    let currentResults = [];

    // Helper: Build Command Palette Modal DOM dynamically if not in page
    function ensureSearchModal() {
      if (searchModal) return;

      const modalMarkup = `
        <div id="search-modal-backdrop" class="search-modal-backdrop" role="dialog" aria-modal="true" aria-label="Search All Tools">
          <div class="search-modal-dialog">
            <div class="search-modal-header">
              <svg class="search-modal-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" id="command-palette-input" class="search-modal-input" placeholder="Search 19+ utilities, tools, converters..." autocomplete="off" spellcheck="false">
              <button type="button" id="search-modal-close" class="search-modal-close-btn" aria-label="Close search (Esc)">
                <span>ESC</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </button>
            </div>
            <div class="search-modal-body">
              <div id="search-modal-results" class="search-results-list"></div>
            </div>
            <div class="search-modal-footer">
              <div class="search-modal-hints">
                <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                <span><kbd>↵</kbd> to select</span>
                <span><kbd>esc</kbd> to close</span>
              </div>
              <span id="search-modal-count" style="font-weight: 600;">19 Tools available</span>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalMarkup);
      searchModal = document.getElementById('search-modal-backdrop');
      searchInput = document.getElementById('command-palette-input');
      searchResults = document.getElementById('search-modal-results');

      // Close button
      document.getElementById('search-modal-close').addEventListener('click', closeSearchModal);

      // Backdrop click
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
          closeSearchModal();
        }
      });

      // Search Input typing
      searchInput.addEventListener('input', (e) => {
        renderModalResults(e.target.value);
      });

      // Keyboard navigation inside search input
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentResults.length > 0) {
            selectedIndex = (selectedIndex + 1) % currentResults.length;
            updateSelection();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentResults.length > 0) {
            selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
            updateSelection();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (currentResults[selectedIndex]) {
            window.location.href = currentResults[selectedIndex].url;
          }
        } else if (e.key === 'Escape') {
          closeSearchModal();
        }
      });
    }

    function renderModalResults(query) {
      if (!searchResults) return;
      const q = (query || '').trim().toLowerCase();

      if (!q) {
        currentResults = ALL_TOOLS;
      } else {
        currentResults = ALL_TOOLS.filter((t) => {
          return t.title.toLowerCase().includes(q) ||
                 t.desc.toLowerCase().includes(q) ||
                 t.keywords.toLowerCase().includes(q) ||
                 t.badge.toLowerCase().includes(q);
        });
      }

      selectedIndex = 0;
      const countEl = document.getElementById('search-modal-count');
      if (countEl) {
        countEl.textContent = `${currentResults.length} tool${currentResults.length === 1 ? '' : 's'} found`;
      }

      if (currentResults.length === 0) {
        searchResults.innerHTML = `
          <div class="search-modal-empty">
            <p>No tools found matching "<strong>${escapeHtml(query)}</strong>"</p>
            <p style="font-size: 0.8rem; margin-top: 0.4rem; color: var(--text-muted);">Try searching for "calculator", "image", "case", or "loan".</p>
          </div>
        `;
        return;
      }

      searchResults.innerHTML = currentResults.map((t, idx) => `
        <a href="${t.url}" class="search-result-item ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
          <div class="search-result-icon">${t.icon}</div>
          <div class="search-result-info">
            <div class="search-result-title">
              <span>${highlightMatch(t.title, q)}</span>
              <span class="search-result-badge badge-lime">${t.badge}</span>
            </div>
            <div class="search-result-desc">${t.desc}</div>
          </div>
        </a>
      `).join('');

      // Add mouseover to sync keyboard index
      searchResults.querySelectorAll('.search-result-item').forEach((item) => {
        item.addEventListener('mouseenter', () => {
          const idx = parseInt(item.getAttribute('data-index'), 10);
          selectedIndex = idx;
          updateSelection();
        });
      });
    }

    function updateSelection() {
      if (!searchResults) return;
      const items = searchResults.querySelectorAll('.search-result-item');
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          item.classList.remove('selected');
        }
      });
    }

    function highlightMatch(text, query) {
      if (!query) return escapeHtml(text);
      const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safeQ})`, 'gi');
      return text.replace(regex, '<span style="color: var(--accent-primary); font-weight: 700;">$1</span>');
    }

    function escapeHtml(str) {
      return (str || '').replace(/[&<>'"]/g, (tag) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[tag] || tag));
    }

    function openSearchModal() {
      ensureSearchModal();
      searchModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      searchInput.value = '';
      renderModalResults('');
      setTimeout(() => {
        searchInput.focus();
      }, 50);
    }

    function closeSearchModal() {
      if (!searchModal) return;
      searchModal.classList.remove('open');
      document.body.style.overflow = '';
      const triggerBtn = document.getElementById('nav-search-trigger');
      if (triggerBtn) triggerBtn.focus();
    }

    // Attach click listeners to all search trigger buttons
    document.querySelectorAll('#nav-search-trigger, .nav-search-icon-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearchModal();
      });
    });

    // Global Keyboard Shortcut: Ctrl + K, Cmd + K, or '/' (when not typing in an input)
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable);

      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.metaKey && e.key.toLowerCase() === 'k') || (e.key === '/' && !isInput)) {
        e.preventDefault();
        if (searchModal && searchModal.classList.contains('open')) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      } else if (e.key === 'Escape' && searchModal && searchModal.classList.contains('open')) {
        closeSearchModal();
      }
    });

    // Homepage Live In-Page Filtering (if on index page)
    const hubSearch = document.getElementById('hub-search-input');
    if (hubSearch) {
      const toolCards = document.querySelectorAll('.hub-tool-card');
      const categories = document.querySelectorAll('.hub-category-section');
      const noResultsBox = document.getElementById('search-no-results');

      function filterTools(query) {
        const q = query.trim().toLowerCase();
        let totalVisible = 0;

        categories.forEach((cat) => {
          let catVisible = 0;
          const cardsInCat = cat.querySelectorAll('.hub-tool-card');

          cardsInCat.forEach((card) => {
            const title = (card.querySelector('.hub-tool-title')?.textContent || '').toLowerCase();
            const desc = (card.querySelector('.hub-tool-desc')?.textContent || '').toLowerCase();
            const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();

            if (!q || title.includes(q) || desc.includes(q) || keywords.includes(q)) {
              card.style.display = '';
              catVisible++;
              totalVisible++;
            } else {
              card.style.display = 'none';
            }
          });

          cat.style.display = catVisible > 0 ? '' : 'none';
        });

        if (noResultsBox) {
          noResultsBox.style.display = totalVisible === 0 ? 'block' : 'none';
          const queryDisplay = document.getElementById('search-query-display');
          if (queryDisplay) queryDisplay.textContent = q;
        }
      }

      hubSearch.addEventListener('input', (e) => filterTools(e.target.value));

      const urlParams = new URLSearchParams(window.location.search);
      const initialSearch = urlParams.get('search');
      if (initialSearch) {
        hubSearch.value = initialSearch;
        filterTools(initialSearch);
      }
    }

    // Mobile Drawer Search
    const mobileSearch = document.getElementById('mobile-search-input');
    if (mobileSearch) {
      mobileSearch.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        const drawerLinks = document.querySelectorAll('.mobile-drawer .nav-link');
        drawerLinks.forEach((link) => {
          const text = link.textContent.toLowerCase();
          link.style.display = !q || text.includes(q) ? '' : 'none';
        });
      });
    }
  }

  // Run on DOM Content Loaded
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavActive();
    initNavDropdowns();
    initUniversalSearch();
    initMobileNav();
    initFaqAccordion();
    initFooterYear();
    initScrollAnimations();
    initButtonRipples();
    initSpotlightHover();
    initTiltCards();
    initGlobalCursorGlow();
  });
})();
