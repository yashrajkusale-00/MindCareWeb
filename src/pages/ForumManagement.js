import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc,query,orderBy,addDoc,onSnapshot,serverTimestamp} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function ForumManagement() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState({});
  const navigate = useNavigate();

  // Fetch forum messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      //query with orderby --->latest first
      const q = query(collection(db, "forums"), orderBy("createdAt","desc"));
      const querySnapshot = await getDocs(q);
      const msgs = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMessages(msgs);

      // Listen for chats for each forum post
      msgs.forEach((msg) => {
        const unsub = onSnapshot(
          collection(db, "forums", msg.id, "chats"),
          (snapshot) => {
            setChats((prev) => ({
              ...prev,
              [msg.id]: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
            }));
          }
        );
        return () => unsub();
      });

    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  //Admin reply(Chat)
  const adminchat = async (id) => {
    const reply = window.prompt("Enter your reply:");
    if (reply && reply.trim() !== "") {
      try {
        await addDoc(collection(db, "forums", id, "chats"), {
          sender: "admin",
          createdAt: serverTimestamp(),
        });
        alert("Reply sent successfully!");
      } catch (error) {
        console.error("Error sending reply:", error);
      }
    }
  };

  // Delete a forum message
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "forums", id));
        setMessages(messages.filter((msg) => msg.id !== id));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Sidebar Toggle */}
      {!sidebarOpen && (
        <div style={hamburgerOutsideStyle} onClick={() => setSidebarOpen(true)}>
          <div style={lineStyle}></div>
          <div style={lineStyle}></div>
          <div style={lineStyle}></div>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={sideMenuStyle}>
          <div
            style={hamburgerInsideStyle}
            onClick={() => setSidebarOpen(false)}
          >
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
            <p style={menuItemStyle} onClick={() => navigate("/settings")}>
              Settings
            </p> 
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main style={mainContentStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Forum Management
        </h2>

        <div style={cardStyle}>
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: "center" }}>No messages found.</p>
          ) : (
            <ul style={messageListStyle}>
              {messages.map((msg) => (
                <li key={msg.id} style={messageItemStyle}>
                  <p>
                    <strong>User ID:</strong> {msg.userId}
                  </p>
                  <p>
                    <strong>Message:</strong> {msg.message}
                  </p>
                  <p>
                    <small>
                      {msg.createdAt
                        ? new Date(
                            msg.createdAt.seconds * 1000
                          ).toLocaleString()
                        : ""}
                    </small>
                  </p>
                  {/* Show chats */}
                  {chats[msg.id] && chats[msg.id].length > 0 && (
                    <div style={{ marginTop: "10px", paddingLeft: "10px" }}>
                      <strong>Replies:</strong>
                      {chats[msg.id].map((c) => (
                        <p key={c.id}>
                          <strong>{c.sender}:</strong> {c.text}
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    style={chatButtonStyle}
                    onClick={() => adminchat(msg.id)}
                  >
                    Reply
                  </button>
                  <button
                    style={deleteButtonStyle}
                    onClick={() => handleDelete(msg.id)}
                  >
                    Delete
                  </button> 
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

/* --- Sidebar Styles --- */
const hamburgerOutsideStyle = {
  position: "fixed",
  top: "20px",
  left: "20px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "20px",
  width: "25px",
  zIndex: 1000,
};

const hamburgerInsideStyle = {
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "20px",
  width: "25px",
  marginBottom: "20px",
  alignSelf: "flex-start",
};

const lineStyle = {
  height: "4px",
  backgroundColor: "#4b589fff",
  borderRadius: "2px",
};

const sideMenuStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100%",
  width: "220px",
  backgroundColor: "#2c3e50",
  color: "white",
  padding: "20px 15px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
  zIndex: 999,
};

const logoStyle = {
  backgroundColor: "#27ae60",
  width: "100%",
  textAlign: "center",
  padding: "20px",
  borderRadius: "10px",
  fontSize: "24px",
  fontWeight: "bold",
  boxSizing: "border-box",
};

const menuItemStyle = {
  padding: "12px 15px",
  cursor: "pointer",
  borderBottom: "1px solid #34495e",
  textAlign: "left",
  width: "100%",
  boxSizing: "border-box",
  color: "white",
};

/* --- Main Content --- */
const mainContentStyle = {
  flex: 1,
  marginLeft: "0px",
  padding: "20px",
  backgroundColor: "#ecf0f1",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

/* --- Card Full Width --- */
const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "100%",
  flex: 1, // take full height
  overflowY: "auto",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
};

/* --- Forum Message Styles --- */
const messageListStyle = {
  listStyleType: "none",
  padding: 0,
};

const messageItemStyle = {
  borderBottom: "1px solid #ddd",
  padding: "15px 0",
};

const chatButtonStyle = {
  padding: "5px 12px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
  marginRight: "10px",
};

const deleteButtonStyle = {
  padding: "5px 12px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
};

export default ForumManagement;
