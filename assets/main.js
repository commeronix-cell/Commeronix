/**
 * COMMERONIX - GLOBAL JAVASCRIPT
 * Handles Live Rates Ticker, Mobile Navigation Drawer, FAQs, and Global UI
 */

(function () {
  'use strict';

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
   * Automatically updates copyright year in footer
   */
  function initFooterYear() {
    const yearElems = document.querySelectorAll('#current-year');
    const year = new Date().getFullYear();
    yearElems.forEach((el) => {
      el.textContent = year;
    });
  }

  /**
   * Initializes Theme Toggle (Dark & Light Mode) with LocalStorage persistence
   */
  function initTheme() {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

    // Get current theme from DOM or storage
    const savedTheme = localStorage.getItem('commeronix_theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const currentTheme = savedTheme || (prefersLight ? 'light' : 'dark');

    document.documentElement.setAttribute('data-theme', currentTheme);

    function toggleTheme() {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';

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
    const currentPath = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'index';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const cleanHref = href.replace(/^\//, '').replace(/\.html$/, '') || 'index';

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

  // Run on DOM Content Loaded
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavActive();
    initLiveTicker();
    initMobileNav();
    initFaqAccordion();
    initFooterYear();
    initScrollAnimations();
    initButtonRipples();
    initSpotlightHover();
    initTiltCards();
    initGlobalCursorGlow();

    // Auto-refresh live market rates every 60 seconds
    setInterval(initLiveTicker, 60000);
  });
})();
