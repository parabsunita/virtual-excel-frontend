import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Registration";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [token, setToken] = useState(null);

  // ✅ Restore session from sessionStorage on page load
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedOrg = sessionStorage.getItem("orgData");

    if (storedToken && storedOrg) {
      setToken(storedToken);
      setOrgData(JSON.parse(storedOrg));
      setIsLoggedIn(true);
    }
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("orgData");
    setToken(null);
    setOrgData(null);
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* ✅ Dashboard Route (Protected) */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Dashboard orgData={orgData} token={token} onLogout={handleLogout} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                  setOrgData={setOrgData}
                  setToken={setToken}
                />
                <div className="flex justify-between mt-4 w-full max-w-md">
                  <a href="/register" className="text-blue-400 hover:underline">
                    Register
                  </a>
                  <a href="/forgot-password" className="text-blue-400 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              </div>
            )
          }
        />

        {/* ✅ Registration Route */}
        <Route
          path="/register"
          element={<Register setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* ✅ Forgot Password Route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ✅ Redirect any unknown path */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
