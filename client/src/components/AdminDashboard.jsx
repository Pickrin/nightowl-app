import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Image as ImageIcon, 
  Trash2, 
  Coins, 
  Users, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Ban, 
  X, 
  Flame, 
  Sparkles,
  Calendar
} from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('chats'); // chats, media, reports, purge
  const [stats, setStats] = useState(null);
  const [chats, setChats] = useState([]);
  const [mediaVault, setMediaVault] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatTranscript, setChatTranscript] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('http://localhost:5000/api/admin/overview');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // 2. Fetch Active Chats
      const chatsRes = await fetch('http://localhost:5000/api/admin/chats');
      const chatsData = await chatsRes.json();
      if (chatsData.success) setChats(chatsData.chats);

      // 3. Fetch 7-Day Media Vault
      const mediaRes = await fetch('http://localhost:5000/api/admin/media-vault');
      const mediaData = await mediaRes.json();
      if (mediaData.success) setMediaVault(mediaData.mediaVault);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/chats/${chat.id}`);
      const data = await res.json();
      if (data.success) {
        setChatTranscript(data.messages || []);
      }
    } catch (e) {
      console.error('Transcript error:', e);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!confirm('Delete this image from the 7-day admin moderation vault?')) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/delete-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId })
      });
      const data = await res.json();
      if (data.success) {
        setMediaVault(prev => prev.filter(m => m.id !== mediaId));
        alert('Image deleted from admin vault.');
      }
    } catch (e) {
      console.error('Delete media error:', e);
    }
  };

  const handleBanUser = async (userId) => {
    if (!confirm(`Ban user ${userId} from NightOwl permanently?`)) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminData();
      }
    } catch (e) {
      console.error('Ban error:', e);
    }
  };

  const handleForcePurge = async () => {
    if (!confirm('Execute 7-Day Purge: This will permanently delete all chat logs & media older than 7 days from the server database. Proceed?')) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/purge-now', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPurgeResult(data.result);
        fetchAdminData();
      }
    } catch (e) {
      console.error('Purge error:', e);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 840, height: '90vh' }}>
        
        {/* Admin Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(90deg, #1e1b4b, #0f172a)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168, 85, 247, 0.25)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck style={{ width: 22, height: 22, color: '#c084fc' }} />
            </div>
            <div>
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>NightOwl Master Admin Portal</span>
                <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  LIVE SERVER v1.2
                </span>
              </div>
              <div className="modal-subtitle">
                Server Time: {stats?.serverTime || 'Kolkata IST'} • 7-Day Automated Purge Protocol Active
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={fetchAdminData} className="btn-icon" title="Refresh Live Data">
              <RefreshCw style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={onClose} className="btn-icon">
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ padding: '14px 20px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
              <Users style={{ width: 14, height: 14, color: '#c084fc' }} />
              <span>Total Owls</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginTop: 2 }}>
              {stats?.totalUsers ?? 6}
            </div>
          </div>

          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
              <MessageSquare style={{ width: 14, height: 14, color: '#f472b6' }} />
              <span>Active Chats</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f472b6', marginTop: 2 }}>
              {stats?.activeChats ?? chats.length}
            </div>
          </div>

          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
              <ImageIcon style={{ width: 14, height: 14, color: '#38bdf8' }} />
              <span>7-Day Vault Images</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
              {stats?.imagesInVault ?? mediaVault.length}
            </div>
          </div>

          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
              <Coins style={{ width: 14, height: 14, color: '#f59e0b' }} />
              <span>Total Revenue</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fde047', marginTop: 2 }}>
              ₹{stats?.totalRevenueInr ?? 0}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ padding: '12px 20px 0 20px', display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('chats')}
            className={`filter-chip ${activeTab === 'chats' ? 'active' : ''}`}
          >
            <MessageSquare style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
            <span>Chat Sessions ({chats.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`filter-chip ${activeTab === 'media' ? 'active' : ''}`}
          >
            <ImageIcon style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
            <span>7-Day Image Vault ({mediaVault.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('purge')}
            className={`filter-chip ${activeTab === 'purge' ? 'active' : ''}`}
          >
            <Clock style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
            <span>7-Day Purge Routine</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          
          {/* TAB 1: ALL CHATS WITH START DATE & TIME */}
          {activeTab === 'chats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>
                  All Active & Historical Sessions (Purges automatically every 7 days)
                </span>
                <span style={{ fontSize: 11, color: '#c084fc' }}>Click session to view transcript</span>
              </div>

              {chats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No active chat sessions found. Start a conversation on the radar to see live logs!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleInspectChat(chat)}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        background: selectedChat?.id === chat.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: selectedChat?.id === chat.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          💬
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
                              {chat.user1Name || 'Owl_1'} ↔ {chat.user2Name || 'Owl_2'}
                            </span>
                            {chat.status === 'burned' && (
                              <span className="brand-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                                BURNED
                              </span>
                            )}
                          </div>
                          
                          {/* Explicit Start Date & Time for Unique Identification */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#fbbf24', marginTop: 2 }}>
                            <Calendar style={{ width: 12, height: 12 }} />
                            <span>Started: {chat.startedAt || 'Recent'}</span>
                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                            <span style={{ color: 'var(--text-dim)' }}>ID: {chat.id.slice(0, 16)}...</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 10px', borderRadius: 8 }}>
                          {chat.messageCount || 0} msgs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Inspector Dialogue Modal */}
              {selectedChat && (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: '#0a0b16', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
                        Transcript: {selectedChat.user1Name} ↔ {selectedChat.user2Name}
                      </h4>
                      <span style={{ fontSize: 10, color: '#fbbf24' }}>
                        Session Began: {selectedChat.startedAt}
                      </span>
                    </div>
                    <button onClick={() => setSelectedChat(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: 10 }}>
                      Close View
                    </button>
                  </div>

                  <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {chatTranscript.length === 0 ? (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>No messages logged or user used self-destruct.</p>
                    ) : (
                      chatTranscript.map((msg) => (
                        <div key={msg.id} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.04)', fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, color: '#c084fc' }}>{msg.senderName}</span>
                            <span>{msg.formattedTime || 'Now'}</span>
                          </div>
                          <div style={{ color: 'white' }}>
                            {msg.mediaUrl ? '📷 [Attached Photo in 7-Day Vault]' : msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 7-DAY IMAGE MODERATION VAULT */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 12, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7dd3fc' }}>7-Day Image Moderation Retention</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    Photos vanish from user chats in 30 seconds, but are held here for 7 days for admin safety review before automatic permanent deletion.
                  </div>
                </div>
                <span className="brand-badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                  TTL: 7 DAYS
                </span>
              </div>

              {mediaVault.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No photos in the 7-day review vault. Images sent in chat will automatically appear here!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {mediaVault.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ height: 160, position: 'relative', background: '#050710' }}>
                        <img src={item.mediaUrl} alt="Vault Review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 6, right: 6 }}>
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.85)', border: 'none', color: 'white', borderRadius: 8, padding: 6, cursor: 'pointer' }}
                            title="Purge image immediately"
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: 12, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontWeight: 700, color: 'white' }}>
                          From: <span style={{ color: '#ec4899' }}>{item.senderName}</span> → To: <span style={{ color: '#c084fc' }}>{item.recipientName}</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar style={{ width: 11, height: 11 }} />
                          <span>Session: {item.startedAt}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                          <button
                            onClick={() => handleBanUser(item.senderId)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Ban style={{ width: 12, height: 12 }} />
                            <span>Ban Sender</span>
                          </button>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Auto-purges in 7d</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 7-DAY PURGE PROTOCOL */}
          {activeTab === 'purge' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 16, background: 'rgba(168, 85, 247, 0.1)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock style={{ width: 20, height: 20, color: '#c084fc' }} />
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Automated 7-Day Database Purge Engine</h4>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  NightOwl operates on strict data minimization. User messages and media expire from client chats in 30 seconds. In the admin database, all chat transcripts and media vault records are hard-purged after <strong>7 days (168 hours)</strong>.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <button onClick={handleForcePurge} className="btn-primary" style={{ padding: '10px 18px', fontSize: 12 }}>
                    <Flame style={{ width: 14, height: 14 }} />
                    <span>Run 7-Day Database Purge Now</span>
                  </button>
                </div>
              </div>

              {purgeResult && (
                <div style={{ padding: 14, borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', fontSize: 12 }}>
                  ✓ Purge Complete: Cleaned {purgeResult.purgedChatsCount} expired chat logs & {purgeResult.purgedMediaCount} expired vault photos.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
