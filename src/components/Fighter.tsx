import React from 'react';

export interface Character {
  id: string;
  name: string;
  title: string;
  color: string;
  accentColor: string;
  power: number;
  speed: number;
  defense: number;
  special: string;
  avatar: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    title: 'Straw Hat Captain',
    color: '#E74C3C',
    accentColor: '#F39C12',
    power: 90,
    speed: 85,
    defense: 75,
    special: 'Gomu Gomu no Gatling',
    avatar: '👒',
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    title: 'Pirate Hunter',
    color: '#27AE60',
    accentColor: '#2ECC71',
    power: 95,
    speed: 80,
    defense: 85,
    special: 'Three Sword Style: Onigiri',
    avatar: '⚔️',
  },
  {
    id: 'sanji',
    name: 'Vinsmoke Sanji',
    title: 'Black Leg',
    color: '#3498DB',
    accentColor: '#E67E22',
    power: 85,
    speed: 95,
    defense: 70,
    special: 'Diable Jambe',
    avatar: '🔥',
  },
  {
    id: 'nami',
    name: 'Nami',
    title: 'Cat Burglar',
    color: '#E91E63',
    accentColor: '#FF9800',
    power: 60,
    speed: 90,
    defense: 55,
    special: 'Thunder Tempo',
    avatar: '⚡',
  },
  {
    id: 'ace',
    name: 'Portgas D. Ace',
    title: 'Fire Fist',
    color: '#FF5722',
    accentColor: '#FF9800',
    power: 92,
    speed: 88,
    defense: 80,
    special: 'Hiken',
    avatar: '🔥',
  },
  {
    id: 'law',
    name: 'Trafalgar Law',
    title: 'Surgeon of Death',
    color: '#9C27B0',
    accentColor: '#673AB7',
    power: 88,
    speed: 82,
    defense: 78,
    special: 'Room: Shambles',
    avatar: '💀',
  },
];

interface FighterProps {
  character: Character;
  health: number;
  maxHealth: number;
  isPlayer: boolean;
  isAttacking: boolean;
  isHit: boolean;
  isBlocking: boolean;
  isSpecial: boolean;
}

export const Fighter: React.FC<FighterProps> = ({
  character,
  health,
  maxHealth,
  isPlayer,
  isAttacking,
  isHit,
  isBlocking,
  isSpecial,
}) => {
  const healthPercent = (health / maxHealth) * 100;

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-100 ${
        isPlayer ? '' : 'scale-x-[-1]'
      }`}
    >
      {/* Character Name */}
      <div
        className={`absolute -top-12 md:-top-16 text-center ${isPlayer ? '' : 'scale-x-[-1]'}`}
      >
        <div className="text-xs md:text-sm font-bold text-white/70">{character.title}</div>
        <div
          className="text-lg md:text-2xl font-black tracking-tight"
          style={{ color: character.color }}
        >
          {character.name}
        </div>
      </div>

      {/* Fighter Body */}
      <div
        className={`relative w-24 h-32 md:w-36 md:h-48 rounded-lg transition-all duration-100 ${
          isHit ? 'animate-shake' : ''
        } ${isAttacking ? 'animate-punch' : ''} ${isSpecial ? 'animate-special' : ''} ${
          isBlocking ? 'opacity-70' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${character.color} 0%, ${character.accentColor} 100%)`,
          boxShadow: isSpecial
            ? `0 0 40px ${character.color}, 0 0 80px ${character.accentColor}`
            : `0 10px 40px ${character.color}50`,
        }}
      >
        {/* Face/Avatar Area */}
        <div className="absolute inset-2 md:inset-4 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-4xl md:text-6xl filter drop-shadow-lg">{character.avatar}</span>
        </div>

        {/* Blocking Shield */}
        {isBlocking && (
          <div className="absolute inset-0 border-4 border-white/50 rounded-lg animate-pulse" />
        )}

        {/* Special Effect */}
        {isSpecial && (
          <div className="absolute -inset-4 md:-inset-8">
            <div
              className="w-full h-full rounded-full animate-ping"
              style={{ background: `${character.color}40` }}
            />
          </div>
        )}

        {/* Hit Effect */}
        {isHit && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl animate-bounce">
            💥
          </div>
        )}
      </div>

      {/* Health Bar */}
      <div className={`mt-4 md:mt-6 w-28 md:w-40 ${isPlayer ? '' : 'scale-x-[-1]'}`}>
        <div className="h-3 md:h-4 bg-black/50 rounded-full overflow-hidden border-2 border-white/30">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${healthPercent}%`,
              background:
                healthPercent > 50
                  ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                  : healthPercent > 25
                  ? 'linear-gradient(90deg, #eab308, #facc15)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
            }}
          />
        </div>
        <div className="text-center text-xs md:text-sm font-bold mt-1 text-white">
          {health} / {maxHealth}
        </div>
      </div>
    </div>
  );
};
