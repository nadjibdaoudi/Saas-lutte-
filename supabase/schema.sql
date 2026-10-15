-- =====================================================================
-- WrestleLab: Complete Production PostgreSQL Schema for Supabase
-- Multi-Tenant Greco-Roman Wrestling Performance Management Platform
-- 100% IDEMPOTENT: Safe to run repeatedly in Supabase SQL Editor
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS (Safe Idempotent Creation)
DO $$ BEGIN
  CREATE TYPE membership_role AS ENUM (
    'owner', 
    'admin', 
    'head_coach', 
    'coach', 
    'assistant', 
    'physio', 
    'doctor', 
    'athlete', 
    'parent'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'club_admin', 'coach', 'athlete');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE wrestling_style AS ENUM ('greco_roman', 'freestyle', 'women_wrestling');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE age_category AS ENUM ('u15', 'u17_cadet', 'u20_junior', 'u23', 'senior', 'veterans');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE dominant_side AS ENUM ('left', 'right', 'ambidextrous');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE test_category AS ENUM (
    'strength', 'power', 'speed', 'agility', 'endurance', 
    'mobility', 'flexibility', 'reaction', 'anthropometry', 'recovery'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE performance_direction AS ENUM ('higher_is_better', 'lower_is_better');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused', 'late');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE injury_status AS ENUM ('active', 'recovering', 'cleared', 'restricted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE injury_severity AS ENUM ('mild', 'moderate', 'severe');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE match_result_type AS ENUM (
    'vfa',  -- Victory by Fall
    'vsu',  -- Technical Superiority (8 pts difference in Greco-Roman, no opponent points)
    'vsu1', -- Technical Superiority (opponent scored)
    'vpo',  -- Decision on Points (no opponent points)
    'vpo1', -- Decision on Points (opponent scored)
    'vin',  -- Injury
    'vca',  -- Cautions / 3 Passivity Disqualifications
    'vfo',  -- Forfeit / Walkover
    'dsq'   -- Double Disqualification
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free_trial', 'coach', 'club', 'pro', 'national_team');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE weigh_in_type AS ENUM ('morning_fasted', 'pre_practice', 'post_practice', 'official_tournament_weighin', 'general');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE hydration_status AS ENUM ('optimal', 'dehydrated', 'severely_dehydrated', 'untested');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'medical_clearance', 'federation_license', 'passport_id', 
    'anti_doping_cert', 'insurance', 'parental_consent', 'contract', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE match_event_type AS ENUM (
    'takedown', 'throw_4pt', 'throw_5pt', 'gut_wrench', 'par_terre_lift', 
    'reversal', 'passivity_ordered', 'passivity_par_terre', 'caution', 
    'challenge_won', 'challenge_lost', 'out_of_bounds', 'penalty_point', 'verbal_warning'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE goal_category AS ENUM (
    'competition_medal', 'technical_mastery', 'weight_target', 
    'physical_benchmark', 'attendance', 'tactical'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'weight_alert', 'upcoming_test', 'competition', 'injury_update', 
    'assessment_due', 'announcement', 'general'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 4. IDENTITY & SAAS TABLES
-- =====================================================================

-- 4.1 PLANS (SaaS Catalog)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'starter', 'coach', 'club', 'pro', 'federation'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    monthly_price_cents INTEGER NOT NULL DEFAULT 0,
    annual_price_cents INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    max_athletes INTEGER NOT NULL DEFAULT 20,
    max_coaches INTEGER NOT NULL DEFAULT 3,
    max_teams INTEGER NOT NULL DEFAULT 2,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL DEFAULT 'Coach',
    last_name VARCHAR(100) NOT NULL DEFAULT 'User',
    avatar_url TEXT,
    phone VARCHAR(50),
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'fr',
    role user_role NOT NULL DEFAULT 'coach', -- Backwards compatible high-level role
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 ORGANIZATIONS (Clubs, Academies, National Teams)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    country VARCHAR(100) NOT NULL DEFAULT 'France',
    city VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    wrestling_federation VARCHAR(150) DEFAULT 'FFLDA (Fédération Française de Lutte)',
    subscription_plan subscription_tier NOT NULL DEFAULT 'club',
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active',
    max_athletes INTEGER NOT NULL DEFAULT 100,
    max_coaches INTEGER NOT NULL DEFAULT 10,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 MEMBERSHIPS (Multi-tenant Role-based membership)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role membership_role NOT NULL DEFAULT 'coach',
    title VARCHAR(150) DEFAULT 'Greco-Roman Coach',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- Backwards compatibility alias for organization_members
CREATE OR REPLACE VIEW organization_members AS 
  SELECT id, organization_id, user_id, role::text AS role, title, is_active, created_at, updated_at
  FROM memberships;

-- 4.5 INVITATIONS
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role membership_role NOT NULL DEFAULT 'coach',
    token VARCHAR(255) UNIQUE NOT NULL,
    status invitation_status NOT NULL DEFAULT 'pending',
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.6 SUBSCRIPTIONS (Stripe / Billing Integration)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'trialing', 'active', 'past_due', 'canceled'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 5. PEOPLE & ROSTER TABLES
-- =====================================================================

-- 5.1 TEAMS / TRAINING GROUPS
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    age_category age_category NOT NULL DEFAULT 'senior',
    description TEXT,
    head_coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.2 ATHLETES (Includes Soft Delete: is_deleted, deleted_at, deleted_by)
CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL DEFAULT 'male',
    nationality VARCHAR(100) NOT NULL DEFAULT 'FRA',
    photo_url TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    height_cm NUMERIC(5,2),
    current_weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2),
    weight_category VARCHAR(50) NOT NULL, -- e.g. "60 kg", "67 kg", "77 kg", "87 kg", "97 kg", "130 kg"
    age_category age_category NOT NULL DEFAULT 'senior',
    wrestling_style wrestling_style NOT NULL DEFAULT 'greco_roman',
    dominant_side dominant_side NOT NULL DEFAULT 'right',
    grip_preference VARCHAR(100) DEFAULT 'Over-Under / Underhook',
    experience_level VARCHAR(50) DEFAULT 'National Elite',
    license_number VARCHAR(100),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'injured', 'resting', 'inactive'
    notes TEXT,
    -- Soft Delete
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.3 TEAM MEMBERS (Junction table)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'captain', 'member', 'reserve'
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, athlete_id)
);

-- 5.4 GUARDIANS (Parents / Legal Guardians for Youth & Cadets)
CREATE TABLE IF NOT EXISTS guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(100) NOT NULL DEFAULT 'Parent', -- 'Father', 'Mother', 'Legal Guardian'
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    is_emergency_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.5 ATHLETE GUARDIANS (Junction)
CREATE TABLE IF NOT EXISTS athlete_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'Parent',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    can_pickup BOOLEAN NOT NULL DEFAULT TRUE,
    emergency_priority INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, guardian_id)
);

-- 5.6 DOCUMENTS (Licenses, Medical Certificates, Passports, Expiry tracking)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type document_type NOT NULL DEFAULT 'medical_clearance',
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    issue_date DATE,
    expiry_date DATE, -- Expiration tracking for license / medical certificates
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 6. WEIGHT MANAGEMENT & CUTTING PROTOCOLS
-- =====================================================================

-- 6.1 WEIGHT CLASSES (Official UWW Standards + Custom)
CREATE TABLE IF NOT EXISTS weight_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = Global official UWW standard
    federation VARCHAR(50) NOT NULL DEFAULT 'UWW',
    age_category age_category NOT NULL DEFAULT 'senior',
    gender VARCHAR(20) NOT NULL DEFAULT 'male',
    wrestling_style wrestling_style NOT NULL DEFAULT 'greco_roman',
    name VARCHAR(50) NOT NULL, -- "55 kg", "60 kg", "67 kg", "77 kg", "87 kg", "97 kg", "130 kg"
    min_weight_kg NUMERIC(5,2),
    max_weight_kg NUMERIC(5,2) NOT NULL,
    is_olympic BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.2 WEIGHT RECORDS (Daily, Pre/Post Practice, Tournament Weigh-In)
CREATE TABLE IF NOT EXISTS weight_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2),
    weight_category VARCHAR(50) NOT NULL,
    delta_to_target NUMERIC(5,2),
    weigh_in_type weigh_in_type NOT NULL DEFAULT 'morning_fasted',
    hydration_status hydration_status NOT NULL DEFAULT 'optimal',
    urine_specific_gravity NUMERIC(4,3), -- e.g. 1.015 (hydration biomarker)
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.3 WEIGHT PLANS (Safe Deceleration / Periodized Weight Cut)
CREATE TABLE IF NOT EXISTS weight_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    target_weight_category VARCHAR(50) NOT NULL,
    starting_weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2) NOT NULL,
    target_date DATE NOT NULL,
    safe_weekly_loss_rate_kg NUMERIC(3,2) NOT NULL DEFAULT 0.75, -- Max 1.0kg/week for safety
    calories_target INTEGER,
    nutrition_guidelines TEXT,
    hydration_protocol TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused', 'aborted'
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 7. TRAINING, TECHNIQUES & PERIODIZATION
-- =====================================================================

-- 7.1 EXERCISES (Strength & Conditioning Library)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = System Library
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Greco-Roman Strength',
    muscle_group VARCHAR(100),
    description TEXT,
    equipment VARCHAR(100),
    instructions TEXT,
    video_url TEXT,
    is_system_exercise BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.2 TECHNIQUES (Greco-Roman Curriculum & Scoring System)
CREATE TABLE IF NOT EXISTS techniques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = System Curriculum
    name VARCHAR(200) NOT NULL, -- e.g. 'Ceinture Arrière (Bodylock Souplesse)', 'Arraché (Gut Wrench)', 'Tour de Bras (Arm Throw)'
    wrestling_style wrestling_style NOT NULL DEFAULT 'greco_roman',
    position VARCHAR(100) NOT NULL DEFAULT 'neutral_standing', -- 'neutral_standing', 'par_terre_top', 'par_terre_bottom', 'clinch_over_under'
    difficulty VARCHAR(50) NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'elite_olympic'
    points_potential INTEGER DEFAULT 4, -- 1, 2, 4, 5 points in UWW rules
    key_cues TEXT[] DEFAULT '{}',
    counters TEXT[] DEFAULT '{}',
    defense_guidelines TEXT,
    video_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.3 TRAINING PLANS (Periodized Macrocycles & Mesocycles)
CREATE TABLE IF NOT EXISTS training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    phase VARCHAR(100) NOT NULL DEFAULT 'Pre-Competition Peak',
    macrocycle_phase VARCHAR(100) DEFAULT 'Specific Preparation',
    description TEXT,
    target_category age_category DEFAULT 'senior',
    target_focus VARCHAR(100) DEFAULT 'Par Terre Defense & Explosive Throws',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.4 TRAINING SESSIONS
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    training_plan_id UUID REFERENCES training_plans(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME DEFAULT '17:30:00',
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    category VARCHAR(100) NOT NULL DEFAULT 'Mat Specific & Par Terre',
    session_type VARCHAR(100) DEFAULT 'Greco-Roman Live Drills',
    intensity_rpe INTEGER NOT NULL DEFAULT 8 CHECK (intensity_rpe BETWEEN 1 AND 10),
    rpe_target INTEGER DEFAULT 8,
    lead_coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    objectives TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7.5 SESSION EXERCISES
CREATE TABLE IF NOT EXISTS session_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
    technique_id UUID REFERENCES techniques(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) DEFAULT 'Greco Technique',
    sets INTEGER NOT NULL DEFAULT 4,
    reps VARCHAR(50) NOT NULL DEFAULT '6',
    weight_load VARCHAR(50),
    duration_seconds INTEGER,
    rest_seconds INTEGER NOT NULL DEFAULT 90,
    intensity_rpe INTEGER NOT NULL DEFAULT 8,
    display_order INTEGER NOT NULL DEFAULT 0,
    instructions TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility alias
CREATE OR REPLACE VIEW training_exercises AS
  SELECT id, training_session_id, name, category, sets, reps, weight_load, duration_seconds, rest_seconds, intensity_rpe, instructions, NULL::text as video_url, display_order
  FROM session_exercises;

-- 7.6 SESSION LOGS (Individual sRPE, duration, Load = duration * RPE)
CREATE TABLE IF NOT EXISTS session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    rpe INTEGER NOT NULL CHECK (rpe BETWEEN 1 AND 10),
    session_load INTEGER GENERATED ALWAYS AS (duration_minutes * rpe) STORED, -- Foster sRPE Training Load (Arbitrary Units)
    completion_status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'assigned', 'completed', 'modified', 'skipped'
    athlete_feedback_rpe INTEGER CHECK (athlete_feedback_rpe BETWEEN 1 AND 10),
    athlete_notes TEXT,
    coach_notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (training_session_id, athlete_id)
);

-- Backwards compatibility alias
CREATE OR REPLACE VIEW training_assignments AS
  SELECT id, training_session_id, athlete_id, completion_status, athlete_feedback_rpe, athlete_notes
  FROM session_logs;

-- 7.7 WELLNESS CHECKS (Daily Morning Readiness)
CREATE TABLE IF NOT EXISTS wellness_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_quality INTEGER NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
    fatigue_level INTEGER NOT NULL CHECK (fatigue_level BETWEEN 1 AND 10), -- 10 = fresh, 1 = exhausted
    muscle_soreness INTEGER NOT NULL CHECK (muscle_soreness BETWEEN 1 AND 10),
    stress_level INTEGER NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
    resting_heart_rate INTEGER,
    hrv_rmssd NUMERIC(5,1),
    soreness_body_parts TEXT[] DEFAULT '{}',
    readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, check_date)
);

-- =====================================================================
-- 8. ATTENDANCE
-- =====================================================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    training_session_id UUID REFERENCES training_sessions(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'present',
    reason TEXT,
    arrival_time TIME,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(athlete_id, attendance_date, training_session_id)
);

-- Backwards compatibility view for attendance
CREATE OR REPLACE VIEW attendance AS
  SELECT id, organization_id, athlete_id, training_session_id, attendance_date, status, reason, recorded_by, created_at
  FROM attendance_records;

-- =====================================================================
-- 9. COMPETITIONS, MATCHES & TACTICAL ANALYSIS
-- =====================================================================

-- 9.1 OPPONENTS (Scouting & Video Dossiers)
CREATE TABLE IF NOT EXISTS opponents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'GEO',
    club VARCHAR(150),
    weight_category VARCHAR(50) NOT NULL,
    wrestling_style wrestling_style NOT NULL DEFAULT 'greco_roman',
    dominant_side dominant_side DEFAULT 'right',
    favorite_attacks TEXT[] DEFAULT '{}',
    par_terre_tendencies TEXT,
    scouting_notes TEXT,
    video_links TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.2 COMPETITIONS (UWW International & Domestic Tournaments)
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    competition_type VARCHAR(100) NOT NULL DEFAULT 'International Tournament',
    tier VARCHAR(50) NOT NULL DEFAULT 'International',
    location VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'FRA',
    city VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    organizer VARCHAR(150) NOT NULL DEFAULT 'United World Wrestling (UWW)',
    uww_sanctioned BOOLEAN NOT NULL DEFAULT TRUE,
    weigh_in_datetime TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.3 COMPETITION ENTRIES (Athlete tournament rosters & Medals)
CREATE TABLE IF NOT EXISTS competition_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    weight_category VARCHAR(50) NOT NULL,
    seed_number INTEGER,
    weigh_in_weight_kg NUMERIC(5,2),
    weigh_in_passed BOOLEAN NOT NULL DEFAULT TRUE,
    final_placement INTEGER,
    medal VARCHAR(20) CHECK (medal IN ('gold', 'silver', 'bronze', 'none')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (competition_id, athlete_id)
);

-- 9.4 MATCHES (Detailed Bout Analytics)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES opponents(id) ON DELETE SET NULL,
    opponent_name VARCHAR(150) NOT NULL,
    opponent_country VARCHAR(100) NOT NULL DEFAULT 'GEO',
    opponent_club VARCHAR(150),
    weight_category VARCHAR(50) NOT NULL,
    round_name VARCHAR(100) NOT NULL DEFAULT 'Quarter-Final',
    match_date DATE NOT NULL DEFAULT CURRENT_DATE,
    match_order INTEGER,
    mat_number VARCHAR(10),
    result match_result_type NOT NULL,
    is_win BOOLEAN NOT NULL DEFAULT TRUE,
    athlete_score INTEGER NOT NULL DEFAULT 0,
    opponent_score INTEGER NOT NULL DEFAULT 0,
    period1_score_athlete INTEGER NOT NULL DEFAULT 0,
    period1_score_opponent INTEGER NOT NULL DEFAULT 0,
    period2_score_athlete INTEGER NOT NULL DEFAULT 0,
    period2_score_opponent INTEGER NOT NULL DEFAULT 0,
    match_duration_seconds INTEGER NOT NULL DEFAULT 360,
    -- Greco-Roman Action Analytics
    takedown_attempts INTEGER NOT NULL DEFAULT 0,
    takedown_success INTEGER NOT NULL DEFAULT 0,
    takedown_defense_success INTEGER NOT NULL DEFAULT 0,
    throws_executed INTEGER NOT NULL DEFAULT 0,
    gut_wrench_executed INTEGER NOT NULL DEFAULT 0,
    par_terre_lifts INTEGER NOT NULL DEFAULT 0,
    passivity_calls_received INTEGER NOT NULL DEFAULT 0,
    passivity_calls_opponent INTEGER NOT NULL DEFAULT 0,
    cautions_received INTEGER NOT NULL DEFAULT 0,
    reversals INTEGER NOT NULL DEFAULT 0,
    coach_tactical_notes TEXT,
    video_analysis_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9.5 MATCH EVENTS (Point-by-point timeline)
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    period INTEGER NOT NULL CHECK (period IN (1, 2)),
    timestamp_seconds INTEGER NOT NULL,
    event_type match_event_type NOT NULL,
    points_scored INTEGER NOT NULL DEFAULT 0,
    awarded_to VARCHAR(20) NOT NULL CHECK (awarded_to IN ('athlete', 'opponent')),
    description TEXT,
    video_timestamp_sec INTEGER,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 10. HEALTH, INJURIES & RETURN TO PLAY
-- =====================================================================

-- 10.1 INJURIES
CREATE TABLE IF NOT EXISTS injuries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    injury_name VARCHAR(200) NOT NULL,
    body_area VARCHAR(100) NOT NULL, -- e.g. "Cervical Neck", "Right Shoulder / Rotator", "Rib Cartilage", "Knee ACL/MCL"
    severity injury_severity NOT NULL DEFAULT 'moderate',
    occurred_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    initial_treatment TEXT,
    status injury_status NOT NULL DEFAULT 'active',
    restrictions TEXT, -- e.g. "No Live Par Terre Throws, Light Pummeling Only"
    estimated_days_out INTEGER,
    return_to_mat_date DATE,
    cleared_date DATE,
    cleared_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    medical_staff_notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.2 INJURY NOTES (Multidisciplinary Medical Logs)
CREATE TABLE IF NOT EXISTS injury_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    injury_id UUID NOT NULL REFERENCES injuries(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    note_type VARCHAR(50) NOT NULL DEFAULT 'progress_note', -- 'progress_note', 'treatment', 'medical_imaging', 'physio_evaluation', 'doctor_clearance'
    notes TEXT NOT NULL,
    pain_scale INTEGER CHECK (pain_scale BETWEEN 0 AND 10),
    mobility_assessment TEXT,
    attachment_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10.3 RETURN TO PLAY STEPS (Phased Protocol)
CREATE TABLE IF NOT EXISTS return_to_play_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    injury_id UUID NOT NULL REFERENCES injuries(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(150) NOT NULL, -- e.g. 'Stage 1: Isometric Neck & Mobility', 'Stage 2: Light Pummeling & Non-impact Drills', 'Stage 3: Full Mat Return'
    description TEXT,
    criteria TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 11. PHYSICAL ASSESSMENTS & GOALS
-- =====================================================================

-- 11.1 TEST TEMPLATES (Physical Testing Catalog)
CREATE TABLE IF NOT EXISTS test_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = System Benchmark Test
    name VARCHAR(200) NOT NULL,
    category test_category NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- "cm", "kg", "seconds", "reps", "level", "W/kg"
    measurement_type VARCHAR(50) NOT NULL DEFAULT 'numeric',
    performance_direction performance_direction NOT NULL DEFAULT 'higher_is_better',
    min_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_value NUMERIC(10,2) NOT NULL DEFAULT 100,
    scoring_method VARCHAR(50) NOT NULL DEFAULT 'normalized',
    benchmark_value NUMERIC(10,2), -- Target elite benchmark for senior wrestling
    instructions TEXT,
    video_url TEXT,
    is_system_test BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility alias for tests
CREATE OR REPLACE VIEW tests AS
  SELECT id, organization_id, name, category, description, unit, measurement_type, performance_direction, min_value, max_value, scoring_method, instructions, video_url, is_system_test, is_active, created_at, updated_at
  FROM test_templates;

-- 11.2 TEST SESSIONS
CREATE TABLE IF NOT EXISTS test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location VARCHAR(200) DEFAULT 'National Training Center / Mat 1',
    lead_coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'planned', 'in_progress', 'completed'
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Test session tests junction
CREATE TABLE IF NOT EXISTS test_session_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES test_templates(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    UNIQUE(test_session_id, test_id)
);

-- 11.3 TEST RESULTS
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES test_templates(id) ON DELETE CASCADE,
    test_session_id UUID REFERENCES test_sessions(id) ON DELETE SET NULL,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    raw_value NUMERIC(10,2) NOT NULL,
    calculated_score NUMERIC(5,2), -- 0 to 100 normalized score
    previous_value NUMERIC(10,2),
    improvement_percentage NUMERIC(6,2),
    is_personal_best BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    media_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11.4 ASSESSMENTS (Greco-Roman Specific Technical, Tactical & Mental Rubrics)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scale_type VARCHAR(20) NOT NULL DEFAULT '1_to_10',
    -- Technical (Greco-Roman specific)
    takedown_technique NUMERIC(4,2),
    throwing_technique NUMERIC(4,2), -- Souplesse, arm throws, chest throws
    clinch_underhook NUMERIC(4,2),   -- Pummeling, body lock control
    ground_par_terre_offense NUMERIC(4,2), -- Gut wrench, roll, lift
    positioning_stance NUMERIC(4,2),
    -- Defense
    takedown_defense NUMERIC(4,2),
    ground_par_terre_defense NUMERIC(4,2),
    clinch_pummeling_defense NUMERIC(4,2),
    balance_recovery NUMERIC(4,2),
    -- Physical Wrestling Attributes
    explosiveness NUMERIC(4,2),
    grip_endurance NUMERIC(4,2),
    isometric_trunk_strength NUMERIC(4,2),
    anaerobic_power NUMERIC(4,2),
    -- Tactical & Match Sense
    passivity_management NUMERIC(4,2), -- Critical in Greco-Roman rules
    mat_zone_control NUMERIC(4,2),
    decision_making NUMERIC(4,2),
    period_tempo_strategy NUMERIC(4,2),
    -- Mental & Behavioral
    discipline NUMERIC(4,2),
    grit_mental_toughness NUMERIC(4,2),
    coachability NUMERIC(4,2),
    competition_focus NUMERIC(4,2),
    -- Overall calculated score
    overall_technical_score NUMERIC(5,2),
    overall_wrestling_score NUMERIC(5,2),
    strengths TEXT,
    areas_for_improvement TEXT,
    coach_feedback TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility alias for wrestling_assessments
CREATE OR REPLACE VIEW wrestling_assessments AS
  SELECT * FROM assessments;

-- 11.5 GOALS (Target Milestones)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category goal_category NOT NULL DEFAULT 'competition_medal',
    target_date DATE NOT NULL,
    current_value NUMERIC(10,2),
    target_value NUMERIC(10,2),
    unit VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'not_started', 'in_progress', 'achieved', 'abandoned'
    action_plan TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 12. PLATFORM & COLLABORATION TABLES
-- =====================================================================

-- 12.1 REPORTS (PDF & Performance Census)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    report_type VARCHAR(100) NOT NULL DEFAULT 'athlete_performance',
    date_range_start DATE,
    date_range_end DATE,
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    pdf_url TEXT,
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.2 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'general',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    link_to TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.3 ANNOUNCEMENTS (Club & Team Bulletins)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.4 CALENDAR EVENTS (Training, Competitions, Weigh-Ins, Camps)
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'training',
    description TEXT,
    location VARCHAR(200),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.5 AUDIT LOGS (Platform activity trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12.6 AI CONVERSATIONS & USAGE
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL DEFAULT 'Greco-Roman Performance Assistant',
    context_type VARCHAR(100) NOT NULL DEFAULT 'general_coach_chat',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    citations JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    model_name VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-pro',
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost_usd NUMERIC(8,5) NOT NULL DEFAULT 0,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 13. AUTOMATED TRIGGERS (Updated_at + Generic Audit Logs)
-- =====================================================================

DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY[
    'plans', 'profiles', 'organizations', 'memberships', 'invitations', 'subscriptions',
    'teams', 'athletes', 'team_members', 'guardians', 'athlete_guardians', 'documents',
    'weight_classes', 'weight_records', 'weight_plans',
    'exercises', 'techniques', 'training_plans', 'training_sessions', 'session_exercises', 'session_logs', 'wellness_checks',
    'attendance_records',
    'opponents', 'competitions', 'competition_entries', 'matches', 'match_events',
    'injuries', 'injury_notes', 'return_to_play_steps',
    'test_templates', 'test_sessions', 'test_results', 'assessments', 'goals',
    'reports', 'notifications', 'announcements', 'calendar_events',
    'ai_conversations', 'ai_messages'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', t);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();', t);
  END LOOP;
END $$;

-- Generic Audit Log Trigger Function
CREATE OR REPLACE FUNCTION trigger_audit_log_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_res_id VARCHAR(100);
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_org_id := OLD.organization_id;
    v_res_id := OLD.id::text;
  ELSE
    v_org_id := NEW.organization_id;
    v_res_id := NEW.id::text;
  END IF;

  INSERT INTO audit_logs (
    organization_id, 
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    details, 
    created_at
  )
  VALUES (
    v_org_id,
    auth.uid(),
    TG_TABLE_NAME || '.' || lower(TG_OP),
    TG_TABLE_NAME,
    v_res_id,
    jsonb_build_object(
      'op', TG_OP,
      'at', NOW()
    ),
    NOW()
  );

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit Log Triggers to Core Clinical & High-Impact Tables
DO $$
DECLARE
  t text;
  core_audit_tables text[] := ARRAY[
    'athletes', 'injuries', 'weight_records', 'matches', 
    'memberships', 'training_plans', 'assessments'
  ];
BEGIN
  FOREACH t IN ARRAY core_audit_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_log ON %I;', t);
    EXECUTE format('CREATE TRIGGER trg_audit_log AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_audit_log_entry();', t);
  END LOOP;
END $$;

-- =====================================================================
-- 14. HIGH PERFORMANCE INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_memberships_org_user ON memberships(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);
CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_athletes_org ON athletes(organization_id);
CREATE INDEX IF NOT EXISTS idx_athletes_team ON athletes(team_id);
CREATE INDEX IF NOT EXISTS idx_athletes_weight ON athletes(weight_category);
CREATE INDEX IF NOT EXISTS idx_athletes_is_deleted ON athletes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_athlete ON team_members(athlete_id);
CREATE INDEX IF NOT EXISTS idx_documents_athlete ON documents(athlete_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_weight_records_athlete ON weight_records(athlete_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_plans_athlete ON weight_plans(athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_org ON training_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_org_date ON training_sessions(organization_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON session_exercises(training_session_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_session_athlete ON session_logs(training_session_id, athlete_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_athlete ON session_logs(athlete_id);
CREATE INDEX IF NOT EXISTS idx_wellness_checks_athlete_date ON wellness_checks(athlete_id, check_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_athlete_date ON attendance_records(athlete_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(training_session_id);
CREATE INDEX IF NOT EXISTS idx_competitions_org_date ON competitions(organization_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_athlete ON matches(athlete_id);
CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_injuries_athlete_status ON injuries(athlete_id, status);
CREATE INDEX IF NOT EXISTS idx_injury_notes_injury ON injury_notes(injury_id);
CREATE INDEX IF NOT EXISTS idx_rtp_steps_injury ON return_to_play_steps(injury_id, step_order);
CREATE INDEX IF NOT EXISTS idx_test_results_athlete ON test_results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_session ON test_results(test_session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_athlete ON assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_goals_athlete ON goals(athlete_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_calendar_events_org_time ON calendar_events(organization_id, start_time);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org_user ON ai_conversations(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id);

-- =====================================================================
-- 15. ANALYTICAL VIEWS & RPC FUNCTIONS
-- =====================================================================

-- 15.1 VIEW: athlete_overview
CREATE OR REPLACE VIEW athlete_overview AS
SELECT 
  a.id AS athlete_id,
  a.organization_id,
  a.first_name,
  a.last_name,
  (a.first_name || ' ' || a.last_name) AS full_name,
  a.photo_url,
  a.date_of_birth,
  DATE_PART('year', AGE(CURRENT_DATE, a.date_of_birth))::INTEGER AS age,
  a.gender,
  a.nationality,
  a.weight_category,
  a.current_weight_kg,
  a.target_weight_kg,
  (a.current_weight_kg - COALESCE(a.target_weight_kg, a.current_weight_kg)) AS weight_delta,
  a.age_category,
  a.wrestling_style,
  a.dominant_side,
  a.status AS athlete_status,
  t.id AS team_id,
  t.name AS team_name,
  COALESCE(inj.active_injuries_count, 0)::INTEGER AS active_injuries_count,
  COALESCE(m.total_matches, 0)::INTEGER AS total_matches,
  COALESCE(m.wins, 0)::INTEGER AS wins,
  COALESCE(m.losses, 0)::INTEGER AS losses,
  CASE WHEN COALESCE(m.total_matches, 0) > 0 
       THEN ROUND((m.wins::NUMERIC / m.total_matches::NUMERIC) * 100, 1) 
       ELSE 0.0 END AS win_rate_percentage,
  COALESCE(att.attendance_percentage, 100.0) AS attendance_rate_90d,
  ass.overall_wrestling_score AS latest_wrestling_score,
  ass.overall_technical_score AS latest_technical_score
FROM athletes a
LEFT JOIN teams t ON a.team_id = t.id
LEFT JOIN (
  SELECT athlete_id, COUNT(*) AS active_injuries_count
  FROM injuries
  WHERE status IN ('active', 'recovering', 'restricted')
  GROUP BY athlete_id
) inj ON a.id = inj.athlete_id
LEFT JOIN (
  SELECT 
    athlete_id,
    COUNT(*) AS total_matches,
    COUNT(*) FILTER (WHERE is_win = TRUE) AS wins,
    COUNT(*) FILTER (WHERE is_win = FALSE) AS losses
  FROM matches
  GROUP BY athlete_id
) m ON a.id = m.athlete_id
LEFT JOIN (
  SELECT 
    athlete_id,
    ROUND(
      (COUNT(*) FILTER (WHERE status IN ('present', 'late'))::NUMERIC / 
       NULLIF(COUNT(*), 0)::NUMERIC) * 100, 1
    ) AS attendance_percentage
  FROM attendance_records
  WHERE attendance_date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY athlete_id
) att ON a.id = att.athlete_id
LEFT JOIN LATERAL (
  SELECT overall_wrestling_score, overall_technical_score
  FROM assessments
  WHERE athlete_id = a.id
  ORDER BY assessment_date DESC, created_at DESC
  LIMIT 1
) ass ON TRUE
WHERE a.is_deleted = FALSE;

-- 15.2 RPC: weekly_training_load (ACWR 7:28 - Acute to Chronic Workload Ratio)
CREATE OR REPLACE FUNCTION get_weekly_training_load(p_org_id UUID, p_athlete_id UUID DEFAULT NULL)
RETURNS TABLE (
  athlete_id UUID,
  athlete_name TEXT,
  acute_load NUMERIC,
  chronic_load NUMERIC,
  acwr NUMERIC,
  risk_category TEXT,
  last_session_date DATE
) AS $$
BEGIN
  RETURN QUERY
  WITH athlete_load_7d AS (
    SELECT 
      sl.athlete_id,
      COALESCE(SUM(sl.session_load), 0)::NUMERIC AS acute
    FROM session_logs sl
    JOIN training_sessions ts ON sl.training_session_id = ts.id
    WHERE sl.organization_id = p_org_id
      AND (p_athlete_id IS NULL OR sl.athlete_id = p_athlete_id)
      AND ts.session_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY sl.athlete_id
  ),
  athlete_load_28d AS (
    SELECT 
      sl.athlete_id,
      ROUND((COALESCE(SUM(sl.session_load), 0)::NUMERIC / 4.0), 1) AS chronic,
      MAX(ts.session_date) AS max_date
    FROM session_logs sl
    JOIN training_sessions ts ON sl.training_session_id = ts.id
    WHERE sl.organization_id = p_org_id
      AND (p_athlete_id IS NULL OR sl.athlete_id = p_athlete_id)
      AND ts.session_date >= CURRENT_DATE - INTERVAL '28 days'
    GROUP BY sl.athlete_id
  )
  SELECT 
    a.id AS athlete_id,
    (a.first_name || ' ' || a.last_name)::TEXT AS athlete_name,
    COALESCE(l7.acute, 0.0) AS acute_load,
    COALESCE(l28.chronic, 0.0) AS chronic_load,
    CASE 
      WHEN COALESCE(l28.chronic, 0) = 0 THEN 0.0
      ELSE ROUND((COALESCE(l7.acute, 0.0) / l28.chronic), 2)
    END AS acwr,
    CASE
      WHEN COALESCE(l28.chronic, 0) = 0 THEN 'insufficient_data'
      WHEN (COALESCE(l7.acute, 0.0) / l28.chronic) < 0.8 THEN 'undertrained'
      WHEN (COALESCE(l7.acute, 0.0) / l28.chronic) BETWEEN 0.8 AND 1.3 THEN 'optimal'
      WHEN (COALESCE(l7.acute, 0.0) / l28.chronic) BETWEEN 1.31 AND 1.5 THEN 'danger_zone'
      ELSE 'high_spike'
    END AS risk_category,
    l28.max_date AS last_session_date
  FROM athletes a
  LEFT JOIN athlete_load_7d l7 ON a.id = l7.athlete_id
  LEFT JOIN athlete_load_28d l28 ON a.id = l28.athlete_id
  WHERE a.organization_id = p_org_id
    AND a.is_deleted = FALSE
    AND (p_athlete_id IS NULL OR a.id = p_athlete_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15.3 RPC: weight_trend (Daily Records + 7-Day Moving Average)
CREATE OR REPLACE FUNCTION get_weight_trend(p_athlete_id UUID, p_days INTEGER DEFAULT 60)
RETURNS TABLE (
  record_date DATE,
  weight_kg NUMERIC,
  target_weight_kg NUMERIC,
  delta_to_target NUMERIC,
  rolling_7d_avg_weight NUMERIC,
  weigh_in_type weigh_in_type,
  hydration_status hydration_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wr.record_date,
    wr.weight_kg,
    wr.target_weight_kg,
    wr.delta_to_target,
    ROUND(AVG(wr.weight_kg) OVER (
      PARTITION BY wr.athlete_id 
      ORDER BY wr.record_date 
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 2) AS rolling_7d_avg_weight,
    wr.weigh_in_type,
    wr.hydration_status
  FROM weight_records wr
  WHERE wr.athlete_id = p_athlete_id
    AND wr.record_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  ORDER BY wr.record_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15.4 RPC: attendance_rate
CREATE OR REPLACE FUNCTION get_attendance_rate(
  p_org_id UUID, 
  p_team_id UUID DEFAULT NULL, 
  p_start_date DATE DEFAULT NULL, 
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  athlete_id UUID,
  athlete_name TEXT,
  team_name TEXT,
  total_sessions INTEGER,
  present_count INTEGER,
  absent_count INTEGER,
  excused_count INTEGER,
  late_count INTEGER,
  attendance_percentage NUMERIC
) AS $$
DECLARE
  v_start DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '60 days');
  v_end DATE := COALESCE(p_end_date, CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS athlete_id,
    (a.first_name || ' ' || a.last_name)::TEXT AS athlete_name,
    COALESCE(t.name, 'Unassigned')::TEXT AS team_name,
    COUNT(ar.id)::INTEGER AS total_sessions,
    COUNT(ar.id) FILTER (WHERE ar.status = 'present')::INTEGER AS present_count,
    COUNT(ar.id) FILTER (WHERE ar.status = 'absent')::INTEGER AS absent_count,
    COUNT(ar.id) FILTER (WHERE ar.status = 'excused')::INTEGER AS excused_count,
    COUNT(ar.id) FILTER (WHERE ar.status = 'late')::INTEGER AS late_count,
    CASE 
      WHEN COUNT(ar.id) = 0 THEN 100.0
      ELSE ROUND((COUNT(ar.id) FILTER (WHERE ar.status IN ('present', 'late'))::NUMERIC / COUNT(ar.id)::NUMERIC) * 100, 1)
    END AS attendance_percentage
  FROM athletes a
  LEFT JOIN teams t ON a.team_id = t.id
  LEFT JOIN attendance_records ar ON a.id = ar.athlete_id AND ar.attendance_date BETWEEN v_start AND v_end
  WHERE a.organization_id = p_org_id
    AND a.is_deleted = FALSE
    AND (p_team_id IS NULL OR a.team_id = p_team_id)
  GROUP BY a.id, a.first_name, a.last_name, t.name
  ORDER BY attendance_percentage DESC, a.last_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15.5 RPC: medal_table
CREATE OR REPLACE FUNCTION get_medal_table(p_org_id UUID, p_year INTEGER DEFAULT NULL)
RETURNS TABLE (
  athlete_id UUID,
  athlete_name TEXT,
  team_name TEXT,
  weight_category VARCHAR(50),
  gold_count INTEGER,
  silver_count INTEGER,
  bronze_count INTEGER,
  total_medals INTEGER,
  total_matches INTEGER,
  wins INTEGER,
  losses INTEGER,
  win_rate_percentage NUMERIC,
  points_scored INTEGER,
  points_conceded INTEGER
) AS $$
DECLARE
  v_year_start DATE := CASE WHEN p_year IS NOT NULL THEN (p_year || '-01-01')::DATE ELSE '2000-01-01'::DATE END;
  v_year_end DATE := CASE WHEN p_year IS NOT NULL THEN (p_year || '-12-31')::DATE ELSE '2099-12-31'::DATE END;
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS athlete_id,
    (a.first_name || ' ' || a.last_name)::TEXT AS athlete_name,
    COALESCE(t.name, 'National Team')::TEXT AS team_name,
    a.weight_category,
    COALESCE(COUNT(ce.id) FILTER (WHERE ce.medal = 'gold'), 0)::INTEGER AS gold_count,
    COALESCE(COUNT(ce.id) FILTER (WHERE ce.medal = 'silver'), 0)::INTEGER AS silver_count,
    COALESCE(COUNT(ce.id) FILTER (WHERE ce.medal = 'bronze'), 0)::INTEGER AS bronze_count,
    COALESCE(COUNT(ce.id) FILTER (WHERE ce.medal IN ('gold', 'silver', 'bronze')), 0)::INTEGER AS total_medals,
    COALESCE(COUNT(DISTINCT m.id), 0)::INTEGER AS total_matches,
    COALESCE(COUNT(DISTINCT m.id) FILTER (WHERE m.is_win = TRUE), 0)::INTEGER AS wins,
    COALESCE(COUNT(DISTINCT m.id) FILTER (WHERE m.is_win = FALSE), 0)::INTEGER AS losses,
    CASE 
      WHEN COUNT(DISTINCT m.id) = 0 THEN 0.0
      ELSE ROUND((COUNT(DISTINCT m.id) FILTER (WHERE m.is_win = TRUE)::NUMERIC / COUNT(DISTINCT m.id)::NUMERIC) * 100, 1)
    END AS win_rate_percentage,
    COALESCE(SUM(m.athlete_score), 0)::INTEGER AS points_scored,
    COALESCE(SUM(m.opponent_score), 0)::INTEGER AS points_conceded
  FROM athletes a
  LEFT JOIN teams t ON a.team_id = t.id
  LEFT JOIN competition_entries ce ON a.id = ce.athlete_id
  LEFT JOIN competitions c ON ce.competition_id = c.id AND c.start_date BETWEEN v_year_start AND v_year_end
  LEFT JOIN matches m ON a.id = m.athlete_id AND (c.id IS NULL OR m.competition_id = c.id)
  WHERE a.organization_id = p_org_id
    AND a.is_deleted = FALSE
  GROUP BY a.id, a.first_name, a.last_name, t.name, a.weight_category
  HAVING COUNT(ce.id) FILTER (WHERE ce.medal IN ('gold', 'silver', 'bronze')) > 0 OR COUNT(DISTINCT m.id) > 0
  ORDER BY gold_count DESC, silver_count DESC, bronze_count DESC, total_matches DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
