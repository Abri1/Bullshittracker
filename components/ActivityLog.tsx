'use client';

import { useState, useRef, useCallback } from 'react';

interface ActivityItem {
  id: string;
  driver: string;
  fieldName: string;
  fieldColor: string;
  timestamp: Date;
}

interface ActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  onDelete: (id: string) => void;
  currentDriver: string;
}

function formatDateTime(date: Date): { date: string; time: string } {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  let dateStr: string;
  if (date.toDateString() === today.toDateString()) {
    dateStr = 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    dateStr = 'Yesterday';
  } else {
    dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return { date: dateStr, time: timeStr };
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}

function groupByDate(activities: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>();

  // Sort by most recent first
  const sorted = [...activities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  for (const activity of sorted) {
    const dateKey = activity.timestamp.toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, activity]);
  }

  return groups;
}

// Swipeable row component - iOS style: swipe to reveal, tap to delete
function SwipeableRow({
  activity,
  onDelete,
  canDelete,
}: {
  activity: ActivityItem;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!canDelete) return;
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, [canDelete]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !canDelete) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // If already open, allow swiping right to close
    if (isOpen) {
      const newX = Math.min(0, Math.max(-80, -80 + diff));
      setTranslateX(newX);
    } else {
      // Only allow swiping left (negative values)
      if (diff < 0) {
        setTranslateX(Math.max(diff, -80));
      }
    }
  }, [canDelete, isOpen]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !canDelete) return;
    isDragging.current = false;

    // If swiped more than 40px, snap to open position
    if (translateX < -40) {
      setTranslateX(-80);
      setIsOpen(true);
    } else {
      // Snap back closed
      setTranslateX(0);
      setIsOpen(false);
    }
  }, [translateX, canDelete]);

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    setTranslateX(-400);
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
    setTimeout(() => {
      onDelete(activity.id);
    }, 200);
  }, [onDelete, activity.id]);

  const handleClose = useCallback(() => {
    setTranslateX(0);
    setIsOpen(false);
  }, []);

  if (isDeleting) {
    return (
      <div className="h-14 bg-danger/20 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200">
        <span className="text-danger text-sm">Deleted</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete button - tap to confirm */}
      <button
        onClick={handleDelete}
        className="absolute inset-y-0 right-0 bg-danger flex items-center justify-center rounded-xl active:bg-red-700 transition-colors"
        style={{ width: '80px' }}
      >
        <span className="text-white text-sm font-medium">Delete</span>
      </button>

      {/* Swipeable content */}
      <div
        className={`relative flex items-center gap-3 bg-card p-3 ${
          isDragging.current ? '' : 'transition-transform duration-200'
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isOpen ? handleClose : undefined}
      >
        {/* Field color dot */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: activity.fieldColor }}
        />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{activity.driver}</span>
            <span className="text-muted">→</span>
            <span className="text-muted truncate">{activity.fieldName}</span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="text-right flex-shrink-0">
          <span className="text-xs text-muted block">{formatDateTime(activity.timestamp).date}</span>
          <span className="text-sm text-muted">{formatDateTime(activity.timestamp).time}</span>
        </div>

        {/* Swipe hint for own entries */}
        {canDelete && translateX === 0 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/30 text-xs">
            ←
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityLog({ isOpen, onClose, activities, onDelete, currentDriver }: ActivityLogProps) {
  if (!isOpen) return null;

  const groupedActivities = groupByDate(activities);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-slide-up">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-white/5 safe-area-top">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-bold">Activity Log</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Swipe hint */}
      <div className="px-4 py-2 text-center text-muted text-xs">
        Swipe left on your entries, then tap Delete
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted">
            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No activity yet</p>
            <p className="text-sm mt-1">Start dumping to see your logs!</p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {Array.from(groupedActivities.entries()).map(([dateKey, items]) => (
              <div key={dateKey}>
                <h2 className="text-sm font-semibold text-muted mb-3 sticky top-0 bg-background py-1">
                  {formatDate(items[0].timestamp)}
                </h2>
                <div className="space-y-2">
                  {items.map((activity) => (
                    <SwipeableRow
                      key={activity.id}
                      activity={activity}
                      onDelete={onDelete}
                      canDelete={activity.driver === currentDriver}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {activities.length > 0 && (
        <div className="sticky bottom-0 bg-card/80 backdrop-blur-xl border-t border-white/5 p-4 safe-area-bottom">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total dumps logged</span>
            <span className="font-bold">{activities.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
