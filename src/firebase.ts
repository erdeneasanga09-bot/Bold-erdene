import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDX5Jv5uSdCQJeGk0m17_tqHCcoB-3h_no",
  authDomain: "favorable-autonomy-s77bw.firebaseapp.com",
  projectId: "favorable-autonomy-s77bw",
  storageBucket: "favorable-autonomy-s77bw.firebasestorage.app",
  messagingSenderId: "301508744240",
  appId: "1:301508744240:web:364ab23856a7078f7d89f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific databaseId from config
export const db = initializeFirestore(app, {}, "ai-studio-vvka-278d66d9-f9c6-46c1-93e7-175bb3da9c6c");
