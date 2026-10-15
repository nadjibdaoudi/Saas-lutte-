-- =====================================================================
-- WrestleLab: Complete Supabase Demo Seed Data
-- Multi-Tenant Greco-Roman Elite Performance Management
-- 100% VALID RFC-4122 UUIDs & FICTIONAL PROFILES
-- =====================================================================

-- ---------------------------------------------------------------------
-- HOW TO CREATE DEMO USERS IN SUPABASE:
-- Option A (Automated): The DO $$ block below provisions 5 mock users in
--          `auth.users` with standard bcrypt password hashes (Password123!)
--          and matching `public.profiles`, satisfying the foreign key
--          `profiles.id REFERENCES auth.users(id) ON DELETE CASCADE`.
-- Option B (Manual / Production): If you prefer to register through the
--          Supabase UI or Auth tab, you can comment out the auth.users
--          insert in the DO block and replace the UUIDs below with your
--          actual user IDs from Supabase Auth -> Users.
-- ---------------------------------------------------------------------

-- 1. SAAS PLANS
INSERT INTO plans (id, code, name, description, monthly_price_cents, annual_price_cents, currency, max_athletes, max_coaches, max_teams, features, is_active)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'starter', 'Club Starter', 'For grassroots and municipal wrestling clubs', 4900, 49000, 'EUR', 25, 2, 2, '{"video_analysis": false, "medical_module": false, "ai_assistant": false}'::jsonb, TRUE),
  ('a0000000-0000-4000-8000-000000000002', 'club', 'Club Pro Performance', 'For regional training centers & competitive clubs', 9900, 99000, 'EUR', 60, 6, 4, '{"video_analysis": true, "medical_module": true, "ai_assistant": false}'::jsonb, TRUE),
  ('a0000000-0000-4000-8000-000000000003', 'pro', 'Elite Academy & National Hub', 'For Olympic preparation centers and academies', 19900, 199000, 'EUR', 150, 15, 10, '{"video_analysis": true, "medical_module": true, "ai_assistant": true}'::jsonb, TRUE),
  ('a0000000-0000-4000-8000-000000000004', 'federation', 'National Wrestling Federation', 'Full enterprise scale for national governing bodies', 49900, 499000, 'EUR', 500, 50, 30, '{"video_analysis": true, "medical_module": true, "ai_assistant": true, "federation_census": true}'::jsonb, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. SAMPLE DEMO ORGANIZATION
INSERT INTO organizations (
  id, name, slug, logo_url, country, city, contact_email, contact_phone, 
  wrestling_federation, subscription_plan, subscription_status, max_athletes, max_coaches
)
VALUES (
  'c0000000-0000-4000-8000-000000000001',
  'Olympique Métropole Lutte Gréco-Romaine',
  'paris-greco-01',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
  'France',
  'Paris / Training Center',
  'contact@metropole-lutte.fr',
  '+33 1 43 78 90 12',
  'FFLDA (Fédération Française de Lutte & UWW Member)',
  'pro',
  'active',
  100,
  10
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. PROVISION DEMO AUTH USERS & MATCHING PROFILES (Safe DO block)
DO $$
DECLARE
  v_pass TEXT := crypt('Password123!', gen_salt('bf'));
  v_user RECORD;
  v_demo_users CONSTANT JSONB := '[
    {"id": "d0000000-0000-4000-8000-000000000001", "email": "coach.alexandre@wrestlelab-demo.com", "first_name": "Alexandre", "last_name": "Mercier", "role": "owner", "title": "Head Olympic Coach & Founder"},
    {"id": "d0000000-0000-4000-8000-000000000002", "email": "coach.julien@wrestlelab-demo.com", "first_name": "Julien", "last_name": "Perrot", "role": "coach", "title": "Senior Technical Coach"},
    {"id": "d0000000-0000-4000-8000-000000000003", "email": "dr.sophie@wrestlelab-demo.com", "first_name": "Sophie", "last_name": "Renard", "role": "physio", "title": "Lead Sports Physician & Physio"},
    {"id": "d0000000-0000-4000-8000-000000000004", "email": "maxime.vautier@wrestlelab-demo.com", "first_name": "Maxime", "last_name": "Vautier", "role": "athlete", "title": "Senior 77kg Elite Competitor"},
    {"id": "d0000000-0000-4000-8000-000000000005", "email": "tariq.benali@wrestlelab-demo.com", "first_name": "Tariq", "last_name": "Benali", "role": "athlete", "title": "Senior 67kg Elite Competitor"}
  ]'::jsonb;
BEGIN
  FOR v_user IN SELECT * FROM jsonb_to_recordset(v_demo_users) AS (
    id UUID, email TEXT, first_name TEXT, last_name TEXT, role TEXT, title TEXT
  )
  LOOP
    -- Step 3.1: Insert into auth.users (if not already present)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user.id) THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user.id,
        'authenticated',
        'authenticated',
        v_user.email,
        v_pass,
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('first_name', v_user.first_name, 'last_name', v_user.last_name, 'full_name', v_user.first_name || ' ' || v_user.last_name),
        NOW(),
        NOW(),
        encode(gen_random_bytes(32), 'hex')
      );
    END IF;

    -- Step 3.2: Insert into public.profiles
    INSERT INTO public.profiles (
      id, email, first_name, last_name, avatar_url, phone, preferred_language, role
    )
    VALUES (
      v_user.id,
      v_user.email,
      v_user.first_name,
      v_user.last_name,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      '+33 6 12 34 56 78',
      'fr',
      'coach'
    )
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email;
  END LOOP;
END $$;

-- 4. MEMBERSHIPS (Organization Roles)
INSERT INTO memberships (id, organization_id, user_id, role, title, is_active)
VALUES
  ('e0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'owner', 'Head Olympic Coach & Founder', TRUE),
  ('e0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'coach', 'Senior Technical Coach', TRUE),
  ('e0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', 'physio', 'Lead Sports Physician & Physio', TRUE),
  ('e0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004', 'athlete', 'Senior 77kg Elite Competitor', TRUE),
  ('e0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005', 'athlete', 'Senior 67kg Elite Competitor', TRUE)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 5. TEAMS
INSERT INTO teams (id, organization_id, name, age_category, description, head_coach_id)
VALUES
  ('f0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Senior Elite Greco-Roman', 'senior', 'National and World Championship preparation roster', 'd0000000-0000-4000-8000-000000000001'),
  ('f0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'U23 & Junior Hopefuls', 'u23', 'Next-Gen National development squad', 'd0000000-0000-4000-8000-000000000002')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. UWW WEIGHT CLASSES (Official Senior Olympic & Non-Olympic Greco-Roman)
INSERT INTO weight_classes (id, federation, age_category, gender, wrestling_style, name, min_weight_kg, max_weight_kg, is_olympic)
VALUES
  ('b0000000-0000-4000-8000-000000000001', 'UWW', 'senior', 'male', 'greco_roman', '60 kg', 55.0, 60.0, TRUE),
  ('b0000000-0000-4000-8000-000000000002', 'UWW', 'senior', 'male', 'greco_roman', '67 kg', 60.0, 67.0, TRUE),
  ('b0000000-0000-4000-8000-000000000003', 'UWW', 'senior', 'male', 'greco_roman', '72 kg', 67.0, 72.0, FALSE),
  ('b0000000-0000-4000-8000-000000000004', 'UWW', 'senior', 'male', 'greco_roman', '77 kg', 72.0, 77.0, TRUE),
  ('b0000000-0000-4000-8000-000000000005', 'UWW', 'senior', 'male', 'greco_roman', '82 kg', 77.0, 82.0, FALSE),
  ('b0000000-0000-4000-8000-000000000006', 'UWW', 'senior', 'male', 'greco_roman', '87 kg', 82.0, 87.0, TRUE),
  ('b0000000-0000-4000-8000-000000000007', 'UWW', 'senior', 'male', 'greco_roman', '97 kg', 87.0, 97.0, TRUE),
  ('b0000000-0000-4000-8000-000000000008', 'UWW', 'senior', 'male', 'greco_roman', '130 kg', 97.0, 130.0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. ATHLETES (All Fictional Wrestlers with Realistic Greco-Roman Profiles)
INSERT INTO athletes (
  id, organization_id, team_id, user_id, coach_id, first_name, last_name, 
  date_of_birth, gender, nationality, height_cm, current_weight_kg, target_weight_kg, 
  weight_category, age_category, wrestling_style, dominant_side, grip_preference, 
  experience_level, license_number, status
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000004',
    'd0000000-0000-4000-8000-000000000001',
    'Maxime', 'Vautier',
    '1995-04-17', 'male', 'FRA', 178.0, 78.4, 77.0,
    '77 kg', 'senior', 'greco_roman', 'right', 'Over-Under / High Underhook',
    'World & European Contender', 'FFL-774921-A', 'active'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'c0000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000005',
    'd0000000-0000-4000-8000-000000000001',
    'Tariq', 'Benali',
    '1998-09-12', 'male', 'FRA', 171.0, 68.6, 67.0,
    '67 kg', 'senior', 'greco_roman', 'left', 'Two-on-One Russian Tie',
    'National Team Elite', 'FFL-662810-B', 'active'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'c0000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000001',
    NULL,
    'd0000000-0000-4000-8000-000000000001',
    'Lucas', 'Moreau',
    '1994-06-25', 'male', 'FRA', 165.0, 61.2, 60.0,
    '60 kg', 'senior', 'greco_roman', 'right', 'Head-and-Arm Pinch',
    'European Medalist', 'FFL-551980-C', 'active'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'c0000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000002',
    NULL,
    'd0000000-0000-4000-8000-000000000002',
    'Gabriel', 'Krikorian',
    '2001-02-14', 'male', 'FRA', 170.0, 67.9, 67.0,
    '67 kg', 'u23', 'greco_roman', 'right', 'Underhook to Lateral Drop',
    'U23 European Silver', 'FFL-992144-D', 'recovering'
  )
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;

-- 8. PHYSICAL TEST TEMPLATES
INSERT INTO test_templates (
  id, organization_id, name, category, description, unit, measurement_type, 
  performance_direction, min_value, max_value, scoring_method, benchmark_value, instructions, is_system_test
)
VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    NULL,
    '30s Suplesse Throw Cadence (30kg Dummy)',
    'power',
    'Greco-Roman explosive throw endurance test. Number of continuous overhead chest throws executed in 30 seconds.',
    'reps',
    'reps',
    'higher_is_better',
    0, 25, 'normalized', 14.0,
    'Continuous overhead arching throws using an approved 30kg dummy. Full back arch required.',
    TRUE
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    NULL,
    'Max Weighted Pull-Up (+kg)',
    'strength',
    'Upper body pulling strength critical for pummeling and par terre gut wrench lock.',
    'kg',
    'numeric',
    'higher_is_better',
    0, 80, 'normalized', 50.0,
    'Dead-hang pull-up with weight belt. Chin completely over the bar with zero kipping.',
    TRUE
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    NULL,
    'Isometric Par Terre Base Hold',
    'endurance',
    'Isometric neck, shoulder and lumbar stability against 80kg downward hydraulic load.',
    'seconds',
    'time',
    'higher_is_better',
    0, 180, 'normalized', 120.0,
    'Standard Greco bottom referee position. Maintain flat spine and wide elbow base without collapsing.',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- 9. GRECO-ROMAN TECHNIQUES
INSERT INTO techniques (id, organization_id, name, wrestling_style, position, difficulty, points_potential, key_cues)
VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    NULL,
    'Ceinture Arrière (Reverse Bodylock Souplesse)',
    'greco_roman',
    'neutral_standing',
    'elite_olympic',
    5,
    ARRAY['Step deep between opponent feet', 'Arch neck back before hips pop', 'Drive through heels for high amplitude arc']
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    NULL,
    'Arraché (Par Terre Gut Wrench)',
    'greco_roman',
    'par_terre_top',
    'intermediate',
    2,
    ARRAY['Lock fingers below ribs', 'Drive chest into upper spine', 'Hip bridge rolling over left shoulder']
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    NULL,
    'Tour de Bras (Arm Throw / Seoi-Nage)',
    'greco_roman',
    'neutral_standing',
    'advanced',
    4,
    ARRAY['Bicep clamp with overhook', 'Back-step 180 degrees', 'Squat low and load hips below belt line']
  )
ON CONFLICT (id) DO NOTHING;

-- 10. TRAINING PLANS & SESSIONS
INSERT INTO training_plans (
  id, organization_id, title, phase, macrocycle_phase, description, 
  target_category, target_focus, start_date, end_date
)
VALUES (
  '40000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  'European Championship 2026 Peaking Macrocycle',
  'Pre-Competition Peak',
  'Specific Preparation & Taper',
  'Targeting peak explosive power in clinch pummeling and par terre gut wrench conversion rate.',
  'senior',
  'Par Terre Defense & Clinch Domination',
  '2026-02-01',
  '2026-04-20'
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO training_sessions (
  id, organization_id, training_plan_id, team_id, title, session_date, 
  duration_minutes, category, intensity_rpe, lead_coach_id, objectives
)
VALUES (
  '50000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  'f0000000-0000-4000-8000-000000000001',
  'High Intensity Greco Live Match Simulation',
  CURRENT_DATE,
  90,
  'Mat Specific & Live Bouts',
  8,
  'd0000000-0000-4000-8000-000000000001',
  '3x3 min match condition simulation with forced 30s par terre passivity scenarios.'
)
ON CONFLICT (id) DO NOTHING;

-- Session logs (Training Load Calculation: 90min * 8 RPE = 720 AU)
INSERT INTO session_logs (
  organization_id, training_session_id, athlete_id, duration_minutes, rpe, 
  completion_status, athlete_feedback_rpe, athlete_notes
)
VALUES 
  ('c0000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 90, 8, 'completed', 8, 'Felt very explosive on chest-to-chest pummeling.'),
  ('c0000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 90, 9, 'completed', 9, 'High cardiovascular fatigue in the 3rd period drill.')
ON CONFLICT (training_session_id, athlete_id) DO NOTHING;

-- 11. WELLNESS CHECKS
INSERT INTO wellness_checks (
  organization_id, athlete_id, check_date, sleep_quality, fatigue_level, 
  muscle_soreness, stress_level, mood_score, resting_heart_rate, hrv_rmssd, readiness_score, notes
)
VALUES
  ('c0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', CURRENT_DATE, 8, 8, 3, 2, 9, 48, 78.5, 88, 'Good sleep, rested neck and shoulders.'),
  ('c0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', CURRENT_DATE, 7, 7, 4, 3, 8, 52, 64.0, 79, 'Normal fatigue after heavy conditioning session.')
ON CONFLICT (athlete_id, check_date) DO NOTHING;

-- 12. WEIGHT MONITORING
INSERT INTO weight_records (
  organization_id, athlete_id, record_date, weight_kg, target_weight_kg, 
  weight_category, delta_to_target, weigh_in_type, hydration_status, urine_specific_gravity
)
VALUES
  ('c0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', CURRENT_DATE, 78.4, 77.0, '77 kg', 1.4, 'morning_fasted', 'optimal', 1.012),
  ('c0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', CURRENT_DATE, 68.6, 67.0, '67 kg', 1.6, 'morning_fasted', 'optimal', 1.015)
ON CONFLICT DO NOTHING;

-- 13. COMPETITIONS & MATCHES
INSERT INTO competitions (
  id, organization_id, name, competition_type, tier, location, country, city, 
  start_date, end_date, organizer, uww_sanctioned
)
VALUES
  (
    '60000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000001',
    'Zagreb Open Ranking Series 2026 (UWW)',
    'UWW Ranking Series',
    'Ranking Series',
    'Zagreb Arena',
    'CRO',
    'Zagreb',
    '2026-01-28',
    '2026-02-02',
    'United World Wrestling',
    TRUE
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    'c0000000-0000-4000-8000-000000000001',
    'European Greco-Roman Championships 2026',
    'Continental Championship',
    'Continental',
    'Bucharest Multi-Sport Hall',
    'ROU',
    'Bucharest',
    '2026-04-14',
    '2026-04-20',
    'European Wrestling Council',
    TRUE
  )
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO opponents (
  id, organization_id, first_name, last_name, country, club, weight_category, dominant_side, scouting_notes
)
VALUES
  (
    '70000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000001',
    'Davit', 'Beridze',
    'GEO', 'Dinamo Tbilisi', '77 kg', 'right',
    'Very explosive body lock. Weak against gut wrench when put in bottom par terre.'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO competition_entries (
  organization_id, competition_id, athlete_id, weight_category, final_placement, medal
)
VALUES 
  ('c0000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '77 kg', 1, 'gold'),
  ('c0000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '67 kg', 3, 'bronze')
ON CONFLICT (competition_id, athlete_id) DO NOTHING;

INSERT INTO matches (
  id, organization_id, competition_id, athlete_id, opponent_id, opponent_name, 
  opponent_country, weight_category, round_name, result, is_win, athlete_score, opponent_score,
  takedown_success, gut_wrench_executed, passivity_calls_opponent
)
VALUES (
  '80000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  'Davit Beridze',
  'GEO',
  '77 kg',
  'Gold Final',
  'vsu',
  TRUE,
  9, 0,
  1, 2, 1
)
ON CONFLICT (id) DO NOTHING;

-- 14. INJURIES & REHABILITATION
INSERT INTO injuries (
  id, organization_id, athlete_id, injury_name, body_area, severity, 
  occurred_date, status, restrictions, medical_staff_notes
)
VALUES (
  '90000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000004',
  'Cervical Sprain & Trapezoid Strain',
  'Cervical Neck',
  'moderate',
  CURRENT_DATE - INTERVAL '14 days',
  'recovering',
  'No live throwing drills. Light pummeling and isometric neck strengthening only.',
  'Gradual improvement in cervical rotation. Clearance expected in 10 days.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO return_to_play_steps (
  organization_id, injury_id, step_order, step_name, criteria, is_completed
)
VALUES
  ('c0000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 1, 'Stage 1: Pain-free neck isometric base hold', 'Hold 60s without radicular symptoms', TRUE),
  ('c0000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 2, 'Stage 2: Light pummeling and non-impact mat drills', 'Zero pain post 45min session', TRUE),
  ('c0000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 3, 'Stage 3: Full contact live par terre and throws', 'Physician clearance protocol', FALSE)
ON CONFLICT DO NOTHING;

-- 15. ASSESSMENTS
INSERT INTO assessments (
  id, organization_id, athlete_id, assessment_date, 
  takedown_technique, throwing_technique, clinch_underhook, ground_par_terre_offense,
  positioning_stance, takedown_defense, ground_par_terre_defense, explosiveness,
  grip_endurance, passivity_management, mat_zone_control, discipline, grit_mental_toughness,
  overall_technical_score, overall_wrestling_score, strengths, areas_for_improvement, coach_feedback
)
VALUES (
  'aa000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  CURRENT_DATE - INTERVAL '7 days',
  9.4, 9.6, 9.2, 9.5, 9.0, 9.1, 9.3, 9.4, 9.2, 9.5, 9.3, 9.8, 9.7,
  94.2, 95.0,
  'Elite chest-to-chest lock, explosive souplesse throw, relentless par terre pressure.',
  'Slight tendency to reach when leading in the final 45 seconds.',
  'World-class execution. Ready for European Championship medal contention.'
)
ON CONFLICT (id) DO NOTHING;

-- 16. GOALS
INSERT INTO goals (
  id, organization_id, athlete_id, title, category, target_date, current_value, target_value, unit, status
)
VALUES
  ('ab000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Gold Medal at European Championships 2026 (77 kg)', 'competition_medal', '2026-04-18', 1, 1, 'place', 'in_progress'),
  ('ab000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'Target Weigh-in at 67.0kg with 1.010 USG hydration', 'weight_target', '2026-04-15', 68.6, 67.0, 'kg', 'in_progress')
ON CONFLICT (id) DO NOTHING;

-- 17. ANNOUNCEMENTS & CALENDAR
INSERT INTO announcements (
  id, organization_id, title, content, priority, is_pinned
)
VALUES (
  'ac000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  'European Championship 2026 Team Roster Finalized',
  'All selected Greco-Roman senior athletes report to Mat 1 on Monday 08:30 for official weigh-in simulation and photo verification.',
  'important',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO calendar_events (
  id, organization_id, title, event_type, location, start_time, end_time
)
VALUES (
  'ad000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000001',
  'National Greco-Roman Training Camp',
  'camp',
  'National High Performance Sports Center',
  (CURRENT_DATE + INTERVAL '5 days')::TIMESTAMPTZ + INTERVAL '9 hours',
  (CURRENT_DATE + INTERVAL '10 days')::TIMESTAMPTZ + INTERVAL '18 hours'
)
ON CONFLICT (id) DO NOTHING;
