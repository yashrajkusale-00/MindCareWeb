import React from "react";
import { BiFontFamily } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

function SelectRole() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    if (role === "admin") {
      navigate("/admin-login");
    } else if (role === "counsellor") {
      navigate("/counsellor-login");
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Welcome to Mind Care</h1>
      <button onClick={() => handleSelect("admin")} style={buttonStyle}>
        Login as Admin
      </button>
      <button onClick={() => handleSelect("counsellor")} style={buttonStyle}>
        Login as Counsellor
      </button>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  textAlign: "center",
  backgroundImage: 'url("/bg.jpeg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const buttonStyle = {
  margin: "10px 0",
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#060505ff",
  color: "white"
};

const headerStyle = {
  color: "blue",
  textShadow: "2px 2px 4px rgba(240, 64, 64, 0.7)",
  position: "absolute",
  top: "150px",
  fontSize: "32px"
};

export default SelectRole;
