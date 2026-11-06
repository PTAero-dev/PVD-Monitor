import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    onSnapshot,
    writeBatch,
    type Unsubscribe
} from 'firebase/firestore';
import type { PVDRecord, MemberProfile, RetirementGoalConfig } from '../types';
import { mockPVDHistory, defaultMemberProfile } from './mockData';
import { sortPVDRecords } from './analytics';

export const firebaseConfig = {
    projectId: 'pvd-monitor-aero',
    appId: '1:270353736181:web:e6e27a421b64271a7940bc',
    storageBucket: 'pvd-monitor-aero.firebasestorage.app',
    apiKey: 'AIzaSyC8-_AkouFAVYUPVag_nOQe-V1z6BhRoXY',
    authDomain: 'pvd-monitor-aero.firebaseapp.com',
    messagingSenderId: '270353736181',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const RECORDS_COLLECTION = 'pvd_records';
const SETTINGS_COLLECTION = 'pvd_settings';

/**
 * Clean undefined values recursively so Firestore doesn't reject undefined properties.
 */
function sanitizeForFirestore<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export async function seedInitialPVDDataIfNeeded(): Promise<PVDRecord[]> {
    try {
        const snapshot = await getDocs(collection(db, RECORDS_COLLECTION));
        const existingMap = new Map<string, PVDRecord>();
        snapshot.forEach((docSnap) => {
            const d = docSnap.data() as PVDRecord;
            existingMap.set(docSnap.id, d);
        });

        // Ensure all 27 official statements exist and have rich policy data
        const batch = writeBatch(db);
        let needsCommit = false;

        for (const officialRec of mockPVDHistory) {
            const existing = existingMap.get(officialRec.id);
            if (!existing || !existing.policies || existing.policies.length === 0) {
                const payload = sanitizeForFirestore({
                    ...officialRec,
                    updatedAt: new Date().toISOString()
                });
                batch.set(doc(db, RECORDS_COLLECTION, officialRec.id), payload);
                existingMap.set(officialRec.id, payload);
                needsCommit = true;
            }
        }

        // Also seed member profile if missing
        const profileRef = doc(db, SETTINGS_COLLECTION, 'profile');
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
            batch.set(profileRef, sanitizeForFirestore({
                ...defaultMemberProfile,
                updatedAt: new Date().toISOString()
            }));
            needsCommit = true;
        }

        if (needsCommit) {
            await batch.commit();
        }

        return sortPVDRecords(Array.from(existingMap.values()));
    } catch (err) {
        console.warn('Firestore seed/read fallback to local data:', err);
        return sortPVDRecords(mockPVDHistory);
    }
}

export function subscribeToPVDRecords(
    onData: (records: PVDRecord[]) => void,
    onStatusChange?: (status: 'synced' | 'syncing' | 'offline', error?: string) => void
): Unsubscribe {
    onStatusChange?.('syncing');
    const colRef = collection(db, RECORDS_COLLECTION);

    return onSnapshot(
        colRef,
        (snapshot) => {
            if (snapshot.empty) {
                // Trigger seed if collection is empty
                seedInitialPVDDataIfNeeded().then((seeded) => {
                    onData(seeded);
                    onStatusChange?.('synced');
                });
                return;
            }
            const records: PVDRecord[] = [];
            snapshot.forEach((d) => {
                records.push(d.data() as PVDRecord);
            });
            onData(sortPVDRecords(records));
            onStatusChange?.('synced');
        },
        (error) => {
            console.warn('Firestore real-time listener warning:', error.message);
            onStatusChange?.('offline', error.message);
        }
    );
}

export async function savePVDRecordToCloud(record: PVDRecord): Promise<void> {
    const docId = record.id || `${record.year}-Q${record.quarter}`;
    const payload = sanitizeForFirestore({
        ...record,
        id: docId,
        updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, RECORDS_COLLECTION, docId), payload);
}

export async function saveMultiplePVDRecordsToCloud(records: PVDRecord[]): Promise<void> {
    const batch = writeBatch(db);
    for (const rec of records) {
        const docId = rec.id || `${rec.year}-Q${rec.quarter}`;
        const payload = sanitizeForFirestore({
            ...rec,
            id: docId,
            updatedAt: new Date().toISOString()
        });
        batch.set(doc(db, RECORDS_COLLECTION, docId), payload);
    }
    await batch.commit();
}

export async function deletePVDRecordFromCloud(id: string): Promise<void> {
    await deleteDoc(doc(db, RECORDS_COLLECTION, id));
}

export async function resetCloudToOfficialStatements(): Promise<PVDRecord[]> {
    const snapshot = await getDocs(collection(db, RECORDS_COLLECTION));
    const batch = writeBatch(db);
    snapshot.forEach((d) => {
        batch.delete(d.ref);
    });
    for (const officialRec of mockPVDHistory) {
        const payload = sanitizeForFirestore({
            ...officialRec,
            updatedAt: new Date().toISOString()
        });
        batch.set(doc(db, RECORDS_COLLECTION, officialRec.id), payload);
    }
    await batch.commit();
    return sortPVDRecords(mockPVDHistory);
}

export async function saveRetirementGoalToCloud(config: RetirementGoalConfig): Promise<void> {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'retirement_goal'), sanitizeForFirestore({
        ...config,
        updatedAt: new Date().toISOString()
    }));
}

export async function loadRetirementGoalFromCloud(): Promise<RetirementGoalConfig | null> {
    try {
        const snap = await getDoc(doc(db, SETTINGS_COLLECTION, 'retirement_goal'));
        if (snap.exists()) {
            const d = snap.data();
            return {
                currentAge: d.currentAge ?? 38,
                retirementAge: d.retirementAge ?? 60,
                expectedAnnualReturn: d.expectedAnnualReturn ?? 6.5,
                annualContributionGrowth: d.annualContributionGrowth ?? 4.0,
                targetAmount: d.targetAmount ?? 15000000,
            };
        }
    } catch (e) {
        console.warn('Could not load retirement goal from cloud:', e);
    }
    return null;
}

export async function loadMemberProfileFromCloud(): Promise<MemberProfile> {
    try {
        const snap = await getDoc(doc(db, SETTINGS_COLLECTION, 'profile'));
        if (snap.exists()) {
            return snap.data() as MemberProfile;
        }
    } catch (e) {
        console.warn('Could not load member profile from cloud:', e);
    }
    return defaultMemberProfile;
}
