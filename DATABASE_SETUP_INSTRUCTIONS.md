# 🗄️ Database Setup Instructions

## ❌ Current Issue
Your Supabase database is missing the required tables, which is causing the error:
```
Could not find the table 'public.users' in the schema cache
```

## ✅ Solution: Manual Database Setup

### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **barlink2** (or whatever you named it)

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"** to create a new SQL query

### Step 3: Execute Database Schema
1. Open the file `supabase-schema.sql` in your project
2. **Copy ALL the contents** of the file (289 lines)
3. **Paste** the entire content into the SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)

### Step 4: Verify Tables Created
After running the SQL, you should see these tables in your database:
- ✅ `users` - User accounts and profiles
- ✅ `user_profiles` - Extended user profile data
- ✅ `jobs` - Job postings
- ✅ `custom_questions` - Custom application questions
- ✅ `custom_question_options` - Multiple choice options
- ✅ `applications` - Job applications
- ✅ `application_answers` - Answers to custom questions
- ✅ `interviews` - Scheduled interviews

### Step 5: Check Table Browser
1. Go to **"Table Editor"** in the left sidebar
2. You should see all the tables listed
3. Click on `users` table to verify it exists

## 🔧 Alternative: Use Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## 🚨 Important Notes

1. **Backup First**: If you have existing data, make sure to backup before running the schema
2. **One-Time Setup**: You only need to do this once per project
3. **Environment Variables**: Make sure your `.env.local` has the correct Supabase credentials

## 🧪 Test After Setup

After creating the tables, test by:
1. Restart your development server: `npm run dev`
2. Try accessing the profile page: `http://localhost:3000/profile`
3. The error should be resolved

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard logs
2. Verify your environment variables
3. Make sure you're using the correct project
4. Check that RLS (Row Level Security) policies are properly set

---

**Next Step**: Once you've executed the SQL schema, your authentication and profile pages should work correctly! 🎉