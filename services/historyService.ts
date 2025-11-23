import { GameHistoryItem, GameState } from '../types';

const HISTORY_KEY = 'scorecard_history';

export const getHistory = (): GameHistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveGameToHistory = (gameState: GameState): void => {
  const totals: Record<string, number> = {};
  gameState.players.forEach(p => totals[p.id] = 0);
  
  gameState.rounds.forEach(round => {
    Object.entries(round.scores).forEach(([pid, score]) => {
      if (totals[pid] !== undefined) {
        totals[pid] += score;
      }
    });
  });

  const historyItem: GameHistoryItem = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    gameName: gameState.gameName || 'Hra bez názvu',
    scoringMode: gameState.scoringMode,
    totalRounds: gameState.rounds.length,
    players: gameState.players.map(p => ({
      name: p.name,
      color: p.color,
      score: totals[p.id] || 0
    })).sort((a, b) => {
        // Sort depends on mode, simpler to just save as is, but let's try to sort by score ascending for PAR logic or descending for points
        // For generic purposes, we will just map them here. Sorting can happen in view.
        return 0;
    })
  };

  const currentHistory = getHistory();
  const newHistory = [historyItem, ...currentHistory];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const clearHistory = (): void => {
    localStorage.removeItem(HISTORY_KEY);
};