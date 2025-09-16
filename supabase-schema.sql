-- Supabase PostgreSQL Schema for Job Board Application
-- Migration from MongoDB to PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (equivalent to MongoDB User collection)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expiry TIMESTAMP WITH TIME ZONE,
    reset_password_token VARCHAR(255),
    reset_password_token_expiry TIMESTAMP WITH TIME ZONE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('pelamar_kerja', 'pencari_kandidat')),
    company VARCHAR(255),
    description TEXT,
    website VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    whatsapp_verified BOOLEAN DEFAULT FALSE,
    whatsapp_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (nested profile object from MongoDB)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    cv_url VARCHAR(500),
    cv_path VARCHAR(500),
    cv_file_name VARCHAR(255),
    cv_uploaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Jobs table (equivalent to MongoDB Job collection)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    salary VARCHAR(255),
    employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom questions table (nested customQuestions array from MongoDB)
CREATE TABLE custom_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'select', 'radio', 'checkbox')),
    required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom question options table (options array from MongoDB)
CREATE TABLE custom_question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES custom_questions(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Applications table (equivalent to MongoDB Application collection)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    notes TEXT,
    interview_scheduled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, applicant_id)
);

-- Application answers table (nested answers array from MongoDB)
CREATE TABLE application_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    question_id UUID REFERENCES custom_questions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer JSONB NOT NULL, -- Using JSONB to handle mixed types (string, array, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews table (equivalent to MongoDB Interview collection)
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    scheduled_time VARCHAR(50) NOT NULL,
    interview_type VARCHAR(50) NOT NULL CHECK (interview_type IN ('online', 'offline')),
    location VARCHAR(500), -- Required for offline interviews
    meeting_link VARCHAR(500), -- Required for online interviews
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_whatsapp_verified ON users(whatsapp_verified);

CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX idx_custom_questions_job_id ON custom_questions(job_id);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_employer_id ON applications(employer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX idx_application_answers_application_id ON application_answers(application_id);
CREATE INDEX idx_application_answers_question_id ON application_answers(question_id);

CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_job_id ON interviews(job_id);
CREATE INDEX idx_interviews_employer_id ON interviews(employer_id);
CREATE INDEX idx_interviews_applicant_id ON interviews(applicant_id);
CREATE INDEX idx_interviews_scheduled_date ON interviews(scheduled_date);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_employer_scheduled_date ON interviews(employer_id, scheduled_date);
CREATE INDEX idx_interviews_applicant_scheduled_date ON interviews(applicant_id, scheduled_date);

-- Triggers to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own user profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON jobs
    FOR SELECT USING (status = 'active');

CREATE POLICY "Employers can manage their jobs" ON jobs
    FOR ALL USING (auth.uid() = employer_id);

-- Applications policies
CREATE POLICY "Users can view their applications" ON applications
    FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() = employer_id);

CREATE POLICY "Job seekers can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Employers can update application status" ON applications
    FOR UPDATE USING (auth.uid() = employer_id);

-- Interviews policies
CREATE POLICY "Users can view their interviews" ON interviews
    FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() = employer_id);

CREATE POLICY "Employers can manage interviews" ON interviews
    FOR ALL USING (auth.uid() = employer_id);

-- Custom questions policies
CREATE POLICY "Anyone can view custom questions for active jobs" ON custom_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = custom_questions.job_id 
            AND jobs.status = 'active'
        )
    );

CREATE POLICY "Employers can manage their job questions" ON custom_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = custom_questions.job_id 
            AND jobs.employer_id = auth.uid()
        )
    );

-- Custom question options policies
CREATE POLICY "Anyone can view question options" ON custom_question_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_questions cq
            JOIN jobs j ON j.id = cq.job_id
            WHERE cq.id = custom_question_options.question_id
            AND j.status = 'active'
        )
    );

-- Application answers policies
CREATE POLICY "Users can view their application answers" ON application_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications a
            WHERE a.id = application_answers.application_id
            AND (a.applicant_id = auth.uid() OR a.employer_id = auth.uid())
        )
    );

CREATE POLICY "Job seekers can create application answers" ON application_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications a
            WHERE a.id = application_answers.application_id
            AND a.applicant_id = auth.uid()
        )
    );

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for both job seekers and employers';
COMMENT ON TABLE user_profiles IS 'Extended profile information for users';
COMMENT ON TABLE jobs IS 'Job postings created by employers';
COMMENT ON TABLE custom_questions IS 'Custom application questions for each job';
COMMENT ON TABLE custom_question_options IS 'Multiple choice options for custom questions';
COMMENT ON TABLE applications IS 'Job applications submitted by job seekers';
COMMENT ON TABLE application_answers IS 'Answers to custom questions in applications';
COMMENT ON TABLE interviews IS 'Scheduled interviews between employers and applicants';