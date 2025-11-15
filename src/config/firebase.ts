// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCM03G6pnCe7LAEroTMSPorn7w3FdbgdCw",
  authDomain: "life-admin-rk.firebaseapp.com",
  projectId: "life-admin-rk",
  storageBucket: "life-admin-rk.firebasestorage.app",
  messagingSenderId: "629243027134",
  appId: "1:629243027134:web:ccd8f73b891c4877c408ef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);