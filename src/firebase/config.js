import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBNrYUBxtf6WumOt5weMhsc1xB_OMtSFAM",
  authDomain: "tcgerp-b7765.firebaseapp.com",
  projectId: "tcgerp-b7765",
  storageBucket: "tcgerp-b7765.firebasestorage.app",
  messagingSenderId: "1096589586286",
  appId: "1:1096589586286:web:b08c47982cfb87e2181b7f",
  measurementId: "G-H9R0ZW8DRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.log('Analytics not available');
}
export { analytics };

export default app;