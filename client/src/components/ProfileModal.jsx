import React, { useState } from 'react';
import { X, EyeOff, ShieldCheck, FileText, Coins, Trash2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ProfileModal({ isOpen, onClose, user, onToggleIncognito, onOpenShop, onAccountDeleted }) {
  if (!isOpen || !user) return null;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('nightowl_user');
        alert('Your account, chats, and data have been permanently purged from NightOwl.');
        if (onAccountDeleted) {
          onAccountDeleted();
        } else {
          window.location.reload();
        }
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

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className="avatar-circle"
              style={{ width: 44, height: 44, fontSize: 22, backgroundColor: `${user.avatarColor}25`, border: `1px solid ${user.avatarColor}70` }}
            >
              <span>{user.avatarIcon || '🎭'}</span>
            </div>
            <div>
              <div className="modal-title">{user.nickname}</div>
              <div className="modal-subtitle">{user.age} yrs • {user.gender} • {user.verified ? '✓ Verified' : 'Standard'}</div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 34, height: 34 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Coin Balance Card */}
          <div style={{ padding: 14, borderRadius: 16, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10, color: '#d8b4fe', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Vault Balance
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <Coins style={{ width: 18, height: 18, color: '#f59e0b' }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>{user.coinsBalance} Coins</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenShop();
              }}
              style={{ padding: '8px 14px', background: '#f59e0b', color: '#07080f', fontWeight: 800, fontSize: 11, borderRadius: 10, border: 'none', cursor: 'pointer' }}
            >
              Refill Vault
            </button>
          </div>

          {/* Privacy & Stealth Settings */}
          <div className="field-group">
            <label className="field-label">Privacy & Stealth</label>
            <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'white' }}>
                  <EyeOff style={{ width: 14, height: 14, color: 'var(--primary)' }} />
                  <span>Incognito Radar Mode</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                  Hide your card from the nearby nocturnal radar.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleIncognito}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 99,
                  background: user.isIncognito ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: 2,
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    transform: user.isIncognito ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease'
                  }}
                ></div>
              </button>
            </div>
          </div>

          {/* Desire Tags */}
          <div className="field-group">
            <label className="field-label">My Desires</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {user.desireTags?.map((tag) => (
                <span key={tag} className="minimal-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Google Play & DPDPA Mandatory Account Deletion Section */}
          <div className="field-group" style={{ paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
            <label className="field-label" style={{ color: '#f87171' }}>Account Deletion & Data Purge</label>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trash2 style={{ width: 14, height: 14 }} />
                  <span>Delete My Account Permanently</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Irreversible</span>
              </button>
            ) : (
              <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fca5a5', fontSize: 11, fontWeight: 700 }}>
                  <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  <span>Permanent Data Purge: All chats, vault media, coins, and your moniker will be wiped immediately.</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
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
                    style={{ flex: 1, padding: 8, fontSize: 11, background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}
                  >
                    {isDeleting ? 'Purging...' : 'Yes, Delete All'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Legal Compliance Links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: 10 }}>
            <a
              href={`${API_BASE_URL}/legal/privacy_policy.html`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              <ShieldCheck style={{ width: 12, height: 12, color: '#10b981' }} />
              <span>Privacy Policy</span>
            </a>
            <a
              href={`${API_BASE_URL}/legal/terms_of_service.html`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              <FileText style={{ width: 12, height: 12, color: 'var(--primary)' }} />
              <span>Terms of Service</span>
            </a>
            <a
              href={`${API_BASE_URL}/legal/csae_standards.html`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              <ShieldAlert style={{ width: 12, height: 12, color: '#f87171' }} />
              <span>Child Safety / CSAE</span>
            </a>
            <a
              href={`${API_BASE_URL}/legal/delete_account.html`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              <Trash2 style={{ width: 12, height: 12, color: '#fca5a5' }} />
              <span>Web Account Deletion</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
