import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { meetingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${color || 'var(--accent)'}` }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([meetingsAPI.getStats(), meetingsAPI.getAll(1)])
      .then(([s, m]) => {
        setStats(s.data);
        setMeetings(m.data.meetings);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Delete this meeting?')) return;
    await meetingsAPI.delete(id);
    setMeetings(prev => prev.filter(m => m._id !== id));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="page-fade" style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Here's your meeting intelligence overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/analyzer')}>+ Analyze meeting</button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard label="Total meetings" value={stats.totalMeetings} color="var(--accent)" />
          <StatCard label="Action items" value={stats.totalActions} sub={`${stats.doneActions} completed`} color="#a78bfa" />
          <StatCard label="Pending actions" value={stats.pendingActions} color="var(--warn)" />
          <StatCard label="Open topics" value={stats.totalUnresolved} color="var(--danger)" />
          {stats.topDominantSpeaker && (
            <StatCard label="Top speaker" value={stats.topDominantSpeaker} sub={`dominated ${stats.topDominantCount} meeting${stats.topDominantCount > 1 ? 's' : ''}`} color="var(--accent2)" />
          )}
        </div>
      )}

      {/* Meetings list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>Recent meetings</h2>
      </div>

      {meetings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>◈</div>
          <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>No meetings analyzed yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/analyzer')}>Analyze your first meeting</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {meetings.map(m => (
            <Link key={m._id} to={`/meetings/${m._id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text2)', flexWrap: 'wrap' }}>
                    <span>{format(new Date(m.date), 'MMM d, yyyy')}</span>
                    <span>· {m.participants?.length || 0} participants</span>
                    <span>· {m.actionItems?.length || 0} actions</span>
                    {m.unresolvedTopics?.filter(t => !t.resolved).length > 0 && (
                      <span style={{ color: 'var(--danger)' }}>· {m.unresolvedTopics.filter(t => !t.resolved).length} unresolved</span>
                    )}
                  </div>
                </div>
                {m.dominantSpeaker && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>dominated by</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--warn)' }}>{m.dominantSpeaker}</div>
                  </div>
                )}
                <button onClick={(e) => handleDelete(m._id, e)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>✕</button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
