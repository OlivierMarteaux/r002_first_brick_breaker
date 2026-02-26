import { useState } from 'react';
import { useGameViewModel } from './ui/viewmodels/useGameViewModel';
import { AuthScreen } from './ui/screens/AuthScreen';
import { HomeScreen } from './ui/screens/HomeScreen';
import { GameScreen } from './ui/screens/GameScreen';
import { ScoreScreen } from './ui/screens/ScoreScreen';
import { Loader2 } from 'lucide-react';

type Screen = 'HOME' | 'GAME' | 'SCORES';

export default function App() {
  const vm = useGameViewModel();
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');

  if (vm.isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!vm.currentUser) {
    return <AuthScreen onGuestLogin={vm.loginAsGuest} />;
  }

  const handleGameOver = async (time: number) => {
    setCurrentScreen('HOME');
  };

  const handleWin = async (time: number) => {
    await vm.updateScore(time);
    setCurrentScreen('HOME');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
      {currentScreen === 'HOME' && (
        <HomeScreen
          speed={vm.speed}
          onSpeedChange={vm.updateSpeed}
          onStartGame={() => setCurrentScreen('GAME')}
          onViewScores={() => setCurrentScreen('SCORES')}
          onLogout={vm.logout}
          pseudo={vm.currentUser.pseudo}
        />
      )}

      {currentScreen === 'GAME' && (
        <GameScreen
          speed={vm.speed}
          onGameOver={handleGameOver}
          onWin={handleWin}
          onBack={() => setCurrentScreen('HOME')}
          gameTime={vm.gameTime}
          startTime={vm.startTime}
          stopTime={vm.stopTime}
        />
      )}

      {currentScreen === 'SCORES' && (
        <ScoreScreen
          scores={vm.scores}
          onBack={() => setCurrentScreen('HOME')}
          onRefresh={vm.getAllScores}
        />
      )}
    </div>
  );
}
