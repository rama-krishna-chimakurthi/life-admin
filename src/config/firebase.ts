// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
// @ts-ignore: getReactNativePersistence exists in the RN bundle 
// but is often missing from public TypeScript definitions.
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: String(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: String(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: String(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: String(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: String(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: String(process.env.EXPO_PUBLIC_FIREBASE_APP_ID)
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);