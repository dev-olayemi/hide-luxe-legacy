import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Guard analytics so missing env values don't crash the app in dev/preview
let analytics: ReturnType<typeof getAnalytics> | null = null;
try {
  if (
    typeof window !== "undefined" &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  ) {
    analytics = getAnalytics(app);
  }
} catch (err) {
  console.warn("Firebase analytics initialization failed", err);
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
