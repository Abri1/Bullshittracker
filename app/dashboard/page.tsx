'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FieldCard from '@/components/FieldCard';
import StatsHeader from '@/components/StatsHeader';
import UndoButton from '@/components/UndoButton';
import ActivityLog from '@/components/ActivityLog';
import AchievementToast from '@/components/AchievementToast';

interface Field {
  id: string;
  name: string;
  color: string;
  target_loads: number;
  is_active: boolean;
}

interface Load {
  id: string;
  field_id: string;
  driver: string;
  created_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const DRIVERS = ['ABRI', 'HEINE'];

const MOTIVATIONAL_QUOTES = [
  "Every load counts towards greatness",
  "Spreading success, one dump at a time",
  "Champions are made in the fields",
  "Today's shit is tomorrow's gold",
  "Keep on truckin', legend",
  "Making the world a fertilized place",
  "You're on a roll today!",
  "The early bird gets the load",
  "Hauling dreams into reality",
  "Another day, another pile conquered",
  "You've got the power!",
  "Keep pushing, keep dumping",
  "Excellence is a habit, not an act",
  "The grind never stops",
];

const getStoredStreak = (): { count: number; lastDate: string } => {
  if (typeof window === 'undefined') return { count: 0, lastDate: '' };
  const stored = localStorage.getItem('streak');
  if (stored) return JSON.parse(stored);
  return { count: 0, lastDate: '' };
};

const getStoredAchievements = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('achievements');
  if (stored) return JSON.parse(stored);
  return [];
};

const getStoredPins = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('pinnedFields');
  if (stored) return JSON.parse(stored);
  return [];
};

export default function DashboardPage() {
  const router = useRouter();
  const [driverName, setDriverName] = useState<string>('');
  const [fields, setFields] = useState<Field[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [pinnedFields, setPinnedFields] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    try {
      // Fetch fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('fields')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (fieldsError) throw fieldsError;

      // Fetch loads
      const { data: loadsData, error: loadsError } = await supabase
        .from('loads')
        .select('*')
        .order('created_at', { ascending: true });

      if (loadsError) throw loadsError;

      setFields(fieldsData || []);
      setLoads(loadsData || []);
      setIsOnline(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsOnline(false);
    }
  }, []);

  // Initialize
  useEffect(() => {
    const driver = localStorage.getItem('driver');
    if (!driver) {
      router.push('/');
      return;
    }
    setDriverName(driver);
    setPinnedFields(getStoredPins());
    setEarnedAchievements(getStoredAchievements());

    // Random quote
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    // Calculate streak
    const storedStreak = getStoredStreak();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (storedStreak.lastDate === today) {
      setStreak(storedStreak.count);
    } else if (storedStreak.lastDate === yesterday) {
      setStreak(storedStreak.count);
    } else if (storedStreak.lastDate) {
      setStreak(0);
      localStorage.setItem('streak', JSON.stringify({ count: 0, lastDate: '' }));
    }

    // Fetch initial data
    fetchData().then(() => setIsLoading(false));
  }, [router, fetchData]);

  // Real-time subscription for loads
  useEffect(() => {
    const channel = supabase
      .channel('realtime-loads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLoads(prev => [...prev, payload.new as Load]);
          } else if (payload.eventType === 'DELETE') {
            setLoads(prev => prev.filter(l => l.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time subscription for fields
  useEffect(() => {
    const channel = supabase
      .channel('realtime-fields')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fields' },
        () => {
          // Refetch fields on any change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

  // Save pinned fields
  useEffect(() => {
    localStorage.setItem('pinnedFields', JSON.stringify(pinnedFields));
  }, [pinnedFields]);

  // Save achievements
  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(earnedAchievements));
  }, [earnedAchievements]);

  // Check for achievements
  const checkAchievements = useCallback((totalLoads: number, driverLoadsToday: number) => {
    const achievementsToCheck = [
      { id: 'first_dump', condition: totalLoads === 1, title: 'First Blood', description: 'Your first dump!', icon: '🎯' },
      { id: 'five_dumps', condition: driverLoadsToday === 5, title: 'High Five', description: '5 loads in one day!', icon: '🖐️' },
      { id: 'ten_dumps', condition: driverLoadsToday === 10, title: 'Perfect 10', description: '10 loads in one day!', icon: '🔟' },
      { id: 'twenty_dumps', condition: driverLoadsToday === 20, title: 'Dump Master', description: '20 loads in one day!', icon: '👑' },
      { id: 'fifty_total', condition: totalLoads === 50, title: 'Half Century', description: '50 total loads!', icon: '🏆' },
      { id: 'hundred_total', condition: totalLoads === 100, title: 'Centurion', description: '100 total loads!', icon: '💯' },
    ];

    for (const achievement of achievementsToCheck) {
      if (achievement.condition && !earnedAchievements.includes(achievement.id)) {
        setEarnedAchievements(prev => [...prev, achievement.id]);
        setCurrentAchievement({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
        });
        break;
      }
    }
  }, [earnedAchievements]);

  const getFieldLoads = useCallback((fieldId: string) => {
    return loads.filter(l => l.field_id === fieldId).length;
  }, [loads]);

  const getFieldDriverBreakdown = useCallback((fieldId: string) => {
    const fieldLoads = loads.filter(l => l.field_id === fieldId);
    return DRIVERS.map(driver => ({
      name: driver,
      count: fieldLoads.filter(l => l.driver === driver).length,
    })).filter(d => d.count > 0);
  }, [loads]);

  const avgLoadsPerHour = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLoads = loads.filter(l => {
      const loadDate = new Date(l.created_at);
      loadDate.setHours(0, 0, 0, 0);
      return loadDate.getTime() === today.getTime();
    });
    if (todayLoads.length < 2) return 0;
    const timestamps = todayLoads.map(l => new Date(l.created_at).getTime()).sort((a, b) => a - b);
    const hoursSpan = (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60);
    if (hoursSpan < 0.1) return 0;
    return todayLoads.length / hoursSpan;
  }, [loads]);

  const getDriverStats = useCallback((driver: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const driverLoads = loads.filter(l => l.driver === driver);
    const todayLoads = driverLoads.filter(l => {
      const loadDate = new Date(l.created_at);
      loadDate.setHours(0, 0, 0, 0);
      return loadDate.getTime() === today.getTime();
    });
    return { name: driver, todayLoads: todayLoads.length, totalLoads: driverLoads.length };
  }, [loads]);

  const driversStats = useMemo(() => DRIVERS.map(driver => getDriverStats(driver)), [getDriverStats]);

  const activityItems = useMemo(() => {
    return loads.map(load => {
      const field = fields.find(f => f.id === load.field_id);
      return {
        id: load.id,
        driver: load.driver,
        fieldName: field?.name || 'Unknown Field',
        fieldColor: field?.color || '#666',
        timestamp: new Date(load.created_at),
      };
    });
  }, [loads, fields]);

  const handleDump = useCallback(async (fieldId: string) => {
    // Optimistically add the load locally
    const tempId = crypto.randomUUID();
    const newLoad: Load = {
      id: tempId,
      field_id: fieldId,
      driver: driverName,
      created_at: new Date().toISOString(),
    };

    setLoads(prev => [...prev, newLoad]);

    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from('loads')
        .insert({
          field_id: fieldId,
          driver: driverName,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp load with real one
      setLoads(prev => prev.map(l => l.id === tempId ? data : l));
    } catch (error) {
      console.error('Error saving load:', error);
      // Revert on error
      setLoads(prev => prev.filter(l => l.id !== tempId));
    }

    // Update streak
    const today = new Date().toDateString();
    const storedStreak = getStoredStreak();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreakCount = 1;
    if (storedStreak.lastDate === today) {
      newStreakCount = storedStreak.count;
    } else if (storedStreak.lastDate === yesterday) {
      newStreakCount = storedStreak.count + 1;
    }

    setStreak(newStreakCount);
    localStorage.setItem('streak', JSON.stringify({ count: newStreakCount, lastDate: today }));

    // Check achievements
    const driverLoadsToday = loads.filter(l => {
      const loadDate = new Date(l.created_at);
      loadDate.setHours(0, 0, 0, 0);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      return l.driver === driverName && loadDate.getTime() === todayDate.getTime();
    }).length + 1;

    const totalLoads = loads.filter(l => l.driver === driverName).length + 1;
    checkAchievements(totalLoads, driverLoadsToday);
  }, [driverName, loads, checkAchievements]);

  const handleTogglePin = useCallback((fieldId: string) => {
    setPinnedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  }, []);

  const handleUndo = useCallback(async () => {
    const driverLoads = loads.filter(l => l.driver === driverName);
    if (driverLoads.length === 0) return;

    const lastLoad = driverLoads[driverLoads.length - 1];

    // Optimistically remove
    setLoads(prev => prev.filter(l => l.id !== lastLoad.id));

    // Delete from Supabase
    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', lastLoad.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error undoing load:', error);
      // Revert on error
      setLoads(prev => [...prev, lastLoad]);
    }
  }, [driverName, loads]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('driver');
    router.push('/');
  }, [router]);

  const handleSettings = useCallback(() => router.push('/settings'), [router]);

  const getLastLoad = useCallback(() => {
    const driverLoads = loads.filter(l => l.driver === driverName);
    if (driverLoads.length === 0) return null;
    const lastLoad = driverLoads[driverLoads.length - 1];
    const field = fields.find(f => f.id === lastLoad.field_id);
    const diff = Math.floor((Date.now() - new Date(lastLoad.created_at).getTime()) / 1000);
    const timeAgo = diff < 60 ? `${diff}s ago` : diff < 3600 ? `${Math.floor(diff / 60)}m ago` : `${Math.floor(diff / 3600)}h ago`;
    return { fieldName: field?.name || 'Unknown', timeAgo };
  }, [loads, driverName, fields]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-amber-950/10">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedFields = [...fields].sort((a, b) => {
    const aPinned = pinnedFields.includes(a.id);
    const bPinned = pinnedFields.includes(b.id);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    const aComplete = getFieldLoads(a.id) >= a.target_loads;
    const bComplete = getFieldLoads(b.id) >= b.target_loads;
    if (aComplete !== bComplete) return aComplete ? 1 : -1;
    return (a.target_loads - getFieldLoads(a.id)) - (b.target_loads - getFieldLoads(b.id));
  });

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-background via-background to-amber-950/5">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500/90 text-white text-center py-2 text-sm">
          Offline - changes will sync when back online
        </div>
      )}

      <AchievementToast
        achievement={currentAchievement}
        onDismiss={() => setCurrentAchievement(null)}
      />

      <StatsHeader
        currentDriver={driverName}
        drivers={driversStats}
        streak={streak}
        quote={quote}
        onSettingsClick={handleSettings}
        onLogout={handleLogout}
        onActivityClick={() => setShowActivity(true)}
      />

      <main className="p-4">
        <div className="grid gap-4">
          {sortedFields.map(field => (
            <FieldCard
              key={field.id}
              id={field.id}
              name={field.name}
              color={field.color}
              currentLoads={getFieldLoads(field.id)}
              targetLoads={field.target_loads}
              isPinned={pinnedFields.includes(field.id)}
              driverBreakdown={getFieldDriverBreakdown(field.id)}
              avgLoadsPerHour={avgLoadsPerHour}
              onDump={handleDump}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🌾</span>
            <p className="text-muted mb-4">No fields yet</p>
            <button onClick={handleSettings} className="px-6 py-3 bg-amber-500/20 border border-amber-500/30 rounded-xl font-medium hover:bg-amber-500/30 transition-colors">
              Add your first field
            </button>
          </div>
        )}
      </main>

      <UndoButton lastLoad={getLastLoad()} onUndo={handleUndo} />

      <ActivityLog isOpen={showActivity} onClose={() => setShowActivity(false)} activities={activityItems} />
    </div>
  );
}
