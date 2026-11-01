/**
 * COMMERONIX - AUTOMATED DAILY BLOG PUBLISHER (Node.js engine)
 * 3 Unique, high-quality, AdSense-ready articles per execution.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const blogDir = path.join(rootDir, 'blog');
const stateFile = path.join(__dirname, 'published-history.json');

console.log('--- Commeronix Node.js Automated Daily Publisher ---');
console.log('To run native publishing without Node, execute: powershell -ExecutionPolicy Bypass -File .\\automation\\daily-publisher.ps1');
