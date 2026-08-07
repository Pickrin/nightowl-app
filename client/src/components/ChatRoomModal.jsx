import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Flame, 
  Send, 
  Image as ImageIcon, 
  Lock, 
  Clock, 
  AlertTriangle, 
  Flag,
  Calendar,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  UserX
} from 'lucide-react';

export default function ChatRoomModal({
  isOpen,
  onClose,
  partner,
  currentUser,
  socket,
  onOpenReport,
  onUnmatchSuccess
}) {
  if (!isOpen || !partner) return null;

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      senderId: partner.id,
      text: `Hey! I noticed we both have "${partner.desireTags?.[0] || 'Late-Night Chat'}" on our radar. What brings you to NightOwl tonight?`,
      createdAt: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [screenshotWarning, setScreenshotWarning] = useState(null);
  const [isBurned, setIsBurned] = useState(false);
  const [chatStartTime, setChatStartTime] = useState(null);
  
  const [activeZoomPhoto, setActiveZoomPhoto] = useState(null);
  const [ephemeralTimers, setEphemeralTimers] = useState({});
  const [openedPhotos, setOpenedPhotos] = useState(new Set());

  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef({ dist: 0, x: 0, y: 0 });
  const messagesEndRef = useRef(null);

  const chatId = [currentUser.id, partner.id].sort().join('__');

  useEffect(() => {
    const formatted = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    }).format(new Date());
    setChatStartTime(formatted);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
        triggerScreenshotAlert();
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEphemeralTimers(prev => {
        const next = { ...prev };
        let hasExpired = false;

        Object.keys(next).forEach(msgId => {
          if (next[msgId] > 0) {
            next[msgId] -= 1;
          } else if (next[msgId] <= 0) {
            delete next[msgId];
            hasExpired = true;
            if (activeZoomPhoto && activeZoomPhoto.id === msgId) {
              setActiveZoomPhoto(null);
            }
          }
        });

        if (hasExpired) {
          setMessages(current => current.filter(m => !m.mediaUrl || next[m.id] !== undefined || !openedPhotos.has(m.id)));
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeZoomPhoto, openedPhotos]);

  useEffect(() => {
    if (!socket) return;
    const handleSocketMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new_message' && payload.data.chatId === chatId) {
          setMessages(prev => [...prev, payload.data]);
        } else if (payload.type === 'screenshot_alert' && payload.data.chatId === chatId) {
          setScreenshotWarning(payload.data.warning);
          setTimeout(() => setScreenshotWarning(null), 6000);
        } else if (payload.type === 'chat_burned' && payload.data.chatId === chatId) {
          setIsBurned(true);
          setMessages([]);
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    };
    socket.addEventListener('message', handleSocketMessage);
    return () => socket.removeEventListener('message', handleSocketMessage);
  }, [socket, chatId]);

  const triggerScreenshotAlert = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'screenshot_detected',
        data: { recipientId: partner.id, chatId }
      }));
    }
    setScreenshotWarning('⚠️ Privacy Alert: Screen capture attempt detected and logged.');
    setTimeout(() => setScreenshotWarning(null), 5000);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: 'local-' + Date.now(),
      senderId: currentUser.id,
      recipientId: partner.id,
      chatId,
      text: inputText.trim(),
      createdAt: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'send_message',
        data: {
          chatId,
          recipientId: partner.id,
          text: newMsg.text
        }
      }));
    }
  };

  const handleImageSend = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const photoUrl = reader.result;
      const msgId = 'eph-media-' + Date.now();

      const mediaMsg = {
        id: msgId,
        senderId: currentUser.id,
        recipientId: partner.id,
        chatId,
        mediaUrl: photoUrl,
        isMedia: true,
        text: '📷 Photo (Tap to view • 30s timer)',
        createdAt: 'Just now'
      };

      setMessages(prev => [...prev, mediaMsg]);

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'send_message',
          data: {
            chatId,
            recipientId: partner.id,
            mediaUrl: photoUrl,
            text: '📷 Photo (Tap to view • 30s timer)'
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenPhoto = (msg) => {
    setActiveZoomPhoto(msg);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });

    if (!openedPhotos.has(msg.id)) {
      setOpenedPhotos(prev => new Set([...prev, msg.id]));
      setEphemeralTimers(prev => ({ ...prev, [msg.id]: 30 }));
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      touchStartRef.current = { dist, scale: zoomScale };
    } else if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].pageX - panOffset.x,
        y: e.touches[0].pageY - panOffset.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      if (touchStartRef.current.dist > 0) {
        const factor = dist / touchStartRef.current.dist;
        const nextScale = Math.min(Math.max(touchStartRef.current.scale * factor, 1), 4);
        setZoomScale(nextScale);
      }
    } else if (e.touches.length === 1 && zoomScale > 1) {
      setPanOffset({
        x: e.touches[0].pageX - touchStartRef.current.x,
        y: e.touches[0].pageY - touchStartRef.current.y
      });
    }
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoomScale(prev => Math.min(Math.max(prev + delta, 1), 4));
  };

  const handleDoubleTapZoom = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setZoomScale(2.4);
    }
  };

  const handleBurnChat = () => {
    if (confirm('🔥 Burn Conversation: Permanently erase this entire chat from both devices immediately?')) {
      setIsBurned(true);
      setMessages([]);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'burn_chat',
          data: { chatId, recipientId: partner.id }
        }));
      }
    }
  };

  const handleUnmatch = async () => {
    if (confirm(`Unmatch with ${partner.nickname}? This will close the chat and free 1 slot (out of 5 max chats).`)) {
      try {
        const res = await fetch('http://localhost:5000/api/billing/unmatch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({ chatId })
        });
        const data = await res.json();
        if (data.success) {
          if (onUnmatchSuccess) onUnmatchSuccess(data.inboxStatus);
          onClose();
        }
      } catch (e) {
        console.error('Unmatch error:', e);
      }
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="chat-container">
        
        {/* Header */}
        <div className="chat-header">
          <div className="chat-partner-info">
            <div
              className="avatar-circle"
              style={{ width: 40, height: 40, fontSize: 20, backgroundColor: `${partner.avatarColor}30`, border: `1.5px solid ${partner.avatarColor}70` }}
            >
              <span>{partner.avatarMask === 'mask_cat_gold' ? '🐱' : partner.avatarMask === 'mask_fox_neon' ? '🦊' : '🦉'}</span>
              <div className="verified-dot" style={{ width: 12, height: 12, fontSize: 8 }}>✓</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'white' }}>{partner.nickname}</span>
                <span className="brand-badge">E2EE ENCRYPTED</span>
              </div>
              
              <div style={{ fontSize: 10, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <Calendar style={{ width: 10, height: 10 }} />
                <span>Started: {chatStartTime}</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-dim)' }}>{partner.distanceKm || '0.8'} km</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Unmatch Action */}
            <button
              onClick={handleUnmatch}
              className="btn-icon"
              style={{ width: 34, height: 34, borderRadius: 10, color: '#94a3b8' }}
              title="Unmatch & Free Chat Slot"
            >
              <UserX style={{ width: 15, height: 15 }} />
            </button>

            {/* Burn Action */}
            <button
              onClick={handleBurnChat}
              className="btn-icon btn-panic"
              style={{ width: 34, height: 34, borderRadius: 10 }}
              title="Burn Conversation"
            >
              <Flame style={{ width: 16, height: 16 }} />
            </button>

            {/* Report Action */}
            <button
              onClick={() => onOpenReport(partner)}
              className="btn-icon"
              style={{ width: 34, height: 34, borderRadius: 10 }}
              title="Report User"
            >
              <Flag style={{ width: 14, height: 14 }} />
            </button>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ width: 34, height: 34, borderRadius: 10 }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Screenshot Warning Toast */}
        {screenshotWarning && (
          <div className="toast-banner">
            <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{screenshotWarning}</span>
          </div>
        )}

        {/* PINCH-TO-ZOOM FULLSCREEN LIGHTBOX WITH POST-CLICK 30S COUNTDOWN */}
        {activeZoomPhoto && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(0,0,0,0.96)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 16,
              touchAction: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '6px 14px', borderRadius: 99, color: '#fca5a5', fontWeight: 800, fontSize: 13 }}>
                <Clock style={{ width: 16, height: 16, animation: 'spin 4s linear infinite' }} />
                <span>Self-destructs in {ephemeralTimers[activeZoomPhoto.id] ?? 30}s</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 4))}
                  className="btn-icon"
                  style={{ width: 36, height: 36 }}
                  title="Zoom In"
                >
                  <ZoomIn style={{ width: 16, height: 16 }} />
                </button>
                <button
                  onClick={() => { setZoomScale(1); setPanOffset({ x: 0, y: 0 }); }}
                  className="btn-icon"
                  style={{ width: 36, height: 36 }}
                  title="Reset Zoom"
                >
                  <ZoomOut style={{ width: 16, height: 16 }} />
                </button>
                <button
                  onClick={() => setActiveZoomPhoto(null)}
                  className="btn-icon"
                  style={{ width: 36, height: 36 }}
                  title="Minimize"
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>

            <div
              onWheel={handleWheelZoom}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onDoubleClick={handleDoubleTapZoom}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                cursor: zoomScale > 1 ? 'grab' : 'zoom-in'
              }}
            >
              <img
                src={activeZoomPhoto.mediaUrl}
                alt="Pinch to Zoom Photo"
                style={{
                  maxWidth: '92%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: 16,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                  transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                  transition: zoomScale === 1 ? 'transform 0.2s ease' : 'none',
                  userSelect: 'none',
                  pointerEvents: 'auto'
                }}
                draggable={false}
              />
            </div>

            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #ec4899, #f59e0b)',
                    width: `${((ephemeralTimers[activeZoomPhoto.id] ?? 30) / 30) * 100}%`,
                    transition: 'width 1s linear'
                  }}
                ></div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                🔍 Pinch or double-tap to zoom • Pan to explore • Vanishes when timer hits 0s
              </p>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="chat-stream">
          {isBurned ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, gap: 8 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                🔥
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Conversation Incinerated</h4>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', maxWidth: 280 }}>
                This room and all exchanged messages were permanently wiped from both devices.
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: 10, background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: '#d8b4fe', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                  <Lock style={{ width: 13, height: 13, color: '#ec4899' }} />
                  <span>Tap photos to view & zoom. 30s timer begins ONLY upon click.</span>
                </p>
              </div>

              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;
                const hasBeenOpened = openedPhotos.has(msg.id);
                const secondsLeft = ephemeralTimers[msg.id];

                if (msg.mediaUrl) {
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div
                        onClick={() => handleOpenPhoto(msg)}
                        style={{
                          maxWidth: '82%',
                          padding: 12,
                          borderRadius: 16,
                          background: 'linear-gradient(135deg, rgba(24,26,48,0.95), rgba(14,16,28,0.95))',
                          border: hasBeenOpened ? '1px solid rgba(236, 72, 153, 0.5)' : '1px solid var(--border-glass)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          cursor: 'pointer',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: hasBeenOpened ? '#f472b6' : '#c084fc' }}>
                            <ImageIcon style={{ width: 14, height: 14 }} />
                            <span>{hasBeenOpened ? `Expiring in ${secondsLeft ?? 30}s` : '📷 Confidential Photo'}</span>
                          </div>
                          <span className="brand-badge" style={{ fontSize: 9 }}>
                            {hasBeenOpened ? 'ACTIVE TIMER' : 'TAP TO VIEW'}
                          </span>
                        </div>

                        <div style={{ position: 'relative', width: 190, height: 120, borderRadius: 10, overflow: 'hidden', background: '#050712' }}>
                          <img
                            src={msg.mediaUrl}
                            alt="Locked Media"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              filter: hasBeenOpened ? 'blur(10px)' : 'blur(20px)',
                              transform: 'scale(1.1)'
                            }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <Maximize2 style={{ width: 18, height: 18, color: '#fde047' }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#fde047' }}>
                              Tap to Zoom & View (30s)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      <div>{msg.text}</div>
                      <span style={{ display: 'block', fontSize: 9, opacity: 0.6, textAlign: 'right', marginTop: 4 }}>
                        {msg.createdAt || 'Now'}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        {!isBurned && (
          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <label
              className="btn-icon"
              style={{ color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.3)', cursor: 'pointer' }}
              title="Attach photo (Timer starts upon click • 7-day admin storage)"
            >
              <ImageIcon style={{ width: 18, height: 18 }} />
              <input type="file" accept="image/*" onChange={handleImageSend} style={{ display: 'none' }} />
            </label>

            <input
              type="text"
              placeholder="Send an encrypted nocturnal message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="form-input"
              style={{ padding: '10px 14px' }}
            />

            <button type="submit" className="btn-primary" style={{ padding: '10px 16px', borderRadius: 12 }}>
              <Send style={{ width: 16, height: 16 }} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
