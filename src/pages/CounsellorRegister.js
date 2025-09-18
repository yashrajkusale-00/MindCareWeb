import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

function CounsellorRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [address, setAddress] = useState("");
  const [languages, setLanguages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const institutions = [
    "I2IT",
    "College of Engineering Pune",
    "D.Y. Patil",
    "PCCOE",
    "MIT"
  ];

  const languageOptions = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada"];
  const specialtyOptions = ["Anxiety", "Depression", "Stress", "Career", "Relationships"];

  // Toggle selection (for pills)
  const handleToggle = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  // Generate next counsellor ID (C1, C2, ...)
  const getNextCounsellorId = async () => {
    const snapshot = await getDocs(collection(db, "counselors"));
    const count = snapshot.size;
    return `C${count + 1}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!institution) {
      setError("Please select an institution.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const counsellorId = await getNextCounsellorId();

      // Save in counsellors collection
      await setDoc(doc(db, "counselors", counsellorId), {
        counsellorId,
        uid: user.uid,
        name,
        email,
        phone,
        institution,
        address,
        languages,
        specialties,
        role: "counselor",
      });

      // Save in users collection (minimal)
      await setDoc(doc(db, "users", user.uid), {
        email,
        role: "counselor",
        counsellorId
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
        <h2 style={{ textAlign: "center" }}>Counselor Registration</h2>
        <form onSubmit={handleRegister} style={formStyle}>
          <div style={fieldStyle}>
            <label>Name</label><br />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
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
            <label>Phone</label><br />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
          <div style={fieldStyle}>
            <label>Address</label><br />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={{ ...inputStyle, height: "60px" }}
            />
          </div>
          <div style={fieldStyle}>
            <label>Languages</label><br />
            <div style={pillContainerStyle}>
              {languageOptions.map((lang) => (
                <div
                  key={lang}
                  style={{
                    ...pillStyle,
                    backgroundColor: languages.includes(lang) ? "#4CAF50" : "#f0f0f0",
                    color: languages.includes(lang) ? "#fff" : "#333",
                  }}
                  onClick={() => handleToggle(lang, languages, setLanguages)}
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>
          <div style={fieldStyle}>
            <label>Specialties</label><br />
            <div style={pillContainerStyle}>
              {specialtyOptions.map((spec) => (
                <div
                  key={spec}
                  style={{
                    ...pillStyle,
                    backgroundColor: specialties.includes(spec) ? "#4CAF50" : "#f0f0f0",
                    color: specialties.includes(spec) ? "#fff" : "#333",
                  }}
                  onClick={() => handleToggle(spec, specialties, setSpecialties)}
                >
                  {spec}
                </div>
              ))}
            </div>
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
  width: "350px",
  maxHeight: "90vh",
  overflowY: "auto"
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
  cursor: "pointer",
  borderRadius: "5px"
};

// Pill (ellipse-like) styles
const pillContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "5px"
};

const pillStyle = {
  padding: "6px 12px",
  borderRadius: "20px",
  cursor: "pointer",
  border: "1px solid #ccc",
  fontSize: "13px",
  userSelect: "none"
};

export default CounsellorRegister;
