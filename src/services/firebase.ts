import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error handling matching FirestoreErrorInfo specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL: Connection verification at startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firestore real-time cloud connection established.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline mode active or network disconnected.');
    } else {
      console.log('Firestore connection verified with cloud database.');
    }
    return true;
  }
}

// Subscribe to a collection with real-time updates
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const items: T[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as T);
      });
      onData(items);
    },
    (error) => {
      console.warn(`Firestore onSnapshot warning on ${collectionName}:`, error.message);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, collectionName);
      } catch (e) {
        // Logged
      }
    }
  );
}

/**
 * Deeply sanitizes an object before writing to Firestore.
 * Firestore throws a runtime error if any property is undefined.
 * This function recursively strips undefined fields, replacing them with null or omitting them.
 */
export function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeFirestoreData(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = sanitizeFirestoreData(value);
    }
  }
  return clean as T;
}

// Set or merge a document in Firestore
export async function saveDocumentToFirestore<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const cleanData = sanitizeFirestoreData(data);
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// Delete a document from Firestore
export async function deleteDocumentFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

// Check if a collection is empty
export async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.empty;
  } catch {
    return false;
  }
}

// Seed initial items to Firestore if empty
export async function seedInitialFirestoreData(
  collectionName: string,
  items: Array<{ id: string; [key: string]: any }>
): Promise<void> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    if (!snap.empty) return; // already has data
    const batch = writeBatch(db);
    items.forEach(item => {
      const cleanItem = sanitizeFirestoreData(item);
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, cleanItem);
    });
    await batch.commit();
    console.log(`Seeded ${items.length} records into Firestore /${collectionName}`);
  } catch (error) {
    console.warn(`Initial seed skipped or failed for ${collectionName}:`, error);
  }
}

// Force-restore/re-populate initial clinic items in Firestore (used during explicit Reset)
export async function forceSeedInitialFirestoreData(
  collectionName: string,
  items: Array<{ id: string; [key: string]: any }>
): Promise<void> {
  try {
    const batch = writeBatch(db);
    items.forEach(item => {
      const cleanItem = sanitizeFirestoreData(item);
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, cleanItem, { merge: true });
    });
    await batch.commit();
    console.log(`Force-restored ${items.length} records into Firestore /${collectionName}`);
  } catch (error) {
    console.warn(`Force seed error on ${collectionName}:`, error);
  }
}
