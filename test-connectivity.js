/**
 * Backend-Frontend Connectivity Test
 * Tests all critical connections and provides a comprehensive rating
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`)
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function addTest(name, status, message, score = 0) {
  results.tests.push({ name, status, message, score });
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else if (status === 'warn') results.warnings++;
}

// 1. Environment Configuration Test
function testEnvironmentConfig() {
  log.section('1. Environment Configuration');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log.error('.env file not found');
    addTest('Environment File', 'fail', '.env file missing', 0);
    return;
  }
  
  log.success('.env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_MAPBOX_TOKEN'
  ];
  
  let configScore = 0;
  requiredVars.forEach(varName => {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    
    if (match && match[1] && !match[1].includes('your-')) {
      log.success(`${varName} configured`);
      configScore += 10;
    } else {
      log.warning(`${varName} not configured (using placeholder)`);
      configScore += 3;
    }
  });
  
  const status = configScore >= 25 ? 'pass' : configScore >= 15 ? 'warn' : 'fail';
  addTest('Environment Variables', status, `${configScore}/30 points`, configScore);
}

// 2. Supabase Client Configuration
function testSupabaseClient() {
  log.section('2. Supabase Client Configuration');
  
  const clientPath = path.join(__dirname, 'src', 'utils', 'supabase', 'client.ts');
  if (!fs.existsSync(clientPath)) {
    log.error('Supabase client file not found');
    addTest('Supabase Client', 'fail', 'Client file missing', 0);
    return;
  }
  
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  
  // Check for key features
  const features = [
    { name: 'Client Creation', pattern: /createClient/, score: 5 },
    { name: 'Auth Configuration', pattern: /auth:.*{/, score: 5 },
    { name: 'Error Handling', pattern: /handleSupabaseError/, score: 5 },
    { name: 'Session Management', pattern: /getSession/, score: 5 },
    { name: 'User Profile', pattern: /getUserProfile/, score: 5 }
  ];
  
  let clientScore = 0;
  features.forEach(({ name, pattern, score }) => {
    if (pattern.test(clientContent)) {
      log.success(name);
      clientScore += score;
    } else {
      log.warning(`${name} not found`);
    }
  });
  
  const status = clientScore >= 20 ? 'pass' : clientScore >= 10 ? 'warn' : 'fail';
  addTest('Supabase Client Setup', status, `${clientScore}/25 points`, clientScore);
}

// 3. API Services Test
function testAPIServices() {
  log.section('3. API Services');
  
  const apiPath = path.join(__dirname, 'src', 'services', 'api.ts');
  if (!fs.existsSync(apiPath)) {
    log.error('API service file not found');
    addTest('API Services', 'fail', 'API file missing', 0);
    return;
  }
  
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  const services = [
    { name: 'Auth API', pattern: /authAPI/, score: 3 },
    { name: 'Trips API', pattern: /tripsAPI/, score: 3 },
    { name: 'Bookings API', pattern: /bookingsAPI/, score: 3 },
    { name: 'Messages API', pattern: /messagesAPI/, score: 3 },
    { name: 'Wallet API', pattern: /walletAPI/, score: 3 },
    { name: 'Error Handling', pattern: /handleApiError/, score: 3 },
    { name: 'Input Validation', pattern: /validateInput/, score: 2 }
  ];
  
  let apiScore = 0;
  services.forEach(({ name, pattern, score }) => {
    if (pattern.test(apiContent)) {
      log.success(name);
      apiScore += score;
    } else {
      log.warning(`${name} not implemented`);
    }
  });
  
  const status = apiScore >= 15 ? 'pass' : apiScore >= 10 ? 'warn' : 'fail';
  addTest('API Services', status, `${apiScore}/20 points`, apiScore);
}

// 4. Auth Context Test
function testAuthContext() {
  log.section('4. Authentication Context');
  
  const authPath = path.join(__dirname, 'src', 'contexts', 'AuthContext.tsx');
  if (!fs.existsSync(authPath)) {
    log.error('Auth context file not found');
    addTest('Auth Context', 'fail', 'Context file missing', 0);
    return;
  }
  
  const authContent = fs.readFileSync(authPath, 'utf8');
  
  const features = [
    { name: 'User State', pattern: /useState.*User/, score: 2 },
    { name: 'Session State', pattern: /useState.*Session/, score: 2 },
    { name: 'Profile State', pattern: /useState.*Profile/, score: 2 },
    { name: 'Sign Up', pattern: /signUp.*async/, score: 2 },
    { name: 'Sign In', pattern: /signIn.*async/, score: 2 },
    { name: 'Sign Out', pattern: /signOut.*async/, score: 2 },
    { name: 'Auth State Listener', pattern: /onAuthStateChange/, score: 3 }
  ];
  
  let authScore = 0;
  features.forEach(({ name, pattern, score }) => {
    if (pattern.test(authContent)) {
      log.success(name);
      authScore += score;
    } else {
      log.warning(`${name} not found`);
    }
  });
  
  const status = authScore >= 12 ? 'pass' : authScore >= 8 ? 'warn' : 'fail';
  addTest('Auth Context', status, `${authScore}/15 points`, authScore);
}

// 5. Health Check System
function testHealthCheck() {
  log.section('5. Health Check System');
  
  const healthPath = path.join(__dirname, 'src', 'utils', 'healthCheck.ts');
  if (!fs.existsSync(healthPath)) {
    log.warning('Health check file not found');
    addTest('Health Check', 'warn', 'Health monitoring not implemented', 5);
    return;
  }
  
  const healthContent = fs.readFileSync(healthPath, 'utf8');
  
  const checks = [
    { name: 'Database Check', pattern: /checkDatabase/, score: 2 },
    { name: 'Auth Check', pattern: /checkAuth/, score: 2 },
    { name: 'Performance Check', pattern: /checkPerformance/, score: 2 },
    { name: 'Memory Check', pattern: /checkMemory/, score: 1 },
    { name: 'Network Check', pattern: /checkNetwork/, score: 1 },
    { name: 'Overall Health Score', pattern: /calculateOverallHealth/, score: 2 }
  ];
  
  let healthScore = 0;
  checks.forEach(({ name, pattern, score }) => {
    if (pattern.test(healthContent)) {
      log.success(name);
      healthScore += score;
    } else {
      log.warning(`${name} not found`);
    }
  });
  
  const status = healthScore >= 8 ? 'pass' : healthScore >= 5 ? 'warn' : 'fail';
  addTest('Health Monitoring', status, `${healthScore}/10 points`, healthScore);
}

// 6. Database Schema
function testDatabaseSchema() {
  log.section('6. Database Schema');
  
  const schemaPath = path.join(__dirname, 'src', 'supabase', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    log.warning('Schema file not found');
    addTest('Database Schema', 'warn', 'Schema file missing', 5);
    return;
  }
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const tables = [
    { name: 'profiles', pattern: /CREATE TABLE.*profiles/, score: 2 },
    { name: 'trips', pattern: /CREATE TABLE.*trips/, score: 2 },
    { name: 'bookings', pattern: /CREATE TABLE.*bookings/, score: 2 },
    { name: 'messages', pattern: /CREATE TABLE.*messages/, score: 1 },
    { name: 'reviews', pattern: /CREATE TABLE.*reviews/, score: 1 },
    { name: 'RLS Policies', pattern: /CREATE POLICY/, score: 2 }
  ];
  
  let schemaScore = 0;
  tables.forEach(({ name, pattern, score }) => {
    if (pattern.test(schemaContent)) {
      log.success(name);
      schemaScore += score;
    } else {
      log.warning(`${name} not found`);
    }
  });
  
  const status = schemaScore >= 8 ? 'pass' : schemaScore >= 5 ? 'warn' : 'fail';
  addTest('Database Schema', status, `${schemaScore}/10 points`, schemaScore);
}

// 7. Security Features
function testSecurity() {
  log.section('7. Security Features');
  
  const securityPath = path.join(__dirname, 'src', 'utils', 'security.ts');
  if (!fs.existsSync(securityPath)) {
    log.warning('Security utilities not found');
    addTest('Security', 'warn', 'Security utilities missing', 3);
    return;
  }
  
  const securityContent = fs.readFileSync(securityPath, 'utf8');
  
  const features = [
    { name: 'Input Sanitization', pattern: /sanitize/, score: 2 },
    { name: 'XSS Prevention', pattern: /xss|escapeHtml/, score: 2 },
    { name: 'SQL Injection Prevention', pattern: /sql|injection/, score: 1 },
    { name: 'Secure Validation', pattern: /secureValidate/, score: 2 }
  ];
  
  let securityScore = 0;
  features.forEach(({ name, pattern, score }) => {
    if (pattern.test(securityContent)) {
      log.success(name);
      securityScore += score;
    } else {
      log.warning(`${name} not found`);
    }
  });
  
  // Check for hardcoded credentials
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  if (!envContent.includes('your-project') && !envContent.includes('your-anon-key')) {
    log.success('No placeholder credentials in .env');
    securityScore += 1;
  }
  
  const status = securityScore >= 6 ? 'pass' : securityScore >= 4 ? 'warn' : 'fail';
  addTest('Security Features', status, `${securityScore}/8 points`, securityScore);
}

// 8. Component Integration
function testComponentIntegration() {
  log.section('8. Component Integration');
  
  const appPath = path.join(__dirname, 'src', 'App.tsx');
  if (!fs.existsSync(appPath)) {
    log.error('App.tsx not found');
    addTest('Component Integration', 'fail', 'Main app file missing', 0);
    return;
  }
  
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  const components = [
    { name: 'Auth Provider', pattern: /AuthProvider/, score: 2 },
    { name: 'Error Boundary', pattern: /ErrorBoundary/, score: 1 },
    { name: 'Lazy Loading', pattern: /lazy\(/, score: 1 },
    { name: 'Dashboard', pattern: /Dashboard/, score: 1 },
    { name: 'Auth Page', pattern: /AuthPage/, score: 1 },
    { name: 'Navigation', pattern: /handleNavigate/, score: 1 }
  ];
  
  let componentScore = 0;
  components.forEach(({ name, pattern, score }) => {
    if (pattern.test(appContent)) {
      log.success(name);
      componentScore += score;
    } else {
      log.warning(`${name} not found`);
    }
  });
  
  const status = componentScore >= 6 ? 'pass' : componentScore >= 4 ? 'warn' : 'fail';
  addTest('Component Integration', status, `${componentScore}/7 points`, componentScore);
}

// Calculate overall rating
function calculateRating() {
  log.section('Test Summary');
  
  const totalScore = results.tests.reduce((sum, test) => sum + test.score, 0);
  const maxScore = 145; // Sum of all possible points
  const percentage = (totalScore / maxScore) * 100;
  
  console.log(`${colors.bold}Tests Passed:${colors.reset} ${colors.green}${results.passed}${colors.reset}`);
  console.log(`${colors.bold}Tests Failed:${colors.reset} ${colors.red}${results.failed}${colors.reset}`);
  console.log(`${colors.bold}Warnings:${colors.reset} ${colors.yellow}${results.warnings}${colors.reset}`);
  console.log(`${colors.bold}Total Score:${colors.reset} ${totalScore}/${maxScore} (${percentage.toFixed(1)}%)`);
  
  let rating, grade, color;
  if (percentage >= 90) {
    rating = 'Excellent';
    grade = 'A+';
    color = colors.green;
  } else if (percentage >= 80) {
    rating = 'Very Good';
    grade = 'A';
    color = colors.green;
  } else if (percentage >= 70) {
    rating = 'Good';
    grade = 'B';
    color = colors.cyan;
  } else if (percentage >= 60) {
    rating = 'Fair';
    grade = 'C';
    color = colors.yellow;
  } else if (percentage >= 50) {
    rating = 'Poor';
    grade = 'D';
    color = colors.yellow;
  } else {
    rating = 'Needs Improvement';
    grade = 'F';
    color = colors.red;
  }
  
  log.section('Overall Rating');
  console.log(`${colors.bold}Grade:${colors.reset} ${color}${grade}${colors.reset}`);
  console.log(`${colors.bold}Rating:${colors.reset} ${color}${rating}${colors.reset}`);
  
  // Detailed breakdown
  log.section('Detailed Breakdown');
  results.tests.forEach(test => {
    const statusColor = test.status === 'pass' ? colors.green : test.status === 'warn' ? colors.yellow : colors.red;
    const statusSymbol = test.status === 'pass' ? '✓' : test.status === 'warn' ? '⚠' : '✗';
    console.log(`${statusColor}${statusSymbol}${colors.reset} ${test.name}: ${test.message}`);
  });
  
  // Recommendations
  log.section('Recommendations');
  
  if (results.failed > 0) {
    log.warning('Fix failed tests to improve connectivity');
  }
  
  const envTest = results.tests.find(t => t.name === 'Environment Variables');
  if (envTest && envTest.status !== 'pass') {
    log.info('Configure Supabase credentials in .env file');
  }
  
  if (percentage < 80) {
    log.info('Review backend setup guide: src/BACKEND_SETUP_GUIDE.md');
  }
  
  if (percentage >= 80) {
    log.success('Backend-frontend connectivity is well configured!');
  }
  
  return { totalScore, maxScore, percentage, grade, rating };
}

// Run all tests
function runTests() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Wasel Backend-Frontend Connectivity Test Suite      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  testEnvironmentConfig();
  testSupabaseClient();
  testAPIServices();
  testAuthContext();
  testHealthCheck();
  testDatabaseSchema();
  testSecurity();
  testComponentIntegration();
  
  const rating = calculateRating();
  
  // Save results to file
  const reportPath = path.join(__dirname, 'connectivity-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    rating,
    results
  }, null, 2));
  
  log.info(`\nDetailed report saved to: connectivity-test-report.json`);
}

// Execute tests
runTests();
