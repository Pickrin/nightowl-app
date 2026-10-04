import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Lock, 
  Moon, 
  Zap, 
  CheckCircle2,
  Radio,
  Flame,
  Share2,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function RadarView({
  nearbyUsers,
  currentTag,
  onSelectTag,
  desireTags,
  onUnlockChat,
  currentUser,
  onOpenShop,
  onPriorityWhisper,
  onGoToVault
}) {
  const [whisperTarget, setWhisperTarget] = useState(null);
  const [whisperText, setWhisperText] = useState('');

  // Check if current hour in IST is Happy Hour (00:00 to 03:59 IST)
  const isHappyHour = () => {
    const hour = parseInt(
      new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(new Date()),
      10
    );
    return hour >= 0 && hour < 4;
  };

  const unlockCost = isHappyHour() ? 10 : 20;

  const handleSendWhisper = (e) => {
    e.preventDefault();
    if (!whisperText.trim() || !whisperTarget) return;
    onPriorityWhisper(whisperTarget, whisperText.trim());
    setWhisperTarget(null);
    setWhisperText('');
  };

  return (
    <div className="radar-page-container">
      {/* Category Pills Filter */}
      <div className="radar-filter-bar">
        <button
          type="button"
          onClick={() => onSelectTag('All')}
          className={`filter-pill ${currentTag === 'All' ? 'active' : ''}`}
        >
          <span>All Owls</span>
        </button>

        {desireTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(tag)}
            className={`filter-pill ${currentTag === tag ? 'active' : ''}`}
          >
            <span>{tag}</span>
          </button>
        ))}
      </div>

      {/* When Radar is Empty: Sleek Ambient Radar Sweep */}
      {nearbyUsers.length === 0 ? (
        <div className="empty-radar-stage">
          <div className="radar-sweep-rig">
            <div className="sweep-ring ring-1" />
            <div className="sweep-ring ring-2" />
            <div className="sweep-ring ring-3" />
            <div className="sweep-beam" />
            <div className="radar-center-blip">
              <img src="/icon-512.jpg" alt="Radar Center" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>

          <h3 className="empty-radar-heading">The Radar is Silent in Your Sector</h3>
          <p className="empty-radar-text">
            No real nocturnal profiles are active within 15 km right now. No bots or fake accounts are simulated.
          </p>

          <div className="awaken-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fde047', fontWeight: 800, fontSize: 13 }}>
              <Sparkles style={{ width: 16, height: 16 }} />
              <span>Awaken Your City (+50 Coins)</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
              Share your Ghost Invite code with contacts. When they register, both of you unlock 50 free coins instantly.
            </p>
            <button
              type="button"
              onClick={onGoToVault}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: 10, fontSize: 12 }}
            >
              <Share2 style={{ width: 14, height: 14 }} />
              <span>Get My Ghost Invite Code</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="radar-dossiers-grid">
          {nearbyUsers.map((user) => (
            <div key={user.id} className="dossier-card">
              {/* Card Header & Distance */}
              <div className="dossier-top">
                <div className="dossier-avatar-wrap">
                  <div
                    className="dossier-avatar"
                    style={{
                      backgroundColor: `${user.avatarColor || '#a855f7'}20`,
                      borderColor: user.avatarColor || '#a855f7'
                    }}
                  >
                    <span>{user.avatarIcon || '🦉'}</span>
                  </div>
                  {user.verified && (
                    <div className="dossier-verified-badge" title="Verified Human">✓</div>
                  )}
                </div>

                <div className="dossier-id-block">
                  <div className="dossier-title-row">
                    <h3 className="dossier-nickname">{user.nickname}</h3>
                    <span className="dossier-age">{user.age} yrs</span>
                  </div>
                  <div className="dossier-distance">
                    <MapPin style={{ width: 12, height: 12, color: 'var(--primary)' }} />
                    <span>{user.distanceKm ? `${user.distanceKm} km away` : 'Nearby'}</span>
                    <span className="dot-sep">•</span>
                    <span>Seeking {user.seeking}</span>
                  </div>
                </div>
              </div>

              {/* Midnight Vibe & Desires */}
              <div className="dossier-vibe-quote">
                "{user.midnightVibe || 'Late-Night Chai & Long Drives'}"
              </div>

              <div className="dossier-tags-row">
                {user.desireTags?.map((tag) => (
                  <span key={tag} className="dossier-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="dossier-actions-row">
                <button
                  type="button"
                  onClick={() => onUnlockChat(user)}
                  className="dossier-primary-btn"
                >
                  <Lock style={{ width: 14, height: 14 }} />
                  <span>Start Chat ({unlockCost}c)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhisperTarget(user)}
                  className="dossier-whisper-btn"
                  title="Send Priority Whisper"
                >
                  <Zap style={{ width: 14, height: 14, color: '#fde047' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Priority Whisper Dialog */}
      {whisperTarget && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap style={{ width: 18, height: 18, color: '#fde047' }} />
                <span className="modal-title">Priority Whisper to {whisperTarget.nickname}</span>
              </div>
              <button onClick={() => setWhisperTarget(null)} className="btn-icon">×</button>
            </div>
            <form onSubmit={handleSendWhisper} className="modal-body" style={{ padding: 18 }}>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
                Delivers an instant high-priority highlighted notification that bypasses standard waitlists (50 coins).
              </p>
              <textarea
                rows={3}
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                placeholder="Say something intriguing..."
                className="sleek-input"
                style={{ resize: 'none' }}
                maxLength={140}
                required
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button type="button" onClick={() => setWhisperTarget(null)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Send Whisper (50c)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
