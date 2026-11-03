# Commeronix Architecture & Agent Guidelines

- **Architecture**: Zero-framework static web application built with HTML5, Vanilla CSS, and modern client-side JavaScript (ES6+).
- **Hosting & Deployment**: Cloudflare Pages connected to GitHub repository `commeronix-coll/Commeronix` (`main` branch).
- **URL Routing**: Clean URLs without `.html` extensions (e.g. `/calculator`, `/currency-converter`, `/unit-converter`, `/loan-calculator`, `/about`, `/contact`, `/privacy-policy`, `/terms`).
- **Dependencies**: No external runtime frameworks (no Next.js, no React, no Tailwind). Zero-bloat client-side computing.
- **Mathematical Integrity**: Strict adherence to NIST conversion factors, standard compound interest reducing-balance formulas, and multi-tier live forex rates.
- **Git & Deployment Protocol (Strict)**:
  - NEVER push changes to the GitHub repository without explicit user permission (e.g. user saying "push kar do").
  - Always test and verify changes in the local environment first.
  - All preview links shared with the user must strictly be `localhost` links (`http://localhost:8080/...`) until the user approves pushing to production.
