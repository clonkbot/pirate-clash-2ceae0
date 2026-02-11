import React, { useState, useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { AuthScreen } from './components/AuthScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { BattleArena } from './components/BattleArena';
import { Leaderboard } from './components/Leaderboard';
import { Character } from './components/Fighter';

type GameState = 'menu' | 'select' | 'battle' | 'result';

interface BattleResult {
  outcome: 'win' | 'loss';
  playerHealth: number;
  opponentHealth: number;
  opponentCharacter: Character;
  newStreak: number;
  isNewRecord: boolean;
}

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const playerStats = useQuery(api.players.getMyStats);
  const getOrCreatePlayer = useMutation(api.players.getOrCreatePlayer);
  const recordMatch = useMutation(api.players.recordMatch);
  const updateUsername = useMutation(api.players.updateUsername);

  // Initialize player on first load
  useEffect(() => {
    if (isAuthenticated && playerStats === null) {
      getOrCreatePlayer({ username: 'Pirate' });
    }
  }, [isAuthenticated, playerStats, getOrCreatePlayer]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4">⚓</div>
          <div className="text-white/60 text-lg">Sailing to the Grand Line...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setGameState('battle');
  };

  const handleBattleEnd = async (
    result: 'win' | 'loss',
    playerHealth: number,
    opponentHealth: number,
    opponentCharacter: Character
  ) => {
    if (!selectedCharacter) return;

    const matchResult = await recordMatch({
      playerCharacter: selectedCharacter.id,
      opponentCharacter: opponentCharacter.id,
      playerHealth,
      opponentHealth,
      result,
    });

    const previousHighest = playerStats?.highestStreak || 0;

    setBattleResult({
      outcome: result,
      playerHealth,
      opponentHealth,
      opponentCharacter,
      newStreak: matchResult.newStreak,
      isNewRecord: matchResult.newHighest > previousHighest,
    });
    setGameState('result');
  };

  const handlePlayAgain = () => {
    setBattleResult(null);
    setGameState('select');
  };

  const handleBackToMenu = () => {
    setBattleResult(null);
    setSelectedCharacter(null);
    setGameState('menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float opacity-20"
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7'][i % 5]
              } 0%, transparent 70%)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <button
          onClick={handleBackToMenu}
          className="flex items-center gap-2 text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 hover:scale-105 transition-transform"
        >
          <span className="text-2xl md:text-3xl">⚔️</span>
          <span className="hidden sm:inline">PIRATE CLASH</span>
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          {playerStats && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="px-3 py-1 bg-amber-500/20 rounded-lg border border-amber-500/30">
                🔥 Streak: <span className="font-bold text-amber-400">{playerStats.currentStreak}</span>
              </div>
              <div className="px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
                🏆 Best: <span className="font-bold text-purple-400">{playerStats.highestStreak}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-20">
        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="max-w-4xl mx-auto pt-8 md:pt-16">
            {/* Title */}
            <div className="text-center mb-8 md:mb-12">
              <div className="text-6xl md:text-9xl mb-4 animate-bounce-slow">⚔️</div>
              <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 tracking-tight mb-4">
                PIRATE CLASH
              </h1>
              <p className="text-white/60 text-lg md:text-xl">One Piece Fighting Arena</p>
            </div>

            {/* Player Stats Card */}
            {playerStats && (
              <div className="max-w-sm mx-auto mb-8 p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-2xl md:text-3xl">
                    🏴‍☠️
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      defaultValue={playerStats.username}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value !== playerStats.username) {
                          updateUsername({ username: e.target.value });
                        }
                      }}
                      className="bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-white/30 focus:border-amber-500 focus:outline-none w-full"
                      maxLength={20}
                    />
                    <div className="text-xs text-white/50">Click to edit name</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <div className="text-2xl font-black text-green-400">{playerStats.totalWins}</div>
                    <div className="text-xs text-white/60">Victories</div>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <div className="text-2xl font-black text-red-400">{playerStats.totalLosses}</div>
                    <div className="text-xs text-white/60">Defeats</div>
                  </div>
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <div className="text-2xl font-black text-amber-400">🔥 {playerStats.currentStreak}</div>
                    <div className="text-xs text-white/60">Current Streak</div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <div className="text-2xl font-black text-purple-400">🏆 {playerStats.highestStreak}</div>
                    <div className="text-xs text-white/60">Best Streak</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 mb-12">
              <button
                onClick={() => setGameState('select')}
                className="w-full max-w-xs py-4 md:py-5 bg-gradient-to-r from-amber-500 to-red-500 rounded-2xl font-black text-xl md:text-2xl text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 active:scale-95"
              >
                ⚔️ FIGHT!
              </button>
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="w-full max-w-xs py-3 md:py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-lg transition-all border border-white/20"
              >
                🏆 {showLeaderboard ? 'Hide' : 'View'} Leaderboard
              </button>
            </div>

            {/* Leaderboard */}
            {showLeaderboard && (
              <div className="animate-fade-in">
                <Leaderboard />
              </div>
            )}
          </div>
        )}

        {/* Character Select Screen */}
        {gameState === 'select' && (
          <div className="pt-4 md:pt-8 animate-fade-in">
            <button
              onClick={handleBackToMenu}
              className="mb-4 md:mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              ← Back to Menu
            </button>
            <CharacterSelect onSelect={handleCharacterSelect} selectedId={selectedCharacter?.id} />
          </div>
        )}

        {/* Battle Screen */}
        {gameState === 'battle' && selectedCharacter && (
          <div className="pt-2 md:pt-4 animate-fade-in">
            <BattleArena
              playerCharacter={selectedCharacter}
              onBattleEnd={handleBattleEnd}
              currentStreak={playerStats?.currentStreak || 0}
            />
          </div>
        )}

        {/* Result Screen */}
        {gameState === 'result' && battleResult && selectedCharacter && (
          <div className="pt-8 md:pt-16 animate-fade-in">
            <div className="max-w-lg mx-auto text-center">
              {/* Result Banner */}
              <div
                className={`text-6xl md:text-9xl mb-4 ${
                  battleResult.outcome === 'win' ? 'animate-bounce' : 'animate-shake'
                }`}
              >
                {battleResult.outcome === 'win' ? '🏆' : '💀'}
              </div>

              <h2
                className={`text-4xl md:text-6xl font-black mb-4 ${
                  battleResult.outcome === 'win'
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300'
                    : 'text-red-500'
                }`}
              >
                {battleResult.outcome === 'win' ? 'VICTORY!' : 'DEFEATED'}
              </h2>

              {/* Battle Summary */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="text-3xl mb-1">{selectedCharacter.avatar}</div>
                  <div className="text-sm text-white/60">{selectedCharacter.name}</div>
                  <div className="font-bold text-green-400">{battleResult.playerHealth} HP</div>
                </div>
                <div className="flex items-center text-2xl text-white/40">VS</div>
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="text-3xl mb-1">{battleResult.opponentCharacter.avatar}</div>
                  <div className="text-sm text-white/60">{battleResult.opponentCharacter.name}</div>
                  <div className="font-bold text-red-400">{battleResult.opponentHealth} HP</div>
                </div>
              </div>

              {/* Streak Info */}
              <div className="mb-8">
                {battleResult.outcome === 'win' ? (
                  <div className="text-xl md:text-2xl">
                    <span className="text-amber-400 font-bold">🔥 {battleResult.newStreak} Win Streak!</span>
                    {battleResult.isNewRecord && (
                      <div className="mt-2 text-lg text-purple-400 animate-pulse">
                        ✨ NEW PERSONAL RECORD! ✨
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-lg text-white/60">Streak reset. Don't give up!</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handlePlayAgain}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30"
                >
                  🔄 Fight Again
                </button>
                <button
                  onClick={handleBackToMenu}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-lg transition-all border border-white/20"
                >
                  🏠 Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 py-3 text-center text-white/40 text-xs bg-gradient-to-t from-slate-900 to-transparent">
        Requested by @plantingtoearn · Built by @clonkbot
      </footer>
    </div>
  );
}

export default App;
