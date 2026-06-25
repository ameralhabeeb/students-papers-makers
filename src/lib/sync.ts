import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './auth';

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserData {
  notes?: string;
  completedSteps?: Record<string, number[]>;
  completedChecklists?: Record<string, string[]>;
}

export const saveUserDataToCloud = async (userId: string, data: UserData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Using setDoc with merge so it creates or updates safely
    await setDoc(userRef, {
      userId,
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};

export const subscribeToUserData = (userId: string, onUpdate: (data: UserData) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      onUpdate({
        notes: data.notes || '',
        completedSteps: data.completedSteps || {},
        completedChecklists: data.completedChecklists || {}
      });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  });
};
