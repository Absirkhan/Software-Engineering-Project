-- PostgreSQL schema for Job Portal application

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table to store all users (clients and freelancers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'freelancer',
    github_id VARCHAR(255),
    github_token TEXT,
    profile JSONB NOT NULL DEFAULT '{}',
    projects JSONB NOT NULL DEFAULT '[]',
    github_repositories JSONB NOT NULL DEFAULT '[]',
    alert_preferences JSONB DEFAULT '{"enabled": true, "skills": []}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table to store all job postings
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    qualifications TEXT NOT NULL,
    experience TEXT NOT NULL,
    skills JSONB NOT NULL DEFAULT '[]',
    salary_range VARCHAR(100) NOT NULL,
    benefits TEXT NOT NULL,
    timer_duration INTEGER NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    client JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    applications JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    apply_clicks INTEGER NOT NULL DEFAULT 0
);

-- Applications table to store job applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer JSONB NOT NULL,
    cover_letter TEXT NOT NULL,
    generic_resume_path TEXT,
    job_specific_resume_path TEXT,
    cover_letter_file_path TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    interview_date_time TIMESTAMP WITH TIME ZONE,
    interview_message TEXT
);

-- Notifications table to store user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Interviews table to store scheduled interviews
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_name VARCHAR(255) NOT NULL,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Saved Jobs table to track jobs saved by freelancers
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(user_id, job_id)
);

-- Ratings table to store freelancer ratings of clients
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(freelancer_id, application_id)
);

-- Chat Messages table to store user-to-user messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indices to improve query performance
CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs((client->>'id'));
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_freelancer ON applications((freelancer->>'id'));
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_interviews_freelancer_id ON interviews(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_client_id ON interviews(client_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_ratings_client_id ON ratings(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);
