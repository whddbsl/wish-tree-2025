import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth 초기화
const auth = getAuth(app);

// Firestore 초기화 with 설정
const db = getFirestore(app);

// Firestore 설정
const connectFirestoreEmulator = async () => {
  if (process.env.NODE_ENV === 'development') {
    const { connectFirestoreEmulator } = await import('firebase/firestore');
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
};

// 개발 환경에서만 에뮬레이터 연결
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator();
}

export { auth, db }; 