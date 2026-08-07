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
  Calendar,
  Flag,
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AdminDashboard({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('reports'); // reports, chats, media, purge
  const [stats, setStats] = useState(null);
  const [chats, setChats] = useState([]);
  const [mediaVault, setMediaVault] = useState([]);
  const [reports, setReports] = useState([]);
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
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/overview`);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // 2. Fetch Active Chats
      const chatsRes = await fetch(`${API_BASE_URL}/api/admin/chats`);
      const chatsData = await chatsRes.json();
      if (chatsData.success) setChats(chatsData.chats);

      // 3. Fetch 7-Day Media Vault
      const mediaRes = await fetch(`${API_BASE_URL}/api/admin/media-vault`);
      const mediaData = await mediaRes.json();
      if (mediaData.success) setMediaVault(mediaData.mediaVault);

      // 4. Fetch Reported Abuse Queue
      const reportsRes = await fetch(`${API_BASE_URL}/api/moderation/reports`);
      const reportsData = await reportsRes.json();
      if (reportsData.success) setReports(reportsData.reports || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/chats/${chat.id}`);
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
      const res = await fetch(`${API_BASE_URL}/api/admin/delete-media`, {
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
      const res = await fetch(`${API_BASE_URL}/api/admin/ban-user`, {
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
    if (!confirm('Execute 7-Day Purge: Permanently delete all chat logs & media older than 7 days from the server database?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/purge-now`, { method: 'POST' });
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
      <div className="modal-card" style={{ maxWidth: 880, height: '92vh' }}>
        
        {/* Admin Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(90deg, #1e1b4b, #0f172a)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(168, 85, 247, 0.25)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck style={{ width: 22, height: 22, color: '#c084fc' }} />
            </div>
            <div>
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>NightOwl Master Admin & Moderation Portal</span>
                <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  LIVE SERVER
                </span>
              </div>
              <div className="modal-subtitle">
                Server Time: {stats?.serverTime || 'Kolkata IST'} • Google Play UGC Policy Enforced
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
              <Flag style={{ width: 14, height: 14, color: '#f87171' }} />
              <span>Pending Reports</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171', marginTop: 2 }}>
              {stats?.pendingReports ?? reports.length}
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
            onClick={() => setActiveTab('reports')}
            className={`filter-chip ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <Flag style={{ width: 14, height: 14, display: 'inline', marginRight: 6, color: '#f87171' }} />
            <span>Abuse Reports ({reports.length})</span>
          </button>

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
            <span>7-Day Purge</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          
          {/* TAB 1: ABUSE REPORTS QUEUE */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>
                User Complaints & Policy Violations (Google Play UGC Moderation Queue)
              </div>

              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <CheckCircle2 style={{ width: 36, height: 36, color: '#10b981', margin: '0 auto 8px' }} />
                  <div style={{ color: 'white', fontWeight: 700 }}>Zero Pending Abuse Reports</div>
                  <p style={{ fontSize: 11, marginTop: 2 }}>All user flags have been resolved.</p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div
                    key={rep.id}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#fca5a5' }}>
                          Reported: {rep.reportedName || rep.reportedId}
                        </span>
                        <span className="brand-badge" style={{ background: 'rgba(239, 68, 68, 0.3)', color: '#fecaca' }}>
                          {rep.reason}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                        By: <span style={{ color: 'white' }}>{rep.reporterName || rep.reporterId}</span> • Details: "{rep.details || 'No additional comment'}"
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleBanUser(rep.reportedId)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: 11, color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Ban style={{ width: 12, height: 12 }} />
                        <span>Ban User</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ALL CHATS */}
          {activeTab === 'chats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>
                  All Active & Historical Sessions (Purges automatically every 7 days)
                </span>
                <span style={{ fontSize: 11, color: '#c084fc' }}>Click session to view transcript</span>
              </div>

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
                    cursor: 'pointer'
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
                          <span className="brand-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
                            BURNED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 2 }}>
                        Started: {chat.startedAt || 'Recent'}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 10px', borderRadius: 8 }}>
                    {chat.messageCount || 0} msgs
                  </span>
                </div>
              ))}

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
                    {chatTranscript.map((msg) => (
                      <div key={msg.id} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.04)', fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, color: '#c084fc' }}>{msg.senderName}</span>
                          <span>{msg.formattedTime || 'Now'}</span>
                        </div>
                        <div style={{ color: 'white' }}>
                          {msg.mediaUrl ? '📷 [Attached Photo in 7-Day Vault]' : msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 7-DAY IMAGE VAULT */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 12, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  Photos vanish from client chats in 30 seconds, but are held here for 7 days for admin safety review before automatic permanent hard deletion.
                </div>
                <span className="brand-badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                  TTL: 7 DAYS
                </span>
              </div>

              {mediaVault.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No photos in the 7-day review vault.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {mediaVault.map((item) => (
                    <div key={item.id} style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: 160, position: 'relative', background: '#050710' }}>
                        <img src={item.mediaUrl} alt="Vault Review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.85)', border: 'none', color: 'white', borderRadius: 8, padding: 6, cursor: 'pointer' }}
                          title="Purge image immediately"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>

                      <div style={{ padding: 12, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontWeight: 700, color: 'white' }}>
                          From: <span style={{ color: '#ec4899' }}>{item.senderName}</span> → To: <span style={{ color: '#c084fc' }}>{item.recipientName}</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#fbbf24' }}>
                          Session: {item.startedAt}
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

          {/* TAB 4: PURGE CONTROLLER */}
          {activeTab === 'purge' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 16, background: 'rgba(168, 85, 247, 0.1)', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock style={{ width: 20, height: 20, color: '#c084fc' }} />
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Automated 7-Day Database Purge Engine</h4>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  User messages and media expire from client chats in 30 seconds. In the admin database, all chat transcripts and media vault records are hard-purged after <strong>7 days (168 hours)</strong>.
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
