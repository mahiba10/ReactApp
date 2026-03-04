import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import Login from "./components/Login";
import Chat from "./components/Chat";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle offline detection
  useEffect(() => {
    if (!user) return;

    const handleOffline = async () => {
      await updateDoc(doc(db, "users", user.uid), { online: false });
    };

    window.addEventListener("beforeunload", handleOffline);

    return () => window.removeEventListener("beforeunload", handleOffline);
  }, [user]);

  if (loading) return <div style={{textAlign: "center", marginTop: "200px"}}>Loading...</div>;

  return (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#0b141a"
    }}
  >
    <div
      style={{
        width: "1520px",
        height: "90vh",
        display: "flex",
        background: "#111b21",
      }}
    >
      {user ? <Chat user={user} /> : <Login />}
    </div>
  </div>
);
}

export default App;