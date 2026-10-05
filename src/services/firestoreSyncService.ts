import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  INITIAL_FAMILIES,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_REQUESTS,
  INITIAL_ACCESS_LOGS
} from './familyService';
import {
  FamilyGroup,
  FamilyMemberRecord,
  FamilyJoinRequest,
  EmergencyAccessLog
} from '../types/family';

export interface FirestoreSyncStatus {
  isConnected: boolean;
  isSeeded: boolean;
  lastSyncTime: string | null;
  familyCount: number;
  memberCount: number;
  requestCount: number;
  logCount: number;
  error: string | null;
}

class FirestoreSyncService {
  private static instance: FirestoreSyncService;
  private statusListeners: Set<(status: FirestoreSyncStatus) => void> = new Set();
  private status: FirestoreSyncStatus = {
    isConnected: true,
    isSeeded: false,
    lastSyncTime: null,
    familyCount: 0,
    memberCount: 0,
    requestCount: 0,
    logCount: 0,
    error: null
  };

  public static getInstance(): FirestoreSyncService {
    if (!FirestoreSyncService.instance) {
      FirestoreSyncService.instance = new FirestoreSyncService();
    }
    return FirestoreSyncService.instance;
  }

  public getStatus(): FirestoreSyncStatus {
    return { ...this.status };
  }

  public subscribeStatus(listener: (status: FirestoreSyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatus(update: Partial<FirestoreSyncStatus>) {
    this.status = { ...this.status, ...update };
    this.statusListeners.forEach((l) => l(this.status));
  }

  /**
   * Seed all initial collections and documents directly into Firestore
   * so the Firebase Console is immediately populated with data!
   */
  public async seedFirestoreDatabase(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      let familiesCount = 0;
      let membersCount = 0;
      let requestsCount = 0;
      let logsCount = 0;

      // 1. Seed Families
      for (const fam of INITIAL_FAMILIES) {
        await setDoc(doc(db, 'families', fam.id), fam, { merge: true });
        familiesCount++;
      }

      // 2. Seed Family Members (both under subcollection and root for rapid querying)
      for (const mem of INITIAL_FAMILY_MEMBERS) {
        await setDoc(doc(db, 'families', mem.familyId, 'members', mem.userId), mem, { merge: true });
        // Also save to /members collection for global member indexing
        await setDoc(doc(db, 'members', mem.id), mem, { merge: true });
        membersCount++;
      }

      // 3. Seed Family Join Requests
      for (const req of INITIAL_REQUESTS) {
        await setDoc(doc(db, 'familyInvitations', req.id), req, { merge: true });
        requestsCount++;
      }

      // 4. Seed Emergency Access Logs (Audit Trail)
      for (const log of INITIAL_ACCESS_LOGS) {
        await setDoc(doc(db, 'emergencyAccessLogs', log.id), log, { merge: true });
        logsCount++;
      }

      // 5. Seed Users & Authoritative Medical Passport Profiles
      await setDoc(
        doc(db, 'users', 'usr-sarah-jenkins'),
        {
          id: 'usr-sarah-jenkins',
          email: 'sarah.jenkins@example.com',
          fullName: 'Sarah Jenkins',
          role: 'PATIENT',
          bloodGroup: 'O+',
          allergies: 'Latex',
          preferredHospital: 'St. Jude Comprehensive Trauma Center',
          emergencyContact: 'Robert Vance (+1 555-234-8901)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'users', 'usr-robert-vance'),
        {
          id: 'usr-robert-vance',
          email: 'robert.vance@example.com',
          fullName: 'Robert Vance',
          role: 'PATIENT',
          bloodGroup: 'O+',
          allergies: 'Latex, Sulfa Antibiotics',
          medicalAlerts: 'Pacemaker registered (Medtronic CRT-P implant)',
          preferredHospital: 'St. Jude Comprehensive Cardiac Center',
          emergencyContact: 'Sarah Jenkins (+1 555-891-2345)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      // 6. Seed an Emergency Session
      await setDoc(
        doc(db, 'emergencySessions', 'sess-emerg-8921'),
        {
          id: 'sess-emerg-8921',
          patientName: 'Robert Vance',
          requesterName: 'Sarah Jenkins',
          relationship: 'Father',
          familyId: 'fam-jenkins-01',
          emergencyType: 'Acute Cardiac Telemetry Check',
          severity: 'HIGH PRIORITY',
          status: 'MONITORING',
          locationAddress: '742 Evergreen Terrace, North Ridge District, CA 94102',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      const now = new Date().toISOString();
      this.notifyStatus({
        isConnected: true,
        isSeeded: true,
        lastSyncTime: now,
        familyCount: familiesCount,
        memberCount: membersCount,
        requestCount: requestsCount,
        logCount: logsCount,
        error: null
      });

      return {
        success: true,
        message: `Successfully seeded Firestore with ${familiesCount} families, ${membersCount} members, ${requestsCount} requests, and ${logsCount} audit logs!`,
        details: { familiesCount, membersCount, requestsCount, logsCount }
      };
    } catch (err: any) {
      console.error('Error seeding Firestore database:', err);
      this.notifyStatus({
        isConnected: false,
        error: err.message || 'Failed to seed Firestore'
      });
      return {
        success: false,
        message: err.message || 'Failed to seed Firestore'
      };
    }
  }

  /**
   * Set up real-time listener for Family Groups
   */
  public subscribeFamilies(onUpdate: (families: FamilyGroup[]) => void): Unsubscribe {
    try {
      const q = collection(db, 'families');
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as FamilyGroup);
            onUpdate(items);
            this.notifyStatus({ familyCount: items.length, lastSyncTime: new Date().toISOString() });
          }
        },
        (error) => {
          console.warn('Real-time families snapshot error:', error);
        }
      );
    } catch (err) {
      console.warn('Could not establish real-time families listener:', err);
      return () => {};
    }
  }

  /**
   * Set up real-time listener for Family Members
   */
  public subscribeMembers(familyId: string, onUpdate: (members: FamilyMemberRecord[]) => void): Unsubscribe {
    try {
      const q = collection(db, 'families', familyId, 'members');
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as FamilyMemberRecord);
            onUpdate(items);
            this.notifyStatus({ memberCount: items.length, lastSyncTime: new Date().toISOString() });
          }
        },
        (error) => {
          console.warn('Real-time members snapshot error:', error);
        }
      );
    } catch (err) {
      console.warn('Could not establish real-time members listener:', err);
      return () => {};
    }
  }

  /**
   * Set up real-time listener for Join Requests
   */
  public subscribeRequests(onUpdate: (requests: FamilyJoinRequest[]) => void): Unsubscribe {
    try {
      const q = collection(db, 'familyInvitations');
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as FamilyJoinRequest);
            onUpdate(items);
            this.notifyStatus({ requestCount: items.length, lastSyncTime: new Date().toISOString() });
          }
        },
        (error) => {
          console.warn('Real-time requests snapshot error:', error);
        }
      );
    } catch (err) {
      console.warn('Could not establish real-time requests listener:', err);
      return () => {};
    }
  }

  /**
   * Set up real-time listener for Audit Access Logs
   */
  public subscribeAccessLogs(onUpdate: (logs: EmergencyAccessLog[]) => void): Unsubscribe {
    try {
      const q = collection(db, 'emergencyAccessLogs');
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as EmergencyAccessLog);
            onUpdate(items);
            this.notifyStatus({ logCount: items.length, lastSyncTime: new Date().toISOString() });
          }
        },
        (error) => {
          console.warn('Real-time audit logs snapshot error:', error);
        }
      );
    } catch (err) {
      console.warn('Could not establish real-time access logs listener:', err);
      return () => {};
    }
  }
}

export const firestoreSyncService = FirestoreSyncService.getInstance();
