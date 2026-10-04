import React, { useState, useEffect } from 'react';
import { API_BASE_URL, WS_BASE_URL } from './config';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import RadarView from './components/RadarView';
import ChatsTab from './components/ChatsTab';
import VaultTab from './components/VaultTab';
import ProfileTab from './components/ProfileTab';
import ChatRoomModal from './components/ChatRoomModal';
import CoinShopModal from './components/CoinShopModal';
import ReportModal from './components/ReportModal';
import PanicScreen from './components/PanicScreen';
import OnboardingModal from './components/OnboardingModal';
import BiometricVerificationModal from './components/BiometricVerificationModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('radar');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [selectedChatPartner, setSelectedChatPartner] = useState(null);
  const [reportedUser, setReportedUser] = useState(null);

  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentTag, setCurrentTag] = useState('All');
  const [desireTags, setDesireTags] = useState([]);
  const [inboxStatus, setInboxStatus] = useState({ activeChatsCount: 0, pendingRequestsCount: 0 });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('nightowl_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentUser(parsed);
      connectWebSocket(parsed.id);
      fetchRadar(parsed.id, currentTag);
      fetchInboxStatus(parsed.id);
    } else {
      setIsOnboardingOpen(true);
    }

    fetch(`${API_BASE_URL}/api/auth/config`)
      .then(res => res.json())
      .then(data => {
        if (data.desireTags) setDesireTags(data.desireTags);
      })
      .catch(e => console.log('Config fetch error:', e.message));
  }, []);

  const connectWebSocket = (userId) => {
    try {
      const ws = new WebSocket(WS_BASE_URL);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'auth',
          data: { userId }
        }));
      };
      setSocket(ws);
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  };

  const fetchInboxStatus = (userId) => {
    fetch(`${API_BASE_URL}/api/billing/inbox-status`, {
      headers: { 'x-user-id': userId }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setInboxStatus(data);
      })
      .catch(e => console.log('Inbox status error:', e));
  };

  const fetchRadar = (userId, tag = 'All') => {
    const tagQuery = tag !== 'All' ? `&tag=${encodeURIComponent(tag)}` : '';
    fetch(`${API_BASE_URL}/api/profiles/nearby?lat=12.9716&lng=77.5946${tagQuery}`, {
      headers: { 'x-user-id': userId }
    })
      .then(res => res.json())
      .then(data => {
        if (data.users) setNearbyUsers(data.users);
      })
      .catch(e => console.log('Nearby fetch error:', e.message));
  };

  const handleCompleteOnboarding = async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.nickname,
          age: formData.age,
          gender: formData.gender,
          seeking: formData.seeking,
          desireTags: formData.desireTags,
          midnightVibe: formData.midnightVibe,
          datingIntention: formData.datingIntention,
          referralCode: formData.referralCode,
          avatarMask: formData.gender === 'Female' ? 'mask_fox_neon' : 'mask_owl_purple',
          avatarColor: formData.gender === 'Female' ? '#ec4899' : '#a855f7'
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('nightowl_user', JSON.stringify(data.user));
        setIsOnboardingOpen(false);
        connectWebSocket(data.user.id);
        fetchRadar(data.user.id, currentTag);
      } else {
        alert(data.error || 'Failed to complete registration');
      }
    } catch (e) {
      console.error('Registration failed:', e);
      alert('Network error connecting to NightOwl cloud');
    }
  };

  const handleUnlockChat = async (targetUser) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/unlock-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ targetUserId: targetUser.id })
      });

      const data = await res.json();

      if (data.capacityExceeded) {
        alert(`⚠️ Capacity Alert: ${data.error}`);
        setActiveTab('chats');
        return;
      }

      if (res.status === 402 || data.insufficientCoins) {
        alert(`Insufficient Coins! Chat unlocks cost ${data.requiredCoins || 20} coins.`);
        setIsShopOpen(true);
        return;
      }

      if (data.success) {
        const updated = { ...currentUser, coinsBalance: data.coinsBalance };
        setCurrentUser(updated);
        localStorage.setItem('nightowl_user', JSON.stringify(updated));
        if (data.inboxStatus) setInboxStatus(data.inboxStatus);
        setSelectedChatPartner(targetUser);
      }
    } catch (err) {
      console.error('Unlock error:', err);
    }
  };

  const handlePriorityWhisper = async (targetUser, text) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/priority-whisper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ targetUserId: targetUser.id, text })
      });
      const data = await res.json();
      if (res.status === 402 || data.insufficientCoins) {
        alert('Priority Whisper requires 50 coins.');
        setIsShopOpen(true);
        return;
      }
      if (data.success) {
        const updated = { ...currentUser, coinsBalance: data.coinsBalance };
        setCurrentUser(updated);
        localStorage.setItem('nightowl_user', JSON.stringify(updated));
        alert('⚡ Priority Whisper delivered to their inbox!');
        setSelectedChatPartner(targetUser);
      }
    } catch (e) {
      console.error('Whisper error:', e);
    }
  };

  const handleToggleIncognito = async () => {
    if (!currentUser) return;
    const nextState = !currentUser.isIncognito;
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ isIncognito: nextState })
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...currentUser, isIncognito: nextState };
        setCurrentUser(updated);
        localStorage.setItem('nightowl_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Incognito update error:', e);
    }
  };

  const handleCoinsPurchased = (newBalance) => {
    if (!currentUser) return;
    const updated = { ...currentUser, coinsBalance: newBalance };
    setCurrentUser(updated);
    localStorage.setItem('nightowl_user', JSON.stringify(updated));
  };

  const handleVerificationComplete = (bonusCoins) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      verified: true,
      coinsBalance: (currentUser.coinsBalance || 0) + bonusCoins
    };
    setCurrentUser(updated);
    localStorage.setItem('nightowl_user', JSON.stringify(updated));
  };

  return (
    <div className="app-viewport">
      {/* Ambient Nocturnal Glow Layer for Glassmorphism Refraction */}
      <div className="ambient-background-layer">
        <div className="ambient-orb orb-purple" />
        <div className="ambient-orb orb-pink" />
        <div className="ambient-orb orb-blue" />
      </div>

      {/* Panic Screen Override */}
      {isPanicActive ? (
        <PanicScreen onExit={() => setIsPanicActive(false)} />
      ) : (
        <>
          {/* Top Status Header */}
          <Navbar
            user={currentUser}
            onOpenShop={() => setIsShopOpen(true)}
            onTriggerPanic={() => setIsPanicActive(true)}
            onOpenAdmin={() => {}}
          />

          {/* Main Tab Screen Content Area */}
          <main className="tab-viewport-content">
            {activeTab === 'radar' && (
              <RadarView
                nearbyUsers={nearbyUsers}
                currentTag={currentTag}
                onSelectTag={(tag) => {
                  setCurrentTag(tag);
                  if (currentUser) fetchRadar(currentUser.id, tag);
                }}
                desireTags={desireTags}
                onUnlockChat={handleUnlockChat}
                currentUser={currentUser}
                onOpenShop={() => setIsShopOpen(true)}
                onPriorityWhisper={handlePriorityWhisper}
                onGoToVault={() => setActiveTab('vault')}
              />
            )}

            {activeTab === 'chats' && (
              <ChatsTab
                currentUser={currentUser}
                onOpenChat={(partner) => setSelectedChatPartner(partner)}
                onGoToRadar={() => setActiveTab('radar')}
                onGoToVault={() => setActiveTab('vault')}
              />
            )}

            {activeTab === 'vault' && (
              <VaultTab
                currentUser={currentUser}
                onOpenShop={() => setIsShopOpen(true)}
                onRefreshUser={() => {
                  if (currentUser) fetchRadar(currentUser.id, currentTag);
                }}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab
                currentUser={currentUser}
                onToggleIncognito={handleToggleIncognito}
                onOpenVerification={() => setIsVerificationOpen(true)}
                onOpenShop={() => setIsShopOpen(true)}
                onAccountDeleted={() => {
                  setCurrentUser(null);
                  setIsOnboardingOpen(true);
                  setActiveTab('radar');
                }}
                onRefreshRadar={() => {
                  if (currentUser) fetchRadar(currentUser.id, currentTag);
                }}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav
            activeTab={activeTab}
            onSelectTab={(tabId) => setActiveTab(tabId)}
            activeChatsCount={inboxStatus?.activeChatsCount || 0}
          />
        </>
      )}

      {/* OVERLAY MODALS */}

      {/* Full-Screen Chat Room Modal */}
      {selectedChatPartner && currentUser && (
        <ChatRoomModal
          isOpen={!!selectedChatPartner}
          onClose={() => {
            setSelectedChatPartner(null);
            if (currentUser) fetchInboxStatus(currentUser.id);
          }}
          currentUser={currentUser}
          chatPartner={selectedChatPartner}
          socket={socket}
          onReportUser={(partner) => {
            setReportedUser(partner);
            setSelectedChatPartner(null);
          }}
          onCoinsUpdated={(newBalance) => {
            const updated = { ...currentUser, coinsBalance: newBalance };
            setCurrentUser(updated);
            localStorage.setItem('nightowl_user', JSON.stringify(updated));
          }}
        />
      )}

      {/* Coin Shop Modal */}
      <CoinShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        currentUser={currentUser}
        onPurchaseSuccess={handleCoinsPurchased}
      />

      {/* UGC Report Modal (10 Google Categories + Block) */}
      <ReportModal
        isOpen={!!reportedUser}
        onClose={() => {
          setReportedUser(null);
          if (currentUser) fetchRadar(currentUser.id, currentTag);
        }}
        reportedUser={reportedUser}
      />

      {/* Biometric Verification Modal */}
      <BiometricVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        currentUser={currentUser}
        onVerificationSuccess={handleVerificationComplete}
      />

      {/* Strict 18+ DOB Registration Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
