import React from 'react';
import { Compass, MessageCircle, Zap, User } from 'lucide-react';

export default function BottomNav({ activeTab, onSelectTab, unreadChatsCount, activeChatsCount }) {
  const tabs = [
    {
      id: 'radar',
      label: 'Radar',
      icon: Compass,
      badge: null
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageCircle,
      badge: activeChatsCount > 0 ? `${activeChatsCount}/5` : null
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: Zap,
      badge: '50% OFF'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      badge: null
    }
  ];

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav-glass">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrapper">
                <Icon className="nav-icon" />
                {tab.badge && (
                  <span className={`nav-badge ${tab.id === 'vault' ? 'vault-badge' : ''}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="nav-label">{tab.label}</span>
              {isActive && <div className="nav-active-pill" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
