import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

function CounsellorBookings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [slots, setSlots] = useState([]);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Add slot
  const handleAddSlot = async () => {
    if (!startAt || !endAt) {
      alert("Please select both start and end times.");
      return;
    }
    try {
      const slot = {
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        counsellorId: auth.currentUser.uid,
        studentPrn: ""
      };
      await addDoc(collection(db, "counselor_slots"), slot);
      alert("Slot added!");
      setStartAt("");
      setEndAt("");
      fetchSlots();
    } catch (error) {
      console.error("Error adding slot:", error);
    }
  };

  // Fetch slots assigned to this counsellor
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "counselor_slots"),
        where("counsellorId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const slotList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setSlots(slotList);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Approve booking
  const handleApprove = async (slotId) => {
    const prn = prompt("Enter student PRN to confirm booking:");
    if (!prn) return;
    try {
      const slotRef = doc(db, "counselor_slots", slotId);
      await updateDoc(slotRef, { studentPrn: prn });
      alert("Booking approved!");
      fetchSlots();
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Hamburger */}
      <div style={hamburgerStyle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <div style={lineStyle}></div>
        <div style={lineStyle}></div>
        <div style={lineStyle}></div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={sideMenuStyle}>
          <div style={hamburgerInsideStyle} onClick={() => setSidebarOpen(!sidebarOpen)}>
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
        <h2>Create New Slot</h2>
        <div style={formStyle}>
          <label>
            Start Time:
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} style={inputStyle} />
          </label>
          <label>
            End Time:
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} style={inputStyle} />
          </label>
          <button style={addButtonStyle} onClick={handleAddSlot}>Add Slot</button>
        </div>

        <h2>All Appointments</h2>
        {loading ? (
          <p>Loading slots...</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Start Time</th>
                <th style={thStyle}>End Time</th>
                <th style={thStyle}>Student PRN</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td style={tdStyle}>{slot.startAt.toDate().toLocaleString()}</td>
                  <td style={tdStyle}>{slot.endAt.toDate().toLocaleString()}</td>
                  <td style={tdStyle}>{slot.studentPrn || "Not booked"}</td>
                  <td style={tdStyle}>
                    {!slot.studentPrn && (
                      <button style={approveButtonStyle} onClick={() => handleApprove(slot.id)}>
                        Approve
                      </button>
                    )}
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

// Styles
const hamburgerStyle = { position: "absolute", top: "15px", left: "15px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "24px", width: "35px", zIndex: 1000 };
const hamburgerInsideStyle = { cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "20px", width: "25px", marginBottom: "20px", alignSelf: "flex-start" };
const lineStyle = { height: "4px", backgroundColor: "#4b589fff", borderRadius: "2px" };
const sideMenuStyle = { position: "fixed", top: 0, left: 0, height: "100%", width: "220px", backgroundColor: "#2c3e50", color: "white", padding: "20px 15px", display: "flex", flexDirection: "column", alignItems: "stretch", boxSizing: "border-box" };
const logoStyle = { backgroundColor: "#27ae60", width: "100%", textAlign: "center", padding: "20px", borderRadius: "10px", fontSize: "24px", fontWeight: "bold", boxSizing: "border-box" };
const menuItemStyle = { padding: "12px 15px", cursor: "pointer", borderBottom: "1px solid #34495e", textAlign: "left", width: "100%", boxSizing: "border-box", color: "white" };
const logoutButtonStyle = { marginTop: "auto", marginBottom: "20px", padding: "10px 20px", backgroundColor: "#e74c3c", border: "1px solid #c0392b", borderRadius: "5px", color: "white", cursor: "pointer", width: "100%" };

const formStyle = { display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px", backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
const inputStyle = { padding: "8px", fontSize: "14px" };
const addButtonStyle = { padding: "8px 16px", backgroundColor: "#3498db", border: "none", borderRadius: "5px", color: "white", cursor: "pointer" };
const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
const thStyle = { border: "1px solid #ddd", padding: "8px", backgroundColor: "#2c3e50", color: "white" };
const tdStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "center" };
const approveButtonStyle = { padding: "5px 10px", backgroundColor: "#2ecc71", border: "none", borderRadius: "5px", color: "white", cursor: "pointer" };

export default CounsellorBookings;
