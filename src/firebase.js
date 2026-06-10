// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKroi_kcDvL-PPEIvMnWsaaGl0l9mgKWg",
  authDomain: "financial-platform-e3cdd.firebaseapp.com",
  projectId: "financial-platform-e3cdd",
  storageBucket: "financial-platform-e3cdd.firebasestorage.app",
  messagingSenderId: "1060695188193",
  appId: "1:1060695188193:web:e0dfe82647341f11f7cda0",
  measurementId: "G-62KNKD9N03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);