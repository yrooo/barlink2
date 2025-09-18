const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase connection with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database schema...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Reading schema file...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // Try alternative method using direct query
          const { error: queryError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(1);
          
          if (queryError && queryError.code === 'PGRST116') {
            // Table doesn't exist, we need to use raw SQL execution
            console.log(`⚠️  Using alternative execution method for statement ${i + 1}`);
            // For now, we'll log the statement that needs manual execution
            console.log('📋 Manual execution needed:', statement.substring(0, 100) + '...');
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message);
      }
    }
    
    // Test if tables were created
    console.log('\n🔍 Verifying table creation...');
    
    const tables = ['users', 'user_profiles', 'jobs', 'applications', 'interviews'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' not accessible:`, error.message);
        } else {
          console.log(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' check failed:`, err.message);
      }
    }
    
    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If any tables failed to create, manually execute the SQL in Supabase Dashboard → SQL Editor');
    console.log('2. Copy the contents of supabase-schema.sql');
    console.log('3. Paste and execute in the SQL Editor');
    console.log('4. Run this script again to verify');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n📋 Manual setup required:');
    console.log('1. Go to your Supabase Dashboard → SQL Editor');
    console.log('2. Copy the contents of supabase-schema.sql');
    console.log('3. Paste and execute the SQL');
    console.log('4. This will create all necessary tables and policies');
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };