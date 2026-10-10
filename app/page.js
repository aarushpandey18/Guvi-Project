"use client";

import { useState } from "react";
import {
  Activity, Bell, CalendarDays, Check, ChevronRight, ClipboardList,
  Clock3, FileText, HeartPulse, LayoutDashboard, LogIn, Menu, Plus,
  Search, Settings, ShieldCheck, Stethoscope, UserRound, Users, X,
} from "lucide-react";

const roles = {
  admin: { label: "Admin", name: "Administrator", id: "ADMIN" },
  doctor: { label: "Doctor", name: "Care provider", id: "DOCTOR" },
  patient: { label: "Patient", name: "Patient", id: "PATIENT" },
};

const nav = {
  admin: [["overview", "Overview", LayoutDashboard], ["users", "Users", Users], ["appointments", "Appointments", CalendarDays], ["analytics", "Analytics", Activity], ["settings", "Settings", Settings]],
  doctor: [["overview", "Overview", LayoutDashboard], ["schedule", "Schedule", Clock3], ["patients", "Patients", Users], ["appointments", "Appointments", CalendarDays], ["feedback", "Feedback", ShieldCheck]],
  patient: [["overview", "Overview", LayoutDashboard], ["book", "Find a doctor", Stethoscope], ["appointments", "My appointments", CalendarDays], ["records", "Medical records", FileText], ["profile", "My profile", UserRound]],
};

export default function Home() {
  const [session, setSession] = useState(null);
  const [login, setLogin] = useState({ role: "patient", id: "" });
  const [active, setActive] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  function loadWorkspace(role) {
    setSession({ ...roles[role], role });
  }

  function submitLogin(event) {
    event.preventDefault();
    const selected = roles[login.role];
    if (!login.id || login.id.trim().toUpperCase() === selected.id) loadWorkspace(login.role);
    else setToast(`Use ${selected.id} or leave the ID empty for demo access.`);
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  if (!session) return <Login login={login} setLogin={setLogin} onSubmit={submitLogin} toast={toast} />;

  const activeLabel = nav[session.role].find(([key]) => key === active)?.[1] ?? "Overview";
  return (
    <div className="app-shell">
      <Sidebar session={session} active={active} setActive={(key) => { setActive(key); setMobileOpen(false); }} mobileOpen={mobileOpen} logout={() => { setSession(null); setActive("overview"); setMobileOpen(false); }} />
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu button-icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div><p className="eyebrow">Workspace / {session.role}</p><h1>{activeLabel}</h1></div>
          <div className="topbar-actions"><button className="button-icon" aria-label="Notifications"><Bell size={19} /><span className="notification-dot" /></button><div className="avatar">{session.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div className="user-meta"><strong>{session.name}</strong><span>{roles[session.role].label}</span></div></div>
        </header>
        <div className="page-body">
          {session.role === "admin" && <AdminView active={active} users={users} setUsers={setUsers} appointments={appointments} setAppointments={setAppointments} notify={notify} />}
          {session.role === "doctor" && <DoctorView active={active} appointments={appointments} setAppointments={setAppointments} notify={notify} />}
          {session.role === "patient" && <PatientView active={active} session={session} appointments={appointments} setAppointments={setAppointments} notify={notify} />}
        </div>
      </main>
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

function Login({ login, setLogin, onSubmit, toast }) {
  const selected = roles[login.role];
  return <main className="login-page"><div className="login-layout"><section className="login-promo">
    <div className="brand"><span className="brand-mark"><HeartPulse size={22} /></span><div><strong>MedFlow</strong><span>Healthcare management</span></div></div>
    <div className="promo-copy"><p className="eyebrow">Clinical operations platform</p><h1>Everything your care team needs, in one place.</h1><p>Securely manage appointments, patient records and daily workflows with clarity.</p><div className="promo-list"><span><Check size={15} /> Secure patient records</span><span><Check size={15} /> Simplified appointment management</span><span><Check size={15} /> Built for modern care teams</span></div></div>
    <div className="promo-footer"><span>Trusted workspace for healthcare teams</span><span className="secure-label"><ShieldCheck size={14} /> Secure by design</span></div>
  </section><section className="login-card">
    <div className="login-heading"><p className="eyebrow">Welcome back</p><h1>Sign in to your workspace</h1><p>Manage care, appointments and patient records in one place.</p></div>
    <div className="role-switcher">{Object.keys(roles).map((role) => <button key={role} className={login.role === role ? "selected" : ""} onClick={() => setLogin({ ...login, role })}>{roles[role].label}</button>)}</div>
    <form onSubmit={onSubmit} className="form-stack"><label>User ID <span className="field-note">Optional for demo</span><input className="input" value={login.id} onChange={(e) => setLogin({ ...login, id: e.target.value })} placeholder={selected.id} /></label><button className="button-primary wide"><LogIn size={17} /> Continue as {selected.label}</button></form>
    <p className="demo-hint">Demo access: click a role and continue. No password required.</p>
    {toast && <p className="error-text">{toast}</p>}
  </section></div></main>;
}

function Sidebar({ session, active, setActive, mobileOpen, logout }) {
  return <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}><div className="sidebar-header"><div className="brand"><span className="brand-mark"><HeartPulse size={22} /></span><div><strong>MedFlow</strong><span>Healthcare platform</span></div></div><button className="mobile-close button-icon" onClick={() => setActive(active)} aria-label="Close menu"><X size={18} /></button></div><div className="workspace-label">MAIN MENU</div><nav>{nav[session.role].map(([key, label, Icon]) => <button key={key} className={active === key ? "nav-item active" : "nav-item"} onClick={() => setActive(key)}><Icon size={18} />{label}{active === key && <ChevronRight size={15} className="nav-arrow" />}</button>)}</nav><div className="sidebar-bottom"><div className="help-card"><ShieldCheck size={20} /><strong>Your care is secure</strong><span>Protected and private by design.</span></div><button className="nav-item" onClick={logout}><X size={18} />Sign out</button></div></aside>;
}

function Stats({ items }) {
  return <div className="stats-grid">{items.map(({ label, value, note, icon: Icon, tone }) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>)}</div>;
}

function SectionHeader({ eyebrow, title, action }) {
  return <div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

function Status({ value }) { return <span className={`status ${value}`}>{value}</span>; }

function AdminView({ active, users, setUsers, appointments, setAppointments, notify }) {
  const [query, setQuery] = useState("");
  const filteredUsers = users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase()));
  if (active === "users") return <><SectionHeader eyebrow="User management" title="Users" action={<button className="button-primary" onClick={() => notify("Connect the user service to add real users")}><Plus size={17} /> Add user</button>} /><div className="toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." /></div><select className="select"><option>All roles</option><option>Doctor</option><option>Patient</option></select></div><div className="panel empty-state"><Users size={28} /><h3>{filteredUsers.length ? "Users" : "No users yet"}</h3><p className="muted">{filteredUsers.length ? "User records will appear here." : "Connect your user service to manage real accounts."}</p></div></>;
  if (active === "appointments") return <AppointmentTable appointments={appointments} setAppointments={setAppointments} notify={notify} admin />;
  if (active === "analytics") return <><SectionHeader eyebrow="Performance" title="System analytics" /><Stats items={[{ label: "Users", value: users.length, note: "Current records", icon: Users, tone: "blue" }, { label: "Appointments", value: appointments.length, note: "Current records", icon: CalendarDays, tone: "purple" }, { label: "Completed", value: appointments.filter((item) => item.status === "confirmed").length, note: "Confirmed visits", icon: Check, tone: "green" }]} /><div className="panel empty-state"><Activity size={28} /><h3>No analytics yet</h3><p className="muted">Analytics will appear when real activity is connected.</p></div></>;
  if (active === "settings") return <SettingsView notify={notify} />;
  return <><SectionHeader eyebrow="Workspace overview" title="Admin overview" action={<button className="button-secondary" onClick={() => notify("Reports are available after real data is connected")}><FileText size={16} /> Export report</button>} /><Stats items={[{ label: "Users", value: users.length, note: "Current records", icon: Users, tone: "blue" }, { label: "Doctors", value: users.filter((user) => user.role === "doctor").length, note: "Current records", icon: Stethoscope, tone: "purple" }, { label: "Appointments", value: appointments.length, note: "Current records", icon: CalendarDays, tone: "green" }, { label: "Completion rate", value: appointments.length ? `${Math.round((appointments.filter((item) => item.status === "confirmed").length / appointments.length) * 100)}%` : "0%", note: "Confirmed visits", icon: Activity, tone: "orange" }]} /><div className="two-column"><AppointmentTable appointments={appointments} setAppointments={setAppointments} notify={notify} /><div className="panel empty-state"><ShieldCheck size={28} /><h3>Ready for real data</h3><p className="muted">Connect your backend to manage users and appointments.</p></div></div></>;
}

function AppointmentTable({ appointments, setAppointments, notify, admin = false }) {
  return <div className="panel"><div className="panel-heading"><div><h3>{admin ? "Appointments" : "Appointments"}</h3><p className="muted">{admin ? "Manage connected appointment records" : "Your upcoming visits"}</p></div></div>{appointments.length ? <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Date & time</th><th>Status</th><th /></tr></thead><tbody>{appointments.map((item) => <tr key={item.id}><td><div className="person"><span className="mini-avatar">{item.patientName[0]}</span><strong>{item.patientName}</strong></div></td><td>{item.doctorName}</td><td>{item.date}<small>{item.time}</small></td><td><Status value={item.status} /></td><td>{item.status === "pending" && <button className="icon-action success" onClick={() => { setAppointments((current) => current.map((appointment) => appointment.id === item.id ? { ...appointment, status: "confirmed" } : appointment)); notify("Appointment approved"); }}><Check size={16} /></button>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><CalendarDays size={28} /><h3>No appointments yet</h3><p className="muted">New appointment records will appear here.</p></div>}</div>;
}

function DoctorView({ active, appointments, setAppointments, notify }) {
  if (active === "appointments") return <AppointmentTable appointments={appointments} setAppointments={setAppointments} notify={notify} />;
  if (active === "schedule") return <><SectionHeader eyebrow="Availability" title="Manage your schedule" action={<button className="button-primary" onClick={() => notify("Connect scheduling to add availability")}><Plus size={17} /> Add time slot</button>} /><div className="panel empty-state"><Clock3 size={28} /><h3>No schedule connected</h3><p className="muted">Availability will appear when scheduling is connected.</p></div></>;
  if (active === "patients") return <><SectionHeader eyebrow="Patient records" title="My patients" /><div className="panel empty-state"><Users size={28} /><h3>No patients yet</h3><p className="muted">Patient records will appear after the patient service is connected.</p></div></>;
  if (active === "feedback") return <><SectionHeader eyebrow="Patient feedback" title="Feedback" /><div className="panel empty-state"><ShieldCheck size={28} /><h3>No feedback yet</h3><p className="muted">Feedback will appear after real consultations are recorded.</p></div></>;
  return <><SectionHeader eyebrow="Clinical workspace" title="Clinical overview" action={<button className="button-primary" onClick={() => notify("Connect records to add a clinical record")}><Plus size={17} /> Add record</button>} /><Stats items={[{ label: "Today’s visits", value: appointments.length, note: "Current records", icon: CalendarDays, tone: "blue" }, { label: "Upcoming", value: appointments.filter((item) => item.status === "pending").length, note: "Pending visits", icon: Clock3, tone: "purple" }, { label: "My patients", value: new Set(appointments.map((item) => item.patientName)).size, note: "Current records", icon: Users, tone: "green" }]} /><div className="two-column"><AppointmentTable appointments={appointments} setAppointments={setAppointments} notify={notify} /><div className="panel insight"><div className="insight-icon"><Activity size={20} /></div><h3>No care summary yet</h3><p>Summary insights will appear when real clinical activity is connected.</p></div></div></>;
}

function PatientView({ active, session, appointments, setAppointments, notify }) {
  if (active === "book") return <Booking setAppointments={setAppointments} notify={notify} />;
  if (active === "appointments") return <><SectionHeader eyebrow="Your care journey" title="My appointments" /><AppointmentTable appointments={appointments.filter((item) => item.patientName === session.name)} setAppointments={setAppointments} notify={notify} /></>;
  if (active === "records") return <><SectionHeader eyebrow="Health records" title="Medical history" /><div className="panel empty-state"><FileText size={28} /><h3>No medical records yet</h3><p className="muted">Your connected medical records will appear here.</p></div></>;
  if (active === "profile") return <Profile session={session} notify={notify} />;
  return <><SectionHeader eyebrow="Patient workspace" title="Your health at a glance" action={<button className="button-primary" onClick={() => notify("Use Find a doctor to request an appointment")}><Plus size={17} /> Book appointment</button>} /><Stats items={[{ label: "Upcoming visits", value: appointments.length, note: "Current records", icon: CalendarDays, tone: "blue" }, { label: "Medical records", value: "0", note: "No records yet", icon: FileText, tone: "purple" }, { label: "Health score", value: "—", note: "Not available yet", icon: HeartPulse, tone: "green" }]} /><div className="two-column"><AppointmentTable appointments={appointments.filter((item) => item.patientName === session.name)} setAppointments={setAppointments} notify={notify} /><div className="panel care-card"><div className="care-illustration"><HeartPulse size={28} /></div><h3>Get started</h3><p className="muted">Request an appointment or connect your care provider to see health information.</p><button className="button-secondary" onClick={() => notify("Medical records are not connected yet")}>View medical records</button></div></div></>;
}

function Booking({ setAppointments, notify }) {
  const [service, setService] = useState("General consultation");
  return <><SectionHeader eyebrow="Find care" title="Request an appointment" /><div className="booking-layout"><div className="panel"><h3>Choose a service</h3><div className="doctor-options"><button className="doctor-option selected" onClick={() => setService("General consultation")}><span className="large-avatar"><Stethoscope size={18} /></span><span><strong>General consultation</strong><small>Request care from your connected provider</small></span><Check size={17} /></button></div></div><div className="panel form-stack"><h3>Appointment details</h3><label>Date<input className="input" type="date" /></label><label>Preferred time<select className="input"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label><label>Reason for visit<textarea className="input" rows="3" placeholder="Describe what you need help with..." /></label><button className="button-primary" onClick={() => { setAppointments((current) => [...current, { id: `APT-${current.length + 1}`, patientName: "Patient", doctorName: "Connected provider", date: "Requested date", time: "Requested time", type: service, status: "pending" }]); notify("Appointment request saved"); }}>Save request <ChevronRight size={16} /></button></div></div></>;
}

function Profile({ session, notify }) {
  return <><SectionHeader eyebrow="Personal details" title="My profile" action={<button className="button-primary" onClick={() => notify("Profile saved locally")}><Check size={16} /> Save changes</button>} /><div className="panel form-grid"><label>Full name<input className="input" defaultValue={session.name} /></label><label>Email address<input className="input" placeholder="Add email address" /></label><label>Phone number<input className="input" placeholder="Add phone number" /></label><label>Date of birth<input className="input" type="date" /></label><label className="span-2">Address<textarea className="input" rows="3" placeholder="Add address" /></label></div></>;
}

function SettingsView({ notify }) {
  return <><SectionHeader eyebrow="Platform configuration" title="System settings" /><div className="panel form-grid"><label>Clinic name<input className="input" defaultValue="MedFlow Healthcare" /></label><label>Support email<input className="input" defaultValue="support@medflow.demo" /></label><label>Appointment duration<select className="input"><option>30 minutes</option><option>45 minutes</option></select></label><label>Timezone<select className="input"><option>Asia/Kolkata (IST)</option><option>UTC</option></select></label><div className="span-2"><button className="button-primary" onClick={() => notify("Settings saved successfully")}><Check size={16} /> Save settings</button></div></div></>;
}
