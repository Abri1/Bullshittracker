'use client';

import { useState, useRef, useCallback } from 'react';

interface DriverBreakdown {
  name: string;
  count: number;
}

interface FieldCardProps {
  id: string;
  name: string;
  color: string;
  currentLoads: number;
  isPinned: boolean;
  driverBreakdown: DriverBreakdown[];
  onDump: (fieldId: string) => void;
  onTogglePin: (fieldId: string) => void;
}

// Field type icons based on name keywords
const getFieldIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('north')) return '🧭';
  if (lower.includes('south')) return '🌴';
  if (lower.includes('river') || lower.includes('water')) return '🌊';
  if (lower.includes('hill')) return '⛰️';
  if (lower.includes('back') || lower.includes('paddock')) return '🌾';
  if (lower.includes('front')) return '🏠';
  if (lower.includes('corn')) return '🌽';
  if (lower.includes('wheat')) return '🌾';
  return '🌱';
};

export default function FieldCard({
  id,
  name,
  color,
  currentLoads,
  isPinned,
  driverBreakdown,
  onDump,
  onTogglePin,
}: FieldCardProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const holdDelayTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isScrolling = useRef(false);

  const fieldIcon = getFieldIcon(name);

  const playSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    oscillator2.frequency.setValueAtTime(400, audioContext.currentTime + 0.05);
    oscillator2.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
    gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    oscillator2.start(audioContext.currentTime + 0.05);
    oscillator2.stop(audioContext.currentTime + 0.25);
  }, []);

  const triggerSuccess = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 100]);
    }
    playSound();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 600);
    onDump(id);
  }, [id, onDump, playSound]);

  const cancelHold = useCallback(() => {
    if (holdDelayTimer.current) {
      clearTimeout(holdDelayTimer.current);
      holdDelayTimer.current = null;
    }
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setIsHolding(false);
    touchStartPos.current = null;
    isScrolling.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    isScrolling.current = false;

    // Wait 150ms before showing hold UI
    holdDelayTimer.current = setTimeout(() => {
      if (isScrolling.current) return;

      setIsHolding(true);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      holdTimer.current = setTimeout(() => {
        if (!isScrolling.current) {
          triggerSuccess();
        }
        setIsHolding(false);
      }, 1350);
    }, 150);
  }, [triggerSuccess]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

    if (deltaX > 10 || deltaY > 10) {
      isScrolling.current = true;
      cancelHold();
    }
  }, [cancelHold]);

  const handleTouchEnd = useCallback(() => {
    cancelHold();
  }, [cancelHold]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsHolding(true);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    holdTimer.current = setTimeout(() => {
      triggerSuccess();
      setIsHolding(false);
    }, 1500);
  }, [triggerSuccess]);

  const handleMouseUp = useCallback(() => {
    cancelHold();
  }, [cancelHold]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
        !isHolding ? 'animate-subtle-glow' : ''
      }`}
      style={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 50%, ${color}05 100%)`,
        borderWidth: '1px',
        borderColor: isHolding ? color : `${color}30`,
        boxShadow: isHolding
          ? `0 0 60px -10px ${color}, 0 20px 40px -20px ${color}50`
          : `0 4px 20px -5px ${color}20`,
        ['--glow-color' as string]: color,
      }}
    >
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-30 animate-float"
            style={{
              backgroundColor: color,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse at top right, ${color}15 0%, transparent 50%)`,
        }}
      />

      {/* Pin button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(id);
        }}
        className={`absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
          isPinned
            ? 'bg-yellow-500/30 text-yellow-300 scale-110'
            : 'bg-black/20 text-white/40 hover:bg-black/40 hover:text-white/70'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill={isPinned ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>

      {/* Hold area */}
      <div
        className="relative p-6 select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Progress ring overlay when holding */}
        {isHolding && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke={`${color}30`} strokeWidth="4" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  className="animate-hold-progress"
                  style={{ filter: `drop-shadow(0 0 10px ${color})` }}
                />
              </svg>
            </div>
          </div>
        )}

        {/* Success checkmark */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center animate-success"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 40px ${color}`,
              }}
            >
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Card content */}
        <div className={`relative transition-all duration-300 ${isHolding ? 'scale-95 opacity-50' : ''}`}>
          {/* Header with icon and name */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
                boxShadow: `0 4px 15px -5px ${color}50`,
              }}
            >
              {fieldIcon}
            </div>
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-muted text-sm">Hold to dump</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-end justify-between">
            <div>
              <span
                className="text-5xl font-black"
                style={{
                  background: `linear-gradient(135deg, white 0%, ${color} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {currentLoads}
              </span>
              <span className="text-muted text-lg ml-2">loads</span>
            </div>

            {/* Driver breakdown */}
            {driverBreakdown.length > 0 && (
              <div className="flex gap-3">
                {driverBreakdown.map((d) => (
                  <div
                    key={d.name}
                    className="text-right px-3 py-1.5 rounded-lg bg-white/5"
                  >
                    <span className="text-muted text-xs block">{d.name}</span>
                    <span className="font-bold text-sm">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
