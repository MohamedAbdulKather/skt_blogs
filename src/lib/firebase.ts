// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDait3-XM02r5dccT4Vctyco3ZYRtxhu-s",
  authDomain: "sithai-blogs-78c4c.firebaseapp.com",
  projectId: "sithai-blogs-78c4c",
  storageBucket: "sithai-blogs-78c4c.firebasestorage.app",
  messagingSenderId: "379027242977",
  appId: "1:379027242977:web:2d2f6c7b7686970b575ca0",
  measurementId: "G-R706BD1JP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Use emulators in development if the environment variable is set
// Note: This block will only run in the browser, not during SSR
if (typeof window !== 'undefined' && isDevelopment && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  try {
    console.log('Connecting to Firebase emulators...');
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    console.log('Successfully connected to Firebase emulators');
  } catch (error) {
    console.error('Failed to connect to Firebase emulators:', error);
  }
}

export { db, storage, auth };