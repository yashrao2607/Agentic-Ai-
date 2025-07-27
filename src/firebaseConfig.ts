// src/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration using your keys
const firebaseConfig = {
    apiKey: "AIzaSyCtbNLRoSjEeO6CmYqpUUAgekswCE8-msI",
    authDomain: "poetic-inkwell-464523-j5.firebaseapp.com",
    projectId: "poetic-inkwell-464523-j5",
    storageBucket: "poetic-inkwell-464523-j5.firebasestorage.app",
    messagingSenderId: "396048445465",
    appId: "1:396048445465:web:573c785cc1945377533a88",
    measurementId: "G-5279197F2J"
  };

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Firebase services
const dbService = getFirestore(app);
const storageService = getStorage(app);

// 3. Export the services so other files can import them
// This 'export' keyword is what fixes your error.
export const db = dbService;
export const storage = storageService;