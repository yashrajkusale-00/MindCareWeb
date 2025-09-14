import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Settings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for admin info
  const [adminEmail, setAdminEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [address, setAddress] = useState("");
  const [studentsCount, setStudentsCount] = useState(0);
  const [prnFormat, setPrnFormat] = useState("");

  // Fetch current admin info
  useEffect(() => {
    const fetchAdminData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setAdminEmail(data.email || "");
        setInstitution(data.institution || "");
        setAddress(data.address || "");
        setStudentsCount(data.studentsCount || 0);
        setPrnFormat(data.prnFormat || "");
      }
    };
    fetchAdminData();
  }, []);

  // Save updated PRN format
  const handleSave = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        prnFormat,
      });
      alert("PRN Format updated successfully!");
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to update settings");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div style={containerStyle}>
      {/* Hamburger Icon */}
      <div style={hamburgerStyle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <div style={lineStyle}></div>
        <div style={lineStyle}></div>
        <div style={lineStyle}></div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={sideMenuStyle}>
          <div
            style={hamburgerInsideStyle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
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

          <button style={logoutButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </aside>
      )}

      {/* Main Content */}
      <main style={mainContentStyle}>
        <h2>Settings</h2>

        {/* Admin Info (Read Only) */}
        <div style={formStyle}>
          <p><strong>Admin Email:</strong> {adminEmail}</p>
          <p><strong>Institution:</strong> {institution}</p>
          <p><strong>Address:</strong> {address || "Not set"}</p>
          <p><strong>Students Enrolled:</strong> {studentsCount}</p>
        </div>

        {/* PRN Format Form */}
        <form onSubmit={handleSave} style={formStyle}>
          <input
            type="text"
            placeholder="PRN Format (e.g. PRN-2025-XXX)"
            value={prnFormat}
            onChange={(e) => setPrnFormat(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={addButtonStyle}>
            Save PRN Format
          </button>
        </form>
      </main>
    </div>
  );
}

/* --- same styles from your Resources page --- */
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  fontFamily: "Arial, sans-serif",
};
const hamburgerStyle = {
  position: "absolute",
  top: "15px",
  left: "15px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "24px",
  width: "35px",
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
const logoutButtonStyle = {
  marginTop: "auto",
  marginBottom: "20px",
  padding: "10px 20px",
  backgroundColor: "#e74c3c",
  border: "1px solid #c0392b",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer",
  width: "100%",
};
const mainContentStyle = {
  flex: 1,
  padding: "20px",
  backgroundColor: "#ecf0f1",
  marginTop: "60px",
};
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginBottom: "20px",
  backgroundColor: "white",
  padding: "15px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
};
const inputStyle = {
  padding: "10px",
  border: "1px solid #bdc3c7",
  borderRadius: "5px",
  fontSize: "14px",
};
const addButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#27ae60",
  border: "none",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Settings;
