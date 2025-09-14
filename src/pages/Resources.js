import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function Resources() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); // admin will set
  const [type, setType] = useState("");         // admin will set
  const [url, setUrl] = useState("");
  const [resources, setResources] = useState([]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Fetch existing resources
  useEffect(() => {
    const fetchResources = async () => {
      const querySnapshot = await getDocs(collection(db, "resources"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(data);
    };
    fetchResources();
  }, []);

  // Add new resource
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !type || !url) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await addDoc(collection(db, "resources"), {
        title,
        description,
        category,
        type,
        url,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setCategory("");
      setType("");
      setUrl("");

      // Refresh resources
      const querySnapshot = await getDocs(collection(db, "resources"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(data);
    } catch (err) {
      console.error("Error adding resource:", err);
    }
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
            <p style={menuItemStyle} onClick={() => navigate("/admin-dashboard")}>Dashboard</p>
            <p style={menuItemStyle} onClick={() => navigate("/bookings")}>Bookings</p>
            <p style={menuItemStyle} onClick={() => navigate("/resources")}>Resources</p>
            <p style={menuItemStyle} onClick={() => navigate("/analytics")}>Analytics</p>
            <p style={menuItemStyle} onClick={() => navigate("/forum-management")}>
              Forum Management
            </p>
            <p style={menuItemStyle} onClick={() => navigate("/settings")}>Settings</p>
          </nav>

          <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
        </aside>
      )}

      {/* Main Content */}
      <main style={mainContentStyle}>
        <h2>Manage Resources</h2>

        {/* Add Resource Form */}
        <form onSubmit={handleAddResource} style={formStyle}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">-- Select Type --</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="article">Article</option>
          </select>
          <input
            type="url"
            placeholder="Resource URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={addButtonStyle}>Add Resource</button>
        </form>

        {/* Resources Table */}
        <table style={bookingTableStyle}>
          <thead style={headerRowStyle}>
            <tr>
              <th style={cellStyle}>#</th>
              <th style={cellStyle}>Title</th>
              <th style={cellStyle}>Description</th>
              <th style={cellStyle}>Category</th>
              <th style={cellStyle}>Type</th>
              <th style={cellStyle}>URL</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((res, index) => (
              <tr key={res.id}>
                <td style={cellStyle}>{index + 1}</td>
                <td style={cellStyle}>{res.title}</td>
                <td style={cellStyle}>{res.description}</td>
                <td style={cellStyle}>{res.category}</td>
                <td style={cellStyle}>{res.type}</td>
                <td style={cellStyle}>
                  <a href={res.url} target="_blank" rel="noopener noreferrer">
                    {res.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

/* --- same styles from your Bookings page --- */
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
const bookingTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  backgroundColor: "white",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
};
const cellStyle = {
  border: "1px solid #bdc3c7",
  padding: "10px",
  textAlign: "center",
  fontSize: "14px",
};
const headerRowStyle = {
  backgroundColor: "#2c3e50",
  color: "white",
};

export default Resources;
