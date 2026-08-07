import React, { useState, useEffect } from 'react';
import { API_BASE_URL, WS_BASE_URL } from './config';
import Navbar from './components/Navbar';
import OnboardingModal from './components/OnboardingModal';
import RadarView from './components/RadarView';
import ChatRoomModal from './components/ChatRoomModal';
import CoinShopModal from './components/CoinShopModal';
import ReportModal from './components/ReportModal';
import PanicScreen from './components/PanicScreen';
import ProfileModal from './components/ProfileModal';
import BiometricVerificationModal from './components/BiometricVerificationModal';
import AdminDashboard from './components/AdminDashboard';
import GhostReferralModal from './components/GhostReferralModal';
import BurnerQrModal from './components/BurnerQrModal';
import CapacityReminderModal from './components/CapacityReminderModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isBurnerOpen, setIsBurnerOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [selectedChatPartner, setSelectedChatPartner] = useState(null);
  const [reportedUser, setReportedUser] = useState(null);

  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentTag, setCurrentTag] = useState('All');
  const [desireTags, setDesireTags] = useState([]);
  const [inboxStatus, setInboxStatus] = useState({ activeChatsCount: 1, pendingRequestsCount: 2 });
  const [dailyClaimAvailable, setDailyClaimAvailable] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('nightowl_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentUser(parsed);
      connectWebSocket(parsed.id);
      fetchRadar(parsed.id, currentTag);
      fetchInboxStatus(parsed.id);
      setIsReminderOpen(true);
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
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('nightowl_user', JSON.stringify(data.user));
        setIsOnboardingOpen(false);
        connectWebSocket(data.user.id);
        fetchRadar(data.user.id, currentTag);
        fetchInboxStatus(data.user.id);
        setIsReminderOpen(true);
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
    }
  };

  const handleSelectTag = (tag) => {
    setCurrentTag(tag);
    if (currentUser) {
      fetchRadar(currentUser.id, tag);
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
        setIsReminderOpen(true);
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

  const handleClaimDaily = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/claim-daily`, {
        method: 'POST',
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...currentUser, coinsBalance: data.coinsBalance };
        setCurrentUser(updated);
        localStorage.setItem('nightowl_user', JSON.stringify(updated));
        setDailyClaimAvailable(false);
        alert('🎁 +20 Daily Coins Credited to your vault!');
      } else {
        alert(data.error || 'Daily reward already claimed.');
      }
    } catch (e) {
      console.error('Claim error:', e);
    }
  };

  const handleToggleIncognito = async () => {
    if (!currentUser) return;
    const newState = !currentUser.isIncognito;
    try {
      const res = await fetch(`${API_BASE_URL}/api/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ isIncognito: newState })
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...currentUser, isIncognito: newState };
        setCurrentUser(updated);
        localStorage.setItem('nightowl_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Incognito toggle error:', e);
    }
  };

  return (
    <div className="app-container">
      {/* Camouflage / Panic Screen */}
      <PanicScreen
        isActive={isPanicActive}
        onExit={() => setIsPanicActive(false)}
      />

      {/* Top Navbar with Capacity Indicator */}
      <Navbar
        user={currentUser}
        inboxStatus={inboxStatus}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onTriggerPanic={() => setIsPanicActive(true)}
        onClaimDaily={handleClaimDaily}
        dailyClaimAvailable={dailyClaimAvailable}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenBurner={() => setIsBurnerOpen(true)}
        onOpenReminder={() => setIsReminderOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <RadarView
          nearbyUsers={nearbyUsers}
          currentTag={currentTag}
          onSelectTag={handleSelectTag}
          desireTags={desireTags}
          onUnlockChat={handleUnlockChat}
          currentUser={currentUser}
          onOpenShop={() => setIsShopOpen(true)}
          onPriorityWhisper={handlePriorityWhisper}
        />
      </main>

      {/* Modals & Dialogs */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />

      <CapacityReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        inboxStatus={inboxStatus}
        user={currentUser}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <GhostReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        user={currentUser}
      />

      <BurnerQrModal
        isOpen={isBurnerOpen}
        onClose={() => setIsBurnerOpen(false)}
        currentUser={currentUser}
        onBurnerConnected={(partner) => setSelectedChatPartner(partner)}
      />

      <BiometricVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        currentUser={currentUser}
        onVerificationComplete={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem('nightowl_user', JSON.stringify(updatedUser));
        }}
      />

      <ChatRoomModal
        isOpen={!!selectedChatPartner}
        onClose={() => setSelectedChatPartner(null)}
        partner={selectedChatPartner}
        currentUser={currentUser}
        socket={socket}
        onOpenReport={(p) => setReportedUser(p)}
        onUnmatchSuccess={(updatedStatus) => {
          if (updatedStatus) setInboxStatus(updatedStatus);
          if (currentUser) fetchInboxStatus(currentUser.id);
        }}
      />

      <CoinShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        currentUser={currentUser}
        onPurchaseSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem('nightowl_user', JSON.stringify(updatedUser));
        }}
        onClaimDaily={handleClaimDaily}
        dailyClaimAvailable={dailyClaimAvailable}
      />

      <ReportModal
        isOpen={!!reportedUser}
        onClose={() => setReportedUser(null)}
        reportedUser={reportedUser}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onToggleIncognito={handleToggleIncognito}
        onOpenShop={() => setIsShopOpen(true)}
      />
    </div>
  );
}
