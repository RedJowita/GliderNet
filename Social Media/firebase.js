import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6Z0MPmH-rliIBOFYnGLlxcoYtD8ncyhk",
  authDomain: "glide-e4022.firebaseapp.com",
  projectId: "glide-e4022",
  storageBucket: "glide-e4022.firebasestorage.app",
  messagingSenderId: "39229613873",
  appId: "1:39229613873:web:42554d3923de3b9ac73210",
  measurementId: "G-5176WEWFWR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;