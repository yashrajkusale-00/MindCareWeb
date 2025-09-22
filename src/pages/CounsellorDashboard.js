import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

function CounsellorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // 🔥 Fetch booked students + bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collegeName = "I2IT"; // replace with dynamic if needed

        // Get only students who have bookings
        const studentsSnapshot = await getDocs(
          collection(db, "colleges", collegeName, "students")
        );
        const allStudents = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch bookings (pending/approved/rejected)
        const bookingsSnapshot = await getDocs(
          collection(db, "colleges", collegeName, "bookings")
        );
        const allBookings = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter only booked students
        const bookedPrns = allBookings.map((b) => b.prn);
        const bookedStudents = allStudents.filter((s) =>
          bookedPrns.includes(s.prn)
        );

        setStudents(bookedStudents);
        setBookings(allBookings);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔥 Approve / Reject booking
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const collegeName = "I2IT"; // replace with dynamic if needed
      const bookingRef = doc(db, "colleges", collegeName, "bookings", bookingId);
      await updateDoc(bookingRef, { status: newStatus });

      // Update UI instantly
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={logoStyle}>MindCare</h1>
      </header>

      {/* Navbar */}
      <nav style={navBarStyle}>
        <div style={navLeftStyle}>
          <p
            style={navItemStyle}
            onClick={() => navigate("/counsellor-dashboard")}
          >
            Dashboard
          </p>
          <p
            style={navItemStyle}
            onClick={() => navigate("/counsellor-bookings")}
          >
            Bookings
          </p>
          <p
            style={navItemStyle}
            onClick={() => navigate("/counsellor-resources")}
          >
            Resources
          </p>
          <p
            style={navItemStyle}
            onClick={() => navigate("/counsellor-analytics")}
          >
            Analytics
          </p>
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
        <h2 style={{ textAlign: "center" }}>Booked Students</h2>
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : students.length === 0 ? (
          <p style={{ textAlign: "center" }}>No booked students.</p>
        ) : (
          <div style={studentsGridStyle}>
            {students.map((student) => (
              <div key={student.id} style={studentCardStyle}>
                <p style={{ fontWeight: "bold" }}>{student.prn || student.id}</p>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: "40px" }}>Recent Bookings</h2>
        <table style={bookingTableStyle}>
          <thead style={headerRowStyle}>
            <tr>
              <th style={cellStyle}>#</th>
              <th style={cellStyle}>PRN</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Date</th>
              <th style={cellStyle}>Time</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((booking, index) => (
                <tr key={booking.id}>
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle}>{booking.prn}</td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        ...statusStyle,
                        backgroundColor:
                          booking.status === "Approved"
                            ? "#2ecc71"
                            : booking.status === "Rejected"
                            ? "#e74c3c"
                            : "#f39c12",
                      }}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td style={cellStyle}>{booking.date}</td>
                  <td style={cellStyle}>{booking.time}</td>
                  <td style={cellStyle}>
                    <button
                      style={approveButtonStyle}
                      onClick={() =>
                        handleStatusChange(booking.id, "Approved")
                      }
                    >
                      Approve
                    </button>
                    <button
                      style={rejectButtonStyle}
                      onClick={() =>
                        handleStatusChange(booking.id, "Rejected")
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

/* ---------- STYLES ---------- */
const containerStyle = {
  fontFamily: "Arial, sans-serif",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
};

const headerStyle = {
  backgroundColor: "#27ae60",
  padding: "20px",
  textAlign: "center",
  color: "white",
};

const logoStyle = {
  margin: 0,
  fontSize: "48px",
  fontWeight: "bold",
};

const navBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#2c3e50",
  padding: "10px 20px",
};

const navLeftStyle = {
  display: "flex",
  gap: "20px",
};

const navItemStyle = {
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  transition: "color 0.3s",
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
  transition: "all 0.3s ease",
};

const mainContentStyle = {
  flex: 1,
  padding: "20px",
  backgroundColor: "#ecf0f1",
  overflowY: "auto",
};

const studentsGridStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  justifyContent: "center",
};

const studentCardStyle = {
  width: "120px",
  height: "120px",
  backgroundColor: "#3498db",
  color: "white",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  transition: "transform 0.2s",
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

const headerRowStyle = {
  backgroundColor: "#2c3e50",
  color: "white",
};

const cellStyle = {
  border: "1px solid #bdc3c7",
  padding: "10px",
  textAlign: "center",
  fontSize: "14px",
};

const statusStyle = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "5px",
  color: "white",
  fontSize: "14px",
  fontWeight: "bold",
};

const approveButtonStyle = {
  backgroundColor: "#2ecc71",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "8px",
};

const rejectButtonStyle = {
  backgroundColor: "#e74c3c",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default CounsellorDashboard;
