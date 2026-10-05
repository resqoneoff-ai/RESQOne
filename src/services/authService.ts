import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { AppUserSession, UserRole } from '../types/roles';
import { AmbulanceVerificationStatus } from '../types/ambulance';

const SESSION_STORAGE_KEY = 'resqone_auth_session_v4';

// Primary System Super Admin Email
export const SUPER_ADMIN_EMAIL = 'resqone.off@gmail.com';

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

  private initSession() {
    if (typeof window === 'undefined') return;

    // Check cached session while Firebase auth initializes
    try {
      const cached = localStorage.getItem(SESSION_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.id && parsed.email) {
          this.currentSession = parsed;
        }
      }
    } catch {
      // ignore
    }

    // Subscribe to authoritative Firebase Auth state changes
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const session = await this.resolveUserRolesAndSession(firebaseUser);
        this.currentSession = session;
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        } catch {}
      } else {
        this.currentSession = { ...DEFAULT_ANONYMOUS_SESSION };
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {}
      }

      this.isInitialized = true;
      this.notifyListeners();
    });
  }

  /**
   * Resolves the authoritative role and profile from Firestore for an authenticated Firebase user
   */
  public async resolveUserRolesAndSession(
    firebaseUser: FirebaseUser,
    requestedRole?: UserRole
  ): Promise<AppUserSession> {
    const uid = firebaseUser.uid;
    const email = (firebaseUser.email || '').toLowerCase().trim();
    const displayName =
      firebaseUser.displayName || email.split('@')[0] || 'RESQ One User';

    let role: UserRole = 'PATIENT';
    let approvedRoles: UserRole[] = ['PATIENT'];
    let verificationStatus: AmbulanceVerificationStatus | undefined = undefined;
    let associatedAmbulanceId: string | undefined = undefined;
    let associatedDoctorId: string | undefined = undefined;
    let organizationId: string | undefined = undefined;
    let fullName = displayName;

    // 1. Super Admin Authority Check (App Owner / Admin)
    const isSuperAdminEmail =
      email === SUPER_ADMIN_EMAIL.toLowerCase() ||
      email === 'admin@resqone.com' ||
      email.startsWith('admin@resqone.');

    if (isSuperAdminEmail) {
      role = 'SUPER_ADMIN';
      approvedRoles = [
        'SUPER_ADMIN',
        'RESQ_ADMIN',
        'DOCTOR',
        'AMBULANCE_OPERATOR',
        'PATIENT'
      ];
      verificationStatus = 'APPROVED';
      associatedDoctorId = 'doc-aris-01';
      associatedAmbulanceId = 'amb-unit-001';
      organizationId = 'org-metro-01';
    } else {
      // 2. Query Firestore users/{uid} for stored profile & role
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          if (data.fullName) fullName = data.fullName;
          if (data.role) role = data.role as UserRole;
          if (Array.isArray(data.approvedRoles)) {
            approvedRoles = data.approvedRoles as UserRole[];
          }
          if (data.verificationStatus) {
            verificationStatus = data.verificationStatus as AmbulanceVerificationStatus;
          }
          if (data.associatedAmbulanceId) associatedAmbulanceId = data.associatedAmbulanceId;
          if (data.associatedDoctorId) associatedDoctorId = data.associatedDoctorId;
          if (data.organizationId) organizationId = data.organizationId;
        } else {
          // Document does not exist yet: check if there is an approved Ambulance Application
          const ambAppsQuery = query(
            collection(db, 'ambulanceApplications'),
            where('email', '==', email)
          );
          const ambSnap = await getDocs(ambAppsQuery);

          if (!ambSnap.empty) {
            const appData = ambSnap.docs[0].data();
            verificationStatus = appData.verificationStatus || 'PENDING';
            organizationId = appData.organizationId;
            associatedAmbulanceId = 'amb-unit-001';

            if (verificationStatus === 'APPROVED') {
              role = 'AMBULANCE_OPERATOR';
              approvedRoles = ['AMBULANCE_OPERATOR', 'PATIENT'];
            } else {
              role = 'PATIENT';
              approvedRoles = ['PATIENT'];
            }
          }

          // Create base user record in Firestore
          await setDoc(
            userDocRef,
            {
              id: uid,
              email,
              fullName,
              role,
              approvedRoles,
              verificationStatus: verificationStatus || null,
              createdAt: new Date().toISOString()
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('Could not query Firestore user profile:', err);
      }
    }

    const isDualRole =
      approvedRoles.includes('PATIENT') && approvedRoles.includes('DOCTOR');

    const session: AppUserSession = {
      id: uid,
      email,
      fullName,
      role,
      approvedRoles,
      emailVerified: firebaseUser.emailVerified,
      verificationStatus,
      associatedAmbulanceId,
      associatedDoctorId,
      organizationId,
      googleLinked: firebaseUser.providerData.some(
        (p) => p.providerId === 'google.com'
      ),
      isDualRoleDoctorPatient: isDualRole
    };

    return session;
  }

  /**
   * Google Authentication using real Firebase Auth GoogleAuthProvider
   */
  public async loginWithGoogle(
    intendedRole?: 'DOCTOR' | 'SUPER_ADMIN' | 'PATIENT' | 'AMBULANCE_OPERATOR'
  ): Promise<{
    success: boolean;
    error?: string;
    session?: AppUserSession;
    medicalProfile?: any;
    isUnauthorizedForRole?: boolean;
  }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const session = await this.resolveUserRolesAndSession(
        result.user,
        intendedRole
      );

      this.currentSession = session;
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {}
      this.notifyListeners();

      // Check if user requested a restricted role but lacks verification
      if (intendedRole === 'AMBULANCE_OPERATOR') {
        const isApprovedAmbulance =
          session.role === 'SUPER_ADMIN' ||
          (session.role === 'AMBULANCE_OPERATOR' &&
            session.verificationStatus === 'APPROVED');

        if (!isApprovedAmbulance) {
          return {
            success: true,
            session,
            isUnauthorizedForRole: true,
            error:
              session.verificationStatus === 'PENDING'
                ? 'Your Ambulance Operator application is currently PENDING review by central medical command.'
                : 'Your Google account is authenticated as a PATIENT, but has not been authorized as a verified Ambulance Operator.'
          };
        }
      } else if (intendedRole === 'DOCTOR') {
        const isApprovedDoctor =
          session.role === 'SUPER_ADMIN' || session.approvedRoles.includes('DOCTOR');

        if (!isApprovedDoctor) {
          return {
            success: true,
            session,
            isUnauthorizedForRole: true,
            error:
              'Your Google account is authenticated, but clinical ER telemetry access requires verified physician credentials.'
          };
        }
      } else if (intendedRole === 'SUPER_ADMIN') {
        if (session.role !== 'SUPER_ADMIN' && session.role !== 'RESQ_ADMIN') {
          return {
            success: true,
            session,
            isUnauthorizedForRole: true,
            error:
              'Your Google account is authenticated, but does not possess Super Admin command authorization.'
          };
        }
      }

      return { success: true, session };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let errorMsg = 'Google authentication failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign-in popup was closed before completing.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMsg = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = 'Authentication request was superseded by another popup.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Universal Login with Email & Password via Firebase Authentication
   * Validates real credentials. Never lets in wrong passwords or nonexistent users.
   */
  public async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
    session?: AppUserSession;
    requiresEmailVerification?: boolean;
  }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const session = await this.resolveUserRolesAndSession(
        userCredential.user
      );
      this.currentSession = session;

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {}
      this.notifyListeners();

      return { success: true, session };
    } catch (err: any) {
      console.warn('Firebase login error:', err.code, err.message);

      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        return {
          success: false,
          error: 'Invalid email or password. Please verify your credentials.'
        };
      } else if (err.code === 'auth/invalid-email') {
        return {
          success: false,
          error: 'Please enter a valid email address.'
        };
      } else if (err.code === 'auth/too-many-requests') {
        return {
          success: false,
          error:
            'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.'
        };
      } else if (err.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error:
            'Email/Password sign-in is disabled in your Firebase console. Please sign in with Google ("Continue with Google") or enable Email/Password in Firebase Authentication.'
        };
      }

      return {
        success: false,
        error: err.message || 'Authentication failed. Please check your credentials.'
      };
    }
  }

  public linkGoogleToPatient(patientEmail: string) {
    if (this.currentSession.email.toLowerCase() === patientEmail.toLowerCase()) {
      this.currentSession = { ...this.currentSession, googleLinked: true };
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
      } catch {}
      this.notifyListeners();
    }
  }

  /**
   * Public Registration via Firebase Auth — Strictly PATIENT role only
   */
  public async register(
    fullName: string,
    email: string,
    password: string,
    medicalData?: Record<string, any>
  ): Promise<{
    success: boolean;
    error?: string;
    session?: AppUserSession;
    requiresEmailVerification?: boolean;
  }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !password || !cleanName) {
      return { success: false, error: 'Please provide full name, email, and password.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: cleanName
      });

      // Save Authoritative User Record in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocPayload = {
        id: userCredential.user.uid,
        email: cleanEmail,
        fullName: cleanName,
        role: 'PATIENT',
        approvedRoles: ['PATIENT'],
        createdAt: new Date().toISOString(),
        ...(medicalData || {})
      };

      await setDoc(userDocRef, userDocPayload, { merge: true });

      const session = await this.resolveUserRolesAndSession(userCredential.user);
      this.currentSession = session;

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        if (medicalData) {
          localStorage.setItem('resqone_user_profile', JSON.stringify({
            id: userCredential.user.uid,
            fullName: cleanName,
            email: cleanEmail,
            ...medicalData
          }));
        }
      } catch {}

      this.notifyListeners();
      return { success: true, session };
    } catch (err: any) {
      console.error('Firebase registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        return {
          success: false,
          error: 'An account with this email address already exists. Please log in instead.'
        };
      } else if (err.code === 'auth/weak-password') {
        return {
          success: false,
          error: 'Password is too weak. Please use at least 6 characters.'
        };
      } else if (err.code === 'auth/invalid-email') {
        return {
          success: false,
          error: 'The email address is improperly formatted.'
        };
      } else if (err.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error:
            'Email/Password sign-up is disabled in your Firebase console. Please sign in with Google or enable Email/Password provider in the Firebase Console.'
        };
      }

      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  /**
   * Send Password Reset Email via Firebase Auth
   */
  public async sendPasswordReset(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (err: any) {
      console.warn('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        return {
          success: false,
          error: 'No account found with this email address.'
        };
      }
      return {
        success: false,
        error: err.message || 'Could not send password reset email.'
      };
    }
  }

  /**
   * Sign Out via Firebase Auth
   */
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }

    this.currentSession = { ...DEFAULT_ANONYMOUS_SESSION };
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}

    this.notifyListeners();
  }

  /**
   * Switch active role for verified DUAL ROLE users (PATIENT + DOCTOR)
   */
  public switchDualRole(targetRole: 'PATIENT' | 'DOCTOR') {
    if (
      !this.currentSession.isDualRoleDoctorPatient &&
      !this.currentSession.approvedRoles.includes(targetRole)
    ) {
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
