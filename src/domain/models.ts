export interface User {
  id: string;
  email: string;
  pseudo: string;
  score: number;
}

export type GameState = 'IDLE' | 'STARTING' | 'PLAYING' | 'GAME_OVER' | 'WIN';
