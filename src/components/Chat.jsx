import { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc
} from "firebase/firestore";
import { signOut } from "firebase/auth";

const handleTyping = async (e) => {
  const value = e.target.value;
  setInput(value);

  if (!selectedUser) return;

  const chatId = getChatId(user.uid, selectedUser.uid);

  await setDoc(
    doc(db, "chats", chatId),
    { typing: user.uid },
    { merge: true }
  );
};

function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatMeta, setChatMeta] = useState(null);
  const bottomRef = useRef(null);

  // Load all users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedUser) return;

    const chatId =
      user.uid > selectedUser.uid
        ? user.uid + selectedUser.uid
        : selectedUser.uid + user.uid;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // Listen for typing
  useEffect(() => {
    if (!selectedUser) return;

    const chatId =
      user.uid > selectedUser.uid
        ? user.uid + selectedUser.uid
        : selectedUser.uid + user.uid;

    const unsubscribe = onSnapshot(
      doc(db, "chats", chatId),
      (docSnap) => setChatMeta(docSnap.data())
    );

    return () => unsubscribe();
  }, [selectedUser]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser || input.trim() === "") return;

    const chatId =
      user.uid > selectedUser.uid
        ? user.uid + selectedUser.uid
        : selectedUser.uid + user.uid;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: input,
      senderId: user.uid,
      createdAt: serverTimestamp()
    });

    await setDoc(
      doc(db, "chats", chatId),
      {
        lastMessage: input,
        users: [user.uid, selectedUser.uid],
        typing: false
      },
      { merge: true }
    );

    setInput("");
  };

  return (
    <div style={{ display: "flex", width:"100%", height:"100%", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <div style={{ width: "450px", background: "#111b21", color: "white", borderRight:"1px solid #222" }}>
        <div style={{ padding: "15px", position: "relative" }}>
          <h3>{user.displayName}</h3>
          <button
            onClick={() => signOut(auth)}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              padding: "5px 10px",
              background: "#ff4d4d",
              border: "none",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
        {users.filter(u => u.uid !== user.uid).map(u => (
          <div
            key={u.uid}
            onClick={() => setSelectedUser(u)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              cursor: "pointer",
              background: selectedUser?.uid === u.uid ? "#202c33" : "transparent"
            }}
          >
            <img
              src={u.photo}
              alt=""
              style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
            />
            <div>
              <div>{u.name}</div>
              <small style={{ color: "#00a884" }}>{u.online ? "Online" : "Offline"}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background:"#0b141a" }}>
        {selectedUser ? (
          <>
            <div style={{ padding: "15px", background: "#202c33", color: "white" }}>
              <strong>{selectedUser.name}</strong>
              {chatMeta?.typing === selectedUser.uid && (
                <div style={{ fontSize: "12px", color: "#00a884" }}>typing...</div>
              )}
            </div>

            <div
  style={{
    flex: 1,
    padding: "20px",
    background: "#0b141a",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column"
  }}
>
              {messages.map((msg,i) => (
  <div
    key={i}
    style={{
        alignSelf: msg.senderId === user.uid ? "flex-end" : "flex-start",
      margin: "8px 0"
    }}
  >
    <span style={{
        background: msg.senderId === user.uid ? "#25D366" : "#2a2f32",
        color: "white",
        padding: "10px 15px",
        borderRadius: "15px",
        display:"inline-block",
        maxWidth: "60%",
      }}
    >
      {msg.text}
    </span>
  </div>
))}
              <div ref={bottomRef}></div>
            </div>

            <form onSubmit={sendMessage} style={{ display: "flex", padding: "10px", background: "#202c33" }}>
              <input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Type a message"
/>
              <button type="submit" style={{ marginLeft: "10px", padding: "10px 20px", borderRadius: "20px", border: "none", background: "#00a884", color: "white" }}>Send</button>
            </form>
          </>
        ) : (
          <div style={{ margin: "auto", color: "#555" }}>Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
}

export default Chat;