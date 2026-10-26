import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDA08Uv49-n-NWChH81rtJJ53DGEbiJRMQ",
  authDomain: "glide-f1a5e.firebaseapp.com",
  projectId: "glide-f1a5e",
  storageBucket: "glide-f1a5e.firebasestorage.app",
  messagingSenderId: "9429295407",
  appId: "1:9429295407:web:466a6331ebd28c227b01da",
  measurementId: "G-DXB63N016L"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;