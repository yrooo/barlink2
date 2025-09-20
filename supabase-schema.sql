-- Supabase Schema for Job-Seeking Platform Migration
-- This schema migrates from MongoDB to Supabase with proper authentication

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('pelamar_kerja', 'pencari_kandidat');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE job_status AS ENUM ('active', 'inactive', 'closed');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    company TEXT,
    description TEXT,
    website TEXT,
    location TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    whatsapp_verified BOOLEAN DEFAULT FALSE,
    whatsapp_verified_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    verification_token_expiry TIMESTAMPTZ,
    reset_password_token TEXT,
    reset_password_token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table (for additional profile data)
CREATE TABLE public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    bio TEXT,
    address TEXT,
    cv_url TEXT,
    cv_path TEXT,
    cv_file_name TEXT,
    cv_uploaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    employment_type TEXT,
    experience_level TEXT,
    skills TEXT[],
    requirements TEXT,
    benefits TEXT,
    status job_status DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status application_status DEFAULT 'pending',
    cover_letter TEXT,
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, applicant_id)
);

-- Interviews table
CREATE TABLE public.interviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE UNIQUE,
    employer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    meeting_link TEXT,
    notes TEXT,
    status interview_status DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_whatsapp_verified ON public.users(whatsapp_verified);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Jobs table indexes
CREATE INDEX idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_employment_type ON public.jobs(employment_type);
CREATE INDEX idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX idx_jobs_expires_at ON public.jobs(expires_at);
CREATE INDEX idx_jobs_salary_range ON public.jobs(salary_min, salary_max);
CREATE INDEX idx_jobs_skills ON public.jobs USING GIN(skills);

-- Applications table indexes
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX idx_applications_employer_id ON public.applications(employer_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_applied_at ON public.applications(applied_at);
CREATE INDEX idx_applications_job_applicant ON public.applications(job_id, applicant_id);

-- Interviews table indexes
CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON public.interviews(status);
CREATE INDEX idx_interviews_employer_id ON public.interviews(employer_id);
CREATE INDEX idx_interviews_applicant_id ON public.interviews(applicant_id);

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_cv_uploaded ON public.user_profiles(cv_uploaded_at) WHERE cv_uploaded_at IS NOT NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for data validation
ALTER TABLE public.users ADD CONSTRAINT check_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.users ADD CONSTRAINT check_phone_format 
    CHECK (phone IS NULL OR phone ~* '^[+]?[0-9\s\-\(\)]{10,20}$');

ALTER TABLE public.users ADD CONSTRAINT check_whatsapp_format 
    CHECK (whatsapp_number IS NULL OR whatsapp_number ~* '^[+]?[0-9\s\-\(\)]{10,20}$');

ALTER TABLE public.jobs ADD CONSTRAINT check_salary_range 
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);

ALTER TABLE public.jobs ADD CONSTRAINT check_salary_positive 
    CHECK (salary_min IS NULL OR salary_min >= 0);

ALTER TABLE public.jobs ADD CONSTRAINT check_expires_future 
    CHECK (expires_at IS NULL OR expires_at > created_at);

ALTER TABLE public.interviews ADD CONSTRAINT check_duration_positive 
    CHECK (duration_minutes > 0 AND duration_minutes <= 480);

ALTER TABLE public.interviews ADD CONSTRAINT check_scheduled_future 
    CHECK (scheduled_at > created_at);

-- Add function to automatically close expired jobs
CREATE OR REPLACE FUNCTION close_expired_jobs()
RETURNS void AS $$
BEGIN
    UPDATE public.jobs 
    SET status = 'closed', updated_at = NOW()
    WHERE status = 'active' 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add function to get job statistics
CREATE OR REPLACE FUNCTION get_job_stats(employer_uuid UUID)
RETURNS TABLE(
    total_jobs BIGINT,
    active_jobs BIGINT,
    total_applications BIGINT,
    pending_applications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(j.id) as total_jobs,
        COUNT(j.id) FILTER (WHERE j.status = 'active') as active_jobs,
        COUNT(a.id) as total_applications,
        COUNT(a.id) FILTER (WHERE a.status = 'pending') as pending_applications
    FROM public.jobs j
    LEFT JOIN public.applications a ON j.id = a.job_id
    WHERE j.employer_id = employer_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role, company, created_at, updated_at)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown User'),
        NEW.email, 
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pelamar_kerja'),
        NEW.raw_user_meta_data->>'company',
        NOW(), 
        NOW()
    );
    
    INSERT INTO public.user_profiles (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public users are viewable by everyone" ON public.users
    FOR SELECT USING (true);

-- User profiles policies
CREATE POLICY "Users can view their own profile data" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile data" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile data" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs
    FOR SELECT USING (status = 'active');

CREATE POLICY "Employers can create jobs" ON public.jobs
    FOR INSERT WITH CHECK (
        auth.uid() = employer_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'pencari_kandidat')
    );

CREATE POLICY "Employers can update their own jobs" ON public.jobs
    FOR UPDATE USING (
        auth.uid() = employer_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'pencari_kandidat')
    );

CREATE POLICY "Employers can delete their own jobs" ON public.jobs
    FOR DELETE USING (
        auth.uid() = employer_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'pencari_kandidat')
    );

-- Applications policies
CREATE POLICY "Job seekers can view their own applications" ON public.applications
    FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Employers can view applications for their jobs" ON public.applications
    FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "Job seekers can create applications" ON public.applications
    FOR INSERT WITH CHECK (
        auth.uid() = applicant_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'pelamar_kerja')
    );

CREATE POLICY "Employers can update applications for their jobs" ON public.applications
    FOR UPDATE USING (
        auth.uid() = employer_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'pencari_kandidat')
    );

-- Interviews policies
CREATE POLICY "Employers can view interviews for their jobs" ON public.interviews
    FOR SELECT USING (auth.uid() = employer_id);

CREATE POLICY "Applicants can view their own interviews" ON public.interviews
    FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Employers can create interviews" ON public.interviews
    FOR INSERT WITH CHECK (
        auth.uid() = employer_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'pencari_kandidat')
    );

CREATE POLICY "Employers can update interviews" ON public.interviews
    FOR UPDATE USING (
        auth.uid() = employer_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'pencari_kandidat')
    );

-- Storage policies for CV uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', false);

CREATE POLICY "Users can upload their own CVs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'cvs' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own CVs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'cvs' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own CVs" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'cvs' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own CVs" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'cvs' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Employers can view CVs of applicants
CREATE POLICY "Employers can view applicant CVs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'cvs' AND 
        EXISTS (
            SELECT 1 FROM public.applications a
            JOIN public.jobs j ON a.job_id = j.id
            WHERE j.employer_id = auth.uid()
            AND a.applicant_id::text = (storage.foldername(name))[1]
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Main users table extending Supabase auth.users';
COMMENT ON TABLE public.user_profiles IS 'Additional user profile data including CV information';
COMMENT ON TABLE public.jobs IS 'Job postings created by employers';
COMMENT ON TABLE public.applications IS 'Job applications submitted by job seekers';
COMMENT ON TABLE public.interviews IS 'Interview schedules for accepted applications';

-- Sample data for testing (optional)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES 
--     ('550e8400-e29b-41d4-a716-446655440001', 'employer@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
--     ('550e8400-e29b-41d4-a716-446655440002', 'jobseeker@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

-- The trigger will automatically create corresponding records in public.users and public.user_profiles