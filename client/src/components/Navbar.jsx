import React from 'react';
import { Coins, Moon, ShieldAlert, Sparkles, Shield, Lock } from 'lucide-react';

export default function Navbar({
  user,
  onOpenShop,
  onTriggerPanic,
  onOpenAdmin
}) {
  // Check if current hour in IST is Happy Hour (00:00 to 03:59 IST)
  const isHappyHour = () => {
    const hour = parseInt(
      new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(new Date()),
      10
    );
    return hour >= 0 && hour < 4;
  };

  return (
    <header className="mobile-header">
      <div className="mobile-header-inner">
        {/* Brand Wordmark & Pulsing Nocturnal Dot */}
        <div className="mobile-brand">
          <div className="nocturnal-live-dot" title="Nocturnal Radar Online" />
          <div className="brand-logo-text">
            <span>NIGHTOWL</span>
            <span className="brand-sub">AFTERHOURS</span>
          </div>
        </div>

        {/* Right Status Capsule: Happy Hour Tag, Coins & Panic Camouflage */}
        <div className="header-actions">
          {isHappyHour() && (
            <div className="header-happy-tag">
              <Moon style={{ width: 11, height: 11, color: '#fde047' }} />
              <span>50% OFF</span>
            </div>
          )}

          {/* Coins Pill */}
          <button
            type="button"
            onClick={onOpenShop}
            className="header-coin-pill"
            title="Open Coins Vault"
          >
            <Coins style={{ width: 13, height: 13, color: '#f59e0b' }} />
            <span>{user?.coinsBalance || 0}</span>
          </button>

          {/* Discreet Panic Camouflage Button */}
          <button
            type="button"
            onClick={onTriggerPanic}
            className="header-panic-btn"
            title="Instant Camouflage (Calculator Screen)"
          >
            <span>🖩</span>
          </button>
        </div>
      </div>
    </header>
  );
}
