
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || '';
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId,
  });
}

export const adminDb = getFirestore(admin.app(), firestoreDatabaseId);
export const adminAuth = admin.auth();
