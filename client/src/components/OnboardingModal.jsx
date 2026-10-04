import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  ArrowRight, 
  Shield, 
  Check, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  
  // Google Play Compliant DOB fields (Strict 18+ Verification)
  const [birthYear, setBirthYear] = useState('2000');
  const [birthMonth, setBirthMonth] = useState('05');
  const [birthDay, setBirthDay] = useState('15');
  const [calculatedAge, setCalculatedAge] = useState(26);

  const [selectedTags, setSelectedTags] = useState(['Late-Night Chat', 'Secret Romance']);
  const [midnightVibe, setMidnightVibe] = useState('Late-Night Chai & Long Drives');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState(null);

  // Calculate age from DOB accurately
  const computeAge = (y, m, d) => {
    const today = new Date();
    const birthDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDobChange = (y, m, d) => {
    setBirthYear(y);
    setBirthMonth(m);
    setBirthDay(d);
    const age = computeAge(y, m, d);
    setCalculatedAge(age);
  };

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
      const age = computeAge(birthYear, birthMonth, birthDay);
      if (isNaN(age) || age < 18) {
        setError('Google Play 18+ Minor Restriction: You must be at least 18 years of age to access NightOwl.');
        return;
      }
      if (age > 99) {
        setError('Please enter a valid date of birth.');
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
      const age = computeAge(birthYear, birthMonth, birthDay);
      onComplete({
        nickname,
        age,
        dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
        gender,
        seeking,
        desireTags: selectedTags,
        midnightVibe,
        datingIntention: selectedTags[0],
        referralCode: referralCode.trim() || null
      });
    }
  };

  // Google Play Reviewer Quick-Fill Helper
  const handleReviewerBypass = () => {
    onComplete({
      nickname: 'NightOwlTester',
      age: 25,
      dateOfBirth: '2001-01-01',
      gender: 'Non-Binary',
      seeking: 'Anyone',
      desireTags: ['Late-Night Chat', 'Casual Dating'],
      midnightVibe: 'Late-Night Chai & Long Drives',
      datingIntention: 'Late-Night Chat',
      isReviewerAccount: true
    });
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
            {step === 1 && 'Create Anonymous Persona'}
            {step === 2 && 'What Are You Seeking?'}
            {step === 3 && 'Choose Your Midnight Vibe'}
          </h2>
          <p className="onboard-subtitle">
            {step === 1 && 'Zero public profile photos. Strictly restricted to consenting adults 18+.'}
            {step === 2 && 'Calibrate your proximity radar with your nocturnal desires.'}
            {step === 3 && 'How do you enjoy spending your late-night hours?'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="onboard-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: IDENTITY, GENDER & COMPLIANT DOB */}
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
                <label className="field-label">Witty & Flirty Moniker</label>
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

            {/* Google Play Compliant DOB Age Verification Gate */}
            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Date of Birth (18+ Verification)</label>
                <span style={{ fontSize: 11, color: calculatedAge >= 18 ? '#10b981' : '#f87171', fontWeight: 700 }}>
                  Age: {calculatedAge} yrs {calculatedAge >= 18 ? '✓ Adult' : '⚠️ Minor Restricted'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8 }}>
                <select
                  value={birthYear}
                  onChange={(e) => handleDobChange(e.target.value, birthMonth, birthDay)}
                  className="sleek-input"
                  style={{ background: '#0a0b16', color: 'white' }}
                >
                  {Array.from({ length: 60 }, (_, i) => 2008 - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  value={birthMonth}
                  onChange={(e) => handleDobChange(birthYear, e.target.value, birthDay)}
                  className="sleek-input"
                  style={{ background: '#0a0b16', color: 'white' }}
                >
                  {['01 - Jan', '02 - Feb', '03 - Mar', '04 - Apr', '05 - May', '06 - Jun', '07 - Jul', '08 - Aug', '09 - Sep', '10 - Oct', '11 - Nov', '12 - Dec'].map((m, idx) => (
                    <option key={m} value={String(idx + 1).padStart(2, '0')}>{m}</option>
                  ))}
                </select>

                <select
                  value={birthDay}
                  onChange={(e) => handleDobChange(birthYear, birthMonth, e.target.value)}
                  className="sleek-input"
                  style={{ background: '#0a0b16', color: 'white' }}
                >
                  {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seeking Preference */}
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
              <span>Google Restrict Minor Access Enforced: Strict 18+ adult verification only.</span>
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

        {/* Google Play Reviewer Quick Access Link */}
        <div style={{ textAlign: 'center', padding: '0 24px 16px' }}>
          <button
            type="button"
            onClick={handleReviewerBypass}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 10, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Google Play Reviewer Access Demo
          </button>
        </div>

      </div>
    </div>
  );
}
