'use client';

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
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
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

export default function ActivityLog({ isOpen, onClose, activities }: ActivityLogProps) {
  if (!isOpen) return null;

  const groupedActivities = groupByDate(activities);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-white/5">
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
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 bg-card rounded-xl p-3"
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

                      {/* Time */}
                      <span className="text-sm text-muted flex-shrink-0">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {activities.length > 0 && (
        <div className="sticky bottom-0 bg-card/80 backdrop-blur-xl border-t border-white/5 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total dumps logged</span>
            <span className="font-bold">{activities.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
