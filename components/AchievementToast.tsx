'use client';

import { useEffect, useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Play achievement sound
      playAchievementSound();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  const playAchievementSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      // Cheerful achievement jingle
      const notes = [
        { freq: 523.25, time: 0 },    // C5
        { freq: 659.25, time: 0.1 },  // E5
        { freq: 783.99, time: 0.2 },  // G5
        { freq: 1046.50, time: 0.35 }, // C6
      ];

      notes.forEach(({ freq, time }) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.25, audioContext.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.25);
        osc.start(audioContext.currentTime + time);
        osc.stop(audioContext.currentTime + time + 0.25);
      });

      // Vibrate
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }
    } catch {
      // Audio not available
    }
  };

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div
        className="mx-auto max-w-sm p-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 backdrop-blur-xl shadow-lg shadow-yellow-500/10"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30">
            {achievement.icon}
          </div>
          <div className="flex-1">
            <p className="text-yellow-300/80 text-xs font-medium uppercase tracking-wide mb-0.5">
              Achievement Unlocked!
            </p>
            <p className="font-bold text-lg">{achievement.title}</p>
            <p className="text-muted text-sm">{achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
