import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";

function CounsellorBookings() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // ✅ Add slot to Firestore
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
        studentPrn: "" // Empty until booking is confirmed
      };
      await addDoc(collection(db, "counselor_slot"), slot);
      alert("Slot added!");
      setStartAt("");
      setEndAt("");
      fetchSlots();
    } catch (error) {
      console.error("Error adding slot:", error);
    }
  };

  // ✅ Fetch slots assigned to this counsellor
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "counselor_slot"),
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

  // ✅ Approve booking by adding student PRN
  const handleApprove = async (slotId) => {
    const prn = prompt("Enter student PRN to confirm booking:");
    if (!prn) return;
    try {
      const slotRef = doc(db, "counselor_slot", slotId);
      await updateDoc(slotRef, { studentPrn: prn });
      alert("Booking approved!");
      fetchSlots();
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={logoStyle}>MindCare</h1>
        <button style={logoutButtonStyle} onClick={handleLogout}>Logout</button>
      </header>

      <main style={mainContentStyle}>
        <h2>Create New Slot</h2>
        <div style={formStyle}>
          <label>
            Start Time:
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            End Time:
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              style={inputStyle}
            />
          </label>
          <button style={addButtonStyle} onClick={handleAddSlot}>
            Add Slot
          </button>
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
const containerStyle = {
  fontFamily: "Arial, sans-serif",
  padding: "20px"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#27ae60",
  padding: "10px 20px",
  color: "white",
  borderRadius: "8px"
};

const logoStyle = {
  margin: 0,
  fontSize: "32px"
};

const logoutButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#e74c3c",
  border: "none",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer"
};

const mainContentStyle = {
  marginTop: "20px"
};

const formStyle = {
  display: "flex",
  gap: "20px",
  alignItems: "center",
  marginBottom: "20px"
};

const inputStyle = {
  padding: "8px",
  fontSize: "14px"
};

const addButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#3498db",
  border: "none",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#2c3e50",
  color: "white"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center"
};

const approveButtonStyle = {
  padding: "5px 10px",
  backgroundColor: "#2ecc71",
  border: "none",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer"
};

export default CounsellorBookings;
