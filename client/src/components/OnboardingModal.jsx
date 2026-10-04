import React, { useState } from 'react';
import { 
  Sparkles, 
  Dices, 
  ArrowRight, 
  Shield, 
  Check, 
  Lock, 
  EyeOff, 
  Moon,
  AlertCircle,
  ShieldCheck,
  ChevronLeft
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

export default function OnboardingModal({ isOpen, onComplete }) {
  if (!isOpen) return null;

  // 4 Progressive Tranquil Micro-Steps
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('Female');
  const [seeking, setSeeking] = useState('Male');
  const [nickname, setNickname] = useState('VelvetVixen');
  
  // Strict 18+ DOB calculation
  const [birthYear, setBirthYear] = useState('2001');
  const [birthMonth, setBirthMonth] = useState('06');
  const [birthDay, setBirthDay] = useState('15');
  const [calculatedAge, setCalculatedAge] = useState(25);

  const [selectedTags, setSelectedTags] = useState(['Late-Night Chat', 'Secret Romance']);
  const [error, setError] = useState(null);

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
    setCalculatedAge(computeAge(y, m, d));
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
      setStep(2);
    } else if (step === 2) {
      if (!nickname.trim()) {
        setError('Please choose a moniker.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const age = computeAge(birthYear, birthMonth, birthDay);
      if (isNaN(age) || age < 18) {
        setError('Google Restrict Minor Access: You must be 18 years or older to enter NightOwl.');
        return;
      }
      if (age > 99) {
        setError('Please enter a valid birth year.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (selectedTags.length === 0) {
        setError('Please choose at least 1 intention tag.');
        return;
      }
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      const age = computeAge(birthYear, birthMonth, birthDay);
      onComplete({
        nickname,
        age,
        dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
        gender,
        seeking,
        desireTags: selectedTags,
        midnightVibe: 'Late-Night Chai & Long Drives',
        datingIntention: selectedTags[0]
      });
    }
  };

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
    <div className="onboard-glass-overlay">
      <div className="onboard-glass-card">
        
        {/* Step Indicator Pills */}
        <div className="step-pill-indicator">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`step-pill ${step === s ? 'active' : step > s ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* STEP 1: THE MIDNIGHT ENTRANCE (Clean, peaceful welcome) */}
        {step === 1 && (
          <div className="tranquil-step-body animate-fade-in">
            <div className="welcome-glow-orb">
              <img src="/icon-512.jpg" alt="NightOwl" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            <div className="welcome-text-block">
              <span className="welcome-badge">AFTERHOURS NOCTURNAL DATING</span>
              <h1 className="welcome-title">Enter the Midnight Hours</h1>
              <p className="welcome-subtitle">
                A discreet, anonymous space for genuine nocturnal connections. Zero public profile photos. Strictly restricted to consenting adults 18+.
              </p>
            </div>

            <div className="trust-features-grid">
              <div className="trust-feature-pill">
                <EyeOff style={{ width: 14, height: 14, color: '#c084fc' }} />
                <span>Zero Public Photos</span>
              </div>
              <div className="trust-feature-pill">
                <Lock style={{ width: 14, height: 14, color: '#10b981' }} />
                <span>30s Vanishing Media</span>
              </div>
              <div className="trust-feature-pill">
                <ShieldCheck style={{ width: 14, height: 14, color: '#fde047' }} />
                <span>18+ Consenting Adults</span>
              </div>
            </div>

            <button type="button" onClick={handleNext} className="glass-primary-action-btn">
              <span>Enter NightOwl</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        )}

        {/* STEP 2: CHOOSE YOUR ALIAS & GENDER (Playful & Fast) */}
        {step === 2 && (
          <div className="tranquil-step-body animate-fade-in">
            <div className="step-micro-header">
              <span className="step-count-tag">STEP 2 OF 4</span>
              <h2 className="step-headline">Choose Your Persona</h2>
              <p className="step-subheadline">You remain completely anonymous behind your moniker.</p>
            </div>

            {/* Gender Segmented Glass Chips */}
            <div className="form-field-unit">
              <label className="field-caption">I Identify As</label>
              <div className="gender-glass-chips">
                {['Female', 'Male', 'Non-Binary'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenderChange(g)}
                    className={`gender-chip ${gender === g ? 'active' : ''}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Flirty Moniker Display with 1-Tap Reroll */}
            <div className="form-field-unit">
              <div className="caption-split-row">
                <label className="field-caption">Your Nocturnal Moniker</label>
                <button type="button" onClick={() => rerollName()} className="link-reroll-btn">
                  <Dices style={{ width: 13, height: 13 }} />
                  <span>Reroll</span>
                </button>
              </div>

              <div className="frosted-alias-box">
                <span className="alias-title">{nickname}</span>
                <button
                  type="button"
                  onClick={() => rerollName()}
                  className="dice-icon-btn"
                  title="Randomize Moniker"
                >
                  <Dices style={{ width: 18, height: 18, color: '#c084fc' }} />
                </button>
              </div>
            </div>

            <div className="onboard-nav-row">
              <button type="button" onClick={() => setStep(1)} className="glass-back-btn">
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
              <button type="button" onClick={handleNext} className="glass-primary-action-btn" style={{ flex: 1 }}>
                <span>Continue</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATE OF BIRTH (Simple, Clear & Reassuring) */}
        {step === 3 && (
          <div className="tranquil-step-body animate-fade-in">
            <div className="step-micro-header">
              <span className="step-count-tag">STEP 3 OF 4</span>
              <h2 className="step-headline">18+ Age Verification</h2>
              <p className="step-subheadline">
                Strictly required by Google Play policy. Your date of birth is kept <strong>completely private</strong> and never shown on your card.
              </p>
            </div>

            {error && (
              <div className="step-error-banner">
                <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-field-unit">
              <div className="caption-split-row">
                <label className="field-caption">Date of Birth</label>
                <span style={{ fontSize: 11, fontWeight: 800, color: calculatedAge >= 18 ? '#10b981' : '#f87171' }}>
                  {calculatedAge} yrs old {calculatedAge >= 18 ? '✓ Adult Verified' : '⚠️ Minor Restricted'}
                </span>
              </div>

              <div className="dob-glass-grid">
                <select
                  value={birthYear}
                  onChange={(e) => handleDobChange(e.target.value, birthMonth, birthDay)}
                  className="glass-dropdown"
                >
                  {Array.from({ length: 60 }, (_, i) => 2008 - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  value={birthMonth}
                  onChange={(e) => handleDobChange(birthYear, e.target.value, birthDay)}
                  className="glass-dropdown"
                >
                  {['01 - Jan', '02 - Feb', '03 - Mar', '04 - Apr', '05 - May', '06 - Jun', '07 - Jul', '08 - Aug', '09 - Sep', '10 - Oct', '11 - Nov', '12 - Dec'].map((m, idx) => (
                    <option key={m} value={String(idx + 1).padStart(2, '0')}>{m}</option>
                  ))}
                </select>

                <select
                  value={birthDay}
                  onChange={(e) => handleDobChange(birthYear, birthMonth, e.target.value)}
                  className="glass-dropdown"
                >
                  {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="privacy-reassurance-box">
              <Shield style={{ width: 16, height: 16, color: '#10b981', flexShrink: 0 }} />
              <span>We calculate your age automatically. Only your age number is visible to matches.</span>
            </div>

            <div className="onboard-nav-row">
              <button type="button" onClick={() => setStep(2)} className="glass-back-btn">
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
              <button type="button" onClick={handleNext} className="glass-primary-action-btn" style={{ flex: 1 }}>
                <span>Confirm & Continue</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DESIRES & CLAIM WELCOME BONUS (Rewarding finish) */}
        {step === 4 && (
          <div className="tranquil-step-body animate-fade-in">
            <div className="step-micro-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="step-count-tag">FINAL STEP</span>
                <span className="bonus-pill-tag">
                  <Sparkles style={{ width: 12, height: 12, color: '#fde047' }} />
                  <span>+100 Coins Welcome</span>
                </span>
              </div>
              <h2 className="step-headline">Calibrate Your Desires</h2>
              <p className="step-subheadline">Tell your nocturnal radar what you are looking for.</p>
            </div>

            {error && (
              <div className="step-error-banner">
                <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Seeking Glass Buttons */}
            <div className="form-field-unit">
              <label className="field-caption">Looking To Connect With</label>
              <div className="gender-glass-chips">
                {['Male', 'Female', 'Anyone'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeeking(s)}
                    className={`gender-chip ${seeking === s ? 'active' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Desire Tags Grid */}
            <div className="form-field-unit">
              <div className="caption-split-row">
                <label className="field-caption">Select Intentions ({selectedTags.length}/4)</label>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Tap to toggle</span>
              </div>

              <div className="desires-frosted-grid">
                {DESIRE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`desire-glass-pill ${isSelected ? 'selected' : ''}`}
                    >
                      <span>{tag}</span>
                      {isSelected && <Check style={{ width: 12, height: 12, strokeWidth: 3 }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="onboard-nav-row">
              <button type="button" onClick={() => setStep(3)} className="glass-back-btn">
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
              <button type="button" onClick={handleNext} className="glass-primary-action-btn" style={{ flex: 1 }}>
                <Sparkles style={{ width: 16, height: 16, color: '#fde047' }} />
                <span>Claim +100 Coins & Awaken Radar</span>
              </button>
            </div>
          </div>
        )}

        {/* Subtle Reviewer Access Demo Link */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
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
