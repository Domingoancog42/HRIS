import React from "react";

function NavItem({ icon, label, href = "#", active = false, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 0,
        color: "#eafff5",
        textDecoration: "none",
        fontSize: 13,
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
      }}
    >
      <span style={{ width: 18, display: "inline-flex", opacity: 0.95 }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </a>
  );
}

export default function Sidebar({ activeKey = "dashboard", onNavigate, variant = "admin" }) {
  const dashboard = {
    label: "Dashboard",
    href: "#",
  };

  const employeeManagement = { label: "Employee Management", href: "#" };

  const goDashboard = (e) => {
    e.preventDefault();
    onNavigate?.("dashboard");
  };

  const goEmployeeManagement = (e) => {
    // Prevent page jump for placeholder link
    e.preventDefault();
    onNavigate?.("employee_management", employeeManagement.href);
  };

  return (
    <aside
      style={{
        width: 250,
        minHeight: "100vh",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#0a7a57",
        backgroundImage: "none",
        color: "#eafff5",
        display: "flex",
        flexDirection: "column",
        borderRight: "none",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      
      {/* Section title */}
      <div
        style={{
          padding: "12px 14px",
          fontWeight: 700,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {variant === "employee" ? "Employee Dashboard" : "Admin Dashboard"}
      </div>

      {/* Nav */}
      <nav
        style={{
          padding: 0,
          margin: 0,
          display: "block",
          flex: 1,
          backgroundColor: "#0a7a57",
        }}
      >
        <div style={{ padding: 10 }}>
          <NavItem
            icon="⌂"
            label={dashboard.label}
            href={dashboard.href}
            active={activeKey === "dashboard"}
            onClick={goDashboard}
          />
          {variant !== "employee" ? (
            <NavItem
              icon="👥"
              label={employeeManagement.label}
              href={employeeManagement.href}
              active={activeKey === "employee_management"}
              onClick={goEmployeeManagement}
            />
          ) : null}
        </div>
      </nav>
    </aside>
  );
}
