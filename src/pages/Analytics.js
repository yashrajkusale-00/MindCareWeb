import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Analytics() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [moodData, setMoodData] = useState([]);
  const [screeningData, setScreeningData] = useState([]);
  const [prns, setPrns] = useState([]);
  const [selectedPrn, setSelectedPrn] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // 🔥 Fetch mood data
  useEffect(() => {
    const fetchMood = async () => {
      const querySnapshot = await getDocs(collection(db, "mood_check"));
      const data = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          prn: d.prn,
          mood: d.mood,
          moodLabel:
            d.mood > 0 ? "Happy 😀" : d.mood < 0 ? "Sad 😢" : "Neutral 😐",
          timestamp: d.timestamp?.toDate
            ? d.timestamp.toDate()
            : new Date(d.timestamp),
        };
      });

      setMoodData(data);

      // unique PRNs
      const uniquePrns = [...new Set(data.map((item) => item.prn))];
      setPrns(uniquePrns);
      if (uniquePrns.length > 0) setSelectedPrn(uniquePrns[0]);
    };

    fetchMood();
  }, []);

  // 🔥 Fetch screening data
  useEffect(() => {
    const fetchScreening = async () => {
      const querySnapshot = await getDocs(collection(db, "screening"));
      const data = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        const createdAt = d.createdAt ? new Date(d.createdAt) : null;

        return {
          id: doc.id,
          prn: d.prn,
          testType: d.testType,
          score: d.score,
          answers: d.answers || [],
          college: d.college,
          createdAt,
          formattedTime: createdAt ? createdAt.toLocaleString() : "N/A",
        };
      });
      setScreeningData(data);
    };

    fetchScreening();
  }, []);

  // Mood data filtered
  const filteredMood = moodData
    .filter((item) => item.prn === selectedPrn)
    .map((item) => ({
      mood: item.mood,
      moodLabel: item.moodLabel,
      time: item.timestamp.toLocaleString(),
    }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  // Screening data filtered
  const filteredScreening = screeningData.filter(
    (item) => item.prn === selectedPrn
  );

  const phqData = filteredScreening.filter((item) => item.testType === "PHQ-9");
  const gadData = filteredScreening.filter((item) => item.testType === "GAD-7");

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

  return (
    <div style={containerStyle}>
      {/* Hamburger */}
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
            <p
              style={menuItemStyle}
              onClick={() => navigate("/admin-dashboard")}
            >
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

      {/* Main */}
      <main
        style={{
          ...mainContentStyle,
          marginLeft: sidebarOpen ? "230px" : "0",
        }}
      >
        <h2>Mood & Screening Analytics</h2>

        {/* Dropdown */}
        <div style={{ margin: "20px 0" }}>
          <label>Select Student (PRN): </label>
          <select
            value={selectedPrn}
            onChange={(e) => setSelectedPrn(e.target.value)}
            style={inputStyle}
          >
            {prns.map((prn) => (
              <option key={prn} value={prn}>
                {prn}
              </option>
            ))}
          </select>
        </div>

        {/* Mood Chart */}
        <h3>Mood Tracking</h3>
        {filteredMood.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredMood}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                angle={0}
                textAnchor="end"
                height={90}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { moodLabel, time } = payload[0].payload;
                    return (
                      <div style={tooltipBox}>
                        <p>
                          <strong>Time:</strong> {time}
                        </p>
                        <p>
                          <strong>Feeling:</strong> {moodLabel}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#27ae60"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No mood data available for this student.</p>
        )}

        {/* Screening Table */}
        <h3>Screening Results</h3>
        {filteredScreening.length > 0 ? (
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
              {filteredScreening.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.prn}</td>
                  <td style={tdStyle}>{item.testType}</td>
                  <td style={tdStyle}>{item.score}</td>
                  <td style={tdStyle}>
                    {getSeverity(item.testType, item.score)}
                  </td>
                  <td style={tdStyle}>{item.formattedTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No screening data available for this student.</p>
        )}

        {/* PHQ-9 Graph */}
        <h3>PHQ-9 Scores Over Time</h3>
        {phqData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={phqData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedTime"
                angle={0}
                textAnchor="end"
                height={90}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, score, formattedTime } = payload[0].payload;
                    return (
                      <div style={tooltipBox}>
                        <p><strong>Name:</strong> {name}</p>
                        <p><strong>Score:</strong> {score}</p>
                        <p><strong>Severity:</strong> {getSeverity("PHQ-9", score)}</p>
                        <p><strong>Time:</strong> {formattedTime}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3498db"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No PHQ-9 data available.</p>
        )}

        {/* GAD-7 Graph */}
        <h3>GAD-7 Scores Over Time</h3>
        {gadData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={gadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedTime"
                angle={0}
                textAnchor="end"
                height={90}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, score, formattedTime } = payload[0].payload;
                    return (
                      <div style={tooltipBox}>
                        <p><strong>Name:</strong> {name}</p>
                        <p><strong>Score:</strong> {score}</p>
                        <p><strong>Severity:</strong> {getSeverity("GAD-7", score)}</p>
                        <p><strong>Time:</strong> {formattedTime}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#e67e22"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No GAD-7 data available.</p>
        )}
      </main>
    </div>
  );
}

/* --- styles --- */
const containerStyle = { display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Arial, sans-serif" };
const hamburgerStyle = { position: "absolute", top: "15px", left: "15px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "24px", width: "35px", zIndex: 1000 };
const hamburgerInsideStyle = { cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "20px", width: "25px", marginBottom: "20px", alignSelf: "flex-start" };
const lineStyle = { height: "4px", backgroundColor: "#4b589fff", borderRadius: "2px" };
const sideMenuStyle = { position: "fixed", top: 0, left: 0, height: "100%", width: "220px", backgroundColor: "#2c3e50", color: "white", padding: "20px 15px", display: "flex", flexDirection: "column", alignItems: "stretch", boxSizing: "border-box" };
const logoStyle = { backgroundColor: "#27ae60", width: "100%", textAlign: "center", padding: "20px", borderRadius: "10px", fontSize: "24px", fontWeight: "bold", boxSizing: "border-box" };
const menuItemStyle = { padding: "12px 15px", cursor: "pointer", borderBottom: "1px solid #34495e", textAlign: "left", width: "100%", boxSizing: "border-box", color: "white" };
const logoutButtonStyle = { marginTop: "auto", marginBottom: "20px", padding: "10px 20px", backgroundColor: "#e74c3c", border: "1px solid #c0392b", borderRadius: "5px", color: "white", cursor: "pointer", width: "100%" };
const mainContentStyle = { flex: 1, padding: "20px", backgroundColor: "#ecf0f1", marginTop: "60px", transition: "margin-left 0.3s ease" };
const inputStyle = { padding: "10px", border: "1px solid #bdc3c7", borderRadius: "5px", fontSize: "14px" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px" };
const thStyle = { border: "1px solid #ccc", padding: "8px", background: "#bdc3c7" };
const tdStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "center" };
const tooltipBox = { background: "white", border: "1px solid #ccc", padding: "10px", borderRadius: "5px" };

export default Analytics;
