import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = ({ setIsLoggedIn }) => {
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("⚠️ Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_name: orgName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setMessage("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000); // redirect to login after 2s
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      <div className="bg-gray-900 text-white flex flex-col shadow-lg p-6 rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        {message && (
          <div className="mb-4 text-center text-sm font-medium text-yellow-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="orgName" className="block text-gray-300 font-medium">
              Organization Name:
            </label>
            <input
              type="text"
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className="w-full px-4 py-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 font-medium">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-300 font-medium">
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 text-black border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-blue-400 hover:underline text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
