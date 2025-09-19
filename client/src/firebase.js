// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCagDhZyfhtN9WW2W8qa7crSyMLeNaYWFA",
  authDomain: "tombolalalegende.firebaseapp.com",
  projectId: "tombolalalegende",
  storageBucket: "tombolalalegende.firebasestorage.app",
  messagingSenderId: "564114826637",
  appId: "1:564114826637:web:60a3db57b0a806eba149c4",
  measurementId: "G-G06VPP0KKZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
