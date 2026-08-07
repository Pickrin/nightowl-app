import React, { useState } from 'react';
import { X, Flag, CheckCircle, Ban, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ReportModal({ isOpen, onClose, reportedUser }) {
  if (!isOpen || !reportedUser) return null;

  const [reason, setReason] = useState('Harassment or Verbal Abuse');
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const REASONS = [
    'Harassment or Verbal Abuse',
    'Inappropriate / Non-Consensual Media',
    'Commercial Spam / Solicitation',
    'Suspected Underage / Policy Violation',
    'Extortion or Blackmail Attempt',
    'Impersonation or Fake Profile'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/api/moderation/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: reportedUser.id,
          reason,
          details,
          alsoBlock
        })
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (e) {
      console.error('Report submission error:', e);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 420 }}>
        <div className="modal-header" style={{ background: 'linear-gradient(90deg, #7f1d1d, #1e1b4b)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flag style={{ width: 16, height: 16, color: '#f87171' }} />
            <span className="modal-title">Report & Block {reportedUser.nickname}</span>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <CheckCircle style={{ width: 44, height: 44, color: '#10b981' }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Report Submitted & User Blocked</div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              This user has been removed from your radar and flagged in the administrative moderation queue for review within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field-group">
              <label className="field-label">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="sleek-input"
                style={{ background: '#0a0b16', color: 'white' }}
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="sleek-input"
                style={{ resize: 'none' }}
                placeholder="Describe what occurred..."
              />
            </div>

            {/* Instant Block Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#fca5a5', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <input
                type="checkbox"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
                style={{ accentColor: '#ef4444', width: 16, height: 16 }}
              />
              <span><strong>Block user permanently:</strong> They will never see your profile or appear on your radar again.</span>
            </label>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: 13 }}>
              <ShieldAlert style={{ width: 16, height: 16 }} />
              <span>Submit Report & Block User</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
