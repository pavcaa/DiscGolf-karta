import React from 'react';
import { GameHistoryItem, ScoringMode } from '../types';
import { ArrowLeft, Calendar, Trophy, Trash2 } from 'lucide-react';
import { clearHistory } from '../services/historyService';

interface HistoryViewProps {
  history: GameHistoryItem[];
  onBack: () => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack, onClear }) => {
  
  const formatDate = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleClear = () => {
      if (window.confirm("Opravdu chcete smazat celou historii?")) {
          clearHistory();
          onClear();
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                <ArrowLeft />
            </button>
            <h1 className="font-bold text-slate-800 text-lg">Historie Her</h1>
          </div>
          {history.length > 0 && (
              <button onClick={handleClear} className="text-red-500 p-2 hover:bg-red-50 rounded-full">
                  <Trash2 size={20} />
              </button>
          )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p>Žádné odehrané hry</p>
            </div>
        ) : (
            history.map((game) => {
                // Determine winner based on scoring mode
                // PAR mode: Lower score wins
                // POINTS mode: Higher score wins
                const sortedPlayers = [...game.players].sort((a, b) => {
                    if (game.scoringMode === ScoringMode.PAR) {
                        return a.score - b.score;
                    }
                    return b.score - a.score;
                });

                const winner = sortedPlayers[0];

                if (!winner) return null;

                return (
                    <div key={game.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800">{game.gameName}</h3>
                                <p className="text-xs text-slate-400">{formatDate(game.date)}</p>
                            </div>
                            <div className="bg-slate-100 px-2 py-1 rounded-md text-xs font-mono text-slate-500">
                                {game.scoringMode === ScoringMode.PAR ? 'DiscGolf' : 'Body'}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-yellow-500" />
                                <span className="text-sm font-medium text-slate-700">{winner.name}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                                {game.scoringMode === ScoringMode.PAR && winner.score > 0 ? '+' : ''}{winner.score}
                            </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between text-xs text-slate-400">
                             <span>{game.totalRounds} kol</span>
                             <span>{game.players.length} hráčů</span>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default HistoryView;