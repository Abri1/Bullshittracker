'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DriverSelect from '@/components/DriverSelect';
import PinPad from '@/components/PinPad';
import { supabase } from '@/lib/supabase';

const TAGLINES = [
  "Because every load counts",
  "Spreading joy, one dump at a time",
  "Making fields great again",
  "Where the magic happens",
  "Hauling ass since day one",
  "No load left behind",
  "Professional shit disturbers",
  "Turning crap into gold",
  "The #1 app for #2",
  "Dump. Track. Repeat.",
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tagline, setTagline] = useState('');

  useEffect(() => {
    // Pick a random tagline
    setTagline(TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);

    // Check if already logged in
    const driver = localStorage.getItem('driver');
    if (driver) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleDriverSelect = (name: string) => {
    setSelectedDriver(name);
    // Prefetch dashboard data while user enters PIN
    supabase.from('fields').select('*').eq('is_active', true);
    supabase.from('loads').select('*');
  };

  const handlePinSuccess = () => {
    router.push('/dashboard');
  };

  const handleBack = () => {
    setSelectedDriver(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-amber-950/20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="page-container items-center justify-center p-6 bg-gradient-to-b from-background via-background to-amber-950/20 relative overflow-hidden page-enter">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-10 text-6xl opacity-10 rotate-12">💩</div>
        <div className="absolute bottom-1/4 left-10 text-4xl opacity-10 -rotate-12">🐄</div>
        <div className="absolute top-1/3 left-1/4 text-3xl opacity-5">🚜</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm">
        {selectedDriver ? (
          <PinPad
            driverName={selectedDriver}
            onSuccess={handlePinSuccess}
            onBack={handleBack}
          />
        ) : (
          <>
            {/* Logo & Title */}
            <div className="text-center mb-10">
              {/* Poop emoji with glow */}
              <div className="relative inline-block mb-4">
                <span className="text-7xl animate-bounce inline-block" style={{ animationDuration: '2s' }}>
                  💩
                </span>
                <div className="absolute inset-0 text-7xl blur-xl opacity-30">💩</div>
              </div>

              <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                BULLSHIT
              </h1>
              <p className="text-xl font-medium text-amber-500/80 tracking-wide">
                TRACKER
              </p>

              {/* Tagline */}
              <p className="mt-4 text-muted text-sm italic">
                &ldquo;{tagline}&rdquo;
              </p>
            </div>

            {/* Cow ASCII art - subtle */}
            <div className="text-center mb-8 font-mono text-xs text-white/10 leading-tight hidden sm:block">
              <pre>{`
        (__)
        (oo)
  /------\\/
 / |    ||
*  /\\---/\\
   ~~   ~~
              `}</pre>
            </div>

            {/* Driver selection */}
            <DriverSelect onSelect={handleDriverSelect} />

            {/* Fun stats */}
            <div className="mt-10 pt-6 border-t border-white/5">
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-amber-400">∞</p>
                  <p className="text-xs text-muted">Loads of fun</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">100%</p>
                  <p className="text-xs text-muted">Organic</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">3</p>
                  <p className="text-xs text-muted">Legends</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-muted/50 text-xs mt-8">
              Made by Abri
            </p>
          </>
        )}
      </div>
    </main>
  );
}
