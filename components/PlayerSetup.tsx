import React, { useState } from 'react';
import { Player, AVATAR_COLORS, ScoringMode } from '../types';
import { Plus, X, Users, Play, Trophy, MapPin, Search, Hash, Activity, Clock, History } from 'lucide-react';
import { CZECH_DISCGOLF_COURSES } from '../services/courseData';

interface PlayerSetupProps {
  onStartGame: (players: Player[], gameName: string, scoringMode: ScoringMode, targetRounds: number | null) => void;
  onShowHistory: () => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame, onShowHistory }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [gameName, setGameName] = useState('Večerní Hra');
  const [scoringMode, setScoringMode] = useState<ScoringMode>(ScoringMode.POINTS);
  const [targetRounds, setTargetRounds] = useState<string>(''); // Empty string = infinite
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  const addPlayer = () => {
    if (!newName.trim()) return;
    
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: randomColor,
    };

    setPlayers([...players, newPlayer]);
    setNewName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleStart = () => {
    if (players.length > 0) {
      const rounds = targetRounds === '' || parseInt(targetRounds) <= 0 ? null : parseInt(targetRounds);
      onStartGame(players, gameName, scoringMode, rounds);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPlayer();
    }
  };

  const selectCourse = (course: string) => {
    setGameName(course);
    setScoringMode(ScoringMode.PAR); 
    setTargetRounds('18'); // Default to 18 holes for discgolf
    setShowCourseSelector(false);
  };

  const filteredCourses = CZECH_DISCGOLF_COURSES.filter(course => 
    course.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="p-6 pb-0 flex justify-between items-start">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
                <Trophy className="text-primary w-8 h-8" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Nová Hra</h1>
                <p className="text-slate-500 text-sm">Nastavení</p>
            </div>
        </div>
        <button 
            onClick={onShowHistory}
            className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
            title="Historie her"
        >
            <History size={24} />
        </button>
      </div>

      <div className="p-6 space-y-6">
          {/* Game Name / Course Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-600">Název hry / Hřiště</label>
                <button 
                    onClick={() => setShowCourseSelector(!showCourseSelector)}
                    className="text-xs font-semibold text-primary flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                >
                    <MapPin size={12} />
                    {showCourseSelector ? 'Zavřít seznam' : 'Vybrat hřiště v ČR'}
                </button>
            </div>
            
            {!showCourseSelector ? (
                <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full p-4 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
                placeholder="Např. Ladronka, Prší, Scrabble..."
                />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                        <Search size={16} className="text-slate-400 ml-2" />
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-sm text-slate-700"
                            placeholder="Hledat hřiště..."
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <button
                                    key={course}
                                    onClick={() => selectCourse(course)}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                                >
                                    {course}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-slate-400 text-xs">
                                Žádné hřiště nenalezeno
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* Scoring Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Typ skórování</label>
            <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setScoringMode(ScoringMode.POINTS)}
                className={`py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  scoringMode === ScoringMode.POINTS 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Hash size={16} />
                Body
              </button>
              <button
                onClick={() => setScoringMode(ScoringMode.PAR)}
                className={`py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  scoringMode === ScoringMode.PAR 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Activity size={16} />
                +/- Par
              </button>
            </div>
          </div>

          {/* Target Rounds Input */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
                Počet jamek / kol <span className="text-slate-400 font-normal">(Volitelné)</span>
            </label>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="number"
                        inputMode="numeric"
                        value={targetRounds}
                        onChange={(e) => setTargetRounds(e.target.value)}
                        className="w-full p-4 pl-12 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        placeholder="∞ (Nekonečno)"
                    />
                </div>
                <button onClick={() => setTargetRounds('9')} className="px-4 py-4 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">9</button>
                <button onClick={() => setTargetRounds('18')} className="px-4 py-4 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">18</button>
            </div>
             <p className="text-xs text-slate-400 mt-2">
              Hra se automaticky ukončí a uloží po dosažení tohoto počtu kol.
            </p>
          </div>

          {/* Players Input */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Hráči ({players.length})</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 p-4 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                placeholder="Jméno hráče"
              />
              <button
                onClick={addPlayer}
                disabled={!newName.trim()}
                className="p-4 bg-primary text-white rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
      </div>

      <div className="flex-1 px-6 pb-24 overflow-y-auto no-scrollbar">
        {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <Users size={24} className="mb-1 opacity-50"/>
                <p className="text-sm">Zatím žádní hráči</p>
            </div>
        ) : (
            <div className="space-y-3">
            {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${player.color} flex items-center justify-center text-white font-bold`}>
                        {player.name.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700">{player.name}</span>
                    </div>
                    <button 
                        onClick={() => removePlayer(player.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            ))}
            </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleStart}
          disabled={players.length < 1}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-300 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Play size={20} fill="currentColor" />
          Začít hru
        </button>
      </div>
    </div>
  );
};

export default PlayerSetup;