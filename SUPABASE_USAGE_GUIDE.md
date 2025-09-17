# 🚀 Supabase Usage Guide for Job Platform

This guide shows you how to use Supabase in your job-seeking platform with practical examples.

## 📋 Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [Authentication](#authentication)
3. [Database Operations](#database-operations)
4. [File Storage](#file-storage)
5. [Real-time Features](#real-time-features)
6. [Best Practices](#best-practices)

---

## 🔧 Setup & Configuration

### Environment Variables
Your `.env.local` already has the required Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ystvidrhbzywunwtxsct.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Supabase Clients
Your platform has multiple Supabase clients for different use cases:

```typescript
// Client-side operations (browser)
import { supabase } from '@/lib/supabase'

// Server-side admin operations
import { supabaseAdmin } from '@/lib/supabase'

// Server components
import { createServerSupabaseClient } from '@/lib/supabase'

// Client components with auth
import { createClientSupabaseClient } from '@/lib/supabase'
```

---

## 🔐 Authentication

### Sign Up New User
```typescript
// In your signup component
import { supabase } from '@/lib/supabase'

const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
        role: userData.role, // 'pelamar_kerja' or 'pencari_kandidat'
        company: userData.company
      }
    }
  })
  
  if (error) {
    console.error('Signup error:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, user: data.user }
}
```

### Sign In User
```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, user: data.user }
}
```

### Get Current User
```typescript
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

---

## 💾 Database Operations

### 1. Job Operations

#### Create a Job
```typescript
import { supabaseAdmin } from '@/lib/supabase'
import type { JobInsert } from '@/lib/supabase'

const createJob = async (jobData: JobInsert) => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert({
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      location: jobData.location,
      salary: jobData.salary,
      employer_id: jobData.employer_id,
      status: 'active'
    })
    .select()
    .single()
    
  if (error) {
    console.error('Error creating job:', error)
    return null
  }
  
  return data
}
```

#### Get All Active Jobs
```typescript
const getActiveJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      employer:users!employer_id(name, company, location)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }
  
  return data
}
```

#### Update Job Status
```typescript
const updateJobStatus = async (jobId: string, status: 'active' | 'inactive' | 'closed') => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select()
    .single()
    
  return { data, error }
}
```

### 2. Application Operations

#### Submit Job Application
```typescript
import type { ApplicationInsert } from '@/lib/supabase'

const submitApplication = async (applicationData: ApplicationInsert) => {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: applicationData.job_id,
      applicant_id: applicationData.applicant_id,
      employer_id: applicationData.employer_id,
      status: 'pending'
    })
    .select()
    .single()
    
  if (error) {
    console.error('Error submitting application:', error)
    return null
  }
  
  return data
}
```

#### Get User Applications
```typescript
const getUserApplications = async (userId: string) => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(*),
      employer:users!employer_id(name, company)
    `)
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false })
    
  return { data, error }
}
```

#### Update Application Status
```typescript
const updateApplicationStatus = async (
  applicationId: string, 
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
) => {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()
    
  return { data, error }
}
```

### 3. Interview Operations

#### Schedule Interview
```typescript
import type { InterviewInsert } from '@/lib/supabase'

const scheduleInterview = async (interviewData: InterviewInsert) => {
  const { data, error } = await supabaseAdmin
    .from('interviews')
    .insert({
      application_id: interviewData.application_id,
      job_id: interviewData.job_id,
      employer_id: interviewData.employer_id,
      applicant_id: interviewData.applicant_id,
      scheduled_date: interviewData.scheduled_date,
      scheduled_time: interviewData.scheduled_time,
      interview_type: interviewData.interview_type,
      location: interviewData.location,
      meeting_link: interviewData.meeting_link,
      notes: interviewData.notes,
      status: 'scheduled'
    })
    .select()
    .single()
    
  return { data, error }
}
```

#### Get User Interviews
```typescript
const getUserInterviews = async (userId: string, role: 'applicant' | 'employer') => {
  const column = role === 'applicant' ? 'applicant_id' : 'employer_id'
  
  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      job:jobs(*),
      application:applications(*),
      applicant:users!applicant_id(name, email),
      employer:users!employer_id(name, company)
    `)
    .eq(column, userId)
    .order('scheduled_date', { ascending: true })
    
  return { data, error }
}
```

---

## 📁 File Storage

### Upload CV
```typescript
import { uploadCV } from '@/lib/supabase'

const handleCVUpload = async (file: File, userId: string) => {
  const result = await uploadCV(file, userId)
  
  if (result) {
    console.log('CV uploaded successfully:', result.url)
    // Update user profile with CV URL
    const { error } = await supabase
      .from('users')
      .update({ cv_url: result.url, cv_path: result.path })
      .eq('id', userId)
      
    if (error) {
      console.error('Error updating user profile:', error)
    }
  }
}
```

### Download CV
```typescript
import { getCVDownloadUrl } from '@/lib/supabase'

const downloadCV = async (cvPath: string) => {
  const downloadUrl = await getCVDownloadUrl(cvPath)
  
  if (downloadUrl) {
    // Open in new tab or trigger download
    window.open(downloadUrl, '_blank')
  }
}
```

---

## ⚡ Real-time Features

### Listen to New Applications
```typescript
const subscribeToApplications = (employerId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('applications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'applications',
        filter: `employer_id=eq.${employerId}`
      },
      callback
    )
    .subscribe()
    
  return subscription
}

// Usage in component
useEffect(() => {
  const subscription = subscribeToApplications(user.id, (payload) => {
    console.log('New application received:', payload.new)
    // Update UI, show notification, etc.
  })
  
  return () => {
    subscription.unsubscribe()
  }
}, [user.id])
```

### Listen to Interview Updates
```typescript
const subscribeToInterviews = (userId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('interviews')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'interviews',
        filter: `applicant_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
    
  return subscription
}
```

---

## 🎯 Best Practices

### 1. Error Handling
```typescript
const safeDbOperation = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      
    if (error) {
      console.error('Database error:', error)
      throw new Error(error.message)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Operation failed:', error)
    return { success: false, error: error.message }
  }
}
```

### 2. Type Safety
```typescript
// Always use the generated types
import type { Job, Application, Interview } from '@/lib/supabase'

const processJob = (job: Job) => {
  // TypeScript will ensure job has all required properties
  console.log(job.title, job.company, job.status)
}
```

### 3. Row Level Security (RLS)
Make sure to enable RLS in your Supabase dashboard and create policies:

```sql
-- Example policy for jobs table
CREATE POLICY "Users can view active jobs" ON jobs
  FOR SELECT USING (status = 'active');

-- Example policy for applications
CREATE POLICY "Users can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() = employer_id);
```

### 4. Performance Optimization
```typescript
// Use select() to only fetch needed columns
const getJobTitles = async () => {
  const { data } = await supabase
    .from('jobs')
    .select('id, title, company')
    .eq('status', 'active')
    
  return data
}

// Use pagination for large datasets
const getJobsPaginated = async (page: number, limit: number = 10) => {
  const from = page * limit
  const to = from + limit - 1
  
  const { data, error, count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .range(from, to)
    .eq('status', 'active')
    
  return { data, error, count }
}
```

---

## 🚀 Quick Start Examples

### Complete Job Application Flow
```typescript
// 1. User applies for a job
const applyForJob = async (jobId: string, userId: string, employerId: string) => {
  // Check if already applied
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('applicant_id', userId)
    .single()
    
  if (existing) {
    return { success: false, error: 'Already applied' }
  }
  
  // Submit application
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      applicant_id: userId,
      employer_id: employerId,
      status: 'pending'
    })
    .select()
    .single()
    
  return { success: !error, data, error }
}

// 2. Employer reviews application
const reviewApplication = async (applicationId: string, status: 'accepted' | 'rejected') => {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()
    
  return { success: !error, data, error }
}

// 3. Schedule interview if accepted
const scheduleInterviewForApplication = async (applicationId: string, interviewData: any) => {
  const { data, error } = await supabaseAdmin
    .from('interviews')
    .insert({
      application_id: applicationId,
      ...interviewData,
      status: 'scheduled'
    })
    .select()
    .single()
    
  return { success: !error, data, error }
}
```

This guide covers the essential Supabase operations for your job platform. Remember to always handle errors gracefully and use TypeScript types for better development experience! 🎉