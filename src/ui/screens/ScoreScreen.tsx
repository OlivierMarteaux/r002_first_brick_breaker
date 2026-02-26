import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { User } from '../../domain/models';

interface ScoreScreenProps {
  scores: User[];
  onBack: () => void;
  onRefresh: () => void;
}

export function ScoreScreen({ scores, onBack, onRefresh }: ScoreScreenProps) {
  useEffect(() => {
    onRefresh();
  }, []);

  const formatTime = (ms: number) => {
    if (ms === 999999) return "---";
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-white">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Trophy size={20} className="text-emerald-500" />
          Leaderboard
        </h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-3">
          {scores.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">
              <Trophy size={48} className="mx-auto mb-4 opacity-20" />
              <p>No scores yet. Be the first!</p>
            </div>
          ) : (
            scores.map((user, index) => (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                key={user.id}
                className={`flex items-center justify-between p-5 rounded-2xl border ${
                  index === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                    index === 0 ? 'bg-emerald-500 text-zinc-950' : 
                    index === 1 ? 'bg-zinc-400 text-zinc-950' :
                    index === 2 ? 'bg-amber-600 text-zinc-950' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold">{user.pseudo}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Player</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-black text-lg ${index === 0 ? 'text-emerald-500' : 'text-white'}`}>
                    {formatTime(user.score)}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Time</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
