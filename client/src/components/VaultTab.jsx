import React, { useState } from 'react';
import { Zap, Moon, Share2, Copy, Check, QrCode, Coins, ShieldAlert, Sparkles, Plus } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function VaultTab({ currentUser, onOpenShop, onRefreshUser }) {
  const [copied, setCopied] = useState(false);
  const [burnerPin, setBurnerPin] = useState(null);
  const [claimInput, setClaimInput] = useState('');
  const [claimStatus, setClaimStatus] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const referralCode = currentUser?.referralCode || 'GHOST-NIGHT';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateBurner = async () => {
    if (!currentUser) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/generate-burner-code`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (data.success && data.burner) {
        setBurnerPin(data.burner.code);
      }
    } catch (e) {
      console.error('Burner code error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClaimBurner = async (e) => {
    e.preventDefault();
    if (!claimInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/claim-burner-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ code: claimInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setClaimStatus({ success: true, message: `Connected with ${data.creator?.nickname || 'Owl'}!` });
        setClaimInput('');
      } else {
        setClaimStatus({ success: false, message: data.error || 'Invalid or expired code.' });
      }
    } catch (e) {
      setClaimStatus({ success: false, message: 'Network error claiming code.' });
    }
  };

  return (
    <div className="tab-page-container">
      {/* Header */}
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Nocturnal Vault</h1>
          <p className="tab-subtitle">Ghost invites, burner PINs & coin reserves</p>
        </div>
        <div className="vault-balance-badge" onClick={onOpenShop}>
          <Coins style={{ width: 16, height: 16, color: '#f59e0b' }} />
          <span>{currentUser?.coinsBalance || 0}c</span>
          <Plus style={{ width: 12, height: 12, color: '#f59e0b' }} />
        </div>
      </div>

      {/* Happy Hour Banner */}
      <div className="happy-hour-card">
        <div className="happy-hour-glow" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="happy-hour-tag">
            <Moon style={{ width: 12, height: 12, color: '#fde047' }} />
            <span>NOCTURNAL HAPPY HOUR • 12 AM – 3 AM IST</span>
          </div>
          <h3 className="happy-hour-title">50% Off All Chat Unlocks</h3>
          <p className="happy-hour-desc">
            Chat unlocks drop from 20 coins to <strong>10 coins</strong> between midnight and 3 AM IST to concentrate active nocturnal connections.
          </p>
        </div>
      </div>

      {/* Ghost Referral Invite Card (+50 Coins) */}
      <div className="vault-feature-card">
        <div className="feature-card-header">
          <div className="feature-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Share2 style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 className="feature-title">Ghost Invite Code</h3>
            <p className="feature-subtitle">Both you and your invitee receive <strong>+50 Coins</strong></p>
          </div>
        </div>

        <div className="referral-copy-row">
          <div className="referral-code-display">{referralCode}</div>
          <button type="button" onClick={handleCopy} className="copy-action-btn">
            {copied ? <Check style={{ width: 16, height: 16, color: '#10b981' }} /> : <Copy style={{ width: 16, height: 16 }} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 24-Hour Disposable Burner PIN */}
      <div className="vault-feature-card">
        <div className="feature-card-header">
          <div className="feature-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            <QrCode style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 className="feature-title">24-Hour Disposable Burner PIN</h3>
            <p className="feature-subtitle">Meet someone offline? Share a 4-digit code to connect anonymously without phone numbers</p>
          </div>
        </div>

        {burnerPin ? (
          <div className="burner-active-display">
            <div style={{ fontSize: 11, color: '#f472b6', fontWeight: 800 }}>YOUR ACTIVE 24H BURNER PIN:</div>
            <div className="burner-pin-huge">{burnerPin}</div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              Give this code to someone. When they enter it in their vault, you will instantly connect.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerateBurner}
            disabled={isGenerating}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: 12 }}
          >
            <Sparkles style={{ width: 16, height: 16, color: '#fde047' }} />
            <span>{isGenerating ? 'Generating...' : 'Generate New Burner PIN'}</span>
          </button>
        )}

        {/* Claim Input */}
        <form onSubmit={handleClaimBurner} style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          <label className="field-label">Received a Burner PIN from someone?</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              type="text"
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value.toUpperCase())}
              placeholder="e.g. OWL-123"
              className="sleek-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-secondary" style={{ padding: '0 16px', fontSize: 12, fontWeight: 700 }}>
              Connect
            </button>
          </div>
          {claimStatus && (
            <div style={{ fontSize: 11, marginTop: 8, color: claimStatus.success ? '#10b981' : '#f87171', fontWeight: 700 }}>
              {claimStatus.message}
            </div>
          )}
        </form>
      </div>

      {/* Refill Coins CTA */}
      <div className="vault-feature-card" style={{ cursor: 'pointer' }} onClick={onOpenShop}>
        <div className="feature-card-header">
          <div className="feature-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Coins style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 className="feature-title">Coin Vault Packs</h3>
            <p className="feature-subtitle">Starting from ₹99 for 100 Coins. 1-tap instant refill.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
