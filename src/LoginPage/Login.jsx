import React, { useState } from "react";
import axios from "axios";

import AdminDashboard from "../adminPage/AdminDashboard";
import EmployeeDashboard from "../employeePage/EmployeeDashboard";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost/Capstone/api/login.php",
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false,
        }
      );

      if (res.data && res.data.success) {
        setMessage("Login success");
        // For a simple setup without routing, just redirect.
        const role = String(res.data?.user?.role || "");
        const roleLower = role.toLowerCase();
        const base = "/Capstone/payroll";
        window.location.href = base + (roleLower === "employee" ? "/employee" : "/admin");
        return;
      }

      setMessage(res.data?.message || "Login failed");
    } catch (err) {
      setMessage("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

export function App() {
  const path = window.location.pathname;
  const base = "/Capstone/payroll";

  // Minimal routing without react-router
  if (path === base + "/admin") {
    return <AdminDashboard />;
  }

  if (path === base + "/employee") {
    return <EmployeeDashboard />;
  }

  return <Login />;
}
