// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 👈 استيراد خدمة التخزين

const firebaseConfig = {
  apiKey: "AIzaSyCQSuAbg2dmIchnxV5puFA0ZPN7nMVikuc",
  authDomain: "lmny-34117.firebaseapp.com",
  projectId: "lmny-34117",
  storageBucket: "lmny-34117.firebasestorage.app",
  messagingSenderId: "12942279022",
  appId: "1:12942279022:web:d8467287be58c2cdf0c17f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 👈 تصدير الـ storage عشان يشتغل في صفحة الواجبات
