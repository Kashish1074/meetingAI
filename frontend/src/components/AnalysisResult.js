import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const PALETTE = ['#6c63ff','#4ade80','#f87171','#fbbf24','#38bdf8','#f472b6','#a78bfa'];
const CHIP_COLORS = [
  { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa' },
  { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
  { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  { bg: 'rgba(56,189,248,0.12)', color: '#38bdf8' },
];

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.75rem' }}>{title}</div>
      {children}
    </div>
  );
}

export default function AnalysisResult({ data, onToggleAction, onToggleUnresolved }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { participants = [], actionItems = [], unresolvedTopics = [], topicClusters = {}, insight } = data;
  const chartData = {
    labels: participants.map(p => p.name),
    datasets: [{
      data: participants.map(p => p.percentage),
      backgroundColor: participants.map((_, i) => PALETTE[i % PALETTE.length]),
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const chartOpts = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}% of conversation` } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b92a8', callback: v => `${v}%` }, max: 100 },
      y: { grid: { display: false }, ticks: { color: '#e8eaf0', font: { size: 13 } } }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'actions', label: `Actions (${actionItems.length})` },
    { id: 'unresolved', label: `Unresolved (${unresolvedTopics.length})` },
    { id: 'clusters', label: 'Topics' },
  ];

  return (
    <div className="page-fade">
      {/* Insight banner */}
      {insight && (
        <div style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>
          💡 {insight}
        </div>
      )}

      {/* Metric pills */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {[
          { label: 'Participants', val: participants.length },
          { label: 'Action items', val: actionItems.length },
          { label: 'Unresolved', val: unresolvedTopics.length },
          { label: 'Topic clusters', val: Object.keys(topicClusters).length },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: 'none', border: 'none', padding: '8px 14px', fontSize: 14,
            color: activeTab === t.id ? 'var(--accent)' : 'var(--text2)',
            borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer', fontWeight: activeTab === t.id ? 500 : 400, marginBottom: -1
          }}>{t.label}</button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="card">
          <Section title="Who dominated the meeting">
            {participants.length === 0 ? (
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>No speaker labels detected. Use <code>Name: message</code> format.</p>
            ) : (
              <>
                <div style={{ position: 'relative', height: Math.max(160, participants.length * 44) }}>
                  <Bar data={chartData} options={chartOpts} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                  {participants.map((p, i) => (
                    <span key={p.name} className={`badge badge-${p.tag}`}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length], display: 'inline-block' }} />
                      {p.name} · {p.percentage}%
                    </span>
                  ))}
                </div>
              </>
            )}
          </Section>
        </div>
      )}

      {/* Actions tab */}
      {activeTab === 'actions' && (
        <div className="card">
          <Section title="Action items">
            {actionItems.length === 0 ? (
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>No action items detected.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {actionItems.map((item, i) => (
                  <div key={item._id || i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px', borderRadius: 8,
                    background: item.done ? 'rgba(74,222,128,0.05)' : 'var(--bg3)',
                    border: `1px solid ${item.done ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
                    opacity: item.done ? 0.65 : 1
                  }}>
                    {onToggleAction ? (
                      <input type="checkbox" checked={!!item.done} onChange={() => onToggleAction(item._id)}
                        style={{ width: 16, height: 16, marginTop: 2, cursor: 'pointer', accentColor: 'var(--accent2)', flexShrink: 0 }} />
                    ) : (
                      <span style={{ color: 'var(--accent)', fontSize: 14, flexShrink: 0, marginTop: 2 }}>◆</span>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>owner: <span style={{ color: 'var(--accent)' }}>{item.owner}</span> · from {item.from}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* Unresolved tab */}
      {activeTab === 'unresolved' && (
        <div className="card">
          <Section title="Unresolved topics">
            {unresolvedTopics.length === 0 ? (
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>No unresolved topics detected.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {unresolvedTopics.map((item, i) => (
                  <div key={item._id || i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px', borderRadius: 8,
                    background: item.resolved ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)',
                    border: `1px solid ${item.resolved ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    opacity: item.resolved ? 0.65 : 1
                  }}>
                    {onToggleUnresolved ? (
                      <input type="checkbox" checked={!!item.resolved} onChange={() => onToggleUnresolved(item._id)}
                        style={{ width: 16, height: 16, marginTop: 2, cursor: 'pointer', accentColor: 'var(--accent2)', flexShrink: 0 }} />
                    ) : (
                      <span style={{ color: 'var(--danger)', fontSize: 14, flexShrink: 0, marginTop: 2 }}>◆</span>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, textDecoration: item.resolved ? 'line-through' : 'none' }}>{item.text}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>raised by <span style={{ color: 'var(--danger)' }}>{item.from}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* Clusters tab */}
      {activeTab === 'clusters' && (
        <div className="card">
          <Section title="Topic clusters (keyword analysis)">
            {Object.keys(topicClusters).length === 0 ? (
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>No strong topic clusters found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(topicClusters).map(([cluster, kws], i) => (
                  <div key={cluster} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', minWidth: 160, flexShrink: 0 }}>{cluster}</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(Array.isArray(kws) ? kws : Object.values(kws)).map(kw => (
                        <span key={kw} style={{ ...CHIP_COLORS[i % CHIP_COLORS.length], fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
