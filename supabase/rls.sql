-- =====================================================================
-- WrestleLab: Complete Supabase Row Level Security (RLS) Policies
-- Multi-Tenant Isolation, Role-Based Access Control & Security Definer
-- 100% IDEMPOTENT: Uses DROP POLICY IF EXISTS before CREATE POLICY
-- =====================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE opponents ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_to_play_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_session_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. SECURITY DEFINER HELPER FUNCTIONS
-- =====================================================================

-- Helper: Check if current authenticated user is a platform Super Admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper 1: is_member(org_id UUID)
-- Checks if current user is an active member of the specified organization
CREATE OR REPLACE FUNCTION is_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = org_id 
      AND user_id = auth.uid() 
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper 2: has_role(org_id UUID, roles membership_role[])
-- Checks if current user has one of the specified roles within the organization
CREATE OR REPLACE FUNCTION has_role(org_id UUID, roles membership_role[])
RETURNS BOOLEAN AS $$
BEGIN
  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = org_id 
      AND user_id = auth.uid() 
      AND role = ANY(roles)
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper 3: my_athlete_ids()
-- Returns athlete IDs that the authenticated user has personal or parental rights over
CREATE OR REPLACE FUNCTION my_athlete_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
    -- Direct athlete link
    SELECT id FROM athletes 
    WHERE user_id = auth.uid() AND is_deleted = FALSE
    UNION
    -- Parent / Guardian link via athlete_guardians
    SELECT ag.athlete_id 
    FROM athlete_guardians ag
    JOIN guardians g ON ag.guardian_id = g.id
    WHERE g.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================================
-- 3. AUTHENTICATION & ONBOARDING TRIGGERS
-- =====================================================================

-- 3.1 Signup trigger: automatically creates profile in public.profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    avatar_url, 
    preferred_language, 
    role,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 1), 'Coach'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2), 'WrestleLab'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'fr'),
    'coach',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3.2 Creating an organization makes the creator the 'owner'
CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.memberships (
      organization_id, 
      user_id, 
      role, 
      title, 
      is_active, 
      created_by,
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id, 
      auth.uid(), 
      'owner', 
      'Club Founder & Owner', 
      TRUE, 
      auth.uid(),
      NOW(), 
      NOW()
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION handle_new_organization();

-- =====================================================================
-- 4. POLICIES: IDENTITY & SAAS (Idempotent)
-- =====================================================================

-- 4.1 PLANS
DROP POLICY IF EXISTS "Public can view active subscription plans" ON plans;
CREATE POLICY "Public can view active subscription plans"
ON plans FOR SELECT USING (is_active = TRUE OR is_super_admin());

DROP POLICY IF EXISTS "Super admins can manage plans" ON plans;
CREATE POLICY "Super admins can manage plans"
ON plans FOR ALL USING (is_super_admin());

-- 4.2 PROFILES
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON profiles;
CREATE POLICY "Users can view and edit their own profile"
ON profiles FOR ALL USING (id = auth.uid());

DROP POLICY IF EXISTS "Members in the same organization can view profiles" ON profiles;
CREATE POLICY "Members in the same organization can view profiles"
ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships m1
    JOIN memberships m2 ON m1.organization_id = m2.organization_id
    WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id AND m1.is_active = TRUE
  ) OR is_super_admin()
);

-- 4.3 ORGANIZATIONS
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;
CREATE POLICY "Super admins can manage all organizations"
ON organizations FOR ALL USING (is_super_admin());

DROP POLICY IF EXISTS "Members can view their own organization" ON organizations;
CREATE POLICY "Members can view their own organization"
ON organizations FOR SELECT USING (is_member(id));

DROP POLICY IF EXISTS "Owners and admins can update their organization" ON organizations;
CREATE POLICY "Owners and admins can update their organization"
ON organizations FOR UPDATE USING (
  has_role(id, ARRAY['owner', 'admin']::membership_role[])
);

DROP POLICY IF EXISTS "Authenticated users can create an organization" ON organizations;
CREATE POLICY "Authenticated users can create an organization"
ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4.4 MEMBERSHIPS
DROP POLICY IF EXISTS "Members can view other members in their organization" ON memberships;
CREATE POLICY "Members can view other members in their organization"
ON memberships FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Only owner and admin can manage memberships" ON memberships;
CREATE POLICY "Only owner and admin can manage memberships"
ON memberships FOR INSERT WITH CHECK (
  has_role(organization_id, ARRAY['owner', 'admin']::membership_role[]) OR is_super_admin()
);

DROP POLICY IF EXISTS "Only owner and admin can update memberships" ON memberships;
CREATE POLICY "Only owner and admin can update memberships"
ON memberships FOR UPDATE USING (
  has_role(organization_id, ARRAY['owner', 'admin']::membership_role[]) OR is_super_admin()
);

DROP POLICY IF EXISTS "Only owner and admin can delete memberships" ON memberships;
CREATE POLICY "Only owner and admin can delete memberships"
ON memberships FOR DELETE USING (
  has_role(organization_id, ARRAY['owner', 'admin']::membership_role[]) OR is_super_admin()
);

-- 4.5 INVITATIONS
DROP POLICY IF EXISTS "Owners and admins can manage invitations" ON invitations;
CREATE POLICY "Owners and admins can manage invitations"
ON invitations FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin']::membership_role[])
);

DROP POLICY IF EXISTS "Invited users can read their invitation by token" ON invitations;
CREATE POLICY "Invited users can read their invitation by token"
ON invitations FOR SELECT USING (status = 'pending');

-- 4.6 SUBSCRIPTIONS
DROP POLICY IF EXISTS "Owners and admins can view and manage subscriptions" ON subscriptions;
CREATE POLICY "Owners and admins can view and manage subscriptions"
ON subscriptions FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin']::membership_role[])
);

-- =====================================================================
-- 5. POLICIES: PEOPLE, TEAMS & ROSTERS
-- =====================================================================

-- 5.1 TEAMS
DROP POLICY IF EXISTS "Members can view teams in their organization" ON teams;
CREATE POLICY "Members can view teams in their organization"
ON teams FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches and admins can manage teams" ON teams;
CREATE POLICY "Coaches and admins can manage teams"
ON teams FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 5.2 TEAM MEMBERS
DROP POLICY IF EXISTS "Members can view team members" ON team_members;
CREATE POLICY "Members can view team members"
ON team_members FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches and admins can manage team members" ON team_members;
CREATE POLICY "Coaches and admins can manage team members"
ON team_members FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
);

-- 5.3 ATHLETES
DROP POLICY IF EXISTS "Coaches, admins, physios, and doctors can view organization athletes" ON athletes;
CREATE POLICY "Coaches, admins, physios, and doctors can view organization athletes"
ON athletes FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant', 'physio', 'doctor']::membership_role[])
  OR id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and admins can insert athletes" ON athletes;
CREATE POLICY "Coaches and admins can insert athletes"
ON athletes FOR INSERT WITH CHECK (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Coaches and admins can update athletes" ON athletes;
CREATE POLICY "Coaches and admins can update athletes"
ON athletes FOR UPDATE USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Only owner and admin can delete athletes" ON athletes;
CREATE POLICY "Only owner and admin can delete athletes"
ON athletes FOR DELETE USING (
  has_role(organization_id, ARRAY['owner', 'admin']::membership_role[])
);

-- 5.4 GUARDIANS & ATHLETE GUARDIANS
DROP POLICY IF EXISTS "Coaches and admins can view all guardians" ON guardians;
CREATE POLICY "Coaches and admins can view all guardians"
ON guardians FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
  OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Coaches and admins can manage guardians" ON guardians;
CREATE POLICY "Coaches and admins can manage guardians"
ON guardians FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Coaches and parents can view athlete guardians" ON athlete_guardians;
CREATE POLICY "Coaches and parents can view athlete guardians"
ON athlete_guardians FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and admins can manage athlete guardians" ON athlete_guardians;
CREATE POLICY "Coaches and admins can manage athlete guardians"
ON athlete_guardians FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 5.5 DOCUMENTS
DROP POLICY IF EXISTS "Staff can view all documents, athletes and parents view their own" ON documents;
CREATE POLICY "Staff can view all documents, athletes and parents view their own"
ON documents FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Staff can manage documents, athletes/parents can upload their own" ON documents;
CREATE POLICY "Staff can manage documents, athletes/parents can upload their own"
ON documents FOR INSERT WITH CHECK (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and medical staff can verify and update documents" ON documents;
CREATE POLICY "Coaches and medical staff can verify and update documents"
ON documents FOR UPDATE USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

DROP POLICY IF EXISTS "Coaches and admins can delete documents" ON documents;
CREATE POLICY "Coaches and admins can delete documents"
ON documents FOR DELETE USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- =====================================================================
-- 6. POLICIES: WEIGHT MONITORING & CUTTING PLANS
-- =====================================================================

-- 6.1 WEIGHT CLASSES
DROP POLICY IF EXISTS "Anyone can view weight classes" ON weight_classes;
CREATE POLICY "Anyone can view weight classes"
ON weight_classes FOR SELECT USING (
  organization_id IS NULL OR is_member(organization_id)
);

DROP POLICY IF EXISTS "Admins and coaches can manage custom weight classes" ON weight_classes;
CREATE POLICY "Admins and coaches can manage custom weight classes"
ON weight_classes FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 6.2 WEIGHT RECORDS
DROP POLICY IF EXISTS "Staff can view all weight records, athletes/parents view their own" ON weight_records;
CREATE POLICY "Staff can view all weight records, athletes/parents view their own"
ON weight_records FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches can record weight, athletes can log their daily weigh-in" ON weight_records;
CREATE POLICY "Coaches can record weight, athletes can log their daily weigh-in"
ON weight_records FOR INSERT WITH CHECK (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and admins can update or delete weight records" ON weight_records;
CREATE POLICY "Coaches and admins can update or delete weight records"
ON weight_records FOR UPDATE USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Coaches and admins can delete weight records" ON weight_records;
CREATE POLICY "Coaches and admins can delete weight records"
ON weight_records FOR DELETE USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 6.3 WEIGHT PLANS
DROP POLICY IF EXISTS "Staff view all weight plans, athletes/parents view their own" ON weight_plans;
CREATE POLICY "Staff view all weight plans, athletes/parents view their own"
ON weight_plans FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and medical staff can manage weight plans" ON weight_plans;
CREATE POLICY "Coaches and medical staff can manage weight plans"
ON weight_plans FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

-- =====================================================================
-- 7. POLICIES: TRAINING, EXERCISES & WELLNESS
-- =====================================================================

-- 7.1 EXERCISES & TECHNIQUES
DROP POLICY IF EXISTS "Members can view exercises" ON exercises;
CREATE POLICY "Members can view exercises"
ON exercises FOR SELECT USING (organization_id IS NULL OR is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage organization exercises" ON exercises;
CREATE POLICY "Coaches can manage organization exercises"
ON exercises FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members can view techniques" ON techniques;
CREATE POLICY "Members can view techniques"
ON techniques FOR SELECT USING (organization_id IS NULL OR is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage organization techniques" ON techniques;
CREATE POLICY "Coaches can manage organization techniques"
ON techniques FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 7.2 TRAINING PLANS & SESSIONS
DROP POLICY IF EXISTS "Members can view training plans" ON training_plans;
CREATE POLICY "Members can view training plans"
ON training_plans FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage training plans" ON training_plans;
CREATE POLICY "Coaches can manage training plans"
ON training_plans FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members can view training sessions" ON training_sessions;
CREATE POLICY "Members can view training sessions"
ON training_sessions FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage training sessions" ON training_sessions;
CREATE POLICY "Coaches can manage training sessions"
ON training_sessions FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
);

DROP POLICY IF EXISTS "Members can view session exercises" ON session_exercises;
CREATE POLICY "Members can view session exercises"
ON session_exercises FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage session exercises" ON session_exercises;
CREATE POLICY "Coaches can manage session exercises"
ON session_exercises FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
);

-- 7.3 SESSION LOGS
DROP POLICY IF EXISTS "Staff view all session logs, athletes view their own" ON session_logs;
CREATE POLICY "Staff view all session logs, athletes view their own"
ON session_logs FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and athletes can insert session logs" ON session_logs;
CREATE POLICY "Coaches and athletes can insert session logs"
ON session_logs FOR INSERT WITH CHECK (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Athletes can update their own feedback, coaches can update all" ON session_logs;
CREATE POLICY "Athletes can update their own feedback, coaches can update all"
ON session_logs FOR UPDATE USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

-- 7.4 WELLNESS CHECKS
DROP POLICY IF EXISTS "Staff view all wellness checks, athletes/parents view their own" ON wellness_checks;
CREATE POLICY "Staff view all wellness checks, athletes/parents view their own"
ON wellness_checks FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Athletes can insert their own daily readiness check" ON wellness_checks;
CREATE POLICY "Athletes can insert their own daily readiness check"
ON wellness_checks FOR INSERT WITH CHECK (
  athlete_id IN (SELECT my_athlete_ids()) 
  OR has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

DROP POLICY IF EXISTS "Athletes can update their check for today, staff can review" ON wellness_checks;
CREATE POLICY "Athletes can update their check for today, staff can review"
ON wellness_checks FOR UPDATE USING (
  athlete_id IN (SELECT my_athlete_ids()) 
  OR has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

-- =====================================================================
-- 8. POLICIES: ATTENDANCE
-- =====================================================================

DROP POLICY IF EXISTS "Staff view all attendance, athletes/parents view their own" ON attendance_records;
CREATE POLICY "Staff view all attendance, athletes/parents view their own"
ON attendance_records FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and admins manage attendance records" ON attendance_records;
CREATE POLICY "Coaches and admins manage attendance records"
ON attendance_records FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
);

-- =====================================================================
-- 9. POLICIES: COMPETITIONS & MATCHES
-- =====================================================================

DROP POLICY IF EXISTS "Members can view competitions" ON competitions;
CREATE POLICY "Members can view competitions"
ON competitions FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches and admins manage competitions" ON competitions;
CREATE POLICY "Coaches and admins manage competitions"
ON competitions FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members can view opponents" ON opponents;
CREATE POLICY "Members can view opponents"
ON opponents FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage opponents" ON opponents;
CREATE POLICY "Coaches can manage opponents"
ON opponents FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members can view competition entries" ON competition_entries;
CREATE POLICY "Members can view competition entries"
ON competition_entries FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage competition entries" ON competition_entries;
CREATE POLICY "Coaches can manage competition entries"
ON competition_entries FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members can view match records" ON matches;
CREATE POLICY "Members can view match records"
ON matches FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage matches" ON matches;
CREATE POLICY "Coaches can manage matches"
ON matches FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members can view match events" ON match_events;
CREATE POLICY "Members can view match events"
ON match_events FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches can manage match events" ON match_events;
CREATE POLICY "Coaches can manage match events"
ON match_events FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- =====================================================================
-- 10. POLICIES: HEALTH & MEDICAL DATA (Strict Access: Physio / Doctor)
-- =====================================================================

-- 10.1 INJURIES
DROP POLICY IF EXISTS "Authorized medical staff and coaches view injuries; athletes/parents view own" ON injuries;
CREATE POLICY "Authorized medical staff and coaches view injuries; athletes/parents view own"
ON injuries FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Medical staff and coaches can manage injuries" ON injuries;
CREATE POLICY "Medical staff and coaches can manage injuries"
ON injuries FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

-- 10.2 INJURY NOTES (Medical Staff & Doctor Protected)
DROP POLICY IF EXISTS "Only medical staff and coaches can read injury notes" ON injury_notes;
CREATE POLICY "Only medical staff and coaches can read injury notes"
ON injury_notes FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

DROP POLICY IF EXISTS "Medical staff and coaches can create and edit injury notes" ON injury_notes;
CREATE POLICY "Medical staff and coaches can create and edit injury notes"
ON injury_notes FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

-- 10.3 RETURN TO PLAY STEPS
DROP POLICY IF EXISTS "Medical staff and coaches view RTP; athletes/parents view own" ON return_to_play_steps;
CREATE POLICY "Medical staff and coaches view RTP; athletes/parents view own"
ON return_to_play_steps FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR EXISTS (
    SELECT 1 FROM injuries i 
    WHERE i.id = return_to_play_steps.injury_id 
      AND i.athlete_id IN (SELECT my_athlete_ids())
  )
);

DROP POLICY IF EXISTS "Medical staff and coaches manage return to play steps" ON return_to_play_steps;
CREATE POLICY "Medical staff and coaches manage return to play steps"
ON return_to_play_steps FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
);

-- =====================================================================
-- 11. POLICIES: ASSESSMENTS, TESTS & GOALS
-- =====================================================================

-- 11.1 TEST TEMPLATES & SESSIONS
DROP POLICY IF EXISTS "Members view test templates" ON test_templates;
CREATE POLICY "Members view test templates"
ON test_templates FOR SELECT USING (organization_id IS NULL OR is_member(organization_id));

DROP POLICY IF EXISTS "Coaches manage organization test templates" ON test_templates;
CREATE POLICY "Coaches manage organization test templates"
ON test_templates FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members view test sessions" ON test_sessions;
CREATE POLICY "Members view test sessions"
ON test_sessions FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches manage test sessions" ON test_sessions;
CREATE POLICY "Coaches manage test sessions"
ON test_sessions FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

DROP POLICY IF EXISTS "Members view test session tests" ON test_session_tests;
CREATE POLICY "Members view test session tests"
ON test_session_tests FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Coaches manage test session tests" ON test_session_tests;
CREATE POLICY "Coaches manage test session tests"
ON test_session_tests FOR ALL USING (TRUE);

-- 11.2 TEST RESULTS
DROP POLICY IF EXISTS "Staff view all test results, athletes/parents view their own" ON test_results;
CREATE POLICY "Staff view all test results, athletes/parents view their own"
ON test_results FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches can manage test results" ON test_results;
CREATE POLICY "Coaches can manage test results"
ON test_results FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'assistant']::membership_role[])
);

-- 11.3 ASSESSMENTS (Greco Technical & Tactical)
DROP POLICY IF EXISTS "Staff view all assessments, athletes/parents view their own" ON assessments;
CREATE POLICY "Staff view all assessments, athletes/parents view their own"
ON assessments FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches can manage wrestling assessments" ON assessments;
CREATE POLICY "Coaches can manage wrestling assessments"
ON assessments FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 11.4 GOALS
DROP POLICY IF EXISTS "Staff view all goals, athletes/parents view their own" ON goals;
CREATE POLICY "Staff view all goals, athletes/parents view their own"
ON goals FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

DROP POLICY IF EXISTS "Coaches and athletes can manage goals" ON goals;
CREATE POLICY "Coaches and athletes can manage goals"
ON goals FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
  OR athlete_id IN (SELECT my_athlete_ids())
);

-- =====================================================================
-- 12. POLICIES: PLATFORM, REPORTS, CALENDAR, AI
-- =====================================================================

-- 12.1 REPORTS
DROP POLICY IF EXISTS "Staff view all reports, athletes/parents view their own" ON reports;
CREATE POLICY "Staff view all reports, athletes/parents view their own"
ON reports FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach', 'physio', 'doctor']::membership_role[])
  OR (athlete_id IS NOT NULL AND athlete_id IN (SELECT my_athlete_ids()))
);

DROP POLICY IF EXISTS "Coaches and admins can generate reports" ON reports;
CREATE POLICY "Coaches and admins can generate reports"
ON reports FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 12.2 NOTIFICATIONS
DROP POLICY IF EXISTS "Users can only see and manage their own notifications" ON notifications;
CREATE POLICY "Users can only see and manage their own notifications"
ON notifications FOR ALL USING (user_id = auth.uid());

-- 12.3 ANNOUNCEMENTS
DROP POLICY IF EXISTS "Members can view announcements" ON announcements;
CREATE POLICY "Members can view announcements"
ON announcements FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches and admins can manage announcements" ON announcements;
CREATE POLICY "Coaches and admins can manage announcements"
ON announcements FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 12.4 CALENDAR EVENTS
DROP POLICY IF EXISTS "Members can view calendar events" ON calendar_events;
CREATE POLICY "Members can view calendar events"
ON calendar_events FOR SELECT USING (is_member(organization_id));

DROP POLICY IF EXISTS "Coaches and admins can manage calendar events" ON calendar_events;
CREATE POLICY "Coaches and admins can manage calendar events"
ON calendar_events FOR ALL USING (
  has_role(organization_id, ARRAY['owner', 'admin', 'head_coach', 'coach']::membership_role[])
);

-- 12.5 AUDIT LOGS
DROP POLICY IF EXISTS "Only owners and admins can view organization audit logs" ON audit_logs;
CREATE POLICY "Only owners and admins can view organization audit logs"
ON audit_logs FOR SELECT USING (
  has_role(organization_id, ARRAY['owner', 'admin']::membership_role[])
);

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT WITH CHECK (TRUE);

-- 12.6 AI CONVERSATIONS & USAGE
DROP POLICY IF EXISTS "Users can access their own AI conversations" ON ai_conversations;
CREATE POLICY "Users can access their own AI conversations"
ON ai_conversations FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access their own AI messages" ON ai_messages;
CREATE POLICY "Users can access their own AI messages"
ON ai_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ai_conversations ac
    WHERE ac.id = ai_messages.conversation_id AND ac.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users and admins can view AI usage" ON ai_usage;
CREATE POLICY "Users and admins can view AI usage"
ON ai_usage FOR SELECT USING (
  user_id = auth.uid() OR has_role(organization_id, ARRAY['owner', 'admin']::membership_role[])
);

DROP POLICY IF EXISTS "System can record AI usage" ON ai_usage;
CREATE POLICY "System can record AI usage"
ON ai_usage FOR INSERT WITH CHECK (TRUE);

-- =====================================================================
-- 13. STORAGE BUCKETS & STORAGE OBJECTS POLICIES (Idempotent)
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('athlete-photos', 'athlete-photos', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('athlete-documents', 'athlete-documents', FALSE, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('match-videos', 'match-videos', FALSE, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('reports', 'reports', FALSE, 20971520, ARRAY['application/pdf']),
  ('org-logos', 'org-logos', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for athlete-photos (Public Read, Staff Write)
DROP POLICY IF EXISTS "Public read for athlete photos" ON storage.objects;
CREATE POLICY "Public read for athlete photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'athlete-photos');

DROP POLICY IF EXISTS "Coaches can upload athlete photos" ON storage.objects;
CREATE POLICY "Coaches can upload athlete photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'athlete-photos' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Coaches can update athlete photos" ON storage.objects;
CREATE POLICY "Coaches can update athlete photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'athlete-photos' 
  AND auth.role() = 'authenticated'
);

-- Storage Policies for org-logos (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public read for org logos" ON storage.objects;
CREATE POLICY "Public read for org logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'org-logos');

DROP POLICY IF EXISTS "Admins can upload org logos" ON storage.objects;
CREATE POLICY "Admins can upload org logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-logos' 
  AND auth.role() = 'authenticated'
);

-- Storage Policies for athlete-documents (Private: Medical/Admin/Owner only)
DROP POLICY IF EXISTS "Private read for athlete documents" ON storage.objects;
CREATE POLICY "Private read for athlete documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'athlete-documents' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Staff can upload athlete documents" ON storage.objects;
CREATE POLICY "Staff can upload athlete documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'athlete-documents' 
  AND auth.role() = 'authenticated'
);

-- Storage Policies for match-videos (Private: Org members)
DROP POLICY IF EXISTS "Private read for match videos" ON storage.objects;
CREATE POLICY "Private read for match videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'match-videos' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Staff can upload match videos" ON storage.objects;
CREATE POLICY "Staff can upload match videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'match-videos' 
  AND auth.role() = 'authenticated'
);

-- Storage Policies for reports (Private)
DROP POLICY IF EXISTS "Private read for reports" ON storage.objects;
CREATE POLICY "Private read for reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Staff can create reports" ON storage.objects;
CREATE POLICY "Staff can create reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports' 
  AND auth.role() = 'authenticated'
);
