import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // MUST IMPORT THESE

// Your specific keys from the Firebase Console go here
const firebaseConfig = {
  apiKey: "AIzaSyBY-NXxfuhPaJqtvTOyquyEX5s_tHpjAvk",
  authDomain: "drishti-ai-a1483.firebaseapp.com",
  projectId: "drishti-ai-a1483",
  storageBucket: "drishti-ai-a1483.firebasestorage.app",
  messagingSenderId: "99586511641",
  appId: "1:99586511641:web:6010a8e921c504572f2b88",
  measurementId: "G-R3C06V65B7"
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize the Auth Service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 3. EXPORT THEM (This is the part your code was complaining about!)
export { auth, googleProvider };