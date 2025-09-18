import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SelectRole from "./pages/SelectRole";
import AdminLogin from "./pages/AdminLogin";
import CounsellorLogin from "./pages/CounsellorLogin";
import AdminRegister from "./pages/AdminRegister";
import CounsellorRegister from "./pages/CounsellorRegister";
import AdminDashboard from "./pages/AdminDashboard";
import Bookings from "./pages/Bookings";
import Resources from "./pages/Resources";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ForumManagement from "./pages/ForumManagement";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import CounsellorBookings from "./pages/CounsellorBookings";
import CounsellorResources from "./pages/CounsellorResources";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectRole />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/counsellor-login" element={<CounsellorLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/forum-management" element={<ForumManagement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/counsellor-register" element={<CounsellorRegister />} />
        <Route path="/counsellor-dashboard" element={<CounsellorDashboard />} />
        <Route path="/counsellor-bookings" element={<CounsellorBookings />} />
        <Route path="/counsellor-resources" element={<CounsellorResources />} />
      </Routes>
    </Router>
  );
}

export default App;
