import React, { useState, useEffect, useRef } from 'react';
import { GameState, Round, Player, ScoringMode } from '../types';
import { Plus, ArrowLeft, RotateCcw, Sparkles, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import NumericKeypad from './NumericKeypad';
import { generateGameCommentary } from '../services/geminiService';

interface ScoreboardProps {
  gameState: GameState;
  onUpdateRound: (rounds: Round[]) => void;
  onReset: () => void;
  onGameFinished: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ gameState, onUpdateRound, onReset, onGameFinished }) => {
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [editingCell, setEditingCell] = useState<{ roundIndex: number; playerId: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [commentary, setCommentary] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Calculate totals whenever rounds change
  useEffect(() => {
    const newTotals: Record<string, number> = {};
    gameState.players.forEach(p => newTotals[p.id] = 0);
    
    gameState.rounds.forEach(round => {
      Object.entries(round.scores).forEach(([pid, score]) => {
        if (newTotals[pid] !== undefined) {
          newTotals[pid] += (score as number);
        }
      });
    });
    setTotals(newTotals);
  }, [gameState.rounds, gameState.players]);

  // Scroll to bottom when a new round is added
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameState.rounds.length]);

  const handleAddRound = () => {
    if (gameState.targetRounds && gameState.rounds.length >= gameState.targetRounds) {
        return; // Limit reached
    }

    const newRound: Round = {
      id: crypto.randomUUID(),
      scores: {},
    };
    onUpdateRound([...gameState.rounds, newRound]);
    
    // Auto-focus first player of the new round
    if (gameState.players.length > 0) {
        setTimeout(() => {
            setEditingCell({ roundIndex: gameState.rounds.length, playerId: gameState.players[0].id });
            setInputValue('');
        }, 100);
    }
  };

  const handleCellClick = (roundIndex: number, playerId: string, currentScore: number | undefined) => {
    setEditingCell({ roundIndex, playerId });
    setInputValue(currentScore !== undefined ? currentScore.toString() : '');
  };

  const handleKeypadInput = (val: string) => {
    setInputValue(prev => {
        if (val === '-' && prev.length === 0) return val;
        if (val === '-' && prev.length > 0) return prev; // prevent double minus
        return prev + val;
    });
  };

  const handleKeypadDelete = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleKeypadSubmit = () => {
    if (editingCell) {
      const { roundIndex, playerId } = editingCell;
      const newRounds = [...gameState.rounds];
      
      const val = inputValue === '' || inputValue === '-' ? 0 : parseInt(inputValue, 10);
      
      if (!newRounds[roundIndex]) {
          return;
      }

      newRounds[roundIndex] = {
        ...newRounds[roundIndex],
        scores: {
          ...newRounds[roundIndex].scores,
          [playerId]: val
        }
      };

      onUpdateRound(newRounds);
      
      // Check for game end condition
      const isLastRound = gameState.targetRounds && (roundIndex + 1) === gameState.targetRounds;
      const allPlayersScoredInThisRound = gameState.players.every(p => {
          if (p.id === playerId) return true; // We just updated this one
          return newRounds[roundIndex].scores[p.id] !== undefined;
      });

      if (isLastRound && allPlayersScoredInThisRound) {
          // Allow the render cycle to update totals before finishing
          setEditingCell(null);
          setTimeout(() => {
             onGameFinished();
          }, 500);
          return;
      }

      // Auto-advance logic
      const currentPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
      if (currentPlayerIndex < gameState.players.length - 1) {
          // Next player same round
          const nextPlayer = gameState.players[currentPlayerIndex + 1];
          setEditingCell({ roundIndex, playerId: nextPlayer.id });
          const existingNextScore = newRounds[roundIndex].scores[nextPlayer.id];
          setInputValue(existingNextScore !== undefined ? existingNextScore.toString() : '');
      } else {
          // Finished round
          setEditingCell(null);
          // Optional: Automatically add next round if not at limit
          if (!gameState.targetRounds || gameState.rounds.length < gameState.targetRounds) {
              // We could auto-add round here, but button is better for control
          }
      }
    }
  };

  const getAICommentary = async () => {
    setIsLoadingAi(true);
    setCommentary(null);
    const text = await generateGameCommentary(gameState);
    setCommentary(text);
    setIsLoadingAi(false);
    setIsMenuOpen(false);
  };

  const sortedPlayers = [...gameState.players].sort((a, b) => {
     // Optional: Sort by score
     return 0; 
  });

  const formatScore = (score: number) => {
    if (score === undefined) return '0'; 
    if (gameState.scoringMode === ScoringMode.PAR) {
        if (score === 0) return 'E';
        if (score > 0) return `+${score}`;
        return score.toString();
    }
    return score.toString();
  };

  const getScoreColor = (score: number) => {
    if (gameState.scoringMode === ScoringMode.PAR) {
        if (score === 0) return 'text-slate-400';
        if (score < 0) return 'text-red-500 font-bold';
        return 'text-slate-800';
    }
    return 'text-slate-800';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 sticky top-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onReset} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <ArrowLeft />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-slate-800 text-lg">{gameState.gameName}</h1>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                {gameState.targetRounds ? (
                    <>
                    <Flag size={10} />
                    {gameState.rounds.length} / {gameState.targetRounds}
                    </>
                ) : (
                    <>{gameState.rounds.length} Kol</>
                )}
                 • {gameState.scoringMode === ScoringMode.PAR ? 'Par +/-' : 'Body'}
            </p>
          </div>
          <div className="relative">
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -mr-2 text-slate-600 bg-slate-100 rounded-full">
                {isMenuOpen ? <ChevronUp size={20}/> : <ChevronDown size={20} />}
             </button>
             {isMenuOpen && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-fade-in z-50">
                     <button onClick={getAICommentary} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-purple-50 text-purple-600 font-medium text-sm transition-colors text-left">
                        <Sparkles size={16} />
                        AI Komentář
                     </button>
                     <button onClick={onReset} className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-red-50 text-red-600 font-medium text-sm transition-colors text-left">
                        <RotateCcw size={16} />
                        Ukončit hru
                     </button>
                 </div>
             )}
          </div>
        </div>
        
        {/* Total Scores Bar (Sticky under header) */}
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-3 gap-3 border-b border-slate-100">
          {sortedPlayers.map(player => (
            <div key={player.id} className="flex flex-col items-center min-w-[64px]">
              <div className={`w-8 h-8 rounded-full ${player.color} flex items-center justify-center text-xs text-white font-bold mb-1 ring-2 ring-white shadow-sm`}>
                {player.name.substring(0, 1).toUpperCase()}
              </div>
              <span className={`text-lg font-bold font-mono ${getScoreColor(totals[player.id] ?? 0)}`}>
                  {formatScore(totals[player.id] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* AI Commentary Bubble */}
      {isLoadingAi && (
          <div className="mx-4 mt-4 p-4 bg-purple-50 rounded-xl flex items-center gap-3 animate-pulse border border-purple-100">
              <Sparkles className="text-purple-500 animate-spin-slow" size={20} />
              <p className="text-sm text-purple-700 font-medium">AI analyzuje hru...</p>
          </div>
      )}
      {commentary && (
           <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg relative animate-fade-in-up">
               <button onClick={() => setCommentary(null)} className="absolute top-2 right-2 text-white/50 hover:text-white">
                   <ChevronUp size={16} />
               </button>
               <div className="flex gap-3">
                   <div className="bg-white/20 p-2 rounded-lg h-fit">
                        <Sparkles className="text-white" size={20} />
                   </div>
                   <div>
                       <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">AI Komentátor</h4>
                       <p className="text-white text-sm leading-relaxed">{commentary}</p>
                   </div>
               </div>
           </div>
      )}

      {/* Score Grid */}
      <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
        <div className="min-w-full inline-block align-middle p-4">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="divide-x divide-slate-100">
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-12 text-center sticky left-0 bg-slate-50 z-0">
                  #
                </th>
                {sortedPlayers.map(player => (
                  <th key={player.id} className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[80px]">
                    <div className="flex flex-col items-center">
                        <span className="truncate max-w-[80px]">{player.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {gameState.rounds.map((round, index) => (
                <tr key={round.id} className="divide-x divide-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-bold text-slate-300 text-center sticky left-0 bg-white border-r border-slate-100">
                    {index + 1}
                  </td>
                  {sortedPlayers.map(player => {
                      const score = round.scores[player.id];
                      return (
                        <td 
                            key={player.id} 
                            onClick={() => handleCellClick(index, player.id, score)}
                            className={`px-2 py-4 whitespace-nowrap text-center cursor-pointer active:bg-blue-50 transition-colors relative ${score === undefined ? 'bg-slate-50/50' : ''}`}
                        >
                            {score !== undefined ? (
                                <span className={`text-lg font-mono font-medium ${getScoreColor(score)}`}>
                                    {formatScore(score)}
                                </span>
                            ) : (
                                <span className="inline-block w-full h-6 border-b-2 border-slate-200 border-dotted"></span>
                            )}
                        </td>
                      );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div ref={bottomRef} className="h-24"></div>
        </div>
      </div>

      {/* Floating Action Button */}
      {(!gameState.targetRounds || gameState.rounds.length < gameState.targetRounds) && (
          <div className="absolute bottom-6 right-6">
            <button
              onClick={handleAddRound}
              className="w-14 h-14 bg-slate-900 rounded-2xl shadow-lg shadow-slate-400 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={28} />
            </button>
          </div>
      )}

      {/* Input Modal */}
      {editingCell && (
        <NumericKeypad
          onInput={handleKeypadInput}
          onDelete={handleKeypadDelete}
          onSubmit={handleKeypadSubmit}
          onClose={() => setEditingCell(null)}
          currentPlayerName={gameState.players.find(p => p.id === editingCell.playerId)?.name || ''}
          currentValue={inputValue}
        />
      )}
    </div>
  );
};

export default Scoreboard;