import React, { useState } from 'react';
import { X, Flag, CheckCircle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, reportedUser }) {
  if (!isOpen || !reportedUser) return null;

  const [reason, setReason] = useState('Inappropriate Content / Photo');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const REASONS = [
    'Inappropriate Content / Photo',
    'Commercial Spam / Solicitation',
    'Underage / Policy Violation',
    'Harassment or Verbal Abuse',
    'Suspicious / Impersonation'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: reportedUser.id,
          reason,
          details
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
      <div className="modal-card" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flag style={{ width: 16, height: 16, color: '#ec4899' }} />
            <span className="modal-title">Report {reportedUser.nickname}</span>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <CheckCircle style={{ width: 44, height: 44, color: 'var(--emerald)' }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Report Received</div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              User has been blocked from your radar and flagged for review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-group">
              <label className="form-label">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-select"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="form-textarea"
                placeholder="Explain the violation..."
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Submit Report & Block
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
