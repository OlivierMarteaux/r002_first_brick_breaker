import React, { useState } from 'react';
import { auth, isConfigured } from '../../data/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { LogIn, UserPlus, Gamepad2, UserCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  onGuestLogin: (pseudo: string) => void;
}

export function AuthScreen({ onGuestLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured || !auth) {
      setError('Firebase is not configured. Please use Guest Mode.');
      return;
    }
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: pseudo });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <Gamepad2 size={48} className="text-zinc-950" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Brick Breaker</h1>
          <p className="text-zinc-500 text-sm">Sign in to save your high scores</p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0" size={20} />
            <div className="text-xs text-amber-200/70 leading-relaxed">
              <p className="font-bold text-amber-500 mb-1 uppercase tracking-wider">Firebase Not Configured</p>
              Online features are disabled. Scores will be saved locally.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(!isLogin || !isConfigured) && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1 ml-1">Pseudo</label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Your gaming name"
                required={!isConfigured}
              />
            </div>
          )}
          
          {isConfigured && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}

          {isConfigured ? (
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGuestLogin(pseudo)}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              <UserCircle size={20} />
              Continue as Guest
            </button>
          )}
        </form>

        {isConfigured && (
          <div className="mt-8 text-center flex flex-col gap-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
            <div className="h-px bg-zinc-800 w-full" />
            <button
              onClick={() => onGuestLogin(pseudo)}
              className="text-emerald-500 hover:text-emerald-400 text-sm font-bold transition-colors"
            >
              Play as Guest instead
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
