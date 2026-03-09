/**
 * LOKASI FAIL: src/firebase-config.js
 * * Cara guna:
 * Di dalam fail lain (contoh: App.jsx), anda boleh panggil dengan:
 * import { db, auth } from './firebase-config';
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Vite menggunakan import.meta.env untuk membaca Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Fungsi semakan untuk memastikan config dimuatkan
const checkConfig = () => {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error("❌ Ralat: Kunci Firebase berikut tidak dijumpai di Vercel/Local:", missingKeys.join(", "));
    return false;
  }
  return true;
};

let app, db, auth;

if (checkConfig()) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("✅ Firebase berjaya dihubungkan!");
} else {
  console.warn("⚠️ Aplikasi berjalan tanpa konfigurasi Firebase yang lengkap. Sila semak Environment Variables di Vercel.");
}

export { db, auth };
