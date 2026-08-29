# Commeronix — Precision Financial & Unit Calculation Hub

Commeronix is a modern, high-performance, client-side calculation suite featuring live foreign exchange rates, standard & scientific math tools, reducing-balance loan EMI schedules, and multi-category unit converters. Built with zero external heavy frameworks, modern CSS glassmorphism, Zuloo AI-inspired micro-animations, and complete Google AdSense & SEO compliance.

---

## 🚀 Live Tools & Capabilities

1. **Simple Pocket & Scientific Live Calculator (`/calculator`)**
   - Standard 4-column arithmetic layout with dual live evaluation display.
   - Scientific operations: Trigonometry ($\sin, \cos, \tan$), logarithms ($\ln, \log_{10}$), square roots, powers ($x^y, x^2$), factorials ($x!$).
   - Full memory registers: `MC`, `MR`, `M+`, `M-` with active `[M]` badge.
   - Physical keyboard support (`0-9`, `+ - * /`, `Enter`, `Backspace`, `Esc`).
   - Synthetic Web Audio key clicks with Mute / Sound toggle.
   - Persistent Audit History Tape with 1-click expression recall.

2. **Real-Time Currency Converter (`/currency-converter`)**
   - Supports 40+ global fiat currencies (USD, PKR, EUR, GBP, AED, SAR, INR, CAD, AUD, JPY, CNY, etc.).
   - Sourced directly from European Central Bank (ECB) benchmark mid-market data feeds.
   - 60-second automated rate synchronization with live status indicators.

3. **Universal Unit Converter (`/unit-converter`)**
   - Multi-category conversions: Length, Weight/Mass, Temperature.
   - Conforms strictly to National Institute of Standards and Technology (NIST SP 811) standards.

4. **Loan & EMI Calculator (`/loan-calculator`)**
   - Standard reducing-balance compound interest mathematics.
   - Generates monthly installments (EMI), total interest burden, repayment totals, and yearly amortization breakdown tables.

---

## 🛡️ Legal, Privacy & Google AdSense Ready

- **Privacy Policy (`/privacy-policy`)**: Includes Google AdSense, DoubleClick DART cookie clauses, GDPR user rights, CCPA compliance, and explicit opt-out links (`aboutads.info/choices`, `adssettings.google.com`).
- **Terms of Service (`/terms`)**: Detailed usage policies, calculation accuracy disclaimers, and limitation of liability.
- **About Us (`/about`) & Contact Us (`/contact`)**: Editorial standards and direct customer service channels.
- **Schema.org Structured Data**: Valid JSON-LD graphs (`WebSite`, `Organization`, `WebApplication`, `BreadcrumbList`, `FAQPage`) across all pages.
- **Generative Engine Optimization (GEO)**: `/llms.txt` and `/llms-full.txt` configured for AI search indexing (ChatGPT, Claude, Perplexity, Google Gemini).

---

## 💻 Local Development

### Run Development Server
```bash
node server.js
```
Visit: `http://localhost:3000/`

### Run Automated Test Suites
```bash
# End-to-End full suite (121 tests)
node scratch/test_suite.js

# Schema & SEO audit (81 checks)
node scratch/test_schema_and_seo.js

# LLM & GEO compliance check (23 checks)
node scratch/test_llms_and_geo.js
```

---

## 📁 Project Architecture

```
├── assets/
│   ├── calculator.js         # Pocket & Scientific math engine & audio synthesizer
│   ├── currency.js           # Real-time Forex rates fetcher & exchange calculator
│   ├── unit.js               # NIST unit conversion matrix
│   ├── loan.js               # Reducing-balance loan & amortization table generator
│   ├── main.js               # Theme toggle, cursor glow, ticker, animations
│   └── favicon.svg           # Brand SVG icon
├── style.css                 # Master responsive design system, dark/light themes
├── server.js                 # Production Node.js server with clean URLs & MIME types
├── sitemap.xml               # Clean canonical sitemap protocol
├── robots.txt                # Search engines, Google AdSense & AI bot directives
├── llms.txt                  # Standard LLM summary for AI search engines
├── llms-full.txt             # Extended mathematical documentation for AI models
├── manifest.json             # PWA Web App manifest
├── .htaccess                 # Apache / cPanel 301 rewrites & security headers
├── _redirects                # Netlify / Cloudflare clean URL mapping
├── index.html                # Homepage & Embedded Quick Calculator
├── calculator.html           # Dedicated Live Calculator Tool
├── currency-converter.html   # Dedicated Currency Converter Tool
├── unit-converter.html       # Dedicated Unit Converter Tool
├── loan-calculator.html      # Dedicated Loan & EMI Calculator Tool
├── about.html                # About Us
├── contact.html              # Contact Us
├── privacy-policy.html       # Privacy Policy
├── terms.html                # Terms of Service
└── 404.html                  # Custom Animated 404 Error Page
```

---

## 📄 License
© 2026 Commeronix. All rights reserved.
