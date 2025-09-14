import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionAddress, setInstitutionAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!institutionName) {
      setError("Please enter institution name.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save admin + institution details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        institutionName: institutionName,
        institutionAddress: institutionAddress,
        studentsEnrolled: 0, // default, admin can update later in Settings
        prnFormat: "", // default empty, admin sets in Settings
        role: "admin"
      });

      navigate("/admin-login");
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
        <h2 style={{ textAlign: "center" }}>Admin Registration</h2>
        <form onSubmit={handleRegister} style={formStyle}>
          {/* Email */}
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

          {/* Password */}
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

          {/* Institution Name */}
          <div style={fieldStyle}>
            <label>Institution Name</label><br />
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              required
              style={inputStyle}
              placeholder="e.g. College of Engineering Pune"
            />
          </div>

          {/* Institution Address */}
          <div style={fieldStyle}>
            <label>Institution Address</label><br />
            <textarea
              value={institutionAddress}
              onChange={(e) => setInstitutionAddress(e.target.value)}
              style={{ ...inputStyle, height: "60px" }}
              placeholder="Enter institution address"
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={buttonStyle}>Register</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Already have an account? <Link to="/admin-login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

// Styles
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
  width: "350px"
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

export default AdminRegister;
