import React, { useState } from 'react';
import { 
  EyeOff, 
  ShieldCheck, 
  FileText, 
  ShieldAlert, 
  Trash2, 
  CheckCircle, 
  Camera, 
  AlertTriangle, 
  Coins, 
  Dices,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ProfileTab({ 
  currentUser, 
  onToggleIncognito, 
  onOpenVerification, 
  onOpenShop, 
  onAccountDeleted, 
  onRefreshRadar 
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sandboxMessage, setSandboxMessage] = useState(null);

  if (!currentUser) return null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        }
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('nightowl_user');
        alert('Your account, chats, and data have been permanently purged from NightOwl.');
        if (onAccountDeleted) onAccountDeleted();
        else window.location.reload();
      } else {
        alert(data.error || 'Failed to delete account.');
      }
    } catch (e) {
      console.error('Delete account error:', e);
      alert('Network error while deleting account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedSandbox = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sandbox/seed`, { method: 'POST' });
      const data = await res.json();
      setSandboxMessage(data.message);
      if (onRefreshRadar) onRefreshRadar();
      setTimeout(() => setSandboxMessage(null), 3000);
    } catch (e) {
      setSandboxMessage('Failed to spawn test personas');
    }
  };

  const handleClearSandbox = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sandbox/clear`, { method: 'POST' });
      const data = await res.json();
      setSandboxMessage(data.message);
      if (onRefreshRadar) onRefreshRadar();
      setTimeout(() => setSandboxMessage(null), 3000);
    } catch (e) {
      setSandboxMessage('Failed to clear test personas');
    }
  };

  return (
    <div className="tab-page-container">
      {/* Header */}
      <div className="tab-header">
        <div>
          <h1 className="tab-title">My Nocturnal Identity</h1>
          <p className="tab-subtitle">Anonymous persona & privacy preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-identity-card">
        <div className="identity-avatar-large" style={{ backgroundColor: `${currentUser.avatarColor || '#a855f7'}25`, border: `2px solid ${currentUser.avatarColor || '#a855f7'}` }}>
          <span>{currentUser.avatarIcon || '🦉'}</span>
        </div>

        <div className="identity-details">
          <div className="identity-name-row">
            <h2 className="identity-name">{currentUser.nickname}</h2>
            {currentUser.verified && (
              <span className="identity-verified-badge">✓ Verified</span>
            )}
          </div>
          <div className="identity-meta">
            {currentUser.age} yrs • {currentUser.gender} • Seeking {currentUser.seeking}
          </div>
          <div className="identity-vibe">
            "{currentUser.midnightVibe || 'Late-Night Chai & Long Drives'}"
          </div>
        </div>
      </div>

      {/* Biometric Verification Banner */}
      {!currentUser.verified ? (
        <div className="verification-promo-card">
          <div className="promo-icon-circle">
            <Camera style={{ width: 22, height: 22, color: '#10b981' }} />
          </div>
          <div className="promo-text-col">
            <div className="promo-title">Verify Face Liveness (+50 Coins)</div>
            <div className="promo-desc">2.5s client-side camera scan. Zero photos or videos stored.</div>
          </div>
          <button type="button" onClick={onOpenVerification} className="promo-action-btn">
            Verify
          </button>
        </div>
      ) : (
        <div className="verified-status-card">
          <CheckCircle style={{ width: 18, height: 18, color: '#10b981' }} />
          <span>Biometric Liveness Verified: Recognized as a genuine human.</span>
        </div>
      )}

      {/* Incognito Stealth Mode */}
      <div className="vault-feature-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'white' }}>
              <EyeOff style={{ width: 16, height: 16, color: 'var(--primary)' }} />
              <span>Incognito Radar Mode</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
              Hide your card completely from the nearby nocturnal radar.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleIncognito}
            style={{
              width: 48,
              height: 26,
              borderRadius: 99,
              background: currentUser.isIncognito ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              padding: 2,
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#ffffff',
                transform: currentUser.isIncognito ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>
        </div>
      </div>

      {/* Developer Testing Sandbox Controls */}
      <div className="vault-feature-card">
        <div className="feature-card-header">
          <div className="feature-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Dices style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 className="feature-title">Developer Testing Sandbox</h3>
            <p className="feature-subtitle">Spawn or clear clean test personas to test matching & chat</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            type="button"
            onClick={handleSeedSandbox}
            className="btn-secondary"
            style={{ flex: 1, padding: 10, fontSize: 11, justifyContent: 'center' }}
          >
            Spawn 2 Test Personas
          </button>
          <button
            type="button"
            onClick={handleClearSandbox}
            className="btn-secondary"
            style={{ flex: 1, padding: 10, fontSize: 11, justifyContent: 'center', color: '#f87171' }}
          >
            Clear Test Personas
          </button>
        </div>
        {sandboxMessage && (
          <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 8, textAlign: 'center', fontWeight: 700 }}>
            {sandboxMessage}
          </div>
        )}
      </div>

      {/* Google Play & DPDPA Mandatory Account Deletion Section */}
      <div className="vault-feature-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 800, fontSize: 13 }}>
          <Trash2 style={{ width: 16, height: 16 }} />
          <span>Account Deletion & Data Purge</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
          Permanently delete your profile, chat transcripts, vault media, and coin ledger immediately.
        </p>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontWeight: 800,
              fontSize: 11,
              marginTop: 10,
              cursor: 'pointer'
            }}
          >
            Delete My Account Permanently
          </button>
        ) : (
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fca5a5', fontSize: 11, fontWeight: 700 }}>
              <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span>Are you sure? This cannot be undone.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: 8, fontSize: 11 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{ flex: 1, padding: 8, fontSize: 11, background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
              >
                {isDeleting ? 'Purging...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legal & Regulatory Suite */}
      <div className="legal-links-footer">
        <a href={`${API_BASE_URL}/legal/privacy_policy.html`} target="_blank" rel="noreferrer">
          <ShieldCheck style={{ width: 12, height: 12, color: '#10b981' }} />
          <span>Privacy Policy</span>
        </a>
        <a href={`${API_BASE_URL}/legal/terms_of_service.html`} target="_blank" rel="noreferrer">
          <FileText style={{ width: 12, height: 12, color: 'var(--primary)' }} />
          <span>Terms of Service</span>
        </a>
        <a href={`${API_BASE_URL}/legal/csae_standards.html`} target="_blank" rel="noreferrer">
          <ShieldAlert style={{ width: 12, height: 12, color: '#f87171' }} />
          <span>Child Safety</span>
        </a>
        <a href={`${API_BASE_URL}/legal/delete_account.html`} target="_blank" rel="noreferrer">
          <Trash2 style={{ width: 12, height: 12, color: '#fca5a5' }} />
          <span>Web Deletion</span>
        </a>
      </div>
    </div>
  );
}
