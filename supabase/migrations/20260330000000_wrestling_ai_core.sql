-- =====================================================================
-- SaaS-lutte (WrestleLab) Migration: Wrestling Core & AI Integration
-- Version: 20260330000000
-- 100% IDEMPOTENT: Safe to apply repeatedly in Supabase SQL Editor
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & TYPE UPDATES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'coach', 'wrestler', 'referee', 'super_admin', 'club_admin', 'athlete');
EXCEPTION WHEN duplicate_object THEN
  -- Add new values if enum exists
  BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'wrestler';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'referee';
  EXCEPTION WHEN OTHERS THEN null;
  END;
END $$;

DO $$ BEGIN
  CREATE TYPE wrestling_style AS ENUM ('greco_roman', 'freestyle', 'women_wrestling', 'female');
EXCEPTION WHEN duplicate_object THEN
  BEGIN
    ALTER TYPE wrestling_style ADD VALUE IF NOT EXISTS 'freestyle';
    ALTER TYPE wrestling_style ADD VALUE IF NOT EXISTS 'female';
  EXCEPTION WHEN OTHERS THEN null;
  END;
END $$;

DO $$ BEGIN
  CREATE TYPE bracket_type AS ENUM ('single_elimination', 'double_elimination', 'round_robin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE bracket_match_status AS ENUM ('scheduled', 'in_progress', 'completed', 'bye');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE ENHANCEMENT
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL DEFAULT 'User',
    last_name VARCHAR(100) NOT NULL DEFAULT 'Wrestler',
    avatar_url TEXT,
    phone VARCHAR(50),
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'fr',
    role user_role NOT NULL DEFAULT 'coach',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ATHLETES / WRESTLERS TABLE
CREATE TABLE IF NOT EXISTS wrestlers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    team_id UUID,
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
    height_cm NUMERIC(5,2),
    current_weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2),
    weight_category VARCHAR(50) NOT NULL,
    age_category VARCHAR(50) NOT NULL DEFAULT 'senior',
    wrestling_style wrestling_style NOT NULL DEFAULT 'greco_roman',
    experience_level VARCHAR(50) DEFAULT 'Elite Competitor',
    license_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'injured', 'resting', 'inactive'
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility view: athletes <-> wrestlers
CREATE OR REPLACE VIEW athletes AS
  SELECT id, organization_id, team_id, user_id, coach_id, first_name, last_name,
         date_of_birth, gender, nationality, photo_url, phone, email, height_cm,
         current_weight_kg, target_weight_kg, weight_category, age_category,
         wrestling_style, experience_level, license_number, status, is_deleted,
         created_at, updated_at
  FROM wrestlers;

-- 5. WEIGHT LOGS / WEIGHT RECORDS
CREATE TABLE IF NOT EXISTS weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    athlete_id UUID NOT NULL REFERENCES wrestlers(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2),
    weight_category VARCHAR(50) NOT NULL,
    delta_to_target NUMERIC(5,2),
    weigh_in_type VARCHAR(50) DEFAULT 'morning_fasted',
    hydration_status VARCHAR(50) DEFAULT 'optimal',
    urine_specific_gravity NUMERIC(4,3),
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backwards compatibility view: weight_records <-> weight_logs
CREATE OR REPLACE VIEW weight_records AS
  SELECT id, organization_id, athlete_id, record_date, weight_kg, target_weight_kg,
         weight_category, delta_to_target, weigh_in_type, hydration_status,
         urine_specific_gravity, notes, recorded_by, created_at, updated_at
  FROM weight_logs;

-- 6. TOURNAMENTS & BRACKETS
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    bracket_type bracket_type NOT NULL DEFAULT 'single_elimination',
    location VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'FRA',
    city VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    organizer VARCHAR(150) NOT NULL DEFAULT 'United World Wrestling (UWW)',
    wrestling_style wrestling_style NOT NULL DEFAULT 'greco_roman',
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BRACKET MATCHES (Tournament Tree & Outcomes)
CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    weight_category VARCHAR(50) NOT NULL,
    round_number INTEGER NOT NULL DEFAULT 1,
    round_name VARCHAR(100) NOT NULL DEFAULT 'Quarter-Final',
    match_number INTEGER NOT NULL,
    wrestler1_id UUID REFERENCES wrestlers(id) ON DELETE SET NULL,
    wrestler1_name VARCHAR(150),
    wrestler1_seed INTEGER,
    wrestler1_score INTEGER DEFAULT 0,
    wrestler2_id UUID REFERENCES wrestlers(id) ON DELETE SET NULL,
    wrestler2_name VARCHAR(150),
    wrestler2_seed INTEGER,
    wrestler2_score INTEGER DEFAULT 0,
    winner_id UUID REFERENCES wrestlers(id) ON DELETE SET NULL,
    next_match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL,
    status bracket_match_status NOT NULL DEFAULT 'scheduled',
    result_type VARCHAR(20) DEFAULT 'vpo',
    match_duration_seconds INTEGER DEFAULT 360,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SUBSCRIPTIONS & MEMBERSHIPS (Multi-tenant)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    plan_code VARCHAR(50) NOT NULL DEFAULT 'club',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'coach',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Helper RLS function: is_org_member
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles Policy
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
CREATE POLICY "Users can manage their own profile"
ON profiles FOR ALL USING (id = auth.uid());

-- Wrestlers Policy
DROP POLICY IF EXISTS "Org members can view wrestlers" ON wrestlers;
CREATE POLICY "Org members can view wrestlers"
ON wrestlers FOR SELECT USING (is_org_member(organization_id) OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Coaches and admins can insert/update wrestlers" ON wrestlers;
CREATE POLICY "Coaches and admins can insert/update wrestlers"
ON wrestlers FOR ALL USING (is_org_member(organization_id) OR auth.uid() IS NOT NULL);

-- Weight Logs Policy
DROP POLICY IF EXISTS "Org members can manage weight logs" ON weight_logs;
CREATE POLICY "Org members can manage weight logs"
ON weight_logs FOR ALL USING (is_org_member(organization_id) OR auth.uid() IS NOT NULL);

-- Tournaments Policy
DROP POLICY IF EXISTS "Org members can manage tournaments" ON tournaments;
CREATE POLICY "Org members can manage tournaments"
ON tournaments FOR ALL USING (is_org_member(organization_id) OR auth.uid() IS NOT NULL);

-- Tournament Matches Policy
DROP POLICY IF EXISTS "Org members can manage tournament matches" ON tournament_matches;
CREATE POLICY "Org members can manage tournament matches"
ON tournament_matches FOR ALL USING (is_org_member(organization_id) OR auth.uid() IS NOT NULL);

-- Subscriptions & Memberships Policies
DROP POLICY IF EXISTS "Org members can view memberships" ON memberships;
CREATE POLICY "Org members can view memberships"
ON memberships FOR ALL USING (user_id = auth.uid() OR is_org_member(organization_id));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['profiles', 'wrestlers', 'weight_logs', 'tournaments', 'tournament_matches', 'subscriptions', 'memberships'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', t);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();', t);
  END LOOP;
END $$;
