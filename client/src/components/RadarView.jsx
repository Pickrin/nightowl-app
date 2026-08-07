import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Lock, 
  Moon, 
  Zap, 
  CheckCircle2,
  Radio,
  Flame
} from 'lucide-react';

export default function RadarView({
  nearbyUsers,
  currentTag,
  onSelectTag,
  desireTags,
  onUnlockChat,
  currentUser,
  onOpenShop,
  onPriorityWhisper
}) {
  const [whisperTarget, setWhisperTarget] = useState(null);
  const [whisperText, setWhisperText] = useState('');

  // Check if current hour in IST is Happy Hour (00:00 to 03:59 IST)
  const isHappyHour = () => {
    const hour = parseInt(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(new Date()), 10);
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
    <div className="radar-container" style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px' }}>
      
      {/* Sleek Happy Hour Minimal Banner */}
      <div className={`happy-hour-bar ${isHappyHour() ? 'active' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="pulse-dot"></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
            {isHappyHour() ? '🌙 Nocturnal Happy Hour Active' : '🌙 Midnight Radar'}
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', marginLeft: 8 }}>
              {isHappyHour() ? '50% off all secret chat unlocks' : 'Discreet & anonymous matches near you'}
            </span>
          </div>
        </div>
        <div className="cost-tag">
          {unlockCost} Coins / Chat
        </div>
      </div>

      {/* Sleek Filter Bar */}
      <div className="filter-scroll" style={{ margin: '18px 0 24px' }}>
        <button
          onClick={() => onSelectTag('All')}
          className={`filter-chip ${currentTag === 'All' ? 'active' : ''}`}
        >
          <span>All Nocturnal</span>
        </button>

        {desireTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={`filter-chip ${currentTag === tag ? 'active' : ''}`}
          >
            <span>{tag}</span>
          </button>
        ))}
      </div>

      {/* Minimalist Modern Cards Grid */}
      <div className="radar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {nearbyUsers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <Moon style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
            <h3 style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>No Profiles Active in This Filter</h3>
            <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text-dim)' }}>Try switching to "All Nocturnal" to discover more matches.</p>
          </div>
        ) : (
          nearbyUsers.map((user) => (
            <div key={user.id} className="sleek-card">
              
              {/* Card Top: Moniker + Verification + Distance/Age Chips */}
              <div className="card-top-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 className="card-moniker">{user.nickname}</h3>
                  {user.verified && (
                    <CheckCircle2 style={{ width: 15, height: 15, color: '#10b981', flexShrink: 0 }} />
                  )}
                </div>

                <div className="meta-chips-group">
                  <span className="meta-chip">{user.age} yrs</span>
                  <span className="meta-chip distance">
                    <MapPin style={{ width: 11, height: 11 }} />
                    {user.distanceKm} km
                  </span>
                </div>
              </div>

              {/* Seeking Line */}
              <div className="card-seeking-line">
                Seeking <span className="highlight">{user.seeking}</span>
              </div>

              {/* Midnight Vibe Quote Block */}
              <div className="card-vibe-quote">
                "{user.midnightVibe || 'Spontaneous nocturnal connections'}"
              </div>

              {/* Compact Desire Tag Pills */}
              <div className="card-tags-row">
                {user.desireTags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="minimal-tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom Actions: Clean Gradient Primary + Minimal Whisper */}
              <div className="card-actions-row">
                <button
                  onClick={() => onUnlockChat(user)}
                  className="btn-chat-primary"
                >
                  <Lock style={{ width: 14, height: 14 }} />
                  <span>Start Chat ({unlockCost}c)</span>
                </button>

                <button
                  onClick={() => setWhisperTarget(user)}
                  className="btn-whisper-minimal"
                  title="Send Priority Whisper (50c)"
                >
                  <Zap style={{ width: 14, height: 14 }} />
                  <span>Whisper</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Priority Whisper Modal */}
      {whisperTarget && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap style={{ width: 16, height: 16, color: '#f59e0b' }} />
                <span className="modal-title">Priority Whisper to {whisperTarget.nickname}</span>
              </div>
              <button onClick={() => setWhisperTarget(null)} className="btn-icon">✕</button>
            </div>

            <form onSubmit={handleSendWhisper} className="modal-body" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 12, fontSize: 12, color: '#fde047', lineHeight: 1.4 }}>
                ⚡ Whispers cost 50 Coins and are pinned at the top of their inbox with a golden glow.
              </div>

              <textarea
                rows={3}
                placeholder="Write your secret whisper..."
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                className="form-input"
                style={{ resize: 'none' }}
                required
              />

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Zap style={{ width: 15, height: 15 }} />
                <span>Send Whisper (50c)</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
