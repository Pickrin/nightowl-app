import React, { useState, useEffect } from 'react';
import { MessageCircle, Shield, Flame, UserCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ChatsTab({ currentUser, onOpenChat, onGoToRadar, onGoToVault }) {
  const [chats, setChats] = useState([]);
  const [capacity, setCapacity] = useState({ active: 0, max: 5 });
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/my/chats`, {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (data.success) {
        setChats(data.activeChats || []);
        if (data.capacity) setCapacity(data.capacity);
      }
    } catch (e) {
      console.error('Fetch chats error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleBurn = async (e, chatId) => {
    e.stopPropagation();
    if (!confirm('🔥 Burn Chat: Permanently incinerate this entire conversation from both devices?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/billing/unmatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify({ chatId })
      });
      fetchChats();
    } catch (err) {
      console.error('Burn error:', err);
    }
  };

  return (
    <div className="tab-page-container">
      {/* Tab Header & Capacity Gauge */}
      <div className="tab-header">
        <div>
          <h1 className="tab-title">Active Whispers</h1>
          <p className="tab-subtitle">Encrypted, ephemeral nocturnal conversations</p>
        </div>

        {/* Capacity Capsule */}
        <div className="capacity-pill-box">
          <div className="capacity-text">
            <span>Capacity</span>
            <strong>{capacity.active} / {capacity.max}</strong>
          </div>
          <div className="capacity-bar-track">
            <div
              className={`capacity-bar-fill ${capacity.active >= 5 ? 'full' : ''}`}
              style={{ width: `${Math.min(100, (capacity.active / capacity.max) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="chat-safety-banner">
        <Shield style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }} />
        <span>Hardware screenshot protection active (`FLAG_SECURE`). Photos self-destruct in 30s.</span>
      </div>

      {/* List or Empty State */}
      {loading ? (
        <div className="tab-loading">Checking nocturnal channels...</div>
      ) : chats.length === 0 ? (
        <div className="empty-chats-card">
          <div className="empty-icon-circle">
            <MessageCircle style={{ width: 36, height: 36, color: '#a855f7' }} />
          </div>
          <h3 className="empty-chats-title">Your Nocturnal Queue is Silent</h3>
          <p className="empty-chats-desc">
            No active conversations right now. Discover anonymous owls on the Radar or exchange a 24-hour Burner PIN.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="button" onClick={onGoToRadar} className="btn-primary" style={{ padding: '10px 18px', fontSize: 12 }}>
              <span>Open Proximity Radar</span>
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
            <button type="button" onClick={onGoToVault} className="btn-secondary" style={{ padding: '10px 18px', fontSize: 12 }}>
              <Sparkles style={{ width: 14, height: 14, color: '#fde047' }} />
              <span>Get Burner PIN</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="chats-list-grid">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onOpenChat({ id: chat.partnerId, nickname: chat.partnerName, avatarIcon: chat.partnerIcon, avatarColor: chat.partnerColor })}
              className="chat-thread-card"
            >
              <div className="chat-thread-avatar" style={{ backgroundColor: `${chat.partnerColor}20`, border: `1px solid ${chat.partnerColor}60` }}>
                <span>{chat.partnerIcon}</span>
              </div>

              <div className="chat-thread-content">
                <div className="chat-thread-row">
                  <div className="chat-partner-name">
                    <span>{chat.partnerName}</span>
                    {chat.partnerVerified && (
                      <span className="partner-verified-badge" title="Verified Human">✓</span>
                    )}
                  </div>
                  <span className="chat-thread-time">{chat.startedAt}</span>
                </div>

                <div className="chat-thread-preview">
                  {chat.lastMessage}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleBurn(e, chat.id)}
                className="chat-burn-btn"
                title="Burn & Incinerate Session"
              >
                <Flame style={{ width: 16, height: 16 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
