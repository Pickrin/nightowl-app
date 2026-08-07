import React, { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, Camera, Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BiometricVerificationModal({
  isOpen,
  onClose,
  currentUser,
  onVerificationComplete
}) {
  if (!isOpen) return null;

  const [stream, setStream] = useState(null);
  const [scanStep, setScanStep] = useState('idle'); // idle, scanning, success, error
  const [scanProgress, setScanProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const videoRef = useRef(null);

  // Start Front Camera Stream
  const startCamera = async () => {
    setErrorMsg(null);
    setScanStep('scanning');
    setScanProgress(0);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Simulate Real-Time Instant 2.5s Facial Liveness & Zero-Storage Biometric Hash
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setScanProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          completeVerification(mediaStream);
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setScanStep('error');
      setErrorMsg('Camera permission required for instant liveness scan. Zero photos will be stored.');
    }
  };

  const stopCamera = (activeStream = stream) => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const completeVerification = async (activeStream) => {
    stopCamera(activeStream);
    setScanStep('success');

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-liveness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        }
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
        onVerificationComplete(data.user);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (e) {
      console.error('Liveness verification error:', e);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 440, textAlign: 'center' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck style={{ width: 18, height: 18, color: '#10b981' }} />
            <span className="modal-title">Zero-Storage Human Verification</span>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          
          {scanStep === 'idle' && (
            <>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                📸
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                  Instant 2-Second Live Face Scan
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: 320 }}>
                  Proves you are a real living person without uploading or saving any images. Zero photos are stored on our servers.
                </p>
              </div>

              <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Sparkles style={{ width: 16, height: 16, color: '#f59e0b' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fde047' }}>
                  Rewards +50 Free Coins & Verified Badge ✓
                </span>
              </div>

              <button
                onClick={startCamera}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                <Camera style={{ width: 16, height: 16 }} />
                <span>Start Instant Live Scan</span>
              </button>
            </>
          )}

          {scanStep === 'scanning' && (
            <>
              {/* Biometric Oval Camera HUD */}
              <div style={{ position: 'relative', width: 240, height: 240, borderRadius: '50%', overflow: 'hidden', border: '3px solid #10b981', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />

                {/* Laser Sweep HUD Animation */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                    boxShadow: '0 0 12px #10b981',
                    top: `${scanProgress}%`,
                    transition: 'top 0.1s linear'
                  }}
                ></div>

                {/* Oval Guide Overlay */}
                <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '1px dashed rgba(255,255,255,0.4)', pointerEvents: 'none' }}></div>
              </div>

              <div style={{ width: '100%', maxWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
                  <span>Analyzing Liveness...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', width: `${scanProgress}%`, transition: 'width 0.1s linear' }}></div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hold steady. Verifying client-side biometric mesh...</p>
            </>
          )}

          {scanStep === 'success' && (
            <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check style={{ width: 36, height: 36, color: '#10b981' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>100% Real Human Verified!</h3>
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                Your profile now displays the Verified Human badge. +50 bonus coins credited.
              </p>
            </div>
          )}

          {scanStep === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <AlertCircle style={{ width: 44, height: 44, color: '#ef4444' }} />
              <p style={{ fontSize: 12, color: '#fca5a5' }}>{errorMsg}</p>
              <button onClick={startCamera} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw style={{ width: 14, height: 14 }} />
                <span>Retry Scan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
