import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('firebase-applet-config.json not found');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log(`Connecting to Firestore database: ${config.firestoreDatabaseId || 'default'} in project: ${config.projectId}...`);

  const app = initializeApp(config);
  const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

  console.log('1. Seeding Families...');
  await setDoc(doc(db, 'families', 'fam-jenkins-01'), {
    id: 'fam-jenkins-01',
    name: 'Jenkins Family Circle',
    familyCode: 'RESQ-FAM-7K42P',
    ownerUserId: 'usr-sarah-jenkins',
    ownerName: 'Sarah Jenkins',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'families', 'fam-care-02'), {
    id: 'fam-care-02',
    name: 'Grandmother Care Group',
    familyCode: 'RESQ-FAM-4M89X',
    ownerUserId: 'usr-sarah-jenkins',
    ownerName: 'Sarah Jenkins',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('2. Seeding Family Members (Subcollection & Root)...');
  const members = [
    {
      id: 'mem-sarah-jenkins',
      familyId: 'fam-jenkins-01',
      userId: 'usr-sarah-jenkins',
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      relationship: 'Self',
      age: 32,
      role: 'ADMIN',
      status: 'ACTIVE',
      permissionLevel: 'LEVEL_3',
      locationPermission: { canShareCurrentLocation: true, canShareLastKnownLocation: true, canShareLiveLocationDuringEmergency: true },
      authorizedInfo: { bloodGroup: 'O+', allergies: ['NKDA'], preferredHospital: 'St. Jude Comprehensive Trauma Center' },
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    },
    {
      id: 'mem-robert-vance',
      familyId: 'fam-jenkins-01',
      userId: 'usr-robert-vance',
      fullName: 'Robert Vance',
      email: 'robert.vance@example.com',
      phone: '+1 (555) 234-8901',
      relationship: 'Father',
      age: 68,
      role: 'MEMBER',
      status: 'ACTIVE',
      permissionLevel: 'LEVEL_3',
      locationPermission: { canShareCurrentLocation: true, canShareLastKnownLocation: true, canShareLiveLocationDuringEmergency: true },
      authorizedInfo: {
        bloodGroup: 'O+',
        allergies: ['Latex', 'Sulfa Antibiotics'],
        medicalConditions: ['Cardiac Arrhythmia', 'Controlled Hypertension', 'Type 2 Diabetes'],
        medicalAlerts: ['Pacemaker registered (Medtronic CRT-P implant)'],
        medicalDevices: ['Medtronic CRT-P Pacemaker (Model Viva XT)'],
        preferredHospital: 'St. Jude Comprehensive Cardiac Center',
        insuranceStatus: 'Medicare Advantage Platinum',
        emergencyContactName: 'Sarah Jenkins (Daughter)',
        emergencyContactPhone: '+1 (555) 891-2345'
      },
      liveLocation: {
        address: '742 Evergreen Terrace, North Ridge District, CA 94102',
        lat: 37.7749,
        lng: -122.4194,
        lastPing: 'Updated 2 mins ago',
        deviceOnline: true
      },
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    },
    {
      id: 'mem-elena-vance',
      familyId: 'fam-jenkins-01',
      userId: 'usr-elena-vance',
      fullName: 'Elena Vance',
      email: 'elena.vance@example.com',
      phone: '+1 (555) 432-7890',
      relationship: 'Mother',
      age: 65,
      role: 'MEMBER',
      status: 'ACTIVE',
      permissionLevel: 'LEVEL_2',
      locationPermission: { canShareCurrentLocation: true, canShareLastKnownLocation: true, canShareLiveLocationDuringEmergency: true },
      authorizedInfo: {
        bloodGroup: 'A+',
        allergies: ['Severe Penicillin (Anaphylaxis)', 'Tree Nuts'],
        medicalConditions: ['Asthma (Moderate Persistent)', 'Osteoarthritis'],
        medicalAlerts: ['Severe Penicillin Allergy (Requires Epinephrine)'],
        preferredHospital: 'Northwestern Memorial Hospital Trauma Care'
      },
      liveLocation: {
        address: '1084 Marina Blvd, Bayside District, CA 94123',
        lat: 37.8044,
        lng: -122.4381,
        lastPing: 'Updated 8 mins ago',
        deviceOnline: true
      },
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    },
    {
      id: 'mem-liam-vance',
      familyId: 'fam-jenkins-01',
      userId: 'usr-liam-vance',
      fullName: 'Liam Vance',
      email: 'liam.vance@example.com',
      phone: '+1 (555) 678-1234',
      relationship: 'Brother',
      age: 29,
      role: 'MEMBER',
      status: 'ACTIVE',
      permissionLevel: 'LEVEL_1',
      locationPermission: { canShareCurrentLocation: false, canShareLastKnownLocation: true, canShareLiveLocationDuringEmergency: true },
      authorizedInfo: {
        bloodGroup: 'O+',
        allergies: ['NKDA'],
        medicalConditions: ['Mild Exercise-Induced Asthma'],
        medicalAlerts: ['Carries rescue inhaler during athletic activity']
      },
      liveLocation: {
        address: 'Last known: 250 King St, Mission Bay, CA 94107',
        lat: 37.7766,
        lng: -122.3948,
        lastPing: 'Updated 45 mins ago',
        deviceOnline: true
      },
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    }
  ];

  for (const m of members) {
    await setDoc(doc(db, 'families', m.familyId, 'members', m.userId), m);
    await setDoc(doc(db, 'members', m.id), m);
  }

  console.log('3. Seeding Family Join Requests...');
  await setDoc(doc(db, 'familyInvitations', 'req-aarav-sharma'), {
    id: 'req-aarav-sharma',
    familyId: 'fam-jenkins-01',
    familyName: 'Jenkins Family Circle',
    userId: 'usr-aarav-sharma',
    userFullName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@example.com',
    userPhone: '+1 (555) 789-0123',
    userAge: 34,
    relationship: 'Cousin',
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    initialPermissionLevel: 'LEVEL_2',
    initialLocationPermission: { canShareCurrentLocation: true, canShareLastKnownLocation: true, canShareLiveLocationDuringEmergency: true }
  });

  console.log('4. Seeding Emergency Access Logs...');
  await setDoc(doc(db, 'emergencyAccessLogs', 'log-001'), {
    id: 'log-001',
    sessionId: 'sess-emerg-8921',
    familyId: 'fam-jenkins-01',
    familyName: 'Jenkins Family Circle',
    viewerUserId: 'usr-sarah-jenkins',
    viewerName: 'Sarah Jenkins',
    viewerRole: 'Family Admin',
    profileOwnerUserId: 'usr-robert-vance',
    profileOwnerName: 'Robert Vance',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accessReason: 'Emergency Assistance Screen & Telemetry Verification',
    informationAccessed: ['Blood Group', 'Pacemaker Alert', 'Medications', 'Live GPS Location'],
    permissionLevelApplied: 'LEVEL_3',
    locationAccessed: true
  });

  await setDoc(doc(db, 'emergencyAccessLogs', 'log-002'), {
    id: 'log-002',
    sessionId: 'sess-emerg-5412',
    familyId: 'fam-jenkins-01',
    familyName: 'Jenkins Family Circle',
    viewerUserId: 'usr-sarah-jenkins',
    viewerName: 'Sarah Jenkins',
    viewerRole: 'Family Admin',
    profileOwnerUserId: 'usr-elena-vance',
    profileOwnerName: 'Elena Vance',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    accessReason: 'Emergency Triage Check',
    informationAccessed: ['Penicillin Anaphylaxis Alert', 'Emergency Contacts', 'Live Location'],
    permissionLevelApplied: 'LEVEL_2',
    locationAccessed: true
  });

  console.log('5. Seeding Users Profiles...');
  await setDoc(doc(db, 'users', 'usr-sarah-jenkins'), {
    id: 'usr-sarah-jenkins',
    email: 'sarah.jenkins@example.com',
    fullName: 'Sarah Jenkins',
    role: 'PATIENT',
    bloodGroup: 'O+',
    allergies: 'Latex',
    preferredHospital: 'St. Jude Comprehensive Trauma Center',
    createdAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'users', 'usr-robert-vance'), {
    id: 'usr-robert-vance',
    email: 'robert.vance@example.com',
    fullName: 'Robert Vance',
    role: 'PATIENT',
    bloodGroup: 'O+',
    allergies: 'Latex, Sulfa Antibiotics',
    medicalAlerts: 'Pacemaker registered (Medtronic CRT-P implant)',
    preferredHospital: 'St. Jude Comprehensive Cardiac Center',
    createdAt: new Date().toISOString()
  });

  console.log('6. Seeding Emergency Sessions...');
  await setDoc(doc(db, 'emergencySessions', 'sess-emerg-8921'), {
    id: 'sess-emerg-8921',
    patientName: 'Robert Vance',
    requesterName: 'Sarah Jenkins',
    relationship: 'Father',
    familyId: 'fam-jenkins-01',
    emergencyType: 'Acute Cardiac Telemetry Check',
    severity: 'HIGH PRIORITY',
    status: 'ACTIVE_MONITORING',
    locationAddress: '742 Evergreen Terrace, North Ridge District, CA 94102',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('SUCCESS! Firestore database has been completely seeded!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
