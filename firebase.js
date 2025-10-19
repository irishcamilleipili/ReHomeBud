// firebase.js

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (from your Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBwFqTHtj58-EsbBd61VofROzNC8U5qhEY",
  authDomain: "rehomebud-294c8.firebaseapp.com",
  projectId: "rehomebud-294c8",
  storageBucket: "rehomebud-294c8.appspot.com", // corrected `.app` typo
  messagingSenderId: "301258542599",
  appId: "1:301258542599:web:bd9d01818c03861dd4e4a2"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the auth and db instances for use in your app
export { auth, db };
