import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function CounsellorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/counsellor-dashboard");
    } catch (err) {
      setError("Invalid credentials or account does not exist.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h2 style={{ textAlign: "center" }}>Counselor Login</h2>
        <form onSubmit={handleLogin} style={formStyle}>
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
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Don't have an account? <Link to="/counsellor-register">Register here</Link>
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

export default CounsellorLogin;
