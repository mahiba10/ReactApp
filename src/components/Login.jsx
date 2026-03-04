import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function Login() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        online: true,
      });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "200px" }}>
      <h2>Login to WhatsApp Clone</h2>
      <button
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          background: "#00a884",
          color: "white",
          cursor: "pointer",
          marginTop: "20px"
        }}
        onClick={handleLogin}
      >
        Login with Google
      </button>
    </div>
  );
}

export default Login;