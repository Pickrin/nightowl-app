import React from 'react';
import { Coins, EyeOff, Gift, ShieldCheck, ShieldAlert, Share2, QrCode, MessageSquare } from 'lucide-react';

export default function Navbar({
  user,
  onOpenShop,
  onOpenProfile,
  onTriggerPanic,
  onClaimDaily,
  dailyClaimAvailable,
  onOpenVerification,
  onOpenAdmin,
  onOpenReferral,
  onOpenBurner,
  inboxStatus,
  onOpenReminder
}) {
  const activeChats = inboxStatus?.activeChatsCount ?? 1;
  const pendingReqs = inboxStatus?.pendingRequestsCount ?? 2;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={onOpenProfile}>
          <div className="brand-icon-box">
            <span>🦉</span>
          </div>
          <div>
            <div className="brand-title">
              <span>NIGHTOWL</span>
              <span className="brand-badge">DISCREET</span>
            </div>
            <p className="brand-subtitle">AfterHours Anonymous Dating</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Capacity Meter Indicator */}
          <button
            onClick={onOpenReminder}
            className="coin-badge-btn"
            style={{ background: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.35)', color: '#7dd3fc' }}
            title="Inbox Capacity: Max 5 Chats, Max 10 Requests"
          >
            <MessageSquare style={{ width: 12, height: 12, color: '#38bdf8' }} />
            <span>{activeChats}/5 Chats • {pendingReqs}/10 Req</span>
          </button>

          {/* Ghost Referral Button (+50 Coins) */}
          <button
            onClick={onOpenReferral}
            className="coin-badge-btn"
            style={{ background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
            title="Anonymous Ghost Invite (+50 Coins for both!)"
          >
            <Share2 style={{ width: 13, height: 13, color: '#c084fc' }} />
            <span>Invite (+50)</span>
          </button>

          {/* 24-Hour Disposable Burner PIN */}
          <button
            onClick={onOpenBurner}
            className="coin-badge-btn"
            style={{ background: 'rgba(236, 72, 153, 0.15)', borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6' }}
            title="24-Hour Disposable Burner PIN & QR"
          >
            <QrCode style={{ width: 13, height: 13, color: '#ec4899' }} />
            <span>Burner PIN</span>
          </button>

          {/* Admin Dashboard Trigger */}
          <button
            onClick={onOpenAdmin}
            className="coin-badge-btn"
            style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde047' }}
            title="Admin Console: Chat Inspector, 7-Day Media Vault & Purge"
          >
            <ShieldAlert style={{ width: 14, height: 14, color: '#f59e0b' }} />
            <span>Admin</span>
          </button>

          {/* Liveness Verification Badge / Button */}
          {!user?.verified ? (
            <button
              onClick={onOpenVerification}
              className="coin-badge-btn"
              style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}
              title="Instant Live Face Verification (+50 Coins)"
            >
              <ShieldCheck style={{ width: 14, height: 14, color: '#10b981' }} />
              <span>Verify Face (+50)</span>
            </button>
          ) : (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', fontSize: 11, fontWeight: 700 }}
              title="100% Real Human Verified"
            >
              <ShieldCheck style={{ width: 13, height: 13, color: '#10b981' }} />
              <span>Verified ✓</span>
            </div>
          )}

          {/* Daily Free Coins Button */}
          {dailyClaimAvailable && (
            <button
              onClick={onClaimDaily}
              className="coin-badge-btn"
              style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              title="Claim Daily Free Coins"
            >
              <Gift style={{ width: 14, height: 14, color: '#f59e0b' }} />
              <span style={{ color: '#fde047' }}>+20 Free</span>
            </button>
          )}

          {/* Coin Wallet Button */}
          <button onClick={onOpenShop} className="coin-badge-btn">
            <Coins style={{ width: 15, height: 15, color: '#fde047' }} />
            <span className="coin-val">{user?.coinsBalance ?? 100}</span>
            <span style={{ fontSize: 10, color: '#c084fc', textTransform: 'uppercase' }}>Coins</span>
            <span className="coin-plus">+</span>
          </button>

          {/* Profile / Mask Icon */}
          <button onClick={onOpenProfile} className="btn-icon" title="Anonymous Profile">
            <span style={{ fontSize: 18 }}>{user?.avatarIcon || '🎭'}</span>
          </button>

          {/* Panic Button */}
          <button
            onClick={onTriggerPanic}
            className="btn-icon btn-panic"
            title="Panic / Hide Screen"
          >
            <EyeOff style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </header>
  );
}
