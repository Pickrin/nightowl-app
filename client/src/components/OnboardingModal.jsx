import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  ArrowRight, 
  Shield, 
  Moon, 
  Heart, 
  Check, 
  User, 
  Compass, 
  Lock 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Curated Witty & Flirty Monikers (Strictly No Numbers)
const FEMALE_MONIKERS = [
  'VelvetVixen', 'AphroditeVibe', 'SpicyChaiLatte', 'NeonGoddess', 'MidnightEnchantress',
  'SilkWhisper', 'WildCherry', 'CaffeineQueen', 'SunsetSiren', 'MoonlitRose',
  'ChampagneKisses', 'VelvetRebel', 'SweetObsession', 'TwilightMuse', 'GlitterStorm'
];

const MALE_MONIKERS = [
  'ShadowWhisky', 'CaffeineNomad', 'MidnightRebel', 'SilverWolf', 'DarkEspresso',
  'PhantomDrifter', 'UrbanMaverick', 'VibeArchitect', 'NeonSamurai', 'NocturnalRogue',
  'VelvetMonarch', 'ThunderEcho', 'MidnightKnight', 'SilentCharmer', 'CosmicNomad'
];

const NON_BINARY_MONIKERS = [
  'NocturnalPhantom', 'ElectricAura', 'SolarEclipse', 'MysticCipher', 'NebulaWhisper',
  'CosmicValkyrie', 'AstralEnigma', 'ShadowGlow', 'HyperNova', 'VelvetZen'
];

const DESIRE_TAGS = [
  'Casual Dating',
  'Secret Romance',
  'Late-Night Chat',
  'Flirt & Fun',
  'Fantasy & Roleplay',
  'Discreet Meetups',
  'No Strings Attached',
  'Deep Anonymous Talk',
  'Virtual Romance'
];

const MIDNIGHT_VIBES = [
  { id: 'chai_drives', title: 'Late-Night Chai & Long Drives', desc: 'Chill conversations under midnight city lights' },
  { id: 'secret_drinks', title: 'Flirty Banter & Rooftop Drinks', desc: 'High energy, witty chemistry, and cocktail vibes' },
  { id: 'deep_talks', title: 'Deep Talks (Zero Judgement)', desc: 'Secrets and thoughts you never share in daylight' },
  { id: 'spontaneous', title: 'Spontaneous Secret Meetups', desc: 'Exciting, discreet, and strictly no drama' }
];

export default function OnboardingModal({ isOpen, onComplete }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('Female');
  const [seeking, setSeeking] = useState('Male');
  const [nickname, setNickname] = useState('VelvetVixen');
  const [age, setAge] = useState('24');
  const [selectedTags, setSelectedTags] = useState(['Late-Night Chat', 'Secret Romance']);
  const [midnightVibe, setMidnightVibe] = useState('Late-Night Chai & Long Drives');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState(null);

  // Reroll Name from Gender Pools
  const rerollName = (targetGender = gender) => {
    let pool = FEMALE_MONIKERS;
    if (targetGender === 'Male') pool = MALE_MONIKERS;
    if (targetGender === 'Non-Binary') pool = NON_BINARY_MONIKERS;

    const available = pool.filter(n => n !== nickname);
    const chosen = available[Math.floor(Math.random() * available.length)] || pool[0];
    setNickname(chosen);
  };

  const handleGenderChange = (g) => {
    setGender(g);
    rerollName(g);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      }
    } else {
      if (selectedTags.length < 4) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 18) {
        setError('You must be 18+ to enter NightOwl.');
        return;
      }
      if (parsedAge > 99) {
        setError('Please enter a valid age.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedTags.length === 0) {
        setError('Please choose at least 1 intention tag.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete({
        nickname,
        age: parseInt(age, 10),
        gender,
        seeking,
        desireTags: selectedTags,
        midnightVibe,
        datingIntention: selectedTags[0],
        referralCode: referralCode.trim() || null
      });
    }
  };

  return (
    <div className="onboard-overlay">
      <div className="onboard-card">
        
        {/* Top Progress Bar */}
        <div className="onboard-progress-bar">
          <div className={`progress-segment ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`progress-segment ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-segment ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        {/* Header */}
        <div className="onboard-header">
          <div className="onboard-badge-row">
            <span className="onboard-step-badge">STEP {step} OF 3</span>
            <span className="onboard-bonus-badge">
              <Sparkles style={{ width: 12, height: 12, color: '#fde047' }} />
              <span>+100 Coins Welcome</span>
            </span>
          </div>

          <h2 className="onboard-title">
            {step === 1 && 'Create Anonymous Identity'}
            {step === 2 && 'What Are You Seeking?'}
            {step === 3 && 'Choose Your Midnight Vibe'}
          </h2>
          <p className="onboard-subtitle">
            {step === 1 && 'Zero photos or real names saved. Pure witty nocturnal anonymity.'}
            {step === 2 && 'Pick up to 3 intention tags to calibrate your proximity radar.'}
            {step === 3 && 'How do you like spending your secret late-night hours?'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="onboard-error">
            {error}
          </div>
        )}

        {/* STEP 1: IDENTITY & GENDER */}
        {step === 1 && (
          <div className="onboard-body">
            
            {/* Gender Segmented Switch */}
            <div className="field-group">
              <label className="field-label">I Identify As</label>
              <div className="segmented-selector">
                {['Female', 'Male', 'Non-Binary'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenderChange(g)}
                    className={`segment-btn ${gender === g ? 'active' : ''}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Witty Codename Display with Reroll */}
            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Witty & Flirty Codename</label>
                <button
                  type="button"
                  onClick={() => rerollName()}
                  className="reroll-link-btn"
                >
                  <Dices style={{ width: 14, height: 14 }} />
                  <span>Reroll Alias</span>
                </button>
              </div>

              <div className="nickname-box">
                <div className="nickname-text">
                  <span>{nickname}</span>
                </div>
                <button
                  type="button"
                  onClick={() => rerollName()}
                  className="reroll-square-btn"
                  title="Randomize Flirty Alias"
                >
                  <Dices style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>

            {/* Two-Column: Age & Seeking */}
            <div className="two-col-grid">
              <div className="field-group">
                <label className="field-label">My Age (18+)</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="sleek-input"
                  placeholder="24"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Looking For</label>
                <div className="seeking-segmented">
                  {['Male', 'Female', 'Anyone'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeeking(s)}
                      className={`seeking-chip ${seeking === s ? 'active' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Ghost Referral Code Input */}
            <div className="field-group">
              <label className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Ghost Invite Code (Optional)</span>
                <span style={{ color: '#fde047', fontSize: 10 }}>+50 Extra Coins</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="GHOST-XXXX"
                className="sleek-input"
                maxLength={12}
              />
            </div>
          </div>
        )}

        {/* STEP 2: DESIRE TAGS */}
        {step === 2 && (
          <div className="onboard-body">
            <div className="field-label-row">
              <label className="field-label">Select Intentions ({selectedTags.length}/4)</label>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap to select</span>
            </div>

            <div className="tags-selection-grid">
              {DESIRE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`tag-select-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="tag-card-text">{tag}</div>
                    <div className="tag-checkbox">
                      {isSelected && <Check style={{ width: 12, height: 12, strokeWidth: 3 }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: MIDNIGHT VIBE */}
        {step === 3 && (
          <div className="onboard-body">
            <div className="vibe-cards-list">
              {MIDNIGHT_VIBES.map((v) => {
                const isSelected = midnightVibe === v.title;
                return (
                  <div
                    key={v.id}
                    onClick={() => setMidnightVibe(v.title)}
                    className={`vibe-choice-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="vibe-card-info">
                      <div className="vibe-card-title">{v.title}</div>
                      <div className="vibe-card-desc">{v.desc}</div>
                    </div>
                    <div className="vibe-radio">
                      {isSelected && <div className="vibe-radio-inner"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="safety-guarantee-box">
              <Shield style={{ width: 16, height: 16, color: '#10b981', flexShrink: 0 }} />
              <span>100% Confidential: Zero photos uploaded or stored on public servers.</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="onboard-footer">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="onboard-back-btn"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="onboard-submit-btn"
          >
            <span>{step === 3 ? 'Enter NightOwl & Claim 100c' : 'Continue'}</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>

      </div>
    </div>
  );
}
