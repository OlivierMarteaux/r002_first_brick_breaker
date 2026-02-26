import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, RotateCcw, Home } from 'lucide-react';

interface GameScreenProps {
  speed: number;
  onGameOver: (time: number) => void;
  onWin: (time: number) => void;
  onBack: () => void;
  gameTime: number;
  startTime: () => void;
  stopTime: () => number;
}

export function GameScreen({ speed, onGameOver, onWin, onBack, gameTime, startTime, stopTime }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START_DIALOG' | 'PLAYING' | 'GAME_OVER' | 'WIN'>('START_DIALOG');
  const [finalTime, setFinalTime] = useState(0);

  // Game Constants
  const PADDLE_WIDTH = 120;
  const PADDLE_HEIGHT = 15;
  const BALL_RADIUS = 8;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 8;
  //const BRICK_ROWS = 1;
  //const BRICK_COLS = 1;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 4;

  // Game Refs
  const paddleX = useRef(0);
  const ballPos = useRef({ x: 0, y: 0 });
  const ballVel = useRef({ dx: 0, dy: 0 });
  const bricks = useRef<{ x: number, y: number, active: boolean }[]>([]);
  const requestRef = useRef<number>(0);

  const initGame = (canvas: HTMLCanvasElement) => {
    paddleX.current = (canvas.width - PADDLE_WIDTH) / 2;
    ballPos.current = { x: canvas.width / 2, y: canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 5 };
    
    // Speed scaling
    const baseSpeed = 2 + (speed * 1);
    ballVel.current = { dx: baseSpeed, dy: -baseSpeed };

    const brickWidth = (canvas.width - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
    const newBricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        newBricks.push({
          x: c * (brickWidth + BRICK_PADDING) + BRICK_PADDING,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + 60,
          active: true
        });
      }
    }
    bricks.current = newBricks;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive canvas
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      if (gameState === 'START_DIALOG') initGame(canvas);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleTouch = (e: TouchEvent) => {
      if (gameState !== 'PLAYING') return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      paddleX.current = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));
    };

    const handleMouse = (e: MouseEvent) => {
      if (gameState !== 'PLAYING') return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      paddleX.current = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));
    };

    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('mousemove', handleMouse);

    const update = () => {
      if (gameState !== 'PLAYING') return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Bricks
      let activeBricks = 0;
      bricks.current.forEach(brick => {
        if (!brick.active) return;
        activeBricks++;
        ctx.fillStyle = '#10b981'; // emerald-500
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, (canvas.width - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS, BRICK_HEIGHT, 4);
        ctx.fill();

        // Collision detection
        const brickWidth = (canvas.width - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
        if (
          ballPos.current.x + BALL_RADIUS > brick.x &&
          ballPos.current.x - BALL_RADIUS < brick.x + brickWidth &&
          ballPos.current.y + BALL_RADIUS > brick.y &&
          ballPos.current.y - BALL_RADIUS < brick.y + BRICK_HEIGHT
        ) {
          ballVel.current.dy = -ballVel.current.dy;
          brick.active = false;
        }
      });

      if (activeBricks === 0) {
        const time = stopTime();
        const playerTime = gameTime;
        setFinalTime(playerTime);
        setGameState('WIN');
        return;
      }

      // Draw Paddle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(paddleX.current, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
      ctx.fill();

      // Draw Ball
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Ball Movement
      ballPos.current.x += ballVel.current.dx;
      ballPos.current.y += ballVel.current.dy;

      // Wall Collisions
      if (ballPos.current.x + BALL_RADIUS > canvas.width || ballPos.current.x - BALL_RADIUS < 0) {
        ballVel.current.dx = -ballVel.current.dx;
      }
      if (ballPos.current.y - BALL_RADIUS < 0) {
        ballVel.current.dy = -ballVel.current.dy;
      }

      // Paddle Collision
      if (
        ballPos.current.y + BALL_RADIUS > canvas.height - PADDLE_HEIGHT - 10 &&
        ballPos.current.x > paddleX.current &&
        ballPos.current.x < paddleX.current + PADDLE_WIDTH
      ) {
        ballVel.current.dy = -Math.abs(ballVel.current.dy);
        // Add some angle based on where it hit the paddle
        const hitPoint = (ballPos.current.x - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ballVel.current.dx = hitPoint * (2 + speed * 0.5);
      }

      // Game Over
      if (ballPos.current.y + BALL_RADIUS > canvas.height) {
        const time = stopTime();
        setFinalTime(time);
        setGameState('GAME_OVER');
        return;
      }

      requestRef.current = requestAnimationFrame(update);
    };

    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('mousemove', handleMouse);
    };
  }, [gameState, speed]);

  const handleStart = () => {
    setGameState('PLAYING');
    startTime();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex justify-between items-center z-10">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400">
          <ArrowLeft size={24} />
        </button>
        <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 font-mono text-emerald-500 font-bold">
          {formatTime(gameTime)}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full touch-none" />
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {gameState === 'START_DIALOG' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm text-center"
            >
              <h2 className="text-2xl font-black mb-2">Ready?</h2>
              <p className="text-zinc-500 mb-8">Break all the bricks as fast as you can. Good luck!</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleStart}
                  className="w-full bg-emerald-500 text-zinc-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <Play size={20} fill="currentColor" />
                  Start Game
                </button>
                <button 
                  onClick={onBack}
                  className="w-full bg-zinc-800 text-white font-bold py-4 rounded-xl"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {(gameState === 'GAME_OVER' || gameState === 'WIN') && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm text-center"
            >
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 ${gameState === 'WIN' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {gameState === 'WIN' ? <RotateCcw size={40} className="text-zinc-950" /> : <RotateCcw size={40} className="text-zinc-950" />}
              </div>
              <h2 className="text-3xl font-black mb-2">{gameState === 'WIN' ? 'YOU WIN!' : 'GAME OVER'}</h2>
              <p className="text-zinc-500 mb-2">{ gameState === 'WIN' ? 'Your time: ' : ''}</p>
              <p className="text-4xl font-black text-emerald-500 mb-8">{ gameState === 'WIN' ? formatTime(gameTime) : ''}</p>
              
              <button 
                onClick={() => {
                  if (gameState === 'WIN' || gameState === 'GAME_OVER') {
                    onGameOver(finalTime);
                  }
                }}
                className="w-full bg-white text-zinc-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-tight"
              >
                <Home size={20} />
                Return Home
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
