import React from 'react';
import { GameState, ScoringMode } from '../types';
import { Trophy, Home, Medal } from 'lucide-react';

interface GameSummaryProps {
  gameState: GameState;
  onBackToMenu: () => void;
}

const GameSummary: React.FC<GameSummaryProps> = ({ gameState, onBackToMenu }) => {
  
  // Calculate totals
  const totals: Record<string, number> = {};
  gameState.players.forEach(p => totals[p.id] = 0);
  
  gameState.rounds.forEach(round => {
    Object.entries(round.scores).forEach(([pid, score]) => {
      if (totals[pid] !== undefined) {
        totals[pid] += (score as number);
      }
    });
  });

  // Sort players
  // For PAR mode, usually lower is better? For Points, usually higher?
  // Let's assume Points = High wins, Par = Low wins (Golf logic)
  const sortedPlayers = [...gameState.players].sort((a, b) => {
      const scoreA = totals[a.id];
      const scoreB = totals[b.id];
      if (gameState.scoringMode === ScoringMode.PAR) {
          return scoreA - scoreB; // Ascending (Lower is better)
      }
      return scoreB - scoreA; // Descending (Higher is better)
  });

  const winner = sortedPlayers[0];

  const formatScore = (score: number) => {
    if (gameState.scoringMode === ScoringMode.PAR) {
        if (score === 0) return 'E';
        if (score > 0) return `+${score}`;
        return score.toString();
    }
    return score.toString();
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto animate-fade-in">
      <div className="flex-1 p-6 flex flex-col items-center">
        
        <div className="mt-8 mb-6 relative">
            <div className="absolute inset-0 bg-yellow-200 blur-xl opacity-50 rounded-full"></div>
            <Trophy size={80} className="text-yellow-500 relative z-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Hra dokončena!</h1>
        <p className="text-slate-500 mb-8">{gameState.gameName}</p>

        {/* Winner Card */}
        <div className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-2xl p-6 mb-8 text-center shadow-sm">
            <p className="text-yellow-600 font-bold uppercase tracking-wider text-xs mb-2">Vítěz</p>
            <div className={`w-16 h-16 rounded-full ${winner.color} flex items-center justify-center text-2xl text-white font-bold mx-auto mb-3 ring-4 ring-white shadow-md`}>
                {winner.name.substring(0, 1).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{winner.name}</h2>
            <p className="text-xl font-mono font-bold text-yellow-600 mt-1">
                {formatScore(totals[winner.id])}
            </p>
        </div>

        {/* Ranking Table */}
        <div className="w-full space-y-3">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider px-2">Výsledková listina</h3>
            {sortedPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold w-6 text-center ${index === 0 ? 'text-yellow-500' : 'text-slate-400'}`}>
                            {index + 1}.
                        </span>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${player.color} flex items-center justify-center text-white text-xs font-bold`}>
                                {player.name.substring(0, 1).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-700">{player.name}</span>
                        </div>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                        {formatScore(totals[player.id])}
                    </span>
                </div>
            ))}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <button
          onClick={onBackToMenu}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-300 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Home size={20} />
          Zpět do menu
        </button>
      </div>
    </div>
  );
};

export default GameSummary;