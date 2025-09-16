# MongoDB to Supabase Migration Guide

This guide provides step-by-step instructions for migrating your Next.js job board application from MongoDB to Supabase with PostgreSQL.

## 📋 Migration Overview

### Current MongoDB Schema
- **Users**: User accounts with embedded profile data
- **Jobs**: Job postings with embedded custom questions
- **Applications**: Job applications with embedded answers
- **Interviews**: Interview scheduling data

### New PostgreSQL Schema
- **Normalized relational structure** with proper foreign keys
- **Row Level Security (RLS)** for data protection
- **Optimized indexes** for better performance
- **UUID primary keys** instead of ObjectIds

## 🚀 Step 1: Set Up Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Choose a region close to your users
4. Set a strong database password
5. Wait for project initialization

### 1.2 Get Project Credentials
From your Supabase dashboard, note down:
- **Project URL**: `https://your-project.supabase.co`
- **Anon Key**: `eyJ...` (public key)
- **Service Role Key**: `eyJ...` (private key, keep secure)
- **Database Password**: The one you set during project creation

### 1.3 Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Execute the SQL to create all tables and policies

## 🔧 Step 2: Install Supabase Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install Supabase Auth helpers for Next.js
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# Optional: Install Supabase CLI for local development
npm install -g supabase
```

## ⚙️ Step 3: Environment Configuration

### 3.1 Update Environment Variables
Create or update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep existing variables for gradual migration
MONGODB_URI=your-mongodb-uri
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 3.2 Create Supabase Client Configuration
Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Server component client
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Client component client
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// Database types (will be generated after schema is created)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          email_verified: boolean
          role: 'pelamar_kerja' | 'pencari_kandidat'
          company?: string
          description?: string
          website?: string
          location?: string
          phone?: string
          whatsapp_number?: string
          whatsapp_verified: boolean
          whatsapp_verified_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          email_verified?: boolean
          role: 'pelamar_kerja' | 'pencari_kandidat'
          company?: string
          description?: string
          website?: string
          location?: string
          phone?: string
          whatsapp_number?: string
          whatsapp_verified?: boolean
          whatsapp_verified_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          email_verified?: boolean
          role?: 'pelamar_kerja' | 'pencari_kandidat'
          company?: string
          description?: string
          website?: string
          location?: string
          phone?: string
          whatsapp_number?: string
          whatsapp_verified?: boolean
          whatsapp_verified_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as needed
    }
  }
}
```

## 🔄 Step 4: Data Migration Strategy

### 4.1 Create Migration Scripts
Create `scripts/migrate-data.js`:

```javascript
const { MongoClient } = require('mongodb')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const mongoUri = process.env.MONGODB_URI
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateUsers() {
  const mongoClient = new MongoClient(mongoUri)
  await mongoClient.connect()
  
  const db = mongoClient.db()
  const users = await db.collection('users').find({}).toArray()
  
  console.log(`Migrating ${users.length} users...`)
  
  for (const user of users) {
    // Migrate main user data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      email_verified: user.emailVerified || false,
      role: user.role,
      company: user.company,
      description: user.description,
      website: user.website,
      location: user.location,
      phone: user.phone,
      whatsapp_number: user.whatsappNumber,
      whatsapp_verified: user.whatsappVerified || false,
      whatsapp_verified_at: user.whatsappVerifiedAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }
    
    const { error: userError } = await supabase
      .from('users')
      .insert(userData)
    
    if (userError) {
      console.error(`Error migrating user ${user.email}:`, userError)
      continue
    }
    
    // Migrate user profile if exists
    if (user.profile) {
      const profileData = {
        user_id: user._id.toString(),
        bio: user.profile.bio,
        phone: user.profile.phone,
        address: user.profile.address,
        website: user.profile.website,
        description: user.profile.description,
        location: user.profile.location,
        cv_url: user.profile.cvUrl,
        cv_path: user.profile.cvPath,
        cv_file_name: user.profile.cvFileName,
        cv_uploaded_at: user.profile.cvUploadedAt
      }
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)
      
      if (profileError) {
        console.error(`Error migrating profile for ${user.email}:`, profileError)
      }
    }
  }
  
  await mongoClient.close()
  console.log('User migration completed')
}

async function migrateJobs() {
  const mongoClient = new MongoClient(mongoUri)
  await mongoClient.connect()
  
  const db = mongoClient.db()
  const jobs = await db.collection('jobs').find({}).toArray()
  
  console.log(`Migrating ${jobs.length} jobs...`)
  
  for (const job of jobs) {
    // Migrate main job data
    const jobData = {
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      salary: job.salary,
      employer_id: job.employerId.toString(),
      status: job.status || 'active',
      applications_count: job.applicationsCount || 0,
      created_at: job.createdAt,
      updated_at: job.updatedAt
    }
    
    const { error: jobError } = await supabase
      .from('jobs')
      .insert(jobData)
    
    if (jobError) {
      console.error(`Error migrating job ${job.title}:`, jobError)
      continue
    }
    
    // Migrate custom questions
    if (job.customQuestions && job.customQuestions.length > 0) {
      for (const question of job.customQuestions) {
        const questionData = {
          id: question._id.toString(),
          job_id: job._id.toString(),
          question: question.question,
          type: question.type || 'text',
          required: question.required || false
        }
        
        const { error: questionError } = await supabase
          .from('custom_questions')
          .insert(questionData)
        
        if (questionError) {
          console.error(`Error migrating question:`, questionError)
          continue
        }
        
        // Migrate question options
        if (question.options && question.options.length > 0) {
          for (let i = 0; i < question.options.length; i++) {
            const optionData = {
              question_id: question._id.toString(),
              option_text: question.options[i],
              sort_order: i
            }
            
            const { error: optionError } = await supabase
              .from('custom_question_options')
              .insert(optionData)
            
            if (optionError) {
              console.error(`Error migrating option:`, optionError)
            }
          }
        }
      }
    }
  }
  
  await mongoClient.close()
  console.log('Job migration completed')
}

// Add similar functions for applications and interviews

async function runMigration() {
  try {
    await migrateUsers()
    await migrateJobs()
    // await migrateApplications()
    // await migrateInterviews()
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMigration()
```

### 4.2 Run Migration
```bash
# Make sure your MongoDB and Supabase are accessible
node scripts/migrate-data.js
```

## 🔐 Step 5: Update Authentication

### 5.1 Configure Supabase Auth
In Supabase Dashboard → Authentication → Settings:
- Enable email confirmations
- Configure email templates
- Set up redirect URLs
- Configure password requirements

### 5.2 Update Auth Provider
Update `src/components/AuthProvider.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClientSupabaseClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## 🔄 Step 6: Update API Routes

### 6.1 Create Supabase Service Layer
Create `src/lib/services/userService.ts`:

```typescript
import { supabaseAdmin } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export class UserService {
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    
    return data
  }
  
  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
    
    return data
  }
  
  static async createUser(userData: UserInsert): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    
    return data
  }
  
  static async updateUser(id: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    
    return data
  }
}
```

### 6.2 Update API Routes
Update `src/app/api/jobs/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:users!employer_id(name, company),
        custom_questions(
          id,
          question,
          type,
          required,
          custom_question_options(option_text, sort_order)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { title, company, description, location, salary, customQuestions } = body
    
    // Create job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        title,
        company,
        description,
        location,
        salary,
        employer_id: user.id
      })
      .select()
      .single()
    
    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      )
    }
    
    // Create custom questions if provided
    if (customQuestions && customQuestions.length > 0) {
      const questionsToInsert = customQuestions.map((q: any) => ({
        job_id: job.id,
        question: q.question,
        type: q.type || 'text',
        required: q.required || false
      }))
      
      const { error: questionsError } = await supabase
        .from('custom_questions')
        .insert(questionsToInsert)
      
      if (questionsError) {
        console.error('Error creating questions:', questionsError)
      }
    }
    
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
```

## 🧪 Step 7: Testing

### 7.1 Test Database Connection
Create `scripts/test-connection.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection failed:', error)
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('Database is ready for migration')
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testConnection()
```

### 7.2 Run Tests
```bash
node scripts/test-connection.js
npm run dev
```

## 🧹 Step 8: Cleanup

### 8.1 Remove MongoDB Dependencies
After successful migration and testing:

```bash
# Remove MongoDB packages
npm uninstall mongoose @next-auth/mongodb-adapter

# Remove MongoDB files
rm src/lib/mongodb.ts
rm -rf src/lib/models/
```

### 8.2 Update Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "migrate": "node scripts/migrate-data.js",
    "test-db": "node scripts/test-connection.js",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset"
  }
}
```

## 🚀 Step 9: Deployment

### 9.1 Update Environment Variables
In your production environment (Vercel, etc.):
- Add Supabase environment variables
- Remove MongoDB environment variables
- Update any CI/CD scripts

### 9.2 Database Backup
Before going live:
1. Export your MongoDB data as backup
2. Test the migration thoroughly
3. Have a rollback plan ready

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Troubleshooting

### Common Issues
1. **RLS Policies**: Make sure RLS policies allow your operations
2. **UUID vs ObjectId**: Ensure proper ID conversion in migration
3. **Nested Data**: PostgreSQL requires normalized structure
4. **Auth Integration**: Test authentication flows thoroughly

### Getting Help
- Check Supabase logs in dashboard
- Use Supabase Discord community
- Review PostgreSQL query logs
- Test with smaller datasets first

---

**Note**: This migration guide provides a comprehensive approach. Adapt the steps based on your specific requirements and test thoroughly before production deployment.