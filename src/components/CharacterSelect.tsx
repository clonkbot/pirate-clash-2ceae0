import React from 'react';
import { Character, CHARACTERS } from './Fighter';

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  selectedId?: string;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, selectedId }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-4xl font-black text-center mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 tracking-wider">
        SELECT YOUR FIGHTER
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char)}
            className={`group relative p-3 md:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              selectedId === char.id
                ? 'ring-4 ring-amber-400 shadow-2xl scale-105'
                : 'hover:shadow-xl'
            }`}
            style={{
              background: `linear-gradient(135deg, ${char.color}30 0%, ${char.accentColor}30 100%)`,
              borderLeft: `4px solid ${char.color}`,
            }}
          >
            {/* Avatar */}
            <div
              className="w-14 h-14 md:w-20 md:h-20 mx-auto rounded-lg flex items-center justify-center mb-2 md:mb-4 transition-all group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${char.color} 0%, ${char.accentColor} 100%)`,
                boxShadow: `0 8px 32px ${char.color}50`,
              }}
            >
              <span className="text-3xl md:text-5xl">{char.avatar}</span>
            </div>

            {/* Name */}
            <div className="text-center">
              <div className="text-sm md:text-lg font-black text-white truncate">{char.name}</div>
              <div className="text-[10px] md:text-xs text-white/60">{char.title}</div>
            </div>

            {/* Stats */}
            <div className="mt-2 md:mt-4 space-y-1 text-[10px] md:text-xs">
              <StatBar label="PWR" value={char.power} color="#ef4444" />
              <StatBar label="SPD" value={char.speed} color="#3b82f6" />
              <StatBar label="DEF" value={char.defense} color="#22c55e" />
            </div>

            {/* Special Move */}
            <div
              className="mt-2 md:mt-3 py-1 px-2 rounded text-[9px] md:text-xs font-bold text-center truncate"
              style={{ background: `${char.color}40`, color: char.accentColor }}
            >
              {char.special}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="flex items-center gap-1 md:gap-2">
    <span className="w-6 md:w-8 text-white/70 font-bold">{label}</span>
    <div className="flex-1 h-1.5 md:h-2 bg-black/30 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  </div>
);
