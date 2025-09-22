import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function CounsellorResources() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [prn, setPrn] = useState("");

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "resources"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !type || !url || !prn) {
      alert("Please fill all fields including PRN!");
      return;
    }

    try {
      await addDoc(collection(db, "resources"), {
        title,
        description,
        category,
        type,
        url,
        prn,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setCategory("");
      setType("");
      setUrl("");
      setPrn("");

      // Refresh table
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
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
            <p style={menuItemStyle} onClick={() => navigate("/counsellor-dashboard")}>Dashboard</p>
            <p style={menuItemStyle} onClick={() => navigate("/counsellor-bookings")}>Bookings</p>
            <p style={menuItemStyle} onClick={() => navigate("/counsellor-resources")}>Resources</p>
            <p style={menuItemStyle} onClick={() => navigate("/counsellor-analytics")}>Analytics</p>
          </nav>
          <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
        </aside>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px", backgroundColor: "#ecf0f1", marginLeft: sidebarOpen ? "230px" : "0", overflowY: "auto" }}>
        <h2>Manage Resources</h2>

        {/* Full-width Form */}
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
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle} required>
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
          <input
            type="text"
            placeholder="Student PRN"
            value={prn}
            onChange={(e) => setPrn(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={addButtonStyle}>Add Resource</button>
        </form>

        {/* Resources Table */}
        {loading ? (
          <p>Loading resources...</p>
        ) : resources.length === 0 ? (
          <p>No resources found.</p>
        ) : (
          <table style={tableStyle}>
            <thead style={headerStyle}>
              <tr>
                <th style={cellStyle}>#</th>
                <th style={cellStyle}>Title</th>
                <th style={cellStyle}>Description</th>
                <th style={cellStyle}>Category</th>
                <th style={cellStyle}>Type</th>
                <th style={cellStyle}>URL</th>
                <th style={cellStyle}>PRN</th>
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
                    <a href={res.url} target="_blank" rel="noopener noreferrer">Open</a>
                  </td>
                  <td style={cellStyle}>{res.prn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

// Styles
const hamburgerStyle = { position: "absolute", top: "15px", left: "15px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "24px", width: "35px", zIndex: 1000 };
const hamburgerInsideStyle = { cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "20px", width: "25px", marginBottom: "20px", alignSelf: "flex-start" };
const lineStyle = { height: "4px", backgroundColor: "#4b589fff", borderRadius: "2px" };
const sideMenuStyle = { position: "fixed", top: 0, left: 0, height: "100%", width: "220px", backgroundColor: "#2c3e50", color: "white", padding: "20px 15px", display: "flex", flexDirection: "column", alignItems: "stretch", boxSizing: "border-box" };
const logoStyle = { backgroundColor: "#27ae60", width: "100%", textAlign: "center", padding: "20px", borderRadius: "10px", fontSize: "24px", fontWeight: "bold", boxSizing: "border-box" };
const menuItemStyle = { padding: "12px 15px", cursor: "pointer", borderBottom: "1px solid #34495e", textAlign: "left", width: "100%", boxSizing: "border-box", color: "white" };
const logoutButtonStyle = { marginTop: "auto", marginBottom: "20px", padding: "10px 20px", backgroundColor: "#e74c3c", border: "1px solid #c0392b", borderRadius: "5px", color: "white", cursor: "pointer", width: "100%" };

const formStyle = { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", width: "100%", backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
const inputStyle = { padding: "10px", fontSize: "14px", width: "100%", boxSizing: "border-box", border: "1px solid #bdc3c7", borderRadius: "5px" };
const addButtonStyle = { padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "150px" };
const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
const headerStyle = { backgroundColor: "#2c3e50", color: "white" };
const cellStyle = { border: "1px solid #bdc3c7", padding: "10px", textAlign: "center" };

export default CounsellorResources;
