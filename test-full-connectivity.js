const https = require('https');
const fs = require('fs');

const supabaseUrl = 'https://djccmatubyyudeosrngm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqY2NtYXR1Ynl5dWRlb3NybmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjY5MjUsImV4cCI6MjA3NzQyNjkyNX0.WlYJmK-OUKlNyp3ktcb2ShILFN1vgCumAL4tOATziTQ';

console.log('🔍 Wasel Backend-Frontend Connectivity Test\n');
console.log('='.repeat(50));

const results = {
  timestamp: new Date().toISOString(),
  tests: []
};

function test(name, status, details) {
  const result = { name, status, details };
  results.tests.push(result);
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}`);
  if (details) console.log(`   ${details}`);
}

// Test 1: Environment Configuration
console.log('\n📋 Test 1: Environment Configuration');
const envPath = '.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasUrl = envContent.includes('VITE_SUPABASE_URL=https://djccmatubyyudeosrngm.supabase.co');
  const hasKey = envContent.includes('VITE_SUPABASE_ANON_KEY=');
  
  if (hasUrl && hasKey) {
    test('Environment File', 'PASS', 'Supabase credentials configured');
  } else {
    test('Environment File', 'FAIL', 'Missing Supabase credentials in .env');
  }
} else {
  test('Environment File', 'FAIL', '.env file not found');
}

// Test 2: Backend Health
console.log('\n🏥 Test 2: Backend Health Check');
const healthUrl = `${supabaseUrl}/rest/v1/`;
const options = {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
};

https.get(healthUrl, options, (res) => {
  if (res.statusCode === 200) {
    test('Backend API', 'PASS', `Status ${res.statusCode} - Backend is online`);
  } else {
    test('Backend API', 'WARN', `Status ${res.statusCode} - Backend responding but check status`);
  }
  
  // Test 3: Database Schema
  console.log('\n🗄️ Test 3: Database Schema Check');
  const tables = ['profiles', 'trips', 'bookings', 'messages'];
  let checkedTables = 0;
  
  tables.forEach(table => {
    const tableUrl = `${supabaseUrl}/rest/v1/${table}?limit=1`;
    https.get(tableUrl, options, (res) => {
      if (res.statusCode === 200) {
        test(`Table: ${table}`, 'PASS', 'Table exists and accessible');
      } else {
        test(`Table: ${table}`, 'FAIL', `Status ${res.statusCode} - Table may not exist`);
      }
      
      checkedTables++;
      if (checkedTables === tables.length) {
        // Test 4: Auth Service
        console.log('\n🔐 Test 4: Auth Service Check');
        const authUrl = `${supabaseUrl}/auth/v1/health`;
        https.get(authUrl, options, (res) => {
          if (res.statusCode === 200) {
            test('Auth Service', 'PASS', 'Authentication service is operational');
          } else {
            test('Auth Service', 'WARN', `Status ${res.statusCode}`);
          }
          
          // Test 5: Frontend Files
          console.log('\n📁 Test 5: Frontend Files Check');
          const frontendFiles = [
            'src/App.tsx',
            'src/main.tsx',
            'src/services/api.ts',
            'src/utils/supabase/client.ts',
            'package.json'
          ];
          
          frontendFiles.forEach(file => {
            if (fs.existsSync(file)) {
              test(`File: ${file}`, 'PASS', 'File exists');
            } else {
              test(`File: ${file}`, 'FAIL', 'File missing');
            }
          });
          
          // Final Summary
          console.log('\n' + '='.repeat(50));
          console.log('📊 Test Summary');
          console.log('='.repeat(50));
          
          const passed = results.tests.filter(t => t.status === 'PASS').length;
          const failed = results.tests.filter(t => t.status === 'FAIL').length;
          const warned = results.tests.filter(t => t.status === 'WARN').length;
          
          console.log(`Total Tests: ${results.tests.length}`);
          console.log(`✅ Passed: ${passed}`);
          console.log(`❌ Failed: ${failed}`);
          console.log(`⚠️  Warnings: ${warned}`);
          
          const score = Math.round((passed / results.tests.length) * 100);
          console.log(`\n🎯 Connectivity Score: ${score}%`);
          
          if (score >= 80) {
            console.log('✅ Backend-Frontend connectivity is GOOD');
          } else if (score >= 60) {
            console.log('⚠️  Backend-Frontend connectivity needs attention');
          } else {
            console.log('❌ Backend-Frontend connectivity has issues');
          }
          
          // Save results
          fs.writeFileSync('connectivity-test-results.json', JSON.stringify(results, null, 2));
          console.log('\n📄 Results saved to connectivity-test-results.json');
        }).on('error', (err) => {
          test('Auth Service', 'FAIL', err.message);
        });
      }
    }).on('error', (err) => {
      test(`Table: ${table}`, 'FAIL', err.message);
    });
  });
  
}).on('error', (err) => {
  test('Backend API', 'FAIL', err.message);
  console.log('\n❌ Cannot proceed with further tests - Backend unreachable');
});
