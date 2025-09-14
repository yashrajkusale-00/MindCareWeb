import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function CounsellorRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const institutions = [
    "I2IT",
    "College of Engineering Pune",
    "D.Y. Patil",
    "PCCOE",
    "MIT"
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!institution) {
      setError("Please select an institution.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save in users collection with role = counsellor
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        institution: institution,
        role: "counsellor"
      });

      navigate("/counsellor-login");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError("Error creating account. " + err.message);
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h2 style={{ textAlign: "center" }}>Counsellor Registration</h2>
        <form onSubmit={handleRegister} style={formStyle}>
          <div style={fieldStyle}>
            <label>Email</label><br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label>Password</label><br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label>Institution</label><br />
            <select
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select an institution</option>
              {institutions.map((inst, index) => (
                <option key={index} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={buttonStyle}>Register</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Already have an account? <Link to="/counsellor-login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#f5f5f5"
};

const formWrapperStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  width: "300px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column"
};

const fieldStyle = {
  marginBottom: "15px"
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  fontSize: "14px",
  boxSizing: "border-box"
};

const buttonStyle = {
  padding: "10px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  fontSize: "16px",
  cursor: "pointer"
};

export default CounsellorRegister;
