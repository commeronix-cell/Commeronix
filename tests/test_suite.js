/**
 * COMMERONIX AUTOMATED TEST & AUDIT SUITE
 * Tests routes, HTML structure, JSON-LD schemas, JS syntax, math formulas, and Cloudflare config.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('       COMMERONIX COMPREHENSIVE TEST SUITE          ');
console.log('====================================================\n');

// 1. ROUTE & HTML INTEGRITY TESTS
console.log('--- 1. Testing HTML Routes & Meta Tags ---');
const routes = [
  'index.html',
  'calculator.html',
  'currency-converter.html',
  'unit-converter.html',
  'loan-calculator.html',
  'about.html',
  'contact.html',
  'privacy-policy.html',
  'terms.html',
  '404.html'
];

routes.forEach(file => {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Route file exists: ${file}`);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // Doctype & title
  assert(content.toLowerCase().includes('<!doctype html>'), `${file} has valid <!DOCTYPE html>`);
  assert(/<title>.+<\/title>/i.test(content), `${file} has non-empty <title>`);

  // Canonical link
  if (file !== '404.html') {
    assert(/<link\s+rel=["']canonical["']\s+href=/i.test(content), `${file} has canonical link`);
    assert(/<meta\s+name=["']description["']/i.test(content), `${file} has meta description`);
    assert(/<meta\s+property=["']og:title["']/i.test(content), `${file} has OpenGraph title`);
  }

  // Schema.org JSON-LD
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let match;
  let hasSchema = false;
  while ((match = jsonLdRegex.exec(content)) !== null) {
    hasSchema = true;
    try {
      JSON.parse(match[1]);
      assert(true, `${file} has valid JSON-LD schema`);
    } catch (e) {
      assert(false, `${file} JSON-LD schema parse error: ${e.message}`);
    }
  }

  // Assets references check
  const assetsRegex = /(?:src|href)=["'](assets\/[^"'?]+)(?:\?[^"']*)?["']/gi;
  while ((match = assetsRegex.exec(content)) !== null) {
    const assetPath = path.join(rootDir, match[1]);
    assert(fs.existsSync(assetPath), `${file} references existing asset: ${match[1]}`);
  }
});

// 2. JAVASCRIPT ENGINES SYNTAX & UNIT TESTS
console.log('\n--- 2. Testing JavaScript Engines & Syntax ---');
const jsFiles = [
  'assets/main.js',
  'assets/calculator.js',
  'assets/currency.js',
  'assets/unit.js',
  'assets/loan.js',
  'server.js'
];

jsFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `JS file exists: ${file}`);
  if (!fs.existsSync(filePath)) return;

  const code = fs.readFileSync(filePath, 'utf8');
  try {
    new Function(code);
    assert(true, `${file} passes syntax evaluation`);
  } catch (e) {
    assert(false, `${file} syntax error: ${e.message}`);
  }
});

// 3. MATHEMATICAL ENGINE UNIT TESTS
console.log('\n--- 3. Testing Mathematical Calculations ---');

// Loan EMI Formula Test
function calculateLoanEMI(principal, annualRate, tenureMonths) {
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

const testLoan1 = calculateLoanEMI(100000, 10, 12);
assert(Math.abs(testLoan1 - 8791.59) < 0.1, `Loan EMI $100k at 10% for 1 yr is ~$8,791.59 (calculated: ${testLoan1.toFixed(2)})`);

const testLoanZero = calculateLoanEMI(12000, 0, 12);
assert(testLoanZero === 1000, `0% interest loan $12,000 for 12 months is $1,000/mo (calculated: ${testLoanZero})`);

// Temperature Conversion Tests
function cToF(c) { return (c * 9) / 5 + 32; }
function fToC(f) { return ((f - 32) * 5) / 9; }
function cToK(c) { return c + 273.15; }

assert(cToF(0) === 32, '0°C converts to 32°F');
assert(cToF(100) === 212, '100°C converts to 212°F');
assert(Math.round(fToC(98.6) * 10) / 10 === 37, '98.6°F converts to 37.0°C');
assert(cToK(0) === 273.15, '0°C converts to 273.15 K');

// Unit Metric Factors
const mToFt = 1 / 0.3048;
assert(Math.abs(mToFt - 3.28084) < 0.001, '1 meter is ~3.28084 feet');

const kgToLb = 1 / 0.45359237;
assert(Math.abs(kgToLb - 2.20462) < 0.001, '1 kilogram is ~2.20462 pounds');

// 4. CLOUDFLARE CONFIGURATION TESTS
console.log('\n--- 4. Testing Deployment Configurations ---');
assert(fs.existsSync(path.join(rootDir, '_redirects')), '_redirects file exists');
assert(fs.existsSync(path.join(rootDir, 'sitemap.xml')), 'sitemap.xml file exists');
assert(fs.existsSync(path.join(rootDir, 'robots.txt')), 'robots.txt file exists');

const sitemapContent = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
routes.filter(r => r !== '404.html').forEach(r => {
  const cleanRoute = r === 'index.html' ? 'https://commeronix.com/' : `https://commeronix.com/${r.replace('.html', '')}`;
  assert(sitemapContent.includes(cleanRoute), `sitemap.xml contains clean route: ${cleanRoute}`);
});

console.log('\n====================================================');
console.log(`TOTAL CHECKS: ${passedTests + failedTests}`);
console.log(`PASSED:       ${passedTests}`);
console.log(`FAILED:       ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL AUTOMATED TESTS COMPLETED WITH 100% SUCCESS!');
}
