import React from "react";

export default function LogoutButton() {
  const handleLogout = () => {
    // Minimal logout: redirect back to login
    window.location.href = "/";
  };

  return (
    <button type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}
