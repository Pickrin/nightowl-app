import React, { useState } from 'react';
import { X, Coins, Crown, Check, Gift, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CoinShopModal({
  isOpen,
  onClose,
  currentUser,
  onPurchaseSuccess,
  onClaimDaily,
  dailyClaimAvailable
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('coins');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);

  const COIN_PACKS = [
    {
      id: 'pack_starter_50',
      title: 'Starter Pack',
      coins: 50,
      bonusCoins: 0,
      priceInr: 49,
      tag: 'Impulse Buy',
      desc: 'Unlocks 2–3 new direct secret chats.'
    },
    {
      id: 'pack_popular_250',
      title: 'Night Explorer',
      coins: 250,
      bonusCoins: 50,
      priceInr: 199,
      tag: 'Most Popular',
      popular: true,
      desc: 'Unlocks ~12+ private conversations & photo requests.'
    },
    {
      id: 'pack_pro_750',
      title: 'Midnight Flame',
      coins: 750,
      bonusCoins: 200,
      priceInr: 499,
      tag: 'Best Value',
      desc: 'Unlimited chats + priority message ranking.'
    }
  ];

  const VIP_PLANS = [
    {
      id: 'vip_weekly_149',
      title: '7-Day VIP Pass',
      priceInr: 149,
      period: 'per week',
      perks: [
        'Unlimited free chat unlocks',
        'Incognito Mode (browse invisibly)',
        'Free 30 Daily Bonus Coins',
        'Unrestricted Distance Radar across all India',
        'Priority delivery for disappearing media'
      ]
    },
    {
      id: 'vip_monthly_499',
      title: 'Monthly VIP Royalty',
      priceInr: 499,
      period: 'per month',
      popular: true,
      perks: [
        'All Weekly VIP perks included',
        'Permanent Golden Mask Profile Badge',
        'See who viewed your anonymous profile',
        'Screenshot-blocked media album',
        'Priority 24/7 moderation support'
      ]
    }
  ];

  const handleSimulateGooglePlayCheckout = async (pack) => {
    setIsProcessing(true);
    setSelectedPack(pack);

    try {
      const res = await fetch('http://localhost:5000/api/billing/process-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          packageId: pack.id,
          googleOrderId: 'GPA.' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000)
        })
      });

      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        onPurchaseSuccess(data.user);
        setTimeout(() => {
          setIsProcessing(false);
          setSelectedPack(null);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Purchase simulation error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 460 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins style={{ width: 20, height: 20, color: '#f59e0b' }} />
            </div>
            <div>
              <div className="modal-title">NightOwl Coin Vault</div>
              <div className="modal-subtitle">Google Play Billing • Instant UPI / NetBanking</div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 34, height: 34 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ padding: '16px 20px 0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={() => setActiveTab('coins')}
            className={`filter-chip ${activeTab === 'coins' ? 'active' : ''}`}
            style={{ textAlign: 'center', justifyContent: 'center' }}
          >
            <Coins style={{ width: 15, height: 15, marginRight: 6, display: 'inline' }} />
            Coin Packs (INR)
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`filter-chip ${activeTab === 'vip' ? 'active' : ''}`}
            style={{ textAlign: 'center', justifyContent: 'center' }}
          >
            <Crown style={{ width: 15, height: 15, marginRight: 6, display: 'inline' }} />
            VIP Royalty Pass
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body" style={{ maxHeight: '60vh' }}>
          {dailyClaimAvailable && (
            <div style={{ padding: 12, borderRadius: 14, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Gift style={{ width: 20, height: 20, color: '#f59e0b' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fde047' }}>Daily Nocturnal Bonus</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>+20 Coins available now</div>
                </div>
              </div>
              <button
                onClick={onClaimDaily}
                style={{ padding: '6px 12px', background: '#f59e0b', color: '#07080f', fontWeight: 800, fontSize: 11, borderRadius: 8, border: 'none', cursor: 'pointer' }}
              >
                Claim Free
              </button>
            </div>
          )}

          {activeTab === 'coins' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COIN_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: pack.popular ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: pack.popular ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{pack.title}</span>
                      <span className="vip-pill">{pack.coins + pack.bonusCoins} Coins</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{pack.desc}</div>
                  </div>

                  <button
                    onClick={() => handleSimulateGooglePlayCheckout(pack)}
                    disabled={isProcessing}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: 12, flexShrink: 0 }}
                  >
                    {isProcessing && selectedPack?.id === pack.id ? 'Verifying...' : `₹${pack.priceInr}`}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {VIP_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: 'linear-gradient(180deg, rgba(24, 26, 48, 0.9) 0%, rgba(14, 16, 28, 0.9) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#fde047', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Crown style={{ width: 16, height: 16, color: '#f59e0b' }} />
                        <span>{plan.title}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{plan.period}</span>
                    </div>
                    <button
                      onClick={() => handleSimulateGooglePlayCheckout(plan)}
                      disabled={isProcessing}
                      style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #f59e0b, #ec4899)', border: 'none', borderRadius: 10, color: '#ffffff', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                    >
                      {isProcessing && selectedPack?.id === plan.id ? 'Activating...' : `Subscribe ₹${plan.priceInr}`}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    {plan.perks.map((perk, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
                        <Check style={{ width: 14, height: 14, color: 'var(--emerald)', flexShrink: 0 }} />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 8 }}>
            <ShieldCheck style={{ width: 14, height: 14, color: 'var(--emerald)' }} />
            <span>Encrypted Google Play Billing • Zero Credit Card Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
