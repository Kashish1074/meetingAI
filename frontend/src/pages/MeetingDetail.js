import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetingsAPI } from '../services/api';
import AnalysisResult from '../components/AnalysisResult';
import { format } from 'date-fns';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    meetingsAPI.getOne(id)
      .then(res => setMeeting(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleToggleAction = async (itemId) => {
    const res = await meetingsAPI.toggleAction(id, itemId);
    setMeeting(res.data);
  };

  const handleToggleUnresolved = async (itemId) => {
    const res = await meetingsAPI.toggleUnresolved(id, itemId);
    setMeeting(res.data);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this meeting permanently?')) return;
    setDeleting(true);
    await meetingsAPI.delete(id);
    navigate('/dashboard');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!meeting) return null;

  return (
    <div className="page-fade" style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ fontSize: 13, color: 'var(--text2)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
          ← Back to dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600 }}>{meeting.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
              {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
              {meeting.dominantSpeaker && <> · <span style={{ color: 'var(--warn)' }}>{meeting.dominantSpeaker}</span> dominated</>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowTranscript(s => !s)}>
              {showTranscript ? 'Hide' : 'View'} transcript
            </button>
            <button className="btn btn-danger" style={{ fontSize: 13 }} onClick={handleDelete} disabled={deleting}>
              {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Transcript viewer */}
      {showTranscript && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.75rem' }}>Transcript</div>
          <pre style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontSize: 13, lineHeight: 1.8, color: 'var(--text2)',
            maxHeight: 320, overflowY: 'auto'
          }}>{meeting.transcript}</pre>
        </div>
      )}

      <AnalysisResult
        data={meeting}
        onToggleAction={handleToggleAction}
        onToggleUnresolved={handleToggleUnresolved}
      />
    </div>
  );
}
