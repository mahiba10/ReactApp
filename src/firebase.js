import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6aFiVbosfmH1aHjVdb1dzU5qJxMQceOs",
  authDomain: "whatsapp-clone-2b807.firebaseapp.com",
  projectId: "whatsapp-clone-2b807",
  storageBucket: "whatsapp-clone-2b807.firebasestorage.app",
  messagingSenderId: "571862788914",
  appId: "1:571862788914:web:03218044cff8b8911a052b",
  measurementId: "G-PQKSWVK88N"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);