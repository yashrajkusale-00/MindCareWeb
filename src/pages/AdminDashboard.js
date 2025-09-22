import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [screeningData, setScreeningData] = useState([]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); 
  };

  // 🔥 Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const collegeName = "I²IT";
        const querySnapshot = await getDocs(
          collection(db, "colleges", collegeName, "students")
        );
        const studentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // 🔥 Fetch screening results
  useEffect(() => {
    const fetchScreening = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "screening"));
        const data = querySnapshot.docs.map((doc) => {
          const d = doc.data();
          const createdAt = d.createdAt ? new Date(d.createdAt) : null;
          return {
            id: doc.id,
            prn: d.prn,
            testType: d.testType,
            score: d.score,
            college: d.college,
            createdAt,
            formattedTime: createdAt ? createdAt.toLocaleString() : "N/A",
          };
        });
        setScreeningData(data);
      } catch (error) {
        console.error("Error fetching screening:", error);
      }
    };

    fetchScreening();
  }, []);

  // Severity checkers
  const getSeverity = (testType, score) => {
    if (testType === "PHQ-9") {
      if (score >= 20) return "Severe depression";
      if (score >= 15) return "Moderately severe depression";
      if (score >= 10) return "Moderate depression";
      if (score >= 5) return "Mild depression";
      return "Minimal or none";
    }
    if (testType === "GAD-7") {
      if (score >= 15) return "Severe anxiety";
      if (score >= 10) return "Moderate anxiety";
      if (score >= 5) return "Mild anxiety";
      return "Minimal anxiety";
    }
    return "N/A";
  };

  // Filter students by PRN search
  const filteredStudents = students.filter((s) =>
    (s.prn || s.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={logoStyle}>MindCare</h1>
      </header>

      {/* Navbar */}
      <nav style={navBarStyle}>
        <div style={navLeftStyle}>
          <p style={navItemStyle} onClick={() => navigate("/admin-dashboard")}>Dashboard</p>
          <p style={navItemStyle} onClick={() => navigate("/bookings")}>Bookings</p>
          <p style={navItemStyle} onClick={() => navigate("/resources")}>Resources</p>
          <p style={navItemStyle} onClick={() => navigate("/analytics")}>Analytics</p>
          <p style={navItemStyle} onClick={() => navigate("/forum-management")}>Forum Management</p>
          <p style={navItemStyle} onClick={() => navigate("/settings")}>Settings</p>
        </div>
        <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
      </nav>

      {/* Main */}
      <main style={mainContentStyle}>
        <h2>Students List</h2>

        {/* 🔢 Total Students */}
        {!loading && <p><strong>Total Students:</strong> {students.length}</p>}

        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search by PRN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "250px",
          }}
        />

        {loading ? (
          <p>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <div style={studentsGridStyle}>
            {filteredStudents
              .slice()
              .sort((a, b) => {
                // if createdAt exists, use it
                if (a.createdAt && b.createdAt) {
                  return new Date(b.createdAt) - new Date(a.createdAt); // 🔥 newest first
                }
                // fallback: sort by id (lexical)
                return b.id.localeCompare(a.id);
              })
              .map((student) => (
                <div key={student.id} style={studentCardStyle}>
                  <p style={{ fontWeight: "bold" }}>{student.prn || student.id}</p>
                  <div style={buttonContainerStyle}>
                    <button
                      style={smallButtonStyle}
                      onClick={() => navigate(`/analytics/${student.prn}`)}
                    >
                      📊 Analytics
                    </button>
                    <button
                      style={smallButtonStyle}
                      onClick={() => navigate(`/bookings/${student.prn}`)}
                    >
                      📅 Bookings
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}


        {/* 📋 Screening Results */}
        <h2 style={{ marginTop: "30px" }}>Screening Results</h2>
        <p><strong>Total Screenings:</strong> {screeningData.length}</p>

        {screeningData.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PRN</th>
                <th style={thStyle}>Test Type</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {screeningData
                .slice() // copy array
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 🔥 newest first
                .map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.prn}</td>
                    <td style={tdStyle}>{item.testType}</td>
                    <td style={tdStyle}>{item.score}</td>
                    <td style={tdStyle}>{getSeverity(item.testType, item.score)}</td>
                    <td style={tdStyle}>{item.formattedTime}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p>No screening data available.</p>
        )}

      </main>
    </div>
  );
}

// --- Styles ---
const containerStyle = { fontFamily: "Arial, sans-serif",
   height: "100vh",
   display: "flex", 
   flexDirection: "column" 
  };


const headerStyle = { 
  backgroundColor: "#0d7ac2ff", 
  padding: "20px", 
  textAlign: "center", 
  color: "white" 
};

const logoStyle = { 
  margin: 0, 
  fontSize: "40px", 
  fontWeight: "bold" 
};

const navBarStyle = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  backgroundColor: "#2c3e50", 
  padding: "10px 20px" 
};

const navLeftStyle = { 
  display: "flex", 
  gap: "20px" 
};

const navItemStyle = { 
  color: "white", 
  cursor: "pointer", 
  fontSize: "16px" 
};

const logoutButtonStyle = { 
  padding: "8px 16px", 
  border: "2px solid #e74c3c",
  borderRadius: "5px", 
  color: "#e74c3c", 
  backgroundColor: "transparent", 
  cursor: "pointer" 
};

const mainContentStyle = { 
  flex: 1, 
  padding: "20px", 
  backgroundColor: "#ecf0f1", 
  overflowY: "auto" 
};

const studentsGridStyle = { 
  display: "flex", 
  gap: "20px", 
  flexWrap: "wrap" 
};

const studentCardStyle = { 
  width: "150px", 
  backgroundColor: "#68bff9ff", 
  color: "white", 
  borderRadius: "12px", 
  padding: "15px", 
  display: "flex", 
  flexDirection: "column", 
  alignItems: "center", 
  justifyContent: "center", 
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)" 
};

const buttonContainerStyle = { 
  marginTop: "10px", 
  display: "flex", 
  flexDirection: "column", 
  gap: "6px" 
};

const smallButtonStyle = { 
  backgroundColor: "white", 
  color: "#2c3e50", 
  border: "none", 
  borderRadius: "5px", 
  padding: "5px 8px", 
  cursor: "pointer", 
  fontSize: "12px", 
  fontWeight: "bold" 
};

const tableStyle = { 
  width: "100%", 
  borderCollapse: "collapse", 
  marginTop: "20px" 
};

const thStyle = { 
  border: "1px solid #ccc", 
  padding: "8px", 
  background: "#bdc3c7" 
};

const tdStyle = { 
  border: "1px solid #ccc", 
  padding: "8px", 
  textAlign: "center" 
};

export default AdminDashboard;
