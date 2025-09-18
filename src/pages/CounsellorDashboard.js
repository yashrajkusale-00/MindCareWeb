import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function CounsellorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // 🔥 Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const collegeName = "I2IT"; // Replace with actual college if needed

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

  // 🔥 Dummy bookings
  const bookings = [
    { id: 1, student: "Student A", status: "Pending", date: "2025-09-10", time: "10:00 AM" },
    { id: 2, student: "Student B", status: "Approved", date: "2025-09-11", time: "11:30 AM" },
    { id: 3, student: "Student C", status: "Rejected", date: "2025-09-12", time: "02:15 PM" }
  ];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={logoStyle}>MindCare</h1>
      </header>

      {/* Navbar */}
      <nav style={navBarStyle}>
        <div style={navLeftStyle}>
          <p style={navItemStyle} onClick={() => navigate("/counsellor-dashboard")}>Dashboard</p>
          <p style={navItemStyle} onClick={() => navigate("/counsellor-bookings")}>Bookings</p>
          <p style={navItemStyle} onClick={() => navigate("/counsellor-resources")}>Resources</p>
          <p style={navItemStyle} onClick={() => navigate("/counsellor-analytics")}>Analytics</p>
        </div>
        <button
          style={logoutButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#e74c3c";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#e74c3c";
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main style={mainContentStyle}>
        <h2 style={{ textAlign: "center" }}>Students List</h2>
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading students...</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: "center" }}>No students found.</p>
        ) : (
          <div style={studentsGridStyle}>
            {students.map((student) => (
              <div
                key={student.id}
                style={studentCardStyle}
                onClick={() => setSelectedStudent(student)}
              >
                {student.prn || student.id}
              </div>
            ))}
          </div>
        )}

        {selectedStudent && (
          <div style={studentDetailStyle}>
            <h3>{selectedStudent.name}</h3>
            <p>PRN: {selectedStudent.prn}</p>
            <p>Analytics: Placeholder for detailed data...</p>
          </div>
        )}

        <h2 style={{ marginTop: "40px" }}>Recent Bookings</h2>
        <table style={bookingTableStyle}>
          <thead style={headerRowStyle}>
            <tr>
              <th style={cellStyle}>#</th>
              <th style={cellStyle}>Student</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Date</th>
              <th style={cellStyle}>Time</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={booking.id}>
                <td style={cellStyle}>{index + 1}</td>
                <td style={cellStyle}>{booking.student}</td>
                <td style={cellStyle}>
                  <span
                    style={{
                      ...statusStyle,
                      backgroundColor:
                        booking.status === "Approved"
                          ? "#2ecc71"
                          : booking.status === "Rejected"
                          ? "#e74c3c"
                          : "#f39c12"
                    }}
                  >
                    {booking.status}
                  </span>
                </td>
                <td style={cellStyle}>{booking.date}</td>
                <td style={cellStyle}>{booking.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

// Styles (same as in admin, but adjusted if needed)
const containerStyle = {
  fontFamily: "Arial, sans-serif",
  height: "100vh",
  display: "flex",
  flexDirection: "column"
};

const headerStyle = {
  backgroundColor: "#27ae60",
  padding: "20px",
  textAlign: "center",
  color: "white"
};

const logoStyle = {
  margin: 0,
  fontSize: "48px",
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
  fontSize: "16px",
  transition: "color 0.3s"
};

const logoutButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "transparent",
  border: "2px solid #e74c3c",
  borderRadius: "5px",
  color: "#e74c3c",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  transition: "all 0.3s ease"
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
  flexWrap: "wrap",
  justifyContent: "center"
};

const studentCardStyle = {
  width: "100px",
  height: "100px",
  backgroundColor: "#3498db",
  color: "white",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  transition: "transform 0.2s"
};

const studentDetailStyle = {
  marginTop: "30px",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  width: "300px",
  textAlign: "center"
};

const bookingTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  backgroundColor: "white",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
};

const headerRowStyle = {
  backgroundColor: "#2c3e50",
  color: "white"
};

const cellStyle = {
  border: "1px solid #bdc3c7",
  padding: "10px",
  textAlign: "center",
  fontSize: "14px"
};

const statusStyle = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "5px",
  color: "white",
  fontSize: "14px",
  fontWeight: "bold"
};

export default CounsellorDashboard;
