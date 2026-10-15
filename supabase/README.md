# WrestleLab — Supabase Backend Guide

Complete PostgreSQL schema, Row-Level Security (RLS) policies, storage buckets, and seed data for **WrestleLab** (Greco-Roman Wrestling Performance Management SaaS).

---

## 🚀 Execution Order in Supabase SQL Editor

Every script in this directory is **100% idempotent** (`IF NOT EXISTS`, `CREATE OR REPLACE`, and `DROP ... IF EXISTS`). You can safely run and re-run them in your **Supabase Dashboard → SQL Editor** in the following sequential order:

```
Step 1: supabase/schema.sql   → Tables, ENUMs, Triggers, Views & RPCs (Idempotent)
Step 2: supabase/rls.sql      → Row Level Security, Helpers & Storage Policies (Idempotent)
Step 3: supabase/seed.sql     → Demo Data with Valid RFC-4122 UUIDs & Auth Integration
```

---

## 👤 Demo Authentication & User Accounts

In Supabase, `public.profiles.id` has a foreign key referencing `auth.users(id) ON DELETE CASCADE`.

`supabase/seed.sql` handles this automatically using an idempotent `DO $$` block:
1. **Automated User Provisioning**: It checks `auth.users` and creates 5 demo accounts (if not already present) with valid bcrypt hashed credentials:
   - **Head Coach & Owner**: `coach.alexandre@wrestlelab-demo.com` (`Password123!`)
   - **Assistant Coach**: `coach.julien@wrestlelab-demo.com` (`Password123!`)
   - **Sports Physician & Physio**: `dr.sophie@wrestlelab-demo.com` (`Password123!`)
   - **Senior 77kg Athlete**: `maxime.vautier@wrestlelab-demo.com` (`Password123!`)
   - **Senior 67kg Athlete**: `tariq.benali@wrestlelab-demo.com` (`Password123!`)
2. **Matching Profiles**: It immediately inserts the corresponding `public.profiles` records and assigns their organization memberships without foreign-key violations.
3. **Manual / Production Alternative**: If you prefer creating accounts through the Supabase Dashboard (`Authentication -> Users`) or your web signup flow, you can simply substitute their assigned UUIDs in the membership and athlete foreign keys.

---

## 📁 File Manifest & Architecture

### 1. `supabase/schema.sql` (100% Idempotent)
- **Multi-Tenant Foundation**: Every business entity is scoped with `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`.
- **Identity & SaaS**: `plans`, `profiles`, `organizations`, `memberships` (with 9 roles: `owner`, `admin`, `head_coach`, `coach`, `assistant`, `physio`, `doctor`, `athlete`, `parent`), `invitations`, `subscriptions`. Backwards-compatible view `organization_members` included.
- **People & Rosters**: `teams`, `team_members`, `athletes` (with soft-delete `is_deleted`, `deleted_at`, `deleted_by`), `guardians`, `athlete_guardians`, `documents` (with `expiry_date` tracking for medical clearance and federation licenses).
- **Weight & Hydration**: `weight_classes` (UWW standards), `weight_records` (with `hydration_status`, `weigh_in_type`, and urine specific gravity `urine_specific_gravity`), `weight_plans` (safe deceleration cuts).
- **Training & Periodization**: `exercises`, `techniques` (Greco-Roman specific cues & UWW points potential), `training_plans`, `training_sessions`, `session_exercises`, `session_logs` (sRPE duration * RPE = training load AU), `wellness_checks` (sleep, fatigue, soreness, HRV, readiness score).
- **Attendance**: `attendance_records` (with status: `present`, `absent`, `excused`, `late`).
- **Competitions & Bout Analytics**: `competitions`, `opponents` (scouting dossier), `competition_entries`, `matches` (UWW Greco rules, technical superiority 8-pt differential `vsu`/`vsu1`, passivity calls, throws), `match_events` (point-by-point timeline).
- **Health & Medical**: `injuries`, `injury_notes` (physio/doctor clinical notes), `return_to_play_steps` (phased protocol).
- **Assessments & Goals**: `test_templates`, `test_sessions`, `test_session_tests`, `test_results`, `assessments` (Greco rubrics: pummeling, par terre gut wrench, chest-to-chest throws, passivity control), `goals`.
- **Platform**: `reports`, `notifications`, `announcements`, `calendar_events`, `audit_logs` (with automated triggers on core tables), `ai_conversations`, `ai_messages`, `ai_usage`.
- **Automatic Triggers**:
  - `trg_set_updated_at`: automatically updates `updated_at` before every record modification.
  - `trg_audit_log`: automatically records audit logs for `athletes`, `injuries`, `weight_records`, `matches`, and `memberships`.

---

### 2. `supabase/rls.sql` (Strict RLS & Idempotent Policies)
- **SECURITY DEFINER Helpers**:
  - `is_super_admin()`: checks platform-wide administrative privileges.
  - `is_member(org_id)`: validates active membership in the organization.
  - `has_role(org_id, allowed_roles[])`: enforces role-based access for coaching staff, admins, or medical personnel.
  - `my_athlete_ids()`: returns the athlete IDs an athlete or parent/guardian is authorized to access.
- **Access Boundaries**:
  - **Coaches/Admins**: Write access to rosters, testing, matches, attendance, and training.
  - **Physio/Doctor**: Elevated write and audit access to medical data (`injuries`, `injury_notes`, `return_to_play_steps`, `wellness_checks`).
  - **Athletes/Parents**: Strictly restricted to their own (or their children's) profile, weight trends, test results, match logs, and assigned training.
  - **Owners/Admins**: Exclusive control over `memberships`, `invitations`, and `subscriptions`.
- **Automated Auth Triggers**:
  - `handle_new_user()`: creates a record in `public.profiles` whenever a user signs up via Supabase Auth.
  - `handle_new_organization()`: automatically grants the creator the `owner` role in `public.memberships`.
- **Storage Buckets & Policies**:
  - `athlete-photos` (Public read, authenticated coach upload)
  - `athlete-documents` (Private, coaches, medical staff, and the athlete/parent only)
  - `match-videos` (Private, organization members only)
  - `reports` (Private, coaches and the respective athlete only)
  - `org-logos` (Public read, admin upload)

---

### 3. `supabase/seed.sql` (Demo Data)
- **100% Valid Hexadecimal UUIDs**: All identifiers strictly follow RFC-4122 format `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`.
- **Fictional Characters**: Complete roster of fictional athletes (Maxime Vautier, Tariq Benali, Lucas Moreau, Gabriel Krikorian), coaching staff (Alexandre Mercier, Julien Perrot), and sports physician (Dr. Sophie Renard).
- **Realistic Athletic Data**: UWW weight categories, Zagreb Open Ranking Series match bouts, technical scores, injury recovery protocols, and wellness check metrics.

---

## 📊 Analytical Views & RPC Functions

### 1. `athlete_overview` (View)
Returns a real-time aggregate of each athlete:
```sql
SELECT * FROM athlete_overview WHERE organization_id = 'c0000000-0000-4000-8000-000000000001';
```

### 2. `get_weekly_training_load(org_id, athlete_id?)` (RPC)
Calculates the **Acute-to-Chronic Workload Ratio (ACWR 7:28)** based on session duration × RPE (sRPE training impulse):
```typescript
const { data, error } = await supabase.rpc('get_weekly_training_load', {
  p_org_id: 'c0000000-0000-4000-8000-000000000001',
  p_athlete_id: '10000000-0000-4000-8000-000000000001'
});
```

### 3. `get_weight_trend(athlete_id, days?)` (RPC)
Returns daily weigh-in records along with a 7-day rolling moving average weight:
```typescript
const { data, error } = await supabase.rpc('get_weight_trend', {
  p_athlete_id: '10000000-0000-4000-8000-000000000001',
  p_days: 60
});
```

### 4. `get_attendance_rate(org_id, team_id?, start_date?, end_date?)` (RPC)
Calculates attendance percentages and breakdown (`present`, `absent`, `excused`, `late`) per athlete over any given period.

### 5. `get_medal_table(org_id, year?)` (RPC)
Generates tournament standings, gold/silver/bronze medal counts, win rate, and total points scored/conceded across all competitions.

---

## 🔑 Frontend Integration & Environment Setup

Copy your Supabase project credentials into `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The application automatically connects to Supabase when valid keys are configured in `src/lib/supabase.ts`.
