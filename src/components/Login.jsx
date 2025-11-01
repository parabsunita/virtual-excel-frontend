import React from "react";

function Login() {
  return (
    <div className="bg-gray-900 text-white flex flex-col shadow-lg p-6 rounded-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;