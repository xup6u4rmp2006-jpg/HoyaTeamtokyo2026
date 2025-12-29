
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 這是你的專案 hoyatokyo2026 的正式配置
const firebaseConfig = {
  apiKey: "AIzaSyABaxLFGWi9Ry7akEN1qi2BKYu2vTH0peU",
  authDomain: "hoyatokyo2026.firebaseapp.com",
  projectId: "hoyatokyo2026",
  storageBucket: "hoyatokyo2026.firebasestorage.app",
  messagingSenderId: "115590727694",
  appId: "1:115590727694:web:dbc77d3310111a1604d45f",
  measurementId: "G-Q3WT7KPKKG"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 導出 Firestore 資料庫實例供全站使用
export const db = getFirestore(app);
