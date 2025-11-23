import React from 'react';
import { Delete, Check } from 'lucide-react';

interface NumericKeypadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onClose: () => void;
  currentPlayerName: string;
  currentValue: string;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ 
  onInput, 
  onDelete, 
  onSubmit, 
  onClose,
  currentPlayerName,
  currentValue
}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end animate-fade-in">
      <div className="bg-white rounded-t-2xl shadow-2xl overflow-hidden pb-6">
        {/* Header Display */}
        <div className="bg-slate-100 p-4 flex justify-between items-center border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Zadat skóre pro</p>
            <h3 className="text-xl font-bold text-slate-800">{currentPlayerName}</h3>
          </div>
          <div className="text-3xl font-mono font-bold text-primary min-w-[80px] text-right">
            {currentValue || <span className="text-slate-300">0</span>}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => onInput(key)}
              className="h-16 rounded-lg bg-white shadow-sm border border-slate-200 text-2xl font-semibold text-slate-700 active:bg-slate-100 active:scale-95 transition-transform touch-manipulation"
            >
              {key}
            </button>
          ))}
          <button
            onClick={onDelete}
            className="h-16 rounded-lg bg-red-50 shadow-sm border border-red-100 text-red-600 flex items-center justify-center active:bg-red-100 active:scale-95 transition-transform"
          >
            <Delete size={28} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-2">
          <button
            onClick={onClose}
            className="py-4 rounded-xl font-bold text-slate-600 bg-slate-200 active:bg-slate-300 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={onSubmit}
            className="py-4 rounded-xl font-bold text-white bg-primary flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:bg-blue-600 transition-colors"
          >
            <Check size={24} />
            Potvrdit
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumericKeypad;