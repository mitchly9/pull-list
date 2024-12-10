// Import Firebase services
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2uNyM3gRmvMgrHCRO3lHN7yRiOaSjxl8",
  authDomain: "bagpulllist.firebaseapp.com",
  projectId: "bagpulllist",
  storageBucket: "bagpulllist.firebasestorage.app",
  messagingSenderId: "629453953802",
  appId: "1:629453953802:web:2cd81e20f382f0b01cb8f3",
  measurementId: "G-92CF0FFPK8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Firestore instance
export { app, db };
