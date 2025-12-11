'use client';

interface DriverSelectProps {
  onSelect: (name: string) => void;
}

const DRIVER_CONFIG = {
  ABRI: {
    emoji: '🤠',
    color: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/25',
  },
  HEINE: {
    emoji: '🧑‍🌾',
    color: 'from-green-500 to-green-600',
    shadow: 'shadow-green-500/25',
  },
  STEPHEN: {
    emoji: '🚜',
    color: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/25',
  },
};

export default function DriverSelect({ onSelect }: DriverSelectProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-lg font-medium text-center text-muted">
        Who&apos;s hauling today?
      </h2>
      <div className="flex gap-3">
        {Object.entries(DRIVER_CONFIG).map(([name, config]) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`flex-1 py-6 px-2 rounded-2xl text-center
                       bg-gradient-to-br ${config.color}
                       transition-all duration-150
                       active:scale-95
                       shadow-lg ${config.shadow}`}
          >
            <span className="text-4xl block mb-2">{config.emoji}</span>
            <span className="text-lg font-bold block text-white">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
