import { useState, useEffect, useCallback } from 'react';
import { auth, isConfigured } from '../../data/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '../../domain/models';
import { userRepository } from '../../data/UserRepository';

export function useGameViewModel() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [speed, setSpeed] = useState(5);
  const [scores, setScores] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Game State
  const [gameTime, setGameTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!isConfigured || !auth) {
      // Check for local guest session
      const savedGuest = localStorage.getItem('guest_user');
      if (savedGuest) {
        setCurrentUser(JSON.parse(savedGuest));
      }
      setIsLoading(false);
      return;
    }

    /* const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await fbUser.reload();
        const profile: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          pseudo: fbUser.displayName || fbUser.email?.split('@')[0] || 'Player',
          score: 0
        };
        setCurrentUser(profile);
        //await userRepository.createUserProfile(profile);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    }); */
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      await fbUser.reload();

      let profile = await userRepository.getUserProfile(fbUser.uid);

      // 🔥 If profile doesn't exist yet, create it using displayName
      if (!profile) {
        const newProfile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          pseudo: fbUser.displayName || 'Player',
          score: 999999
        };

        await userRepository.createUserProfile(newProfile);

        // 🔥 IMPORTANT: fetch again AFTER creation
        profile = await userRepository.getUserProfile(fbUser.uid);
      }

      setCurrentUser(profile);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginAsGuest = (pseudo: string) => {
    const guest: User = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      email: 'guest@local.com',
      pseudo: pseudo || 'Guest Player',
      score: 0
    };
    setCurrentUser(guest);
    localStorage.setItem('guest_user', JSON.stringify(guest));
  };

  const logout = async () => {
    if (isConfigured && auth) {
      await auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('guest_user');
  };

  const updateSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const startTime = () => {
    setGameTime(0);
    setTimerActive(true);
  };

  const stopTime = () => {
    setTimerActive(false);
    return gameTime;
  };

  const updateScore = async (finalTime: number) => {
    if (currentUser) {
      await userRepository.updateScore(currentUser.id, gameTime);
      // Refresh scores
      const allScores = await userRepository.getAllScores();
      setScores(allScores);
    }
  };

  const getAllScores = useCallback(async () => {
    const allScores = await userRepository.getAllScores();
    setScores(allScores);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 10); // 10ms increments
      }, 10);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  return {
    currentUser,
    speed,
    scores,
    isLoading,
    gameTime,
    updateSpeed,
    startTime,
    stopTime,
    updateScore,
    getAllScores,
    loginAsGuest,
    logout
  };
}
