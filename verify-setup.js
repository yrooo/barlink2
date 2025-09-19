require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySetup() {
  console.log('🔍 Verifying Supabase database setup...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  const tables = [
    'users', 'user_profiles', 'jobs', 'custom_questions', 
    'custom_question_options', 'applications', 'application_answers', 'interviews'
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}' - ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' - OK`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' - ${err.message}`);
      allTablesExist = false;
    }
  }
  
  if (!allTablesExist) {
    console.log('\n🚨 SETUP REQUIRED:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project: ystvidrhbzywunwtxsct');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy the entire contents of supabase-schema.sql');
    console.log('5. Paste and execute in the SQL Editor');
    console.log('6. Run this script again to verify');
    console.log('\n📄 Schema file location: ./supabase-schema.sql');
  } else {
    console.log('\n🎉 All tables are set up correctly!');
    
    // Test creating a user profile
    console.log('\n🧪 Testing user creation...');
    
    try {
      // Test if we can insert into users table
      const testUserId = 'test-user-' + Date.now();
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: 'test@example.com',
          role: 'pelamar_kerja',
          email_verified: true
        })
        .select()
        .single();
      
      if (userError) {
        console.log('❌ User creation test failed:', userError.message);
      } else {
        console.log('✅ User creation test passed');
        
        // Test user profile creation
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: testUserId,
            full_name: 'Test User',
            bio: 'Test bio'
          })
          .select()
          .single();
        
        if (profileError) {
          console.log('❌ Profile creation test failed:', profileError.message);
        } else {
          console.log('✅ Profile creation test passed');
        }
        
        // Clean up test data
        await supabase.from('user_profiles').delete().eq('user_id', testUserId);
        await supabase.from('users').delete().eq('id', testUserId);
        console.log('🧹 Test data cleaned up');
      }
    } catch (err) {
      console.log('❌ Testing failed:', err.message);
    }
  }
}

verifySetup().catch(console.error);