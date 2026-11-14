import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Users, LogOut, Menu, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

const ROLE_LABEL = { hr: 'HR', manager: 'Manager', employee: 'Employee' };

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/tasks', label: user.role === 'employee' ? 'My tasks' : 'Tasks', icon: ListChecks },
    ...(user.role !== 'employee' ? [{ to: '/people', label: user.role === 'hr' ? 'New hires' : 'My team', icon: Users }] : []),
  ];

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand"><Compass size={22} /> Bala's Onboarding</div>
        <nav>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <Avatar name={user.name} size={38} />
          <div className="me-text">
            <strong>{user.name}</strong>
            <span>{ROLE_LABEL[user.role]}</span>
          </div>
          <button className="icon-btn light" onClick={logout} aria-label="Sign out"><LogOut size={18} /></button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Menu size={22} /></button>
          <span className="brand brand-dark"><Compass size={20} /> Onboardly</span>
        </div>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
