import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import LogoutButton from "../components/LogoutButton";

export default function EmployeeDashboard() {
  const [activeKey, setActiveKey] = useState("dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ background: "#0a7a57" }}>
        <Sidebar
          variant="employee"
          activeKey={activeKey}
          onNavigate={(key) => setActiveKey(key)}
        />
      </div>

      <div style={{ flex: 1, marginLeft: 250 }}>
        <div
          style={{
            padding: 10,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            background: "#fff",
          }}
        >
          <LogoutButton />
        </div>

        <main style={{ padding: 16 }}>
          {activeKey === "dashboard" ? (
            <>
              <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>
                Welcome, Employee
              </h1>
              <p style={{ margin: 0, color: "#4b5563" }}>
                Use the links on the left to navigate.
              </p>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
