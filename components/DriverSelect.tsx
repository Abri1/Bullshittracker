'use client';

interface DriverSelectProps {
  onSelect: (name: string) => void;
}

const DRIVER_CONFIG = {
  ABRI: {
    emoji: '🤠',
    subtitle: 'The Legend',
    color: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/25',
  },
  HEINE: {
    emoji: '🧑‍🌾',
    subtitle: 'The Machine',
    color: 'from-green-500 to-green-600',
    shadow: 'shadow-green-500/25',
  },
};

export default function DriverSelect({ onSelect }: DriverSelectProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-lg font-medium text-center text-muted">
        Who&apos;s hauling today?
      </h2>
      <div className="flex gap-4">
        {Object.entries(DRIVER_CONFIG).map(([name, config]) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`flex-1 py-6 px-4 rounded-3xl text-center
                       bg-gradient-to-br ${config.color}
                       transition-all duration-300
                       active:scale-95 hover:scale-105
                       shadow-lg ${config.shadow}
                       hover:shadow-xl`}
          >
            <span className="text-4xl block mb-2">{config.emoji}</span>
            <span className="text-xl font-bold block text-white">{name}</span>
            <span className="text-xs text-white/70 block mt-1">{config.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
