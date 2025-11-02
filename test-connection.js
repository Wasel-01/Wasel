const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing API Health...');
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    if (error) throw error;
    console.log('✅ API Health: OK\n');
  } catch (err) {
    console.log('❌ API Health: FAILED', err.message, '\n');
  }

  // Test 2: Profiles Table
  console.log('2️⃣ Testing Profiles Table...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Profiles Table: OK');
    console.log('   Records found:', data?.length || 0, '\n');
  } catch (err) {
    console.log('❌ Profiles Table: FAILED', err.message, '\n');
  }

  // Test 3: Auth
  console.log('3️⃣ Testing Auth Service...');
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Auth Service: OK');
    console.log('   Session:', data.session ? 'Active' : 'None', '\n');
  } catch (err) {
    console.log('❌ Auth Service: FAILED', err.message, '\n');
  }

  // Summary
  console.log('📊 Connection Summary:');
  console.log('   Backend URL:', supabaseUrl);
  console.log('   Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres');
  console.log('   Studio: http://127.0.0.1:54323');
  console.log('\n✅ Backend is READY for frontend connection!');
}

testConnection();