import { Gamepad2, Trophy, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../../data/firebase';

interface HomeScreenProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  onStartGame: () => void;
  onViewScores: () => void;
  onLogout: () => void;
  pseudo: string;
}

export function HomeScreen({ speed, onSpeedChange, onStartGame, onViewScores, onLogout, pseudo }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <div className="flex justify-between w-full items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Gamepad2 size={24} className="text-zinc-950" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Welcome back</p>
              <p className="font-bold text-lg">{pseudo}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="w-32 h-32 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
          <Gamepad2 size={64} className="text-emerald-500" />
        </div>

        <h1 className="text-4xl font-black mb-12 text-center tracking-tighter">
          BRICK<br/><span className="text-emerald-500">BREAKER</span>
        </h1>

        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Game Speed</span>
            <span className="text-2xl font-black text-emerald-500">{speed}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-600 uppercase">
            <span>Level 1</span>
            <span>Level 10</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full">
          <button
            onClick={onStartGame}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-lg uppercase tracking-tight"
          >
            Start New Game
          </button>
          
          <button
            onClick={onViewScores}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-5 rounded-2xl transition-all border border-zinc-800 flex items-center justify-center gap-3 uppercase tracking-tight"
          >
            <Trophy size={20} className="text-emerald-500" />
            Scores
          </button>
        </div>
      </motion.div>
    </div>
  );
}
