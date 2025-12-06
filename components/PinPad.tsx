'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PinPadProps {
  driverName: string;
  onSuccess: () => void;
  onBack: () => void;
}

const DRIVER_EMOJI: Record<string, string> = {
  ABRI: '🤠',
  HEINE: '🧑‍🌾',
};

export default function PinPad({ driverName, onSuccess, onBack }: PinPadProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      setIsChecking(true);

      // Verify PIN against Supabase
      const verifyPin = async () => {
        // Fallback PINs for offline mode
        const fallbackPins: Record<string, string> = {
          'ABRI': '1234',
          'HEINE': '5678',
        };

        try {
          const { data, error: dbError } = await supabase
            .from('drivers')
            .select('pin')
            .ilike('name', driverName)
            .single();

          console.log('Supabase response:', { data, dbError, driverName });

          // Check if PIN matches (from DB or fallback)
          const correctPin = data?.pin || fallbackPins[driverName];

          if (dbError) {
            console.error('Supabase error:', dbError);
          }

          if (pin === correctPin) {
            // Success!
            localStorage.setItem('driver', driverName);
            if (navigator.vibrate) {
              navigator.vibrate([50, 30, 100]);
            }
            onSuccess();
          } else {
            setError(true);
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            setTimeout(() => {
              setPin('');
              setError(false);
              setIsChecking(false);
            }, 500);
          }
        } catch (err) {
          console.error('PIN verification error:', err);
          // Fallback to hardcoded PINs if offline
          if (pin === fallbackPins[driverName]) {
            localStorage.setItem('driver', driverName);
            if (navigator.vibrate) {
              navigator.vibrate([50, 30, 100]);
            }
            onSuccess();
          } else {
            setError(true);
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            setTimeout(() => {
              setPin('');
              setError(false);
              setIsChecking(false);
            }, 500);
          }
        }
      };

      verifyPin();
    }
  }, [pin, driverName, onSuccess]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !isChecking) {
      setPin(prev => prev + digit);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleDelete = () => {
    if (!isChecking) {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-muted hover:text-white transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>Back</span>
      </button>

      <div className="text-center">
        <span className="text-5xl mb-3 block">{DRIVER_EMOJI[driverName] || '👤'}</span>
        <h1 className="text-3xl font-black mb-1">{driverName}</h1>
        <p className="text-muted">Enter your secret code</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-4 py-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full transition-all duration-200 ${
              error
                ? 'bg-red-500 animate-shake'
                : pin.length > i
                  ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50'
                  : 'bg-white/10 border-2 border-white/20'
            }`}
          />
        ))}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {digits.map((digit, i) => (
          digit === '' ? (
            <div key={i} />
          ) : digit === 'del' ? (
            <button
              key={i}
              onClick={handleDelete}
              className="py-5 text-xl font-medium text-muted
                         transition-all active:scale-95 hover:text-white"
            >
              ⌫
            </button>
          ) : (
            <button
              key={i}
              onClick={() => handleDigit(digit)}
              className="py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-2xl font-semibold
                         transition-all duration-150 active:scale-90 active:bg-white/20
                         border border-white/5 hover:border-white/10"
            >
              {digit}
            </button>
          )
        ))}
      </div>

      {/* Hint */}
      <p className="text-muted/50 text-xs mt-4">
        Hint: Think simple 🤫
      </p>
    </div>
  );
}
