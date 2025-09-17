const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase database setup...\n');
  
  const tables = [
    { name: 'users', description: 'User accounts and authentication' },
    { name: 'user_profiles', description: 'Extended user profile data' },
    { name: 'jobs', description: 'Job postings' },
    { name: 'custom_questions', description: 'Custom application questions' },
    { name: 'custom_question_options', description: 'Multiple choice options' },
    { name: 'applications', description: 'Job applications' },
    { name: 'application_answers', description: 'Answers to custom questions' },
    { name: 'interviews', description: 'Scheduled interviews' }
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${table.name}' - ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table.name}' - ${table.description}`);
      }
    } catch (err) {
      console.log(`❌ Table '${table.name}' - ${err.message}`);
      allTablesExist = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allTablesExist) {
    console.log('🎉 SUCCESS: All database tables are properly set up!');
    console.log('\n✅ Your application should now work correctly.');
    console.log('✅ Profile pages should load without errors.');
    console.log('✅ User authentication should function properly.');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Test the profile page: http://localhost:3000/profile');
    console.log('3. Try signing up/signing in to test authentication');
  } else {
    console.log('❌ SETUP REQUIRED: Some database tables are missing.');
    console.log('\n📋 To fix this:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy the contents of supabase-schema.sql');
    console.log('3. Paste and execute the SQL');
    console.log('4. Run this verification script again');
    console.log('\n📖 See DATABASE_SETUP_INSTRUCTIONS.md for detailed steps');
  }
  
  console.log('\n🔗 Useful links:');
  console.log(`📊 Supabase Dashboard: ${supabaseUrl.replace('/rest/v1', '')}`);
  console.log('📝 SQL Editor: Dashboard → SQL Editor');
  console.log('📋 Table Editor: Dashboard → Table Editor');
}

// Run the verification
if (require.main === module) {
  verifyDatabase().catch(console.error);
}

module.exports = { verifyDatabase };