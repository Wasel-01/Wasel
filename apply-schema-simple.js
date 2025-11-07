const https = require('https');
const fs = require('fs');

const supabaseUrl = 'https://djccmatubyyudeosrngm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqY2NtYXR1Ynl5dWRlb3NybmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNjY5MjUsImV4cCI6MjA3NzQyNjkyNX0.WlYJmK-OUKlNyp3ktcb2ShILFN1vgCumAL4tOATziTQ';

console.log('🔧 Creating Essential Tables for Wasel\n');

// Create tables using REST API
const tables = [
  {
    name: 'trips',
    check: `${supabaseUrl}/rest/v1/trips?limit=1`
  },
  {
    name: 'bookings',
    check: `${supabaseUrl}/rest/v1/bookings?limit=1`
  },
  {
    name: 'messages',
    check: `${supabaseUrl}/rest/v1/messages?limit=1`
  }
];

const options = {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
};

console.log('📋 Checking existing tables...\n');

let checkedCount = 0;
const missingTables = [];

tables.forEach(table => {
  https.get(table.check, options, (res) => {
    checkedCount++;
    
    if (res.statusCode === 200) {
      console.log(`✅ Table '${table.name}' exists`);
    } else if (res.statusCode === 404) {
      console.log(`❌ Table '${table.name}' missing`);
      missingTables.push(table.name);
    } else {
      console.log(`⚠️  Table '${table.name}' status: ${res.statusCode}`);
    }
    
    if (checkedCount === tables.length) {
      console.log('\n' + '='.repeat(50));
      if (missingTables.length > 0) {
        console.log('\n❌ Missing tables detected!');
        console.log('\n📝 To fix this, you need to:');
        console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project: djccmatubyyudeosrngm');
        console.log('3. Go to SQL Editor');
        console.log('4. Run the schema from: src/supabase/schema.sql');
        console.log('\nOr use the Supabase CLI:');
        console.log('   npx supabase db push');
      } else {
        console.log('\n✅ All essential tables exist!');
        console.log('✅ Backend-Frontend connectivity is ready');
      }
    }
  }).on('error', (err) => {
    console.log(`❌ Error checking ${table.name}:`, err.message);
  });
});
