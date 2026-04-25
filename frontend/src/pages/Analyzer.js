import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingsAPI } from '../services/api';
import AnalysisResult from '../components/AnalysisResult';

const SAMPLE = `Alice: I think we should move the launch date to Q3. That gives the team more runway.
Bob: Agreed, but we haven't resolved the pricing model yet. It's still up in the air.
Alice: Right. Can you own the pricing research by Friday, Bob?
Bob: Sure. Also, Carol, can you update the deck with the new timeline?
Carol: Yes, I'll do that today.
David: What about the API integration issues? We've been stuck on that.
Alice: We'll revisit that next week. Let's table it for now.
Carol: Agreed. One more thing — do we have budget approval from finance?
Alice: Not yet. Finance hasn't confirmed. That's still open.
Bob: And the marketing brief — did anyone send it to the agency?
Alice: No one has. That needs to happen this week. Carol, can you handle that?
Carol: Sure, I'll send it Thursday.`;

export default function Analyzer() {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!transcript.trim() || transcript.trim().length < 20) return setError('Please enter a longer transcript.');
    setError(''); setLoading(true);
    try {
      const res = await meetingsAPI.analyze(transcript);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const save = async () => {
    if (!title.trim()) return setError('Please add a meeting title to save.');
    setSaving(true);
    try {
      const res = await meetingsAPI.create({ title, transcript });
      navigate(`/meetings/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="page-fade" style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Meeting analyzer</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Paste your transcript in <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4, fontSize: 13 }}>Name: message</code> format for speaker detection</p>
      </div>

      {/* Input area */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Meeting title (for saving)</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q3 Product Sync — July 2025" />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Transcript</label>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder={"Alice: Let's discuss the launch timeline...\nBob: I think we need more time..."}
            style={{ minHeight: 220, resize: 'vertical', fontSize: 13, lineHeight: 1.7 }}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 14, color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={analyze} disabled={loading} style={{ minWidth: 140 }}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Analyzing…</> : '◈ Analyze'}
          </button>
          <button className="btn btn-ghost" onClick={() => setTranscript(SAMPLE)}>Load sample</button>
          {result && title && (
            <button className="btn btn-ghost" onClick={save} disabled={saving} style={{ marginLeft: 'auto', color: 'var(--accent2)', borderColor: 'rgba(74,222,128,0.3)' }}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '↑ Save meeting'}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && <AnalysisResult data={result} />}
    </div>
  );
}
