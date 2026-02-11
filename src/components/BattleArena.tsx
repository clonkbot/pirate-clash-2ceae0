import React, { useState, useEffect, useCallback } from 'react';
import { Character, CHARACTERS, Fighter } from './Fighter';

interface BattleArenaProps {
  playerCharacter: Character;
  onBattleEnd: (result: 'win' | 'loss', playerHealth: number, opponentHealth: number, opponentCharacter: Character) => void;
  currentStreak: number;
}

type Action = 'attack' | 'heavy' | 'block' | 'special';

interface AIState {
  nextAction: Action;
  actionTimer: number;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  playerCharacter,
  onBattleEnd,
  currentStreak,
}) => {
  const [opponent] = useState<Character>(() => {
    const others = CHARACTERS.filter((c) => c.id !== playerCharacter.id);
    return others[Math.floor(Math.random() * others.length)];
  });

  const maxHealth = 100;
  const [playerHealth, setPlayerHealth] = useState(maxHealth);
  const [opponentHealth, setOpponentHealth] = useState(maxHealth);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);
  const [playerBlocking, setPlayerBlocking] = useState(false);
  const [opponentBlocking, setOpponentBlocking] = useState(false);
  const [playerSpecial, setPlayerSpecial] = useState(false);
  const [opponentSpecial, setOpponentSpecial] = useState(false);
  const [specialCharge, setSpecialCharge] = useState(0);
  const [opponentSpecialCharge, setOpponentSpecialCharge] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>(['Battle Start!']);
  const [gameOver, setGameOver] = useState(false);
  const [canAct, setCanAct] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [aiState, setAiState] = useState<AIState>({ nextAction: 'attack', actionTimer: 0 });

  // Countdown before battle starts
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const addLog = useCallback((msg: string) => {
    setBattleLog((prev) => [msg, ...prev.slice(0, 4)]);
  }, []);

  // Calculate damage based on stats
  const calculateDamage = useCallback(
    (attacker: Character, defender: Character, isHeavy: boolean, isSpecial: boolean, isBlocked: boolean) => {
      const baseDamage = isSpecial ? 25 : isHeavy ? 15 : 10;
      const powerMod = attacker.power / 100;
      const defenseMod = defender.defense / 100;
      const blockMod = isBlocked ? 0.3 : 1;

      // Add some randomness
      const random = 0.85 + Math.random() * 0.3;

      return Math.round(baseDamage * powerMod * (1 - defenseMod * 0.3) * blockMod * random);
    },
    []
  );

  // Player actions
  const playerAction = useCallback(
    (action: Action) => {
      if (!canAct || gameOver || countdown !== null) return;

      if (action === 'block') {
        setPlayerBlocking(true);
        setCanAct(false);
        setTimeout(() => {
          setPlayerBlocking(false);
          setCanAct(true);
        }, 800);
        return;
      }

      if (action === 'special' && specialCharge < 100) return;

      setCanAct(false);

      if (action === 'special') {
        setPlayerSpecial(true);
        setSpecialCharge(0);
      } else {
        setPlayerAttacking(true);
      }

      // Calculate and apply damage
      setTimeout(() => {
        const isBlocked = opponentBlocking;
        const damage = calculateDamage(
          playerCharacter,
          opponent,
          action === 'heavy',
          action === 'special',
          isBlocked
        );

        if (!isBlocked) {
          setOpponentHit(true);
          setTimeout(() => setOpponentHit(false), 200);
        }

        setOpponentHealth((prev) => {
          const newHealth = Math.max(0, prev - damage);
          if (newHealth === 0) {
            setGameOver(true);
            addLog(`${playerCharacter.name} wins!`);
            setTimeout(() => onBattleEnd('win', playerHealth, newHealth, opponent), 1500);
          }
          return newHealth;
        });

        const actionName = action === 'special' ? playerCharacter.special : action === 'heavy' ? 'Heavy Attack' : 'Attack';
        addLog(`${playerCharacter.name}: ${actionName}! ${damage} dmg${isBlocked ? ' (blocked)' : ''}`);

        // Charge special on hit
        if (!isBlocked && action !== 'special') {
          setSpecialCharge((prev) => Math.min(100, prev + 15));
        }
      }, 150);

      setTimeout(() => {
        setPlayerAttacking(false);
        setPlayerSpecial(false);
        setCanAct(true);
      }, action === 'special' ? 1000 : action === 'heavy' ? 700 : 400);
    },
    [canAct, gameOver, countdown, specialCharge, opponentBlocking, playerCharacter, opponent, calculateDamage, addLog, onBattleEnd, playerHealth]
  );

  // AI opponent logic - medium difficulty
  useEffect(() => {
    if (gameOver || countdown !== null) return;

    const aiTick = setInterval(() => {
      setAiState((prev) => {
        const newTimer = prev.actionTimer + 100;

        // AI acts every 1.5-2.5 seconds (medium pace)
        const actionThreshold = 1500 + Math.random() * 1000 + (currentStreak * 50); // Gets slightly faster with streaks

        if (newTimer >= actionThreshold) {
          // Decide action
          const rand = Math.random();
          let action: Action;

          if (opponentSpecialCharge >= 100 && rand < 0.25) {
            action = 'special';
          } else if (rand < 0.15) {
            action = 'block';
          } else if (rand < 0.4) {
            action = 'heavy';
          } else {
            action = 'attack';
          }

          // Execute action
          if (action === 'block') {
            setOpponentBlocking(true);
            setTimeout(() => setOpponentBlocking(false), 600);
          } else {
            const isSpecial = action === 'special' && opponentSpecialCharge >= 100;

            if (isSpecial) {
              setOpponentSpecial(true);
              setOpponentSpecialCharge(0);
            } else {
              setOpponentAttacking(true);
            }

            setTimeout(() => {
              const isBlocked = playerBlocking;
              const damage = calculateDamage(
                opponent,
                playerCharacter,
                action === 'heavy',
                isSpecial,
                isBlocked
              );

              if (!isBlocked) {
                setPlayerHit(true);
                setTimeout(() => setPlayerHit(false), 200);
              }

              setPlayerHealth((prev) => {
                const newHealth = Math.max(0, prev - damage);
                if (newHealth === 0 && !gameOver) {
                  setGameOver(true);
                  addLog(`${opponent.name} wins!`);
                  setTimeout(() => onBattleEnd('loss', newHealth, opponentHealth, opponent), 1500);
                }
                return newHealth;
              });

              const actionName = isSpecial ? opponent.special : action === 'heavy' ? 'Heavy Attack' : 'Attack';
              addLog(`${opponent.name}: ${actionName}! ${damage} dmg${isBlocked ? ' (blocked)' : ''}`);

              if (!isBlocked && !isSpecial) {
                setOpponentSpecialCharge((prev) => Math.min(100, prev + 12));
              }
            }, 150);

            setTimeout(() => {
              setOpponentAttacking(false);
              setOpponentSpecial(false);
            }, isSpecial ? 800 : action === 'heavy' ? 600 : 350);
          }

          return { nextAction: 'attack', actionTimer: 0 };
        }

        return { ...prev, actionTimer: newTimer };
      });
    }, 100);

    return () => clearInterval(aiTick);
  }, [gameOver, countdown, playerBlocking, opponent, playerCharacter, calculateDamage, addLog, onBattleEnd, opponentHealth, opponentSpecialCharge, currentStreak]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'j':
          playerAction('attack');
          break;
        case 's':
        case 'k':
          playerAction('heavy');
          break;
        case 'd':
        case 'l':
          playerAction('block');
          break;
        case 'f':
        case ' ':
          playerAction('special');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerAction]);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 rounded-2xl">
          <div className="text-8xl md:text-9xl font-black text-amber-400 animate-pulse">
            {countdown === 0 ? 'FIGHT!' : countdown}
          </div>
        </div>
      )}

      {/* Arena Background */}
      <div
        className="relative rounded-2xl overflow-hidden p-4 md:p-8"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 0 100px rgba(0,0,0,0.5), inset 0 0 100px rgba(0,0,0,0.3)',
        }}
      >
        {/* VS Banner */}
        <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500 tracking-widest">
            VS
          </div>
        </div>

        {/* Streak Display */}
        {currentStreak > 0 && (
          <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10 px-2 md:px-3 py-1 bg-amber-500/20 rounded-lg border border-amber-500/50">
            <span className="text-amber-400 font-bold text-xs md:text-sm">🔥 {currentStreak} STREAK</span>
          </div>
        )}

        {/* Fighters */}
        <div className="flex justify-between items-end py-8 md:py-16 px-2 md:px-8 min-h-[280px] md:min-h-[400px]">
          <Fighter
            character={playerCharacter}
            health={playerHealth}
            maxHealth={maxHealth}
            isPlayer={true}
            isAttacking={playerAttacking}
            isHit={playerHit}
            isBlocking={playerBlocking}
            isSpecial={playerSpecial}
          />

          <Fighter
            character={opponent}
            health={opponentHealth}
            maxHealth={maxHealth}
            isPlayer={false}
            isAttacking={opponentAttacking}
            isHit={opponentHit}
            isBlocking={opponentBlocking}
            isSpecial={opponentSpecial}
          />
        </div>

        {/* Battle Log */}
        <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 bg-black/50 rounded-lg p-2 md:p-3 max-h-16 md:max-h-24 overflow-hidden">
          {battleLog.map((log, i) => (
            <div
              key={i}
              className="text-[10px] md:text-xs text-white/80 truncate"
              style={{ opacity: 1 - i * 0.2 }}
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
        {/* Special Charge Bar */}
        <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4">
          <span className="text-xs md:text-sm font-bold text-amber-400">SPECIAL</span>
          <div className="flex-1 h-3 md:h-4 bg-black/50 rounded-full overflow-hidden border-2 border-amber-500/30">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${specialCharge}%`,
                background: specialCharge >= 100
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)'
                  : 'linear-gradient(90deg, #d97706, #f59e0b)',
                boxShadow: specialCharge >= 100 ? '0 0 20px #f59e0b' : 'none',
              }}
            />
          </div>
          <span className="text-xs md:text-sm font-bold text-amber-400">{specialCharge}%</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          <ActionButton
            label="Attack"
            subLabel="A / J"
            color="#3b82f6"
            onClick={() => playerAction('attack')}
            disabled={!canAct || gameOver || countdown !== null}
          />
          <ActionButton
            label="Heavy"
            subLabel="S / K"
            color="#ef4444"
            onClick={() => playerAction('heavy')}
            disabled={!canAct || gameOver || countdown !== null}
          />
          <ActionButton
            label="Block"
            subLabel="D / L"
            color="#22c55e"
            onClick={() => playerAction('block')}
            disabled={!canAct || gameOver || countdown !== null}
          />
          <ActionButton
            label="Special"
            subLabel="F / Space"
            color="#f59e0b"
            onClick={() => playerAction('special')}
            disabled={!canAct || gameOver || countdown !== null || specialCharge < 100}
            glowing={specialCharge >= 100}
          />
        </div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  label: string;
  subLabel: string;
  color: string;
  onClick: () => void;
  disabled: boolean;
  glowing?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  subLabel,
  color,
  onClick,
  disabled,
  glowing,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative py-3 md:py-4 px-2 md:px-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
    }`}
    style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
      boxShadow: glowing ? `0 0 30px ${color}, 0 0 60px ${color}50` : `0 4px 20px ${color}40`,
    }}
  >
    <div className="text-sm md:text-lg">{label}</div>
    <div className="text-[9px] md:text-xs opacity-70 hidden md:block">{subLabel}</div>
    {glowing && (
      <div
        className="absolute inset-0 rounded-xl animate-pulse"
        style={{ border: `2px solid ${color}`, boxShadow: `inset 0 0 20px ${color}50` }}
      />
    )}
  </button>
);
