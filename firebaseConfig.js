import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyBwFqTHtj58-EsbBd61VofROzNC8U5qhEY",
  authDomain: "rehomebud-294c8.firebaseapp.com",
  projectId: "rehomebud-294c8",
  storageBucket: "rehomebud-294c8.firebasestorage.app",
  messagingSenderId: "301258542599",
  appId: "1:301258542599:web:bd9d01818c03861dd4e4a2"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); 
export { auth, db };
export default app;

///