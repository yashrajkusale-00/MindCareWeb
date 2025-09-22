import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function ForumManagement() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch messages and replies
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "forums"), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      const msgs = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Admin reply
  const handleReply = async (msgId) => {
    const replyText = prompt("Enter your reply:");
    if (!replyText || replyText.trim() === "") return;

    try {
      await addDoc(collection(db, "forums"), {
        sender: "admin",
        text: replyText,
        createdAt: serverTimestamp(),
        replyTo: msgId,
      });
      fetchMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  // Delete message
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteDoc(doc(db, "forums", id));
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

            // Render messages in chat-style
            const renderMessages = () => {
              const topMessages = messages.filter((m) => !m.replyTo);
              return topMessages.map((msg) => {
                const msgText = msg.message || msg.text || "";
                const time = msg.createdAt?.seconds
                  ? new Date(msg.createdAt.seconds * 1000).toLocaleString()
                  : "";

                const replies = messages.filter((r) => r.replyTo === msg.id);

                return (
                  <div key={msg.id} style={{ marginBottom: "20px" }}>
          <div style={messageBubbleStyle(msg.sender)}>
            <p>
              <strong>{msg.sender === "admin" ? "Admin" : msg.prn}:</strong> {msgText}
            </p>
            <small>{time}</small>
          </div>

          {replies.map((r) => {
            const replyText = r.text || r.message || "";
            const replyTime = r.createdAt?.seconds
              ? new Date(r.createdAt.seconds * 1000).toLocaleString()
              : "";
            return (
              <div
                key={r.id}
                style={{ ...messageBubbleStyle(r.sender), marginLeft: "40px" }}
              >
                <p>
                  <strong>{r.sender === "admin" ? "Admin" : r.prn}:</strong> {replyText}
                </p>
                <small>{replyTime}</small>
              </div>
            );
          })}


          {/* Actions */}
          {msg.sender !== "admin" && (
            <div style={{ marginTop: "5px" }}>
              <button style={chatButtonStyle} onClick={() => handleReply(msg.id)}>
                Reply
              </button>
              <button style={deleteButtonStyle} onClick={() => handleDelete(msg.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  // Sidebar logout
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {!sidebarOpen && (
        <div style={hamburgerOutsideStyle} onClick={() => setSidebarOpen(true)}>
          <div style={lineStyle}></div>
          <div style={lineStyle}></div>
          <div style={lineStyle}></div>
        </div>
      )}

      {sidebarOpen && (
        <aside style={sideMenuStyle}>
          <div style={hamburgerInsideStyle} onClick={() => setSidebarOpen(false)}>
            <div style={lineStyle}></div>
            <div style={lineStyle}></div>
            <div style={lineStyle}></div>
          </div>

          <div style={logoStyle}>MindCare</div>
          <nav style={{ width: "100%", marginTop: "20px" }}>
            <p style={menuItemStyle} onClick={() => navigate("/admin-dashboard")}>
              Dashboard
            </p>
            <p style={menuItemStyle} onClick={() => navigate("/bookings")}>
              Bookings
            </p>
            <p style={menuItemStyle} onClick={() => navigate("/resources")}>
              Resources
            </p>
            <p style={menuItemStyle} onClick={() => navigate("/analytics")}>
              Analytics
            </p>
            <p style={menuItemStyle} onClick={() => navigate("/forum-management")}>
              Forum Management
            </p>
            <p style={menuItemStyle} onClick={handleLogout}>
              Logout
            </p>
          </nav>
        </aside>
      )}

      <main style={mainContentStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Forum Management</h2>
        <div style={cardStyle}>
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: "center" }}>No messages found.</p>
          ) : (
            renderMessages()
          )}
        </div>
      </main>
    </div>
  );
}

/* --- Styles --- */
const hamburgerOutsideStyle = {
  position: "fixed", top: "20px", left: "20px", cursor: "pointer",
  display: "flex", flexDirection: "column", justifyContent: "space-between",
  height: "20px", width: "25px", zIndex: 1000,
};
const hamburgerInsideStyle = { cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "20px", width: "25px", marginBottom: "20px", alignSelf: "flex-start" };
const lineStyle = { height: "4px", backgroundColor: "#4b589fff", borderRadius: "2px" };
const sideMenuStyle = { position: "fixed", top: 0, left: 0, height: "100%", width: "220px", backgroundColor: "#2c3e50", color: "white", padding: "20px 15px", display: "flex", flexDirection: "column", alignItems: "stretch", boxSizing: "border-box", zIndex: 999 };
const logoStyle = { backgroundColor: "#27ae60", width: "100%", textAlign: "center", padding: "20px", borderRadius: "10px", fontSize: "24px", fontWeight: "bold", boxSizing: "border-box" };
const menuItemStyle = { padding: "12px 15px", cursor: "pointer", borderBottom: "1px solid #34495e", textAlign: "left", width: "100%", boxSizing: "border-box", color: "white" };
const mainContentStyle = { flex: 1, marginLeft: "0px", padding: "20px", backgroundColor: "#ecf0f1", minHeight: "100vh", display: "flex", flexDirection: "column" };
const cardStyle = { backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "100%", flex: 1, overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
const messageBubbleStyle = (sender) => ({
  backgroundColor: sender === "admin" ? "#3498db" : "#eee",
  color: sender === "admin" ? "white" : "black",
  padding: "10px 15px",
  borderRadius: "20px",
  maxWidth: "70%",
  marginBottom: "5px",
});
const chatButtonStyle = { padding: "5px 12px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px", marginRight: "10px" };
const deleteButtonStyle = { padding: "5px 12px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" };

export default ForumManagement;
