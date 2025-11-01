#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Wasel project...\n');

const validations = [
  {
    name: 'Environment Variables',
    validate: () => {
      if (!fs.existsSync('.env')) return { pass: false, message: 'Missing .env file' };
      const env = fs.readFileSync('.env', 'utf8');
      const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
      const missing = required.filter(key => !env.includes(key));
      return missing.length === 0 
        ? { pass: true, message: 'All required variables present' }
        : { pass: false, message: `Missing: ${missing.join(', ')}` };
    }
  },
  {
    name: 'TypeScript Files',
    validate: () => {
      const tsFiles = ['src/main.tsx', 'src/App.tsx', 'src/types/database.ts'];
      const missing = tsFiles.filter(file => !fs.existsSync(file));
      return missing.length === 0
        ? { pass: true, message: 'Core TypeScript files present' }
        : { pass: false, message: `Missing: ${missing.join(', ')}` };
    }
  },
  {
    name: 'UI Components',
    validate: () => {
      const uiDir = 'src/components/ui';
      if (!fs.existsSync(uiDir)) return { pass: false, message: 'UI components directory missing' };
      const components = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));
      return components.length > 10
        ? { pass: true, message: `${components.length} UI components found` }
        : { pass: false, message: `Only ${components.length} UI components found` };
    }
  },
  {
    name: 'Build Configuration',
    validate: () => {
      const configs = ['vite.config.js', 'tsconfig.json', 'package.json'];
      const missing = configs.filter(file => !fs.existsSync(file));
      return missing.length === 0
        ? { pass: true, message: 'Build configuration complete' }
        : { pass: false, message: `Missing: ${missing.join(', ')}` };
    }
  }
];

let allPassed = true;

validations.forEach(({ name, validate }) => {
  try {
    const result = validate();
    const status = result.pass ? '✅' : '❌';
    console.log(`${status} ${name}: ${result.message}`);
    if (!result.pass) allPassed = false;
  } catch (error) {
    console.log(`❌ ${name}: Validation error - ${error.message}`);
    allPassed = false;
  }
});

console.log(`\n${allPassed ? '🎉' : '⚠️'} Validation ${allPassed ? 'PASSED' : 'FAILED'}`);

if (!allPassed) {
  console.log('\n💡 Run "npm run setup" to fix issues');
  process.exit(1);
}