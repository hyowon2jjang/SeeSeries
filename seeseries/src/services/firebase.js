// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOeryqHpGU9n5hcB_hAIVxQMPT5R3yXsc",
  authDomain: "seeseries-66a16.firebaseapp.com",
  projectId: "seeseries-66a16",
  storageBucket: "seeseries-66a16.firebasestorage.app",
  messagingSenderId: "248946339515",
  appId: "1:248946339515:web:47acb05a981bd78e7ec39e",
  measurementId: "G-BVJL2GSNMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firestore를 이렇게 export 해야 함
export const db = getFirestore(app);