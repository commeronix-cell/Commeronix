# Commeronix — Privacy-First Web Utilities & Engineering Suite

Commeronix is a high-performance, client-side web utility suite and developer platform featuring 19+ privacy-first tools, scientific calculators, media converters, an engineering blog, and an automated publishing workflow. Built with zero heavy framework bloat, instant client-side computation (Web APIs / Canvas), a modern dual-theme system, and complete Google AdSense & Core Web Vitals optimization.

---

## ⚡ Key Highlights

- **100% Client-Side Privacy**: All file conversions, image processing, diffing, and calculations run strictly in the user's browser sandbox. No user files, images, or arithmetic inputs are ever uploaded to any server.
- **Dual-Theme Design System**:
  - **Light Mode (Default)**: Crisp off-white (`#F8FAFC`), deep charcoal typography (`#0F172A`), clean borders (`#E2E8F0`).
  - **Dark Mode**: Midnight Black (`#0B0C10`), Electric Cobalt Blue (`#0047AB` / `#2563EB`), and Acid Lime (`#C6FF00` / `#A3E635`) highlights.
  - Persistent user preference saved in `localStorage`.
- **Engineering Blog & Technical SEO**: Pre-rendered semantic articles covering Core Web Vitals, URL permalink design, and color space theory with 16:9 responsive vector covers.
- **Instant Search & Filtering**: Fast keyboard-navigable (`Ctrl + K` or `/`) filter across all 19 tools.

---

## 🛠️ Complete Suite of 19 Utilities

### 1. Financial & Scientific Calculators
- **Scientific & Pocket Calculator (`/calculator`)**: Trigonometric, logarithmic, powers, factorials, memory registers (`MC`, `MR`, `M+`, `M-`), and persistent calculation tape.
- **Real-Time Currency Converter (`/currency-converter`)**: Live mid-market foreign exchange rates across 40+ fiat currencies.
- **Universal Unit Converter (`/unit-converter`)**: NIST-standard metric and imperial conversion across Length, Weight, Temperature, Area, Volume, and Speed.
- **Loan EMI & Mortgage Calculator (`/loan-calculator`)**: Reducing-balance compound interest engine with monthly amortizations and graphical breakdowns.

### 2. Image & Media Processors
- **Image Compressor (`/image-compressor`)**: Client-side canvas compression targeting specific KB sizes with side-by-side quality comparison.
- **Image Resizer (`/image-resizer`)**: Multi-resolution aspect-ratio locked resizing (16:9, 4:3, 1:1, custom).
- **Image Format Converter (`/image-format-converter`)**: Instant conversion across JPG, PNG, and WebP formats.
- **Image to Base64 Encoder (`/image-to-base64`)**: Direct data URI, HTML `<img>`, and CSS background generator.
- **Background Remover (`/background-remover`)**: Canvas-based transparent cutout with tolerance adjustment.
- **Favicon Generator (`/favicon-generator`)**: Generates 16x16, 32x32, 180x180 Apple Touch icons and copyable HTML meta tags.
- **Color Picker & Palette (`/color-picker`)**: Interactive color wheel, HEX / RGB / HSL conversion, harmonic palette generator, and WCAG contrast testing.

### 3. Text & Developer Tools
- **Word & Character Counter (`/word-counter`)**: Real-time word, character, sentence, paragraph, and reading time counter.
- **Case Converter (`/case-converter`)**: Convert text across UPPERCASE, lowercase, Title Case, Sentence case, camelCase, kebab-case, snake_case.
- **Text Diff & Compare (`/text-compare`)**: Side-by-side visual diff highlighter showing additions and deletions.
- **Text to Slug Generator (`/text-to-slug`)**: SEO-friendly permalink slugs with stop-word removal.
- **Duplicate Line Remover (`/remove-duplicate-lines`)**: Instant line deduplication, whitespace trimming, and alphabetization.
- **Lorem Ipsum Generator (`/lorem-ipsum-generator`)**: Dummy placeholder text generation by paragraphs, sentences, or words.
- **Random Text & String Generator (`/random-text-generator`)**: Cryptographically secure alphanumeric strings, UUIDs, and passwords.
- **Reading Time Calculator (`/reading-time-calculator`)**: Estimates reading and speaking durations based on custom WPM rates.

---

## 🚀 Running Locally

### Option 1: PowerShell Local Server (Port 8080)
Double-click `start_local_server.bat` or run:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Visit: **`http://localhost:8080/`**

### Option 2: Node.js Server (Port 3000)
```bash
node server.js
```
Visit: **`http://localhost:3000/`**

---

## 📁 Repository Structure

```
├── assets/                  # Core JS logic, theme switcher, favicons, logos, blog covers
├── automation/              # Daily blog post publisher and topic catalog
├── blog/                    # Engineering blog index and technical articles
├── tests/                   # End-to-end and audit test suites
├── index.html               # Main homepage with universal search & categorized tool grid
├── tools.html               # Dedicated searchable hub of all 19 utilities
├── calculator.html          # Scientific Calculator
├── currency-converter.html  # Live Forex Currency Converter
├── unit-converter.html      # Universal Unit Converter
├── loan-calculator.html     # Loan EMI & Amortization Calculator
├── image-compressor.html    # Client-Side Image Compressor
├── image-resizer.html       # Image Resizer
├── image-format-converter.html # Image Format Converter (JPG/PNG/WebP)
├── image-to-base64.html     # Image to Base64 Data URI
├── background-remover.html  # Background Remover
├── favicon-generator.html   # Multi-Resolution Favicon Generator
├── color-picker.html        # Color Picker & WCAG Contrast Checker
├── word-counter.html        # Word & Reading Time Counter
├── case-converter.html      # Case Converter
├── text-compare.html        # Text Diff Checker
├── text-to-slug.html        # Text to Slug Generator
├── remove-duplicate-lines.html # Duplicate Line Remover
├── lorem-ipsum-generator.html  # Lorem Ipsum Generator
├── random-text-generator.html  # Secure Random String Generator
├── reading-time-calculator.html # Reading Time Calculator
├── about.html               # About Us
├── contact.html             # Contact Us (direct to commeronix@gmail.com)
├── privacy-policy.html      # AdSense & GDPR compliant Privacy Policy
├── terms.html               # Terms of Service
├── 404.html                 # Custom 404 Error Page
├── style.css                # Master unified CSS design system
├── server.js                # Production Node.js server
├── serve.ps1                # Lightweight PowerShell HTTP server
├── start_local_server.bat   # 1-Click local launch script
├── sitemap.xml              # XML Sitemap
├── robots.txt               # Search engine crawl directives
├── manifest.json            # PWA web application manifest
├── _headers                 # Cloudflare Pages edge security & cache rules
├── _redirects               # Cloudflare / Netlify clean URL rewrites
└── .htaccess                # Apache / cPanel rewrites & MIME rules
```

---

## 📄 License
© 2026 Commeronix. All rights reserved.
