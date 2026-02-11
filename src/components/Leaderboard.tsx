import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface PlayerStats {
  _id: string;
  username: string;
  highestStreak: number;
  totalWins: number;
  totalLosses: number;
}

export const Leaderboard: React.FC = () => {
  const leaderboard = useQuery(api.players.getLeaderboard) as PlayerStats[] | undefined;

  if (!leaderboard) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin text-4xl">⚓</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-xl md:text-2xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
        🏆 TOP PIRATES
      </h3>

      {leaderboard.length === 0 ? (
        <div className="text-center text-white/60 py-4">No records yet. Be the first!</div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((player: PlayerStats, index: number) => (
            <div
              key={player._id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/20 border border-amber-500/50'
                  : index === 1
                  ? 'bg-gradient-to-r from-slate-400/30 to-slate-500/20 border border-slate-400/50'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-700/30 to-orange-800/20 border border-orange-700/50'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {/* Rank */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  index === 0
                    ? 'bg-amber-500 text-black'
                    : index === 1
                    ? 'bg-slate-400 text-black'
                    : index === 2
                    ? 'bg-orange-700 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {index + 1}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{player.username}</div>
                <div className="text-xs text-white/60">
                  {player.totalWins}W / {player.totalLosses}L
                </div>
              </div>

              {/* Streak */}
              <div className="text-right">
                <div className="text-lg font-black text-amber-400">🔥 {player.highestStreak}</div>
                <div className="text-[10px] text-white/50">Best Streak</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
