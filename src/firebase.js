import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // MUST IMPORT THESE

// Your specific keys from the Firebase Console go here
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize the Auth Service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 3. EXPORT THEM (This is the part your code was complaining about!)
export { auth, googleProvider };