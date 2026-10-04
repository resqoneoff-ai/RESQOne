import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MedicalRecord, UserEmergencyProfile, EmergencyCase } from '../types/emergency';
import { DoctorOnboardingRequest, DoctorRecord } from '../types/roles';
import { INITIAL_MEDICAL_RECORDS } from '../data/mockInitialData';

const LOCAL_STORAGE_RECORDS_KEY = 'resqone_medical_records_v1';
const LOCAL_STORAGE_ONBOARDING_KEY = 'resqone_doctor_onboarding_v1';

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- RESQ ONE EMERGENCY CARE PLATFORM - SUPABASE SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. PATIENT MEDICAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.medical_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  relationship TEXT DEFAULT 'Self',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  facility TEXT,
  attending_doctor TEXT,
  diagnosis TEXT,
  clinical_summary TEXT,
  medications_prescribed JSONB DEFAULT '[]'::jsonb,
  findings_or_results TEXT,
  relevant_for_emergency BOOLEAN DEFAULT true,
  attachments JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMERGENCY CASES TABLE (Real-time CAD Dispatch Telemetry)
CREATE TABLE IF NOT EXISTS public.emergency_cases (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  target_mode TEXT DEFAULT 'ME',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  case_data JSONB NOT NULL
);

-- 3. DOCTOR ONBOARDING REQUESTS TABLE (Physician Credential Review)
CREATE TABLE IF NOT EXISTS public.doctor_onboarding_requests (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 5,
  hospital_affiliation TEXT NOT NULL,
  qualifications TEXT,
  telemetry_preference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCTORS REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 5,
  hospital_affiliation TEXT NOT NULL,
  phone TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'APPROVED',
  availability TEXT NOT NULL DEFAULT 'AVAILABLE',
  rating NUMERIC DEFAULT 4.95,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PATIENT PROFILES & EMERGENCY PASSPORTS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PATIENT',
  blood_group TEXT DEFAULT 'O+',
  allergies JSONB DEFAULT '[]'::jsonb,
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  preferred_hospitals JSONB DEFAULT '[]'::jsonb,
  insurance_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY & PUBLIC POLICIES FOR DEMO / PROTOTYPING
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_onboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for authenticated & anon clients
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Medical Records') THEN
    CREATE POLICY "Public Access for Medical Records" ON public.medical_records FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Emergency Cases') THEN
    CREATE POLICY "Public Access for Emergency Cases" ON public.emergency_cases FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Onboarding Requests') THEN
    CREATE POLICY "Public Access for Onboarding Requests" ON public.doctor_onboarding_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Doctors') THEN
    CREATE POLICY "Public Access for Doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Profiles') THEN
    CREATE POLICY "Public Access for Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

class SupabaseDataService {
  /**
   * Fetch all medical records (Supabase with localStorage fallback)
   */
  public async getMedicalRecords(): Promise<MedicalRecord[]> {
    // 1. Check Supabase first if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .order('date', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: MedicalRecord[] = data.map((row: any) => ({
            id: row.id,
            patientId: row.patient_id,
            patientName: row.patient_name,
            title: row.title,
            category: row.category,
            date: row.date,
            doctorOrFacility: row.doctor_or_facility,
            summary: row.summary,
            fileName: row.file_name,
            fileType: row.file_type,
            fileSize: row.file_size,
            tags: Array.isArray(row.tags) ? row.tags : []
          }));

          // Cache locally
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(mapped));
            } catch {}
          }
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch medical records warning:', err);
      }
    }

    // 2. Fallback to localStorage or initial seed
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {}
    }

    return [...INITIAL_MEDICAL_RECORDS];
  }

  /**
   * Save / Upsert a single medical record
   */
  public async saveMedicalRecord(record: MedicalRecord): Promise<{ success: boolean; error?: string }> {
    // Save locally
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
        const records: MedicalRecord[] = cached ? JSON.parse(cached) : [...INITIAL_MEDICAL_RECORDS];
        const existingIdx = records.findIndex((r) => r.id === record.id);
        if (existingIdx >= 0) {
          records[existingIdx] = record;
        } else {
          records.unshift(record);
        }
        localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(records));
      } catch (e) {
        console.warn('Failed saving medical record locally:', e);
      }
    }

    // Upsert to Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('medical_records').upsert({
          id: record.id,
          patient_id: record.patientId,
          patient_name: record.patientName,
          title: record.title,
          category: record.category,
          date: record.date,
          doctor_or_facility: record.doctorOrFacility || 'General Hospital',
          summary: record.summary || '',
          file_name: record.fileName || null,
          file_type: record.fileType || null,
          file_size: record.fileSize || null,
          tags: record.tags || [],
          updated_at: new Date().toISOString()
        });

        if (error) {
          console.warn('Supabase upsert medical_records error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.warn('Supabase saveMedicalRecord error:', err);
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }

  /**
   * Delete a medical record
   */
  public async deleteMedicalRecord(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
        if (cached) {
          const records: MedicalRecord[] = JSON.parse(cached);
          localStorage.setItem(
            LOCAL_STORAGE_RECORDS_KEY,
            JSON.stringify(records.filter((r) => r.id !== id))
          );
        }
      } catch {}
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('medical_records').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete medical_records error:', err);
      }
    }
  }

  /**
   * Doctor Onboarding Requests Management
   */
  public async getDoctorOnboardingRequests(): Promise<DoctorOnboardingRequest[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('doctor_onboarding_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: DoctorOnboardingRequest[] = data.map((row: any) => ({
            id: row.id,
            fullName: row.full_name,
            email: row.email,
            phone: row.phone,
            registrationNumber: row.registration_number,
            specialization: row.specialization,
            experienceYears: row.experience_years,
            hospitalAffiliation: row.hospital_affiliation,
            qualifications: row.qualifications,
            telemetryPreference: row.telemetry_preference,
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at,
            reviewedBy: row.reviewed_by,
            reviewedAt: row.reviewed_at
          }));

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_ONBOARDING_KEY, JSON.stringify(mapped));
            } catch {}
          }
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch doctor onboarding error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_ONBOARDING_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    // Default sample request for demonstration
    return [
      {
        id: 'req-doc-demo-01',
        fullName: 'Dr. Marcus Vance, MD',
        email: 'dr.vance@metroemergency.org',
        phone: '+1 (555) 019-3388',
        registrationNumber: 'MD-92817-EM',
        specialization: 'Emergency Medicine & Critical Resuscitation',
        experienceYears: 12,
        hospitalAffiliation: 'Metro Health Emergency Network',
        qualifications: 'MD (Stanford), Board Certified ABEM, ACLS/ATLS Instructor',
        telemetryPreference: 'Live CAD Video & Audio Resuscitation Telemetry',
        notes: 'Requested urgent clinical onboarding to support high-priority cardiac and trauma telemetry.',
        status: 'PENDING_VERIFICATION',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ];
  }

  /**
   * Submit Doctor Onboarding Request
   */
  public async submitDoctorOnboardingRequest(
    request: Omit<DoctorOnboardingRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; error?: string; request?: DoctorOnboardingRequest }> {
    const newRequest: DoctorOnboardingRequest = {
      ...request,
      id: `req-doc-${Date.now()}`,
      status: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString()
    };

    // Save locally
    if (typeof window !== 'undefined') {
      try {
        const existing = await this.getDoctorOnboardingRequests();
        localStorage.setItem(
          LOCAL_STORAGE_ONBOARDING_KEY,
          JSON.stringify([newRequest, ...existing])
        );
      } catch {}
    }

    // Save to Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('doctor_onboarding_requests').insert({
          id: newRequest.id,
          full_name: newRequest.fullName,
          email: newRequest.email,
          phone: newRequest.phone,
          registration_number: newRequest.registrationNumber,
          specialization: newRequest.specialization,
          experience_years: newRequest.experienceYears,
          hospital_affiliation: newRequest.hospitalAffiliation,
          qualifications: newRequest.qualifications || null,
          telemetry_preference: newRequest.telemetryPreference || null,
          notes: newRequest.notes || null,
          status: newRequest.status,
          created_at: newRequest.createdAt
        });

        if (error) {
          console.warn('Supabase submitDoctorOnboardingRequest error:', error);
        }
      } catch (err) {
        console.warn('Supabase submitDoctorOnboardingRequest error:', err);
      }
    }

    return { success: true, request: newRequest };
  }

  /**
   * Review & Update Doctor Onboarding Request Status (Approve / Reject)
   */
  public async updateDoctorOnboardingStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reviewerName: string
  ): Promise<boolean> {
    const reviewedAt = new Date().toISOString();

    // Update locally
    if (typeof window !== 'undefined') {
      try {
        const requests = await this.getDoctorOnboardingRequests();
        const updated = requests.map((r) =>
          r.id === id ? { ...r, status, reviewedBy: reviewerName, reviewedAt } : r
        );
        localStorage.setItem(LOCAL_STORAGE_ONBOARDING_KEY, JSON.stringify(updated));
      } catch {}
    }

    // Update in Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('doctor_onboarding_requests')
          .update({
            status,
            reviewed_by: reviewerName,
            reviewed_at: reviewedAt
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateDoctorOnboardingStatus error:', err);
      }
    }

    return true;
  }
}

export const supabaseDataService = new SupabaseDataService();
