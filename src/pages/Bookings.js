import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

function Bookings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // 🔥 Fetch bookings with counselor + student info
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "bookings"));
        const bookingList = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let counselorName = "Unknown";
            let studentPRN = data.studentPrn || "N/A";

            // fetch counselor name
            if (data.counselorId) {
              const counselorDoc = await getDoc(
                doc(db, "counselors", data.counselorId)
              );
              if (counselorDoc.exists()) {
                counselorName = counselorDoc.data().name || "Unknown";
              }
            }

            return {
              id: docSnap.id,
              ...data,
              counselorName,
              studentPRN,
            };
          })
        );

        setBookings(bookingList);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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
            <p
              style={menuItemStyle}
              onClick={() => navigate("/forum-management")}
            >
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
        <h2>All Bookings</h2>
        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <table style={bookingTableStyle}>
            <thead style={headerRowStyle}>
              <tr>
                <th style={cellStyle}>Sr.No</th>
                <th style={cellStyle}>Student (PRN)</th>
                <th style={cellStyle}>Counselor</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Date</th>
                <th style={cellStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={booking.id}>
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle}>{booking.studentPRN}</td>
                  <td style={cellStyle}>{booking.counselorName}</td>
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
                  <td style={cellStyle}>
                    {booking.startAt
                      ? new Date(booking.startAt.seconds * 1000).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td style={cellStyle}>
                    {booking.startAt
                      ? new Date(booking.startAt.seconds * 1000).toLocaleTimeString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

// --- Styles ---
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

const statusStyle = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "5px",
  color: "white",
  fontSize: "14px",
  fontWeight: "bold",
};

export default Bookings;
