import React, { useState, useEffect } from 'react';
import { GameState, Player, Round, AppView, ScoringMode, GameHistoryItem } from './types';
import PlayerSetup from './components/PlayerSetup';
import Scoreboard from './components/Scoreboard';
import GameSummary from './components/GameSummary';
import HistoryView from './components/HistoryView';
import { saveGameToHistory, getHistory } from './services/historyService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SETUP);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    rounds: [],
    isActive: false,
    gameName: '',
    scoringMode: ScoringMode.POINTS,
    targetRounds: null
  });
  const [history, setHistory] = useState<GameHistoryItem[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('scorecard_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (!parsed.scoringMode) parsed.scoringMode = ScoringMode.POINTS;
        if (parsed.isActive) {
            setGameState(parsed);
            setView(AppView.GAME);
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setHistory(getHistory());
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('scorecard_state', JSON.stringify(gameState));
  }, [gameState]);

  const startNewGame = (players: Player[], gameName: string, scoringMode: ScoringMode, targetRounds: number | null) => {
    setGameState({
      players,
      rounds: [],
      isActive: true,
      gameName,
      scoringMode,
      targetRounds
    });
    setView(AppView.GAME);
  };

  const updateRounds = (rounds: Round[]) => {
    setGameState(prev => ({ ...prev, rounds }));
  };

  const handleGameFinished = () => {
      saveGameToHistory(gameState);
      setHistory(getHistory()); // Refresh local history
      setView(AppView.SUMMARY);
      
      // Clear active game state from storage but keep it in memory for Summary view
      localStorage.removeItem('scorecard_state');
      setGameState(prev => ({ ...prev, isActive: false }));
  };

  const resetGame = () => {
    if (window.confirm("Opravdu chcete ukončit hru? Všechna data budou smazána.")) {
        setGameState({
            players: [],
            rounds: [],
            isActive: false,
            gameName: '',
            scoringMode: ScoringMode.POINTS,
            targetRounds: null
        });
        localStorage.removeItem('scorecard_state');
        setView(AppView.SETUP);
    }
  };

  const backToMenu = () => {
      setGameState({
        players: [],
        rounds: [],
        isActive: false,
        gameName: '',
        scoringMode: ScoringMode.POINTS,
        targetRounds: null
    });
    localStorage.removeItem('scorecard_state');
    setView(AppView.SETUP);
  };

  return (
    <div className="w-full h-full max-w-md mx-auto bg-white sm:shadow-2xl sm:rounded-3xl overflow-hidden relative border-x border-slate-100">
      {view === AppView.SETUP && (
        <PlayerSetup 
            onStartGame={startNewGame} 
            onShowHistory={() => setView(AppView.HISTORY)}
        />
      )}
      
      {view === AppView.GAME && (
        <Scoreboard 
            gameState={gameState} 
            onUpdateRound={updateRounds} 
            onReset={resetGame}
            onGameFinished={handleGameFinished}
        />
      )}

      {view === AppView.SUMMARY && (
          <GameSummary 
            gameState={gameState}
            onBackToMenu={backToMenu}
          />
      )}

      {view === AppView.HISTORY && (
          <HistoryView 
            history={history}
            onBack={() => setView(AppView.SETUP)}
            onClear={() => setHistory([])}
          />
      )}
    </div>
  );
};

export default App;