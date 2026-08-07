import React, { useState } from 'react';
import { X, QrCode, Key, Clock, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function BurnerQrModal({ isOpen, onClose, currentUser, onBurnerConnected }) {
  if (!isOpen || !currentUser) return null;

  const [activeTab, setActiveTab] = useState('generate'); // generate, scan
  const [burnerCode, setBurnerCode] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/billing/generate-burner-code', {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (data.success) {
        setBurnerCode(data.burnerCode);
      } else {
        setErrorMsg(data.error || 'Failed to generate burner code.');
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/billing/claim-burner-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ code: inputCode.trim() })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        onBurnerConnected(data.partner);
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid or expired burner PIN.');
      }
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode style={{ width: 18, height: 18, color: '#ec4899' }} />
            <span className="modal-title">24-Hour Disposable Burner ID</span>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => { setActiveTab('generate'); setErrorMsg(null); }}
            className={`filter-chip ${activeTab === 'generate' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, justifyContent: 'center', border: 'none', borderBottom: activeTab === 'generate' ? '2px solid var(--primary)' : 'none' }}
          >
            Create My QR / PIN
          </button>
          <button
            onClick={() => { setActiveTab('scan'); setErrorMsg(null); }}
            className={`filter-chip ${activeTab === 'scan' ? 'active' : ''}`}
            style={{ flex: 1, borderRadius: 0, justifyContent: 'center', border: 'none', borderBottom: activeTab === 'scan' ? '2px solid var(--primary)' : 'none' }}
          >
            Enter 6-Digit PIN
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          
          {/* TAB 1: GENERATE DISPOSABLE QR & PIN */}
          {activeTab === 'generate' && (
            <>
              {!burnerCode ? (
                <>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', border: '2px solid rgba(236, 72, 153, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🔥
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                      Meet Someone in Real Life?
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: 320 }}>
                      Generate a 24-hour disposable PIN or QR. Connect instantly in NightOwl without ever giving out your phone number, WhatsApp, or Instagram.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                  >
                    <Sparkles style={{ width: 16, height: 16 }} />
                    <span>{loading ? 'Generating...' : 'Generate 24h Burner PIN (₹49 / Free)'}</span>
                  </button>
                </>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  {/* Generated Holographic QR Placeholder */}
                  <div style={{ padding: 16, borderRadius: 18, background: 'white', display: 'inline-block', boxShadow: '0 10px 30px rgba(236,72,153,0.3)' }}>
                    <div style={{ width: 150, height: 150, background: '#0f172a', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fde047', gap: 6 }}>
                      <QrCode style={{ width: 70, height: 70, color: '#ec4899' }} />
                      <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2 }}>{burnerCode}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Share this 6-Character Burner PIN:</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#fde047', letterSpacing: 3, marginTop: 2 }}>
                      {burnerCode}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#fbbf24' }}>
                    <Clock style={{ width: 13, height: 13 }} />
                    <span>Expires automatically in 24 hours. Single-use.</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: ENTER 6-DIGIT PIN */}
          {activeTab === 'scan' && (
            <form onSubmit={handleClaim} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                  Connect via Burner PIN
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  Enter the 6-character code (e.g. <code>OWL-884</code>) to open an encrypted private chat instantly.
                </p>
              </div>

              <input
                type="text"
                placeholder="OWL-XXX"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="form-input"
                style={{ textAlign: 'center', fontSize: 20, letterSpacing: 3, fontWeight: 800, padding: 12 }}
                maxLength={8}
              />

              <button
                type="submit"
                disabled={loading || !inputCode.trim()}
                className="btn-primary"
                style={{ justifyContent: 'center', padding: '14px' }}
              >
                <span>{loading ? 'Connecting...' : 'Connect Anonymously'}</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </form>
          )}

          {errorMsg && (
            <div style={{ fontSize: 12, color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 10, borderRadius: 10, width: '100%' }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
