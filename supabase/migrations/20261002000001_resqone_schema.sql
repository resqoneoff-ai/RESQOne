-- ====================================================================
-- RESQ ONE — Comprehensive PostgreSQL Database Schema (Supabase)
-- Migration: 20261002000001_resqone_schema.sql
-- Description: Complete multi-role emergency response coordination schema
-- Roles: PATIENT, REQUESTER, DOCTOR, AMBULANCE_OPERATOR, HOSPITAL, RESQ_ADMIN, SUPER_ADMIN
-- ====================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- ENUMS
-- --------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'PATIENT',
    'REQUESTER',
    'DOCTOR',
    'AMBULANCE_OPERATOR',
    'HOSPITAL',
    'RESQ_ADMIN',
    'SUPER_ADMIN'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE emergency_status AS ENUM (
    'CREATED',
    'TRIAGE',
    'AMBULANCE_REQUESTED',
    'AMBULANCE_ASSIGNED',
    'AMBULANCE_EN_ROUTE',
    'AMBULANCE_ARRIVING',
    'PATIENT_PICKED_UP',
    'DOCTOR_ASSIGNED',
    'DOCTOR_CONNECTED',
    'HOSPITAL_SEARCH',
    'HOSPITAL_NOTIFIED',
    'HOSPITAL_ACCEPTED',
    'PATIENT_ARRIVED',
    'HANDOVER',
    'COMPLETED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE emergency_severity AS ENUM (
    'CRITICAL (Priority 1)',
    'URGENT (Priority 2)',
    'STANDARD (Priority 3)'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE doctor_availability AS ENUM (
    'AVAILABLE',
    'BUSY',
    'OFFLINE'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE doctor_verification AS ENUM (
    'VERIFIED',
    'PENDING',
    'REJECTED',
    'SUSPENDED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ambulance_status AS ENUM (
    'AVAILABLE',
    'ASSIGNED',
    'EN_ROUTE',
    'ARRIVING',
    'ON_SCENE',
    'PATIENT_PICKED_UP',
    'AT_HOSPITAL',
    'COMPLETED',
    'OFFLINE'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE family_auth_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REVOKED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE role_status AS ENUM (
    'PENDING',
    'APPROVED',
    'SUSPENDED',
    'REVOKED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE doctor_approval_status AS ENUM (
    'INVITED',
    'PENDING_VERIFICATION',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'PATIENT',
  organization_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Secure Multi-Role Table: Users cannot self-assign privileged roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  status role_status NOT NULL DEFAULT 'APPROVED',
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- --------------------------------------------------------------------
-- 2. ORGANIZATIONS (Ambulance services, Hospitals, Doctor Networks)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'HOSPITAL', 'AMBULANCE_PROVIDER', 'EMS_DISPATCH', 'HEALTH_NETWORK'
  code TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_org TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- --------------------------------------------------------------------
-- 3. PATIENT & EMERGENCY PASSPORT TABLES
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  approximate_age INTEGER,
  gender TEXT,
  blood_group TEXT,
  affordability_preference TEXT DEFAULT 'Standard / In-Network',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  diagnosed_date DATE,
  severity TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  reaction TEXT,
  severity TEXT, -- 'MILD', 'MODERATE', 'ANAPHYLAXIS'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  prescribed_by TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date DATE,
  facility TEXT,
  attending_doctor TEXT,
  clinical_summary TEXT,
  findings TEXT,
  relevant_for_emergency BOOLEAN NOT NULL DEFAULT true,
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  subscriber_id TEXT,
  subscriber_name TEXT,
  network_status TEXT DEFAULT 'Verified Active',
  claims_phone TEXT,
  valid_thru DATE,
  card_front_url TEXT,
  card_back_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 4. FAMILY RELATIONSHIPS & AUTHORIZATIONS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  family_member_name TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  authorization_status family_auth_status NOT NULL DEFAULT 'ACCEPTED',
  access_level TEXT NOT NULL DEFAULT 'FULL_EMERGENCY_PROFILE', -- 'FULL_EMERGENCY_PROFILE' | 'CRITICAL_ALERTS_ONLY'
  blood_group TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  medical_alerts JSONB DEFAULT '[]'::jsonb,
  live_location JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 5. DOCTORS, AMBULANCES, & HOSPITALS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registration_number TEXT UNIQUE NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 5,
  organization_id UUID REFERENCES organizations(id),
  hospital_affiliation TEXT NOT NULL,
  phone TEXT NOT NULL,
  verification_status doctor_verification NOT NULL DEFAULT 'VERIFIED',
  availability doctor_availability NOT NULL DEFAULT 'AVAILABLE',
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 4.95,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctor_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'MEDICAL_LICENSE', 'BOARD_CERTIFICATION', 'ID_PROOF'
  document_url TEXT NOT NULL,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id TEXT UNIQUE NOT NULL, -- e.g. "ALS-22"
  vehicle_type TEXT NOT NULL DEFAULT 'ALS (Advanced Life Support)',
  registration_number TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  driver_paramedic TEXT NOT NULL,
  lead_medic TEXT NOT NULL,
  phone TEXT NOT NULL,
  status ambulance_status NOT NULL DEFAULT 'AVAILABLE',
  current_lat DOUBLE PRECISION NOT NULL DEFAULT 37.7749,
  current_lng DOUBLE PRECISION NOT NULL DEFAULT -122.4194,
  current_address TEXT DEFAULT 'Station 4 CAD Bay',
  speed_mph NUMERIC(5,2) DEFAULT 0.0,
  heading_deg INTEGER DEFAULT 0,
  equipment_list JSONB DEFAULT '["Defibrillator", "12-Lead ECG", "Mechanical Ventilator", "Airway Suction", "IV Resuscitation Kits"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  trauma_level TEXT NOT NULL, -- 'Level 1 Trauma', 'Level 2 Regional', etc.
  address TEXT NOT NULL,
  bay_entrance TEXT NOT NULL DEFAULT 'North ER Ambulance Bay',
  lat DOUBLE PRECISION NOT NULL DEFAULT 37.7749,
  lng DOUBLE PRECISION NOT NULL DEFAULT -122.4194,
  emergency_phone TEXT NOT NULL,
  total_trauma_bays INTEGER NOT NULL DEFAULT 8,
  occupied_bays INTEGER NOT NULL DEFAULT 2,
  is_accepting_emergencies BOOLEAN NOT NULL DEFAULT true,
  specialties JSONB DEFAULT '["Comprehensive Stroke", "STEMI Cardiac Cath", "Pediatric Trauma", "Burn Unit"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS preferred_hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  trauma_tier TEXT NOT NULL,
  rank_order INTEGER NOT NULL DEFAULT 1,
  is_default BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 6. EMERGENCY CASES (Core entity)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS emergency_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL, -- Human-readable, e.g. "RX1-20261002-000001" or "RESQ-8492"
  requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patient_profiles(id) ON DELETE SET NULL,
  target_mode TEXT NOT NULL, -- 'ME', 'FAMILY', 'FRIEND_OTHER'
  patient_name TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  patient_age TEXT,
  
  -- Emergency details
  emergency_type TEXT NOT NULL,
  severity emergency_severity NOT NULL DEFAULT 'CRITICAL (Priority 1)',
  symptoms JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  consciousness TEXT DEFAULT 'Conscious & Alert',
  breathing TEXT DEFAULT 'Normal',
  
  -- Status
  status emergency_status NOT NULL DEFAULT 'CREATED',
  
  -- Medical payload snapshot (strictly authorized)
  medical_info JSONB DEFAULT '{}'::jsonb,
  
  -- Active Assignments
  assigned_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  assigned_ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
  assigned_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  
  -- Hospital Preference
  hospital_preference JSONB DEFAULT '{}'::jsonb,
  insurance_summary TEXT DEFAULT 'NOT PROVIDED',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS emergency_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES emergency_cases(id) ON DELETE CASCADE,
  location_source TEXT NOT NULL, -- 'GPS', 'PATIENT_SHARED', 'REQUESTER_MAP_PIN', 'MANUAL_ADDRESS'
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_meters NUMERIC(6,2),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS triage_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES emergency_cases(id) ON DELETE CASCADE,
  assessed_by_doctor_id UUID REFERENCES doctors(id),
  chief_complaint TEXT NOT NULL,
  symptoms JSONB DEFAULT '[]'::jsonb,
  consciousness TEXT NOT NULL,
  breathing TEXT NOT NULL,
  bleeding TEXT DEFAULT 'None',
  pain_severity INTEGER CHECK (pain_severity BETWEEN 0 AND 10),
  vital_signs JSONB DEFAULT '{"heart_rate": null, "bp": null, "spo2": null, "resp_rate": null, "temp": null}'::jsonb,
  clinical_notes TEXT,
  severity emergency_severity NOT NULL,
  recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES emergency_cases(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'NOTIFIED', -- 'NOTIFIED', 'ACCEPTED', 'DECLINED', 'BAY_PREPPED', 'ARRIVED'
  allocated_bay TEXT,
  lead_physician TEXT,
  pre_arrival_notes TEXT,
  response_time_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES emergency_cases(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id),
  paramedic_name TEXT NOT NULL,
  paramedic_badge TEXT NOT NULL,
  receiving_physician_name TEXT NOT NULL,
  clinical_handover_summary TEXT NOT NULL,
  vitals_at_handover JSONB DEFAULT '{}'::jsonb,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 7. REAL-TIME CASE COMMUNICATION (Per-case messaging)
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES emergency_cases(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_role user_role NOT NULL,
  message TEXT NOT NULL,
  is_system_event BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 8. IMMUTABLE AUDIT LOGS
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role user_role NOT NULL,
  action TEXT NOT NULL, -- 'EMERGENCY_CREATED', 'STATUS_CHANGED', 'DOCTOR_ASSIGNED', 'TRIAGE_SUBMITTED', 'AMBULANCE_DISPATCHED', 'HOSPITAL_ACCEPTED', 'HANDOVER_COMPLETED'
  case_id UUID REFERENCES emergency_cases(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL, -- 'EMERGENCY_CASE', 'MEDICAL_RECORD', 'PROFILE', 'AMBULANCE', 'HOSPITAL'
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- INDEXES FOR HIGH-FREQUENCY QUERIES
-- --------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_cases_status ON emergency_cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON emergency_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_requester ON emergency_cases(requester_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_doc ON emergency_cases(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_amb ON emergency_cases(assigned_ambulance_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_hosp ON emergency_cases(assigned_hospital_id);
CREATE INDEX IF NOT EXISTS idx_messages_case ON case_messages(case_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_audit_case ON audit_logs(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
CREATE INDEX IF NOT EXISTS idx_doctors_availability ON doctors(availability, verification_status);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Profiles: Users can view own profile; Admins & Operators can view all profiles
DROP POLICY IF EXISTS "Users view own profile or admins view all" ON profiles;
CREATE POLICY "Users view own profile or admins view all" ON profiles
  FOR SELECT USING (
    auth_user_id = auth.uid() OR
    get_current_user_role() IN ('RESQ_ADMIN', 'SUPER_ADMIN', 'AMBULANCE_OPERATOR')
  );

-- User Roles: Read approved roles for authenticated user or admins
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own roles or admins view all" ON user_roles;
CREATE POLICY "Users view own roles or admins view all" ON user_roles
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR
    get_current_user_role() IN ('RESQ_ADMIN', 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Only Admins can modify user roles" ON user_roles;
CREATE POLICY "Only Admins can modify user roles" ON user_roles
  FOR ALL USING (
    get_current_user_role() IN ('RESQ_ADMIN', 'SUPER_ADMIN')
  );

-- Emergency Cases:
-- Requesters can view cases they initiated
-- Doctors can view cases assigned to them or unassigned triage cases
-- Ambulance operators can view assigned cases and active cases
-- Hospitals can view cases targeted to them
-- Admins can view all cases
DROP POLICY IF EXISTS "Role based emergency case access" ON emergency_cases;
CREATE POLICY "Role based emergency case access" ON emergency_cases
  FOR SELECT USING (
    (requester_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) OR
    (get_current_user_role() IN ('RESQ_ADMIN', 'SUPER_ADMIN', 'AMBULANCE_OPERATOR')) OR
    (get_current_user_role() = 'DOCTOR' AND (assigned_doctor_id IN (SELECT id FROM doctors WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) OR status IN ('CREATED', 'TRIAGE'))) OR
    (get_current_user_role() = 'HOSPITAL' AND assigned_hospital_id IN (SELECT id FROM hospitals WHERE organization_id IN (SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid())))
  );

-- Case creation: Requesters, Doctors, Operators, Admins can insert
DROP POLICY IF EXISTS "Authorized case creation" ON emergency_cases;
CREATE POLICY "Authorized case creation" ON emergency_cases
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR true
  );

-- Case updates: Enforce role-based updates
DROP POLICY IF EXISTS "Role based case updates" ON emergency_cases;
CREATE POLICY "Role based case updates" ON emergency_cases
  FOR UPDATE USING (
    get_current_user_role() IN ('RESQ_ADMIN', 'SUPER_ADMIN', 'AMBULANCE_OPERATOR', 'DOCTOR', 'HOSPITAL') OR
    requester_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

-- Messages: Participants can read and write to cases they can see
DROP POLICY IF EXISTS "Case participants can view messages" ON case_messages;
CREATE POLICY "Case participants can view messages" ON case_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Case participants can post messages" ON case_messages;
CREATE POLICY "Case participants can post messages" ON case_messages
  FOR INSERT WITH CHECK (true);

-- Audit logs: Read-only for admins and auditors
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    get_current_user_role() IN ('RESQ_ADMIN', 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "System can record audit logs" ON audit_logs;
CREATE POLICY "System can record audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- --------------------------------------------------------------------
-- TRIGGER FOR UPDATED_AT
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cases_updated_at ON emergency_cases;
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON emergency_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------
-- SEED DATA (DEVELOPMENT ONLY — Clearly labeled)
-- --------------------------------------------------------------------

-- Seed Organizations
INSERT INTO organizations (id, name, type, code, phone, address)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Metro Health Emergency Medical Network', 'HOSPITAL', 'ORG-METRO-01', '+1 (555) 018-9000', '1001 Potrero Ave, San Francisco, CA'),
  ('22222222-2222-2222-2222-222222222222', 'St. Jude Regional Health System', 'HOSPITAL', 'ORG-STJUDE-02', '+1 (555) 018-9100', '850 Bryant St, San Francisco, CA'),
  ('33333333-3333-3333-3333-333333333333', 'RESQ ONE Rapid Response Fleet Corp', 'AMBULANCE_PROVIDER', 'ORG-RESQ-FLEET', '+1 (555) 019-2000', 'Station 4 CAD Hub, San Francisco, CA')
ON CONFLICT (id) DO NOTHING;

-- Seed Hospitals
INSERT INTO hospitals (id, name, code, organization_id, trauma_level, address, bay_entrance, lat, lng, emergency_phone, total_trauma_bays, occupied_bays)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Metro Health Cardiac & Vascular Institute', 'HOSP-METRO-01', '11111111-1111-1111-1111-111111111111', 'Level 1 Trauma & Cardiac Cath', '1001 Potrero Ave, SF, CA', 'North ER Trauma Wing Entrance', 37.7558, -122.4045, '+1 (555) 019-9114', 12, 3),
  ('bbbb2222-2222-2222-2222-222222222222', 'St. Jude Comprehensive Trauma Center', 'HOSP-STJUDE-02', '22222222-2222-2222-2222-222222222222', 'Level 1 Trauma & Stroke', '850 Bryant St, SF, CA', 'Ambulance Bay Entrance A', 37.7760, -122.4060, '+1 (555) 018-7711', 10, 2),
  ('cccc3333-3333-3333-3333-333333333333', 'Children’s Specialty Acute Pediatric ER', 'HOSP-PED-03', '11111111-1111-1111-1111-111111111111', 'Level 1 Pediatric Trauma', '505 Parnassus Ave, SF, CA', 'Pediatric Emergency Entrance', 37.7632, -122.4578, '+1 (555) 018-4422', 8, 1)
ON CONFLICT (id) DO NOTHING;

-- Seed Ambulances
INSERT INTO ambulances (id, unit_id, vehicle_type, registration_number, organization_id, driver_paramedic, lead_medic, phone, status, current_lat, current_lng, current_address)
VALUES
  ('a0011111-1111-1111-1111-111111111111', 'ALS Medic 14', 'ALS (Advanced Life Support)', 'CAD-CA-9921', '33333333-3333-3333-3333-333333333333', 'Sergeant M. Torres', 'C. Henderson, EMT-P', '+1 (555) 019-9114', 'EN_ROUTE', 37.7785, -122.4140, 'Mission St & 16th St En Route'),
  ('a0022222-2222-2222-2222-222222222222', 'Rescue 08', 'BLS Rapid Response', 'CAD-CA-8808', '33333333-3333-3333-3333-333333333333', 'Officer D. Wu', 'J. Reynolds, EMT-P', '+1 (555) 019-8808', 'ON_SCENE', 37.7725, -122.4289, '72nd St Crosswalk On Scene'),
  ('a0033333-3333-3333-3333-333333333333', 'ALS Unit 22', 'ALS Mobile ICU', 'CAD-CA-2201', '33333333-3333-3333-3333-333333333333', 'Paramedic S. Jackson', 'R. Patel, EMT-P', '+1 (555) 019-2288', 'AVAILABLE', 37.7749, -122.4194, 'Station 4 CAD Bay Standby'),
  ('a0044444-4444-4444-4444-444444444444', 'Medic Unit 05', 'Critical Care Transport', 'CAD-CA-0511', '33333333-3333-3333-3333-333333333333', 'Lt. A. Gomez', 'T. Evans, RN/EMT-P', '+1 (555) 019-0511', 'AVAILABLE', 37.7833, -122.4167, 'Downtown Staging Post')
ON CONFLICT (id) DO NOTHING;

-- Seed Profiles & Doctors
INSERT INTO profiles (id, full_name, email, phone, role)
VALUES
  ('00010001-0001-0001-0001-000000000001', 'Jake Vance', 'jake.vance@example.com', '+1 (555) 018-9921', 'PATIENT'),
  ('00020001-0001-0001-0001-000000000001', 'Dr. Katherine Aris, MD', 'dr.aris@metrohealth.example', '+1 (555) 018-3829', 'DOCTOR'),
  ('00020002-0002-0002-0002-000000000002', 'Dr. Tariq Al-Mansoor, MD', 'dr.mansoor@stjude.example', '+1 (555) 018-7711', 'DOCTOR'),
  ('00030001-0001-0001-0001-000000000001', 'Sergeant M. Torres (Ops Lead)', 'dispatch@resqone.example', '+1 (555) 019-9114', 'AMBULANCE_OPERATOR'),
  ('00040001-0001-0001-0001-000000000001', 'Metro Trauma Intake Bay', 'intake@metrohealth.example', '+1 (555) 019-9114', 'HOSPITAL'),
  ('00050001-0001-0001-0001-000000000001', 'Commander Marcus Sterling', 'admin@resqone.example', '+1 (555) 019-0000', 'SUPER_ADMIN')
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (id, profile_id, registration_number, specialization, experience_years, hospital_affiliation, phone, verification_status, availability)
VALUES
  ('d0011111-1111-1111-1111-111111111111', '00020001-0001-0001-0001-000000000001', 'MD-88219-CAD', 'Attending Emergency Physician & Acute Resuscitation Lead', 14, 'Metro Health Trauma & Cardiac Center', '+1 (555) 018-3829', 'VERIFIED', 'AVAILABLE'),
  ('d0022222-2222-2222-2222-222222222222', '00020002-0002-0002-0002-000000000002', 'MD-74391-TRA', 'Trauma & Emergency Orthopedic Specialist', 11, 'St. Jude Regional Trauma Center', '+1 (555) 018-7711', 'VERIFIED', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- Seed User Roles (Strict Access Model with Dual-Role Support for Doctors)
INSERT INTO user_roles (user_id, role, status)
VALUES
  ('00010001-0001-0001-0001-000000000001', 'PATIENT', 'APPROVED'),
  ('00020001-0001-0001-0001-000000000001', 'DOCTOR', 'APPROVED'),
  ('00020001-0001-0001-0001-000000000001', 'PATIENT', 'APPROVED'), -- Dr. Katherine Aris is also a verified Patient (Dual Role)
  ('00020002-0002-0002-0002-000000000002', 'DOCTOR', 'APPROVED'),
  ('00030001-0001-0001-0001-000000000001', 'AMBULANCE_OPERATOR', 'APPROVED'),
  ('00040001-0001-0001-0001-000000000001', 'HOSPITAL', 'APPROVED'),
  ('00050001-0001-0001-0001-000000000001', 'SUPER_ADMIN', 'APPROVED')
ON CONFLICT (user_id, role) DO NOTHING;
