
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD726409dZY00pbdIdyHEaRBL_U2q0hKCU",
  authDomain: "b6-he195074.firebaseapp.com",
  projectId: "b6-he195074",
  storageBucket: "b6-he195074.firebasestorage.app",
  messagingSenderId: "1092557700920",
  appId: "1:1092557700920:web:f6188454508ecb0d1f4bcd",
  measurementId: "G-S9KVJ67GPN",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const messagingPromise = isSupported()
  .then((supported) => (supported ? getMessaging(app) : null))
  .catch(() => null);
