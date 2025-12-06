'use client';

import { useState } from 'react';

interface UndoButtonProps {
  lastLoad: {
    fieldName: string;
    timeAgo: string;
  } | null;
  onUndo: () => void;
}

export default function UndoButton({ lastLoad, onUndo }: UndoButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!lastLoad) return null;

  const handleUndo = () => {
    if (showConfirm) {
      onUndo();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
      <button
        onClick={handleUndo}
        className={`w-full py-4 rounded-2xl font-medium transition-all duration-300 ${
          showConfirm
            ? 'bg-danger text-white'
            : 'bg-card text-muted hover:text-white'
        }`}
      >
        {showConfirm ? (
          'Tap again to confirm undo'
        ) : (
          <>
            Undo: {lastLoad.fieldName} ({lastLoad.timeAgo})
          </>
        )}
      </button>
    </div>
  );
}
