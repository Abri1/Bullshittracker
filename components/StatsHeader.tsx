'use client';

interface DriverStats {
  name: string;
  todayLoads: number;
  totalLoads: number;
}

interface StatsHeaderProps {
  currentDriver: string;
  drivers: DriverStats[];
  streak: number;
  quote: string;
  onSettingsClick: () => void;
  onLogout: () => void;
  onActivityClick: () => void;
}

const DRIVER_EMOJI: Record<string, string> = {
  ABRI: '🤠',
  HEINE: '🧑‍🌾',
};

export default function StatsHeader({
  currentDriver,
  drivers,
  streak,
  quote,
  onSettingsClick,
  onLogout,
  onActivityClick,
}: StatsHeaderProps) {
  const totalToday = drivers.reduce((sum, d) => sum + d.todayLoads, 0);

  return (
    <header className="sticky top-0 z-20">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative px-4 py-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Exit</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{DRIVER_EMOJI[currentDriver]}</span>
            <span className="font-bold text-lg">{currentDriver}</span>
          </div>

          <button
            onClick={onSettingsClick}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Motivational quote */}
        <div className="mb-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-200/80 italic text-center">
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Streak counter */}
        <div className="mb-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-xs text-orange-300/70">Current Streak</p>
            <p className="font-bold text-lg text-orange-300">{streak} days</p>
          </div>
        </div>

        {/* Driver stats - head to head */}
        <div className="flex gap-3 mb-3">
          {drivers.map((driver) => {
            const isLeader = driver.todayLoads > 0 && driver.todayLoads >= Math.max(...drivers.map(d => d.todayLoads));
            const isCurrentDriver = driver.name === currentDriver;

            return (
              <div
                key={driver.name}
                className={`flex-1 rounded-2xl p-4 transition-all relative overflow-hidden ${
                  isCurrentDriver
                    ? 'bg-gradient-to-br from-white/15 to-white/5 shadow-lg'
                    : 'bg-white/5'
                }`}
                style={{
                  boxShadow: isCurrentDriver ? '0 8px 32px -8px rgba(255,255,255,0.1)' : undefined,
                }}
              >
                {/* Decorative gradient */}
                {isCurrentDriver && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                )}

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{DRIVER_EMOJI[driver.name]}</span>
                      <span className={`text-sm font-medium ${isCurrentDriver ? 'text-white' : 'text-muted'}`}>
                        {driver.name}
                      </span>
                    </div>
                    {isLeader && <span className="text-lg animate-bounce">👑</span>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      {driver.todayLoads}
                    </span>
                    <span className="text-muted text-sm">today</span>
                  </div>
                  <p className="text-muted text-xs mt-1">{driver.totalLoads} all time</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total and activity button */}
        <div className="flex items-center justify-between px-1">
          <div className="text-muted text-sm">
            <span className="text-white font-bold text-lg">{totalToday}</span>
            <span className="ml-1">loads today</span>
          </div>
          <button
            onClick={onActivityClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-muted hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity
          </button>
        </div>
      </div>
    </header>
  );
}
