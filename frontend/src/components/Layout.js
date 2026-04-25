import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/analyzer', icon: '◈', label: 'Analyze' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>◈</div>
          {!collapsed && <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>MeetingAI</span>}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 4,
              color: isActive ? '#fff' : 'var(--text2)',
              background: isActive ? 'var(--accent)' : 'transparent',
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              textDecoration: 'none'
            })}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + collapse */}
        <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
            <span>⎋</span>{!collapsed && 'Logout'}
          </button>
          <button onClick={() => setCollapsed(c => !c)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '8px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--text3)', fontSize: 16, cursor: 'pointer', marginTop: 4 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
