export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface ScoreEntry {
  playerId: string;
  value: number;
}

export interface Round {
  id: string;
  scores: Record<string, number>; // playerId -> score
}

export enum ScoringMode {
  POINTS = 'POINTS',
  PAR = 'PAR'
}

export interface GameState {
  players: Player[];
  rounds: Round[];
  isActive: boolean;
  gameName: string;
  scoringMode: ScoringMode;
  targetRounds: number | null; // null means infinite/manual end
}

export interface GameHistoryItem {
  id: string;
  date: string;
  gameName: string;
  scoringMode: ScoringMode;
  players: { name: string; score: number; color: string }[];
  totalRounds: number;
}

export enum AppView {
  SETUP = 'SETUP',
  GAME = 'GAME',
  SUMMARY = 'SUMMARY',
  HISTORY = 'HISTORY'
}

export const AVATAR_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];