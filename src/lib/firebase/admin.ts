import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const apps = getApps();

if (!apps.length) {
  try {
    const formatPrivateKey = (key: string) => {
      if (key.includes('\\n')) {
        return key.replace(/\\n/g, '\n');
      }
      return key;
    };

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY || ''),
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminAuth = getAuth(); 