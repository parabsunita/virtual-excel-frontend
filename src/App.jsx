import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function Register() {
  return (
    <div className="bg-gray-900 text-white flex flex-col shadow-lg p-6 rounded-md max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input type="email" id="email" className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white" />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input type="password" id="password" className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md">Register</button>
      </form>
    </div>
  );
}

function ForgotPassword() {
  return (
    <div className="bg-gray-900 text-white flex flex-col shadow-lg p-6 rounded-md max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <form>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input type="email" id="email" className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md">Send Reset Link</button>
      </form>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Dashboard />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
                <Login />
                <div className="flex justify-between mt-4 w-full max-w-md">
                  <a href="/register" className="text-blue-400 hover:underline">Register</a>
                  <a href="/forgot-password" className="text-blue-400 hover:underline">Forgot Password?</a>
                </div>
              </div>
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;