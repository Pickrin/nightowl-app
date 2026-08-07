import React from 'react';
import { X, EyeOff, ShieldCheck, FileText, Coins } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user, onToggleIncognito, onOpenShop }) {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
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
              <div className="modal-subtitle">{user.age} yrs • {user.gender}</div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 34, height: 34 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="modal-body">
          {/* Coin Balance Card */}
          <div style={{ padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10, color: '#d8b4fe', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Vault Balance
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <Coins style={{ width: 20, height: 20, color: '#f59e0b' }} />
                <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>{user.coinsBalance} Coins</span>
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
          <div className="form-group">
            <label className="form-label">Privacy & Stealth</label>
            <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'white' }}>
                  <EyeOff style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                  <span>Incognito Radar Mode</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                  Hide your profile completely from the nearby radar.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleIncognito}
                style={{
                  width: 48,
                  height: 26,
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
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#ffffff',
                    transform: user.isIncognito ? 'translateX(22px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease'
                  }}
                ></div>
              </button>
            </div>
          </div>

          {/* Desire Tags */}
          <div className="form-group">
            <label className="form-label">My Desires</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {user.desireTags?.map((tag) => (
                <span key={tag} className="desire-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Legal Compliance */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: 11 }}>
            <a
              href="http://localhost:5000/legal/privacy_policy.html"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              <ShieldCheck style={{ width: 14, height: 14, color: 'var(--emerald)' }} />
              <span>Privacy Policy</span>
            </a>
            <a
              href="http://localhost:5000/legal/terms_of_service.html"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              <FileText style={{ width: 14, height: 14, color: 'var(--primary)' }} />
              <span>Terms of Service</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
