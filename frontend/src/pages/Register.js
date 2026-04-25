import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 1rem' }}>◈</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Create account</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Start analyzing your meetings today</p>
        </div>

        <div className="card">
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 14, color: 'var(--danger)' }}>
              {error}
            </div>
          )}
          <form onSubmit={submit}>
            {[
              { name: 'name', label: 'Full name', type: 'text', placeholder: 'Alice Johnson' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'alice@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { name: 'confirm', label: 'Confirm password', type: 'password', placeholder: '••••••••' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name} style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{label}</label>
                <input name={name} type={type} value={form[name]} onChange={handle} placeholder={placeholder} required />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text2)', marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
