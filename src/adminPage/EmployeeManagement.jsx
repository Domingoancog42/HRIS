import React, { useEffect, useMemo, useState } from "react";

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#334155" }}>
      <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: 34,
        padding: "0 10px",
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        outline: "none",
        background: "#fff",
        fontSize: 12,
        ...props.style,
      }}
    />
  );
}

function SelectInput({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        height: 34,
        padding: "0 10px",
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        outline: "none",
        background: "#fff",
        fontSize: 12,
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        minHeight: 64,
        padding: 10,
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        outline: "none",
        background: "#fff",
        fontSize: 12,
        resize: "vertical",
        ...props.style,
      }}
    />
  );
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "grid",
        placeItems: "center",
        padding: 12,
        zIndex: 50,
      }}
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          width: "min(560px, calc(100vw - 24px))",
          maxHeight: "calc(100vh - 24px)",
          background: "#fff",
          borderRadius: 10,
          boxShadow:
            "0 20px 35px rgba(0,0,0,0.18), 0 10px 15px rgba(0,0,0,0.10)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 12, color: "#0f172a" }}>
            {title}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              lineHeight: "26px",
              fontSize: 14,
              color: "#334155",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: 12,
            overflowY: "auto",
            overflowX: "hidden",
            background: "#fff",
          }}
        >
          {children}
        </div>

        <div
          style={{
            padding: 10,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: "#fff",
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function EmployeeManagement() {
  const [addOpen, setAddOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const positionOptionsByDepartment = useMemo(() => ({}), []);

  const initialForm = useMemo(
    () => ({
      firstName: "",
      lastName: "",
      middleName: "",
      gender: "",
      email: "",
      role: "Employee",
      divisionCode: "",
      department: "",
      chief: "No",
      position: "",
      dateHired: "",
      password: "",
    }),
    []
  );

  const [form, setForm] = useState(initialForm);

  // Auto-increment display ID (UI-only for now)
  const nextEmployeeId = "EMP2026-01";

  const onChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const divisions = useMemo(
    () =>
      [
        {
          code: "ORD",
          fullName: "Office of the Regional Director",
          department: "Management / Executive",
          chiefTitle: "Regional Director",
          samplePositions: [
            "OIC Regional Director",
            "Administrative Assistant I",
            "Science Research Specialist II",
          ],
        },
        {
          code: "FAD",
          fullName: "Finance & Administrative Division",
          department: "Administrative & Finance",
          chiefTitle: "Chief Administrative Officer",
          samplePositions: [
            "Administrative Assistant I",
            "Administrative Assistant II",
            "Administrative Assistant III",
            "Accounting Clerk",
            "HR Officer",
          ],
        },
        {
          code: "MSESDD",
          fullName: "Mine Safety, Environment & Social Development Division",
          department: "Mine Safety & Environment",
          chiefTitle: "Division Chief",
          samplePositions: [
            "Community Affairs Officer II",
            "Engineer",
            "Senior Science Research Specialist",
          ],
        },
        {
          code: "MMD",
          fullName: "Mine Management Division",
          department: "Mine Management",
          chiefTitle: "Division Chief",
          samplePositions: ["Engineer", "Engineer V", "Cartographer II"],
        },
        {
          code: "GD",
          fullName: "Geosciences Division",
          department: "Geosciences",
          chiefTitle: "Division Chief",
          samplePositions: ["Geologic Aide", "Cartographer II", "Geologist"],
        },
      ],
    []
  );

  const selectedDivision = useMemo(
    () => divisions.find((d) => d.department === form.department) || null,
    [divisions, form.department]
  );

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost/Capstone/api/user.php?type=employees");
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to load employees");
      }
      setEmployees(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setEmployees([]);
      setError(e?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onClose = () => {
    setAddOpen(false);
    setForm(initialForm);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        employeeId: nextEmployeeId,
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName,
        gender: form.gender,
        email: form.email,
        role: form.role,
        department: form.department,
        divisionCode: form.divisionCode,
        position: form.position,
        chief: form.chief,
        status: "Active",
        dateHired: form.dateHired,
        password: form.password,
      };

      const res = await fetch("http://localhost/Capstone/api/user.php?type=employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to create employee");
      }

      // Optimistic insert
      if (json?.data) {
        setEmployees((prev) => [json.data, ...prev]);
      } else {
        await fetchEmployees();
      }

      setAddOpen(false);
      setForm(initialForm);
    } catch (e) {
      setError(e?.message || "Failed to create employee");
    }
  };

  return (
    <section style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
          Employee Management
        </h2>
      </div>

      <div
        style={{
          marginTop: 14,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            background: "#fff",
          }}
        >
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #0a7a57",
              background: "#0a7a57",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Add User
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th
                  style={{
                    padding: "10px 8px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Name
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Division
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Department
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Position
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Role
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Chief
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: 16,
                      color: "#64748b",
                      fontSize: 14,
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: 16,
                      color: "#64748b",
                      fontSize: 14,
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp, idx) => (
                  <tr key={emp.id ?? idx} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "10px 8px", fontSize: 13, color: "#0f172a" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#0f172a" }}>
                      {`${emp.last_name ?? ""}, ${emp.first_name ?? ""}${emp.middle_name ? " " + emp.middle_name : ""}`}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#0f172a" }}>
                      {emp.division_code}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#0f172a" }}>
                      {emp.department}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#0f172a" }}>
                      {emp.position}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#0f172a" }}>
                      {emp.role}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#0f172a" }}>
                      {emp.chief}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#0f172a" }}>
                      {emp.status}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      
                      <button
                        type="button"
                        disabled
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #e5e7eb",
                          background: "#f8fafc",
                          color: "#94a3b8",
                          cursor: "not-allowed",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error ? (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#991b1b",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}

      <Modal
        open={addOpen}
        title="Add Employee"
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#0f172a",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <button
              type="submit"
              form="add-employee-form"
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #0a7a57",
                background: "#0a7a57",
                color: "#fff",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Add New User
            </button>
          </>
        }
      >
        <form id="add-employee-form" onSubmit={onSave}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>
              Employee
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 18,
                columnGap: 24,
              }}
            >
              <Field label="Employee ID (Auto)">
                <TextInput value={nextEmployeeId} readOnly disabled />
              </Field>

              <Field label="First name">
                <TextInput value={form.firstName} onChange={onChange("firstName")} />
              </Field>

              <Field label="Last name">
                <TextInput value={form.lastName} onChange={onChange("lastName")} />
              </Field>

              <Field label="Middle name">
                <TextInput value={form.middleName} onChange={onChange("middleName")} />
              </Field>

              <Field label="Gender">
                <SelectInput value={form.gender} onChange={onChange("gender")}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectInput>
              </Field>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 18,
                columnGap: 24,
              }}
            >
              <Field label="Email">
                <TextInput type="email" value={form.email} onChange={onChange("email")} />
              </Field>

              <Field label="Role">
                <SelectInput value={form.role} onChange={onChange("role")}>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </SelectInput>
              </Field>

              <Field label="Chief">
                <SelectInput value={form.chief} onChange={onChange("chief")}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </SelectInput>
              </Field>

              <Field label="Department">
                <SelectInput
                  value={form.department}
                  onChange={(e) => {
                    const dept = e.target.value;
                    const division = divisions.find((d) => d.department === dept) || null;

                    setForm((s) => ({
                      ...s,
                      department: dept,
                      divisionCode: division?.code ?? "",
                      position: "",
                    }));
                  }}
                >
                  <option value="">Select department</option>
                  {divisions.map((d) => (
                    <option key={d.code} value={d.department}>
                      {d.department}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Division (Code)">
                <TextInput value={form.divisionCode} readOnly disabled />
              </Field>

              <Field label="Position">
                <SelectInput
                  value={form.position}
                  onChange={onChange("position")}
                  disabled={!selectedDivision}
                >
                  <option value="">Select position</option>
                  {(selectedDivision?.samplePositions ?? []).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Date Hired">
                <TextInput type="date" value={form.dateHired} onChange={onChange("dateHired")} />
              </Field>

              <Field label="Account Password">
                <TextInput
                  type="password"
                  value={form.password}
                  onChange={onChange("password")}
                  placeholder="Set a password (optional for now)"
                />
              </Field>
            </div>

                      </div>
        </form>
      </Modal>
    </section>
  );
}
