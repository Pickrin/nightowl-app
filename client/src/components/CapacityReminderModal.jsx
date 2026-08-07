import React from 'react';
import { MessageSquare, Inbox, ShieldAlert, Check, ArrowRight, AlertTriangle } from 'lucide-react';

export default function CapacityReminderModal({ isOpen, onClose, inboxStatus, user }) {
  if (!isOpen) return null;

  const activeChats = inboxStatus?.activeChatsCount ?? 1;
  const maxChats = 5;
  const pendingReqs = inboxStatus?.pendingRequestsCount ?? 2;
  const maxReqs = 10;

  const isAtChatLimit = activeChats >= maxChats;
  const isAtReqLimit = pendingReqs >= maxReqs;
  const requiresAction = isAtChatLimit || isAtReqLimit;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ background: requiresAction ? 'linear-gradient(90deg, #7f1d1d, #1e1b4b)' : 'linear-gradient(90deg, #1e1b4b, #0f172a)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {requiresAction ? (
              <AlertTriangle style={{ width: 18, height: 18, color: '#f87171' }} />
            ) : (
              <ShieldAlert style={{ width: 18, height: 18, color: '#c084fc' }} />
            )}
            <span className="modal-title">
              {requiresAction ? 'Inbox Action Required' : 'Nocturnal Inbox Status'}
            </span>
          </div>
          <button onClick={onClose} className="btn-icon">✕</button>
        </div>

        <div className="modal-body" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              Welcome Back, {user?.nickname || 'Owl'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              NightOwl enforces strict capacity limits to eliminate ghosting: <strong>Max 5 active chats</strong> & <strong>Max 10 pending requests</strong>.
            </p>
          </div>

          {/* Meter 1: Active Chats (Max 5) */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255, 255, 255, 0.03)', border: isAtChatLimit ? '1px solid #ef4444' : '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'white' }}>
                <MessageSquare style={{ width: 14, height: 14, color: '#f472b6' }} />
                <span>Active Chat Slots</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, color: isAtChatLimit ? '#f87171' : '#fde047' }}>
                {activeChats} / {maxChats} Max
              </span>
            </div>

            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: isAtChatLimit ? '#ef4444' : 'linear-gradient(90deg, #d946ef, #a855f7)',
                  width: `${Math.min((activeChats / maxChats) * 100, 100)}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            {isAtChatLimit && (
              <p style={{ fontSize: 10, color: '#fca5a5', marginTop: 6 }}>
                ⚠️ Active chat slots full. You must unmatch an existing chat to unlock new connections.
              </p>
            )}
          </div>

          {/* Meter 2: Pending Requests (Max 10) */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255, 255, 255, 0.03)', border: isAtReqLimit ? '1px solid #ef4444' : '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'white' }}>
                <Inbox style={{ width: 14, height: 14, color: '#38bdf8' }} />
                <span>Pending Request Queue</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 900, color: isAtReqLimit ? '#f87171' : '#7dd3fc' }}>
                {pendingReqs} / {maxReqs} Max
              </span>
            </div>

            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: isAtReqLimit ? '#ef4444' : 'linear-gradient(90deg, #38bdf8, #0284c7)',
                  width: `${Math.min((pendingReqs / maxReqs) * 100, 100)}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            {isAtReqLimit && (
              <p style={{ fontSize: 10, color: '#fca5a5', marginTop: 6 }}>
                ⚠️ Request queue full. You must respond or unmatch pending requests before receiving new ones.
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <span>Proceed to Radar</span>
            <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
