import React, { useState } from "react";

const Login = ({ setIsLoggedIn, setOrgData, setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      setMessage("✅ Login successful!");

      // Save token and org details in sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("orgData", JSON.stringify(data.org));

      // Update parent states
      setToken(data.token);
      setOrgData(data.org);
      setIsLoggedIn(true);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col shadow-lg p-6 rounded-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>

      {message && (
        <div className="mb-4 text-center text-sm font-medium text-yellow-400">
          {message}
        </div>
      )}

      <form onSubmit={handleLogin}>
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

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
