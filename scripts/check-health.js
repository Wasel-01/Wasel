#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏥 Wasel Health Check\n');

const checks = [
  {
    name: 'Node.js Version',
    check: () => {
      const version = parseInt(process.version.slice(1));
      return version >= 18 ? { pass: true, message: `v${process.version}` } : { pass: false, message: `v${process.version} (requires 18+)` };
    }
  },
  {
    name: 'Package.json',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return { pass: true, message: `v${pkg.version}` };
      } catch (error) {
        return { pass: false, message: `Missing or invalid: ${error.message}` };
      }
    }
  },
  {
    name: 'Environment File',
    check: () => {
      const exists = fs.existsSync('.env');
      return { pass: exists, message: exists ? 'Found' : 'Missing (.env)' };
    }
  },
  {
    name: 'Node Modules',
    check: () => {
      const exists = fs.existsSync('node_modules');
      return { pass: exists, message: exists ? 'Installed' : 'Run npm install' };
    }
  },
  {
    name: 'TypeScript Config',
    check: () => {
      const exists = fs.existsSync('tsconfig.json');
      return { pass: exists, message: exists ? 'Found' : 'Missing' };
    }
  },
  {
    name: 'Vite Config',
    check: () => {
      const exists = fs.existsSync('vite.config.js') || fs.existsSync('vite.config.ts');
      return { pass: exists, message: exists ? 'Found' : 'Missing' };
    }
  }
];

let allPassed = true;

checks.forEach(({ name, check }) => {
  const result = check();
  const status = result.pass ? '✅' : '❌';
  console.log(`${status} ${name}: ${result.message}`);
  if (!result.pass) allPassed = false;
});

console.log(`\n${allPassed ? '🎉' : '⚠️'} Health Check ${allPassed ? 'PASSED' : 'FAILED'}`);

if (!allPassed) {
  console.log('\n💡 Run "npm run setup" to fix common issues');
  process.exit(1);
}