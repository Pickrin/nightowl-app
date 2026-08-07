import React, { useState } from 'react';
import { Lock, Unlock, Eye } from 'lucide-react';

export default function PanicScreen({ isActive, onExit }) {
  if (!isActive) return null;

  const [display, setDisplay] = useState('0');
  const SECRET_RESTORE_PIN = '9999';

  const handleBtn = (val) => {
    if (val === 'C') {
      setDisplay('0');
    } else if (val === '=') {
      try {
        if (display === SECRET_RESTORE_PIN) {
          onExit();
          return;
        }
        // Safe math evaluator without eval()
        const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
        const cleanExpression = sanitized.replace(/[^0-9+\-*/.]/g, '');
        const computeResult = Function(`'use strict'; return (${cleanExpression})`)();
        setDisplay(String(computeResult));
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay(prev => (prev === '0' ? val : prev + val));
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000000', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Secret Restore Bar */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <button
          onClick={onExit}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#64748b', padding: '6px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Unlock style={{ width: 13, height: 13 }} />
          <span>Restore (Or PIN 9999=)</span>
        </button>
      </div>

      {/* Camouflage Calculator */}
      <div style={{ width: '100%', maxWidth: 320, background: '#171717', border: '1px solid #262626', borderRadius: 24, padding: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
        
        {/* Screen */}
        <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 12, padding: '20px 16px', textAlign: 'right', fontSize: 32, fontWeight: 700, letterSpacing: 1, marginBottom: 16, overflowX: 'auto', color: '#4ade80' }}>
          {display}
        </div>

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '9999', '='].map((btn) => (
            <button
              key={btn}
              onClick={() => handleBtn(btn)}
              style={{
                height: 56,
                borderRadius: 14,
                border: '1px solid #333',
                background: btn === '=' ? '#10b981' : ['÷', '×', '-', '+'].includes(btn) ? '#f59e0b' : '#262626',
                color: btn === '=' ? '#000' : '#fff',
                fontSize: btn === '9999' ? 10 : 18,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
