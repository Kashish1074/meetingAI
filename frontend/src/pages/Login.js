import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 1rem' }}>◈</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Sign in to your MeetingAI account</p>
        </div>

        <div className="card">
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 14, color: 'var(--danger)' }}>
              {error}
            </div>
          )}
          <form onSubmit={submit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text2)', marginTop: '1.25rem' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
