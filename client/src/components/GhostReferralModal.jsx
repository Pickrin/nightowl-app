import React, { useState } from 'react';
import { X, Gift, Share2, Copy, Check, Sparkles, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GhostReferralModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const [copied, setCopied] = useState(false);
  const refCode = user.referralCode || 'GHOST-' + (user.nickname || 'OWL').toUpperCase();
  const inviteLink = `${window.location.origin}/?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`🦉 Join me on NightOwl: AfterHours for discreet, 100% anonymous secret dating & late-night chats.\n\nUse my Ghost Invite code ${refCode} to get +50 Free Coins instantly:\n${inviteLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`🦉 Connect anonymously on NightOwl. Use Ghost Code: ${refCode} for +50 Free Coins:`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(90deg, #3b0764, #1e1b4b)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gift style={{ width: 18, height: 18, color: '#f59e0b' }} />
            <span className="modal-title">Anonymous Ghost Referral</span>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', border: '2px solid rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            🎁
          </div>

          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              Give +50 Coins, Get +50 Coins
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: 330 }}>
              Share your anonymous Ghost Invite link. When a friend joins, you <strong>BOTH</strong> receive +50 Free Coins instantly without ever revealing your real identity.
            </p>
          </div>

          {/* Referral Code Box */}
          <div style={{ width: '100%', padding: '14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-glass)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Ghost Code</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fde047', letterSpacing: 1.5 }}>
                {refCode}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 11 }}
            >
              {copied ? <Check style={{ width: 14, height: 14, color: '#10b981' }} /> : <Copy style={{ width: 14, height: 14 }} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Social Share Buttons */}
          <div style={{ width: '100%', display: 'flex', gap: 10 }}>
            <button
              onClick={handleWhatsAppShare}
              className="btn-primary"
              style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', justifyContent: 'center', padding: '12px' }}
            >
              <MessageCircle style={{ width: 16, height: 16 }} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleTelegramShare}
              className="btn-primary"
              style={{ flex: 1, background: 'linear-gradient(135deg, #0284c7, #0369a1)', justifyContent: 'center', padding: '12px' }}
            >
              <Share2 style={{ width: 16, height: 16 }} />
              <span>Telegram</span>
            </button>
          </div>

          <div style={{ fontSize: 11, color: '#a855f7', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles style={{ width: 12, height: 12 }} />
            <span>100% Anonymous: Inviter names are never shared.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
