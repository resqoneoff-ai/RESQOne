import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AppUserSession, UserRole, UserRoleAssignment } from '../types/roles';

const SESSION_STORAGE_KEY = 'resqone_auth_session_v3';

// Default initial state before authentication
export const DEFAULT_ANONYMOUS_SESSION: AppUserSession = {
  id: '',
  email: '',
  fullName: '',
  role: 'PATIENT',
  approvedRoles: ['PATIENT'],
  emailVerified: false,
  isDualRoleDoctorPatient: false
};

class AuthService {
  private currentSession: AppUserSession = { ...DEFAULT_ANONYMOUS_SESSION };
  private listeners: Set<(session: AppUserSession) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.initSession();
  }

  private async initSession() {
    if (typeof window === 'undefined') return;

    // Check localStorage cached session
    try {
      const cached = localStorage.getItem(SESSION_STORAGE_KEY);
      if (cached) {
        this.currentSession = JSON.parse(cached);
      }
    } catch {
      // ignore
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          await this.syncUserFromDatabase(user);
        } else {
          // No active Supabase session
          if (!this.currentSession.id) {
            this.currentSession = { ...DEFAULT_ANONYMOUS_SESSION };
          }
        }

        // Listen for Supabase auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await this.syncUserFromDatabase(session.user);
          } else if (event === 'SIGNED_OUT') {
            this.currentSession = { ...DEFAULT_ANONYMOUS_SESSION };
            localStorage.removeItem(SESSION_STORAGE_KEY);
            this.notifyListeners();
          }
        });
      } catch (err) {
        console.warn('AuthService Supabase init error:', err);
      }
    }

    this.isInitialized = true;
    this.notifyListeners();
  }

  /**
   * Syncs user profile and approved roles from Supabase database
   */
  private async syncUserFromDatabase(authUser: any) {
    if (!supabase) return;

    const email = authUser.email || '';
    const emailVerified = Boolean(authUser.email_confirmed_at);
    let fullName = authUser.user_metadata?.full_name || email.split('@')[0] || 'RESQ User';
    let approvedRoles: UserRole[] = [];

    try {
      // 1. Check user_roles table
      const { data: roleRows, error: roleError } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', authUser.id)
        .eq('status', 'APPROVED');

      if (!roleError && roleRows && roleRows.length > 0) {
        approvedRoles = roleRows.map((r: any) => r.role as UserRole);
      } else {
        // Fallback: check profile table role
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('auth_user_id', authUser.id)
          .maybeSingle();

        if (profileRow) {
          if (profileRow.full_name) fullName = profileRow.full_name;
          if (profileRow.role) approvedRoles = [profileRow.role as UserRole];
        }
      }
    } catch (err) {
      console.warn('Error reading approved roles:', err);
    }

    // Default to PATIENT if no roles assigned
    if (approvedRoles.length === 0) {
      approvedRoles = ['PATIENT'];
    }

    // Determine primary active role
    let activeRole: UserRole = 'PATIENT';
    if (approvedRoles.includes('SUPER_ADMIN')) {
      activeRole = 'SUPER_ADMIN';
    } else if (approvedRoles.includes('RESQ_ADMIN')) {
      activeRole = 'RESQ_ADMIN';
    } else if (approvedRoles.includes('DOCTOR')) {
      activeRole = 'DOCTOR';
    } else if (approvedRoles.includes('AMBULANCE_OPERATOR')) {
      activeRole = 'AMBULANCE_OPERATOR';
    } else if (approvedRoles.includes('HOSPITAL')) {
      activeRole = 'HOSPITAL';
    } else {
      activeRole = 'PATIENT';
    }

    const isDualRole = approvedRoles.includes('PATIENT') && approvedRoles.includes('DOCTOR');

    this.currentSession = {
      id: authUser.id,
      email,
      fullName,
      role: activeRole,
      approvedRoles,
      emailVerified,
      isDualRoleDoctorPatient: isDualRole
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch {
      // ignore
    }

    this.notifyListeners();
  }

  /**
   * Check if patient has already completed registration
   */
  public getRegisteredPatients(): Array<{ id: string; email: string; fullName: string; profile?: any; googleLinked?: boolean }> {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('resqone_registered_patients');
      if (stored) return JSON.parse(stored);
    } catch {}

    // Default registered demo patient
    return [
      {
        id: 'usr-primary-001',
        email: 'resqone.off@gmail.com',
        fullName: 'Sarah Jenkins',
        googleLinked: true,
        profile: {
          bloodGroup: 'O+',
          allergies: ['Penicillin'],
          medicalConditions: ['Mild Asthma']
        }
      },
      {
        id: 'usr-primary-002',
        email: 'sarah.jenkins@example.com',
        fullName: 'Sarah Jenkins',
        googleLinked: true
      }
    ];
  }

  /**
   * Check if an email belongs to an already registered patient
   */
  public async isPatientRegistered(email: string): Promise<{ registered: boolean; patientData?: any }> {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Check local registered patients
    const patients = this.getRegisteredPatients();
    const found = patients.find((p) => p.email.toLowerCase() === cleanEmail);
    if (found) {
      return { registered: true, patientData: found };
    }

    // 2. Check cached user profile
    if (typeof window !== 'undefined') {
      try {
        const storedProfile = localStorage.getItem('resqone_user_profile');
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed.email && parsed.email.toLowerCase() === cleanEmail) {
            return { registered: true, patientData: parsed };
          }
        }
      } catch {}
    }

    // 3. Check Supabase profiles if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (data) {
          return { registered: true, patientData: data };
        }
      } catch (e) {
        console.warn('Supabase check isPatientRegistered error:', e);
      }
    }

    return { registered: false };
  }

  /**
   * Google Authentication Handler
   * - DOCTOR: Google Sign-In for Board-Certified Physicians
   * - ADMIN: Google Sign-In for Central Command Administrators
   * - AMBULANCE_OPERATOR: Google Sign-In for Verified Ambulance Operators & EMTs
   * - PATIENT: ONLY for patients who ALREADY created an account!
   */
  public async loginWithGoogle(
    intendedRole: 'DOCTOR' | 'SUPER_ADMIN' | 'PATIENT' | 'AMBULANCE_OPERATOR' = 'PATIENT',
    customGoogleEmail?: string
  ): Promise<{
    success: boolean;
    error?: string;
    session?: AppUserSession;
    isNewPatientBlocked?: boolean;
    medicalProfile?: any;
  }> {
    const targetEmail = (customGoogleEmail || 'resqone.off@gmail.com').trim().toLowerCase();

    // -------------------------------------------------------------
    // RULE ENFORCEMENT: Patients MUST already be registered!
    // -------------------------------------------------------------
    if (intendedRole === 'PATIENT') {
      const check = await this.isPatientRegistered(targetEmail);
      if (!check.registered) {
        return {
          success: false,
          isNewPatientBlocked: true,
          error:
            'Google authentication is only available for patients who already created an account. New patients must first complete medical registration (blood group, allergies & emergency contacts) so first responders have your emergency passport.'
        };
      }

      // Existing patient verified: proceed with login
      const patientName = check.patientData?.fullName || check.patientData?.full_name || 'Verified Patient';
      this.currentSession = {
        id: check.patientData?.id || `usr-${Date.now()}`,
        email: targetEmail,
        fullName: patientName,
        role: 'PATIENT',
        approvedRoles: ['PATIENT'],
        emailVerified: true,
        googleLinked: true,
        isDualRoleDoctorPatient: false
      };

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch {}

      this.notifyListeners();
      return { success: true, session: this.currentSession, medicalProfile: check.patientData };
    }

    // -------------------------------------------------------------
    // DOCTOR Google Sign-In
    // -------------------------------------------------------------
    if (intendedRole === 'DOCTOR') {
      this.currentSession = {
        id: `usr-doc-${Date.now()}`,
        email: targetEmail,
        fullName: 'Dr. Katherine Aris, MD (Google Verified)',
        role: 'DOCTOR',
        approvedRoles: ['DOCTOR', 'PATIENT'],
        emailVerified: true,
        googleLinked: true,
        associatedDoctorId: 'doc-aris-01',
        isDualRoleDoctorPatient: true
      };

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch {}

      this.notifyListeners();
      return { success: true, session: this.currentSession };
    }

    // -------------------------------------------------------------
    // AMBULANCE_OPERATOR Google Sign-In
    // -------------------------------------------------------------
    if (intendedRole === 'AMBULANCE_OPERATOR') {
      // Check if user has an existing application
      let verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' = 'APPROVED';
      let fullName = 'Marcus Vance, Lead Paramedic';
      let callsign = 'MEDIC-42 (ALS)';
      let organizationId = 'org-metro-01';

      if (targetEmail.includes('elena')) {
        verificationStatus = 'PENDING';
        fullName = 'Officer Elena Cross';
        callsign = 'UNIT-71 (BLS)';
        organizationId = 'org-bay-02';
      } else if (targetEmail.includes('david')) {
        verificationStatus = 'UNDER_REVIEW';
        fullName = 'David Chen, Paramedic';
        callsign = 'AMB-204 (ALS Rescue)';
        organizationId = 'org-gold-03';
      }

      this.currentSession = {
        id: `usr-amb-${Date.now()}`,
        email: targetEmail,
        fullName: `${fullName} (Google Verified)`,
        role: 'AMBULANCE_OPERATOR',
        approvedRoles: verificationStatus === 'APPROVED' ? ['AMBULANCE_OPERATOR', 'PATIENT'] : ['PATIENT'],
        verificationStatus,
        emailVerified: true,
        googleLinked: true,
        associatedAmbulanceId: 'amb-unit-001',
        organizationId,
        isDualRoleDoctorPatient: false
      };

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch {}

      this.notifyListeners();
      return { success: true, session: this.currentSession };
    }

    // -------------------------------------------------------------
    // ADMIN Google Sign-In
    // -------------------------------------------------------------
    if (intendedRole === 'SUPER_ADMIN') {
      this.currentSession = {
        id: `usr-adm-${Date.now()}`,
        email: targetEmail,
        fullName: 'Command Administrator (Google Verified)',
        role: 'SUPER_ADMIN',
        approvedRoles: ['SUPER_ADMIN', 'RESQ_ADMIN', 'DOCTOR', 'AMBULANCE_OPERATOR'],
        emailVerified: true,
        googleLinked: true,
        isDualRoleDoctorPatient: false
      };

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch {}

      this.notifyListeners();
      return { success: true, session: this.currentSession };
    }

    return { success: false, error: 'Unsupported Google authentication role' };
  }

  /**
   * Link Google account to an existing patient profile
   */
  public linkGoogleToPatient(patientEmail: string) {
    const patients = this.getRegisteredPatients();
    const idx = patients.findIndex((p) => p.email.toLowerCase() === patientEmail.toLowerCase());
    if (idx >= 0) {
      patients[idx].googleLinked = true;
      try {
        localStorage.setItem('resqone_registered_patients', JSON.stringify(patients));
      } catch {}
    }

    if (this.currentSession.email.toLowerCase() === patientEmail.toLowerCase()) {
      this.currentSession = { ...this.currentSession, googleLinked: true };
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch {}
      this.notifyListeners();
    }
  }

  /**
   * Universal Login with Email & Password
   */
  public async login(email: string, password: string): Promise<{ success: boolean; error?: string; session?: AppUserSession; requiresEmailVerification?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Check email verification if confirmation is active
          const isVerified = Boolean(data.user.email_confirmed_at);
          if (!isVerified) {
            return {
              success: false,
              requiresEmailVerification: true,
              error: 'Please verify your email before continuing.'
            };
          }

          await this.syncUserFromDatabase(data.user);
          return { success: true, session: this.currentSession };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Fallback for development if Supabase credentials are not yet provisioned
    const fallbackRole: UserRole = cleanEmail.includes('doc')
      ? 'DOCTOR'
      : cleanEmail.includes('amb') || cleanEmail.includes('ops')
      ? 'AMBULANCE_OPERATOR'
      : cleanEmail.includes('hosp')
      ? 'HOSPITAL'
      : cleanEmail.includes('adm')
      ? 'SUPER_ADMIN'
      : 'PATIENT';

    let ambulanceVerification: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | undefined = undefined;
    if (fallbackRole === 'AMBULANCE_OPERATOR') {
      if (cleanEmail.includes('elena') || cleanEmail.includes('pending')) {
        ambulanceVerification = 'PENDING';
      } else if (cleanEmail.includes('david') || cleanEmail.includes('review')) {
        ambulanceVerification = 'UNDER_REVIEW';
      } else {
        ambulanceVerification = 'APPROVED';
      }
    }

    this.currentSession = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      fullName: cleanEmail.split('@')[0],
      role: fallbackRole,
      approvedRoles: fallbackRole === 'AMBULANCE_OPERATOR' && ambulanceVerification !== 'APPROVED' ? ['PATIENT'] : [fallbackRole],
      emailVerified: true,
      verificationStatus: ambulanceVerification,
      associatedAmbulanceId: fallbackRole === 'AMBULANCE_OPERATOR' ? 'amb-unit-001' : undefined,
      organizationId: fallbackRole === 'AMBULANCE_OPERATOR' ? 'org-metro-01' : undefined,
      isDualRoleDoctorPatient: false
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch {}

    this.notifyListeners();
    return { success: true, session: this.currentSession };
  }

  /**
   * Public Registration — Strictly PATIENT role only with full Medical Profile
   */
  public async register(
    fullName: string,
    email: string,
    password: string,
    medicalData?: Record<string, any>
  ): Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (medicalData) {
      try {
        localStorage.setItem('resqone_user_profile', JSON.stringify({
          id: `usr-${Date.now()}`,
          fullName: cleanName,
          email: cleanEmail,
          ...medicalData
        }));

        // Record in registered patients list so Google sign-in is enabled for them
        const patients = this.getRegisteredPatients();
        if (!patients.some((p) => p.email.toLowerCase() === cleanEmail)) {
          patients.push({
            id: `usr-${Date.now()}`,
            email: cleanEmail,
            fullName: cleanName,
            profile: medicalData
          });
          localStorage.setItem('resqone_registered_patients', JSON.stringify(patients));
        }
      } catch {}
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              role: 'PATIENT', // Strictly PATIENT only for public self-registration
              medical_passport: medicalData || null
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const isVerified = Boolean(data.user?.email_confirmed_at);
        if (!isVerified) {
          return {
            success: true,
            requiresEmailVerification: true
          };
        }

        if (data.user) {
          await this.syncUserFromDatabase(data.user);
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    // Dev fallback
    this.currentSession = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      fullName: cleanName,
      role: 'PATIENT',
      approvedRoles: ['PATIENT'],
      emailVerified: true
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch {}

    this.notifyListeners();
    return { success: true };
  }

  /**
   * Forgot Password Reset
   */
  public async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  }

  /**
   * Logout
   */
  public async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }

    this.currentSession = { ...DEFAULT_ANONYMOUS_SESSION };
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}

    this.notifyListeners();
  }

  /**
   * Switch active view role for DUAL ROLE users (PATIENT + DOCTOR)
   */
  public switchDualRole(targetRole: 'PATIENT' | 'DOCTOR') {
    if (!this.currentSession.isDualRoleDoctorPatient && !this.currentSession.approvedRoles.includes(targetRole)) {
      console.warn('Unauthorized role switch attempt');
      return;
    }
    this.currentSession = {
      ...this.currentSession,
      role: targetRole
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch {}
    this.notifyListeners();
  }

  public getSession(): AppUserSession {
    return this.currentSession;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentSession.id && this.currentSession.email);
  }

  public subscribe(listener: (session: AppUserSession) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentSession);
      } catch (err) {
        console.error('AuthService listener error:', err);
      }
    });
  }
}

export const authService = new AuthService();
