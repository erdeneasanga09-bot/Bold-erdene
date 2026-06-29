import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Play, 
  Pause, 
  Radio, 
  Activity, 
  ShieldAlert, 
  Wrench, 
  Compass,
  Cpu,
  Volume2,
  VolumeX,
  Zap,
  Target,
  Sparkles,
  Gamepad
} from 'lucide-react';

interface PlayableGamesProps {
  gameTitle: string;
  onClose: () => void;
  isRedMode: boolean;
}

export default function PlayableGames({ gameTitle, onClose, isRedMode }: PlayableGamesProps) {
  return (
    <div className="w-full max-w-4xl mx-auto text-left animate-fadeIn flex flex-col gap-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <button 
          onClick={onClose}
          className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-all cursor-pointer group`}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Буцах / Back to Showcase</span>
        </button>
        <div className="flex items-center gap-2">
          <Gamepad className={`w-4 h-4 ${isRedMode ? 'text-red-500 animate-pulse' : 'text-yellow-500 animate-pulse'}`} />
          <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Bolderdene Arcade Engine v1.4</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-4xl sm:text-5xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
          {gameTitle}
        </h2>
        <p className="text-sm text-white/40 font-mono tracking-wide uppercase">
          Interactive Browser Emulator Mode
        </p>
      </div>

      {/* Embedded Game Screens */}
      {gameTitle === "Atmosphere: Zero" && <AtmosphereZeroGame isRedMode={isRedMode} />}
      {gameTitle === "Mirage City" && <MirageCityGame isRedMode={isRedMode} />}
      {gameTitle === "Silence of the Horizon" && <SilenceHorizonGame isRedMode={isRedMode} />}
    </div>
  );
}

// ==========================================
// GAME 1: ATMOSPHERE: ZERO (Radar sound puzzle)
// ==========================================
function AtmosphereZeroGame({ isRedMode }: { isRedMode: boolean }) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'victory' | 'gameover'>('idle');
  const [score, setScore] = useState(0); // Anomalies found
  const [battery, setBattery] = useState(100);
  const [sonarActive, setSonarActive] = useState(false);
  const [sonarRadius, setSonarRadius] = useState(0);
  
  // Probe coordinates (percentages, 0-100)
  const [probe, setProbe] = useState({ x: 50, y: 50 });
  const [anomaly, setAnomaly] = useState({ x: 30, y: 75 });
  const [anomalyHistory, setAnomalyHistory] = useState<{ x: number; y: number }[]>([]);
  const [distance, setDistance] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<AudioContext | null>(null);

  // Generate a new anomaly position, not too close to the probe
  const generateNewAnomaly = (currentProbe: { x: number; y: number }) => {
    let nx = 15 + Math.random() * 70;
    let ny = 15 + Math.random() * 70;
    // Ensure sufficient distance
    while (Math.hypot(nx - currentProbe.x, ny - currentProbe.y) < 25) {
      nx = 15 + Math.random() * 70;
      ny = 15 + Math.random() * 70;
    }
    setAnomaly({ x: nx, y: ny });
  };

  // Web Audio synth for ambient sonars
  const triggerBeep = (freq: number, duration: number, type: 'sine' | 'sawtooth' | 'triangle' = 'sine') => {
    try {
      if (!synthRef.current) {
        synthRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = synthRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored if browser blocks audio
    }
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBattery(100);
    setProbe({ x: 50, y: 50 });
    setAnomalyHistory([]);
    generateNewAnomaly({ x: 50, y: 50 });
  };

  // Handle key controls
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 2.5;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy = -step;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = step;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -step;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = step;
      
      if (e.key === ' ') {
        triggerSonar();
        e.preventDefault();
        return;
      }

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setProbe(prev => {
          const nx = Math.max(5, Math.min(95, prev.x + dx));
          const ny = Math.max(5, Math.min(95, prev.y + dy));
          return { x: nx, y: ny };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, anomaly]);

  // Update distance & trigger hot/cold sound cues
  useEffect(() => {
    if (gameState !== 'playing') return;
    const dist = Math.hypot(probe.x - anomaly.x, probe.y - anomaly.y);
    setDistance(dist);

    // If extremely close, lock/capture anomaly
    if (dist < 4.5) {
      triggerBeep(880, 0.4, 'triangle');
      triggerBeep(1200, 0.5, 'sine');
      setScore(prev => {
        const nextScore = prev + 1;
        if (nextScore >= 3) {
          setGameState('victory');
        } else {
          setAnomalyHistory(h => [...h, anomaly]);
          generateNewAnomaly(probe);
          setBattery(b => Math.min(100, b + 25)); // Battery reward
        }
        return nextScore;
      });
    }
  }, [probe, anomaly, gameState]);

  // Periodic acoustic signal cue (hot/cold guide)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      // Beep interval speed depends on closeness (hotter = faster beeps)
      const pitch = 300 + (100 - distance) * 5;
      triggerBeep(pitch, 0.15, 'sine');
    }, Math.max(150, Math.min(1500, distance * 12)));

    return () => clearInterval(interval);
  }, [distance, gameState]);

  // Drain battery over time
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setBattery(b => {
        if (b <= 1) {
          setGameState('gameover');
          return 0;
        }
        return b - 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [gameState]);

  // Trigger sonar pulse
  const triggerSonar = () => {
    if (sonarActive) return;
    setSonarActive(true);
    setSonarRadius(0);
    triggerBeep(180, 0.8, 'sawtooth');
  };

  // Sonar sweep simulation
  useEffect(() => {
    if (!sonarActive) return;
    const interval = setInterval(() => {
      setSonarRadius(r => {
        if (r >= 100) {
          setSonarActive(false);
          return 0;
        }
        return r + 5;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [sonarActive]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Clear with elegant dark void
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Radar scopes & grid
      ctx.strokeStyle = isRedMode ? 'rgba(239, 68, 68, 0.07)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Draw grid lines
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw concentric radar rings
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      for (let r = 80; r < canvas.width; r += 80) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Scale calculations
      const scaleX = canvas.width / 100;
      const scaleY = canvas.height / 100;

      // Draw captured anomalies (history)
      anomalyHistory.forEach((pos, idx) => {
        ctx.fillStyle = isRedMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(14, 165, 233, 0.2)';
        ctx.beginPath();
        ctx.arc(pos.x * scaleX, pos.y * scaleY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isRedMode ? '#ef4444' : '#0ea5e9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x * scaleX, pos.y * scaleY, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = '8px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`SECURED_0${idx+1}`, pos.x * scaleX + 12, pos.y * scaleY + 3);
      });

      // Draw Sonar Waves
      if (sonarActive) {
        const pX = probe.x * scaleX;
        const pY = probe.y * scaleY;
        const currentSonarPx = (sonarRadius / 100) * (canvas.width * 0.6);

        ctx.strokeStyle = isRedMode ? `rgba(239, 68, 68, ${1 - sonarRadius / 100})` : `rgba(234, 179, 8, ${1 - sonarRadius / 100})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pX, pY, currentSonarPx, 0, Math.PI * 2);
        ctx.stroke();

        // Reveal anomaly briefly if sonar wave intersects it
        const distToAnomaly = Math.hypot(pX - anomaly.x * scaleX, pY - anomaly.y * scaleY);
        if (Math.abs(distToAnomaly - currentSonarPx) < 25) {
          ctx.fillStyle = isRedMode ? `rgba(239, 68, 68, ${1 - sonarRadius / 100})` : `rgba(234, 179, 8, ${1 - sonarRadius / 100})`;
          ctx.beginPath();
          ctx.arc(anomaly.x * scaleX, anomaly.y * scaleY, 6, 0, Math.PI * 2);
          ctx.fill();

          // Flash ripple
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(anomaly.x * scaleX, anomaly.y * scaleY, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw Probe
      const probeX = probe.x * scaleX;
      const probeY = probe.y * scaleY;
      ctx.shadowBlur = 12;
      ctx.shadowColor = isRedMode ? '#ef4444' : '#ffffff';

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(probeX, probeY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isRedMode ? '#ef4444' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(probeX, probeY, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw signal indicator squiggly waveform bottom
      ctx.strokeStyle = isRedMode ? '#ef4444' : '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveY = canvas.height - 30;
      const maxAmp = Math.max(2, (100 - distance) * 0.4);
      for (let x = 20; x < canvas.width - 20; x++) {
        // frequency is higher when closer
        const freq = 0.05 + (100 - distance) * 0.003;
        const y = waveY + Math.sin(x * freq + Date.now() * 0.01) * maxAmp;
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    if (gameState === 'playing') {
      render();
    } else {
      // Render static radar layout in background
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 45) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }
    }

    return () => cancelAnimationFrame(animId);
  }, [gameState, probe, anomaly, sonarActive, sonarRadius, anomalyHistory, distance, isRedMode]);

  return (
    <div className={`liquid-glass border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 ${isRedMode ? 'border-red-500/20 bg-red-950/5' : 'border-white/10'}`}>
      
      {/* Game Stage Canvas */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative border border-white/10 rounded-2xl overflow-hidden aspect-square w-full max-w-[380px] sm:max-w-[420px] bg-black">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={400} 
            className="w-full h-full block cursor-none"
            onClick={triggerSonar}
          />

          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <Compass className={`w-12 h-12 mb-4 animate-spin ${isRedMode ? 'text-red-500' : 'text-yellow-500'}`} style={{ animationDuration: '6s' }} />
              <h4 className="text-xl font-semibold text-white mb-2 uppercase tracking-wide">АНУОМАЛИ СЭРГЭЭГЧ / SCAN SYSTEM</h4>
              <p className="text-xs text-white/50 max-w-xs mb-6">
                Navigate the dark probe. Tap space/screen to trigger sonar waves and use auditory signal tones to locate the 3 spatial anomalies.
              </p>
              <button 
                onClick={startGame}
                className={`rounded-full px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isRedMode ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                ЗАЛХАХ / INITIALIZE SCAN
              </button>
            </div>
          )}

          {gameState === 'victory' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <Sparkles className="w-14 h-14 text-yellow-500 mb-4 animate-bounce" />
              <h4 className="text-2xl font-bold text-white mb-1 uppercase tracking-wider">СПЕКТР ТОГТВОРЖЛОО / SECTOR CLEAR</h4>
              <p className="text-xs text-green-400 font-mono mb-4 uppercase tracking-wider">3/3 ANOMALIES SECURED & DECODED</p>
              <p className="text-xs text-white/40 max-w-xs mb-6">
                You successfully mapped the coordinates of the space sanctuary. Atmospheric frequency is now fully normalized.
              </p>
              <button 
                onClick={startGame}
                className={`rounded-full px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 ${
                  isRedMode ? 'bg-red-500 text-white' : 'bg-white text-black'
                }`}
              >
                ДАХИН ТОГЛОХ / SCAN AGAIN
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <ShieldAlert className="w-14 h-14 text-red-500 mb-4 animate-pulse" />
              <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">СУУРЬ ТАСАРЛАА / SIGNAL TERMINATED</h4>
              <p className="text-xs text-red-400 font-mono mb-6 uppercase tracking-wider">Probe thermal battery drained entirely.</p>
              <button 
                onClick={startGame}
                className="bg-white hover:bg-neutral-200 text-black rounded-full px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ДАХИН ОРОЛДОХ / RETRY SCAN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Details Console Info */}
      <div className="w-full md:w-80 flex flex-col justify-between gap-5 text-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Cpu className="w-4 h-4 text-white/50" />
            <span className="text-xs font-mono tracking-widest uppercase text-white/60">PROBE TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col">
              <span className="text-[10px] text-white/30 uppercase">ANOMALIES</span>
              <span className="text-lg font-semibold text-white">{score} / 3</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col">
              <span className="text-[10px] text-white/30 uppercase">BATTERY</span>
              <span className={`text-lg font-semibold ${battery < 30 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>{battery}%</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-white/40 uppercase">PROBE COORDS:</span>
              <span className="text-white/80">X: {probe.x.toFixed(1)} / Y: {probe.y.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40 uppercase">SIGNAL FREQ:</span>
              <span className="text-white/80">{(100 - distance).toFixed(1)} MHz</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-100 ${isRedMode ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.max(0, 100 - distance)}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 font-mono text-xs text-white/50 flex flex-col gap-2.5">
          <div className="text-[10px] text-white/30 tracking-widest uppercase font-bold border-b border-white/5 pb-1.5">Удирдлага / Controls</div>
          <div className="flex justify-between items-center">
            <span>Хөдлөх / Navigation</span>
            <span className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-white/80 font-bold text-[10px]">W, A, S, D / Arrows</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Радар импульс / Sonar</span>
            <span className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-white/80 font-bold text-[10px]">SPACE / CLICK</span>
          </div>
          <div className="text-[10px] text-white/30 italic leading-snug mt-2 border-t border-white/5 pt-2">
            Tip: Listen closely! The audio pitch rises and the beep intervals speed up as you align yourself towards the hidden targets.
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// GAME 2: MIRAGE CITY (2D Neon Platform runner)
// ==========================================
function MirageCityGame({ isRedMode }: { isRedMode: boolean }) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerPhase, setPlayerPhase] = useState<'blue' | 'red'>('blue'); // Player phasing color

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Game variable refs to bypass react state latency in animation loops
  const gameVars = useRef({
    playerY: 280,
    playerVelocityY: 0,
    isJumping: false,
    jumpCount: 0,
    obstacles: [] as { x: number; width: number; height: number; type: 'blue' | 'red' | 'gap' }[],
    speed: 5.5,
    lastObstacleSpawn: 0,
    distanceRun: 0,
  });

  const triggerJumpSound = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const triggerCrashSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  const startGame = () => {
    setGameState('playing');
    setDistance(0);
    setPlayerPhase('blue');
    gameVars.current = {
      playerY: 280,
      playerVelocityY: 0,
      isJumping: false,
      jumpCount: 0,
      obstacles: [
        { x: 500, width: 22, height: 40, type: 'blue' },
        { x: 800, width: 24, height: 45, type: 'red' },
      ],
      speed: 6.0,
      lastObstacleSpawn: Date.now(),
      distanceRun: 0,
    };
  };

  const togglePhase = () => {
    if (gameState !== 'playing') return;
    setPlayerPhase(prev => {
      const next = prev === 'blue' ? 'red' : 'blue';
      triggerJumpSound(next === 'blue' ? 320 : 450);
      return next;
    });
  };

  const handleJump = () => {
    if (gameState !== 'playing') return;
    const v = gameVars.current;
    if (v.jumpCount < 2) {
      v.playerVelocityY = -12;
      v.isJumping = true;
      v.jumpCount += 1;
      triggerJumpSound(250 + v.jumpCount * 120);
    }
  };

  // Setup Keyboard Input Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleJump();
      }
      if (e.key === 'Shift' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        togglePhase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerPhase]);

  // Main game logic loop on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localPhase = playerPhase; // Sync local variable for high-speed loop access

    const updateLoop = () => {
      const v = gameVars.current;

      // Increment running metrics
      v.distanceRun += v.speed * 0.05;
      setDistance(Math.floor(v.distanceRun));

      // Gravity Physics
      v.playerY += v.playerVelocityY;
      v.playerVelocityY += 0.65; // gravity constant

      // Collide with ground floor
      if (v.playerY >= 280) {
        v.playerY = 280;
        v.playerVelocityY = 0;
        v.isJumping = false;
        v.jumpCount = 0;
      }

      // Spawn Obstacles
      const now = Date.now();
      if (now - v.lastObstacleSpawn > Math.max(1400, 3000 - v.speed * 100)) {
        const types: ('blue' | 'red' | 'gap')[] = ['blue', 'red', 'gap'];
        const chosenType = types[Math.floor(Math.random() * 3)];
        
        v.obstacles.push({
          x: canvas.width + 50,
          width: chosenType === 'gap' ? 45 : 20 + Math.random() * 12,
          height: chosenType === 'gap' ? 0 : 35 + Math.random() * 20,
          type: chosenType,
        });
        v.lastObstacleSpawn = now;

        // Increase speed slowly
        v.speed = Math.min(12, v.speed + 0.15);
      }

      // Move & filter obstacles
      v.obstacles = v.obstacles.map(obs => ({
        ...obs,
        x: obs.x - v.speed,
      })).filter(obs => obs.x > -100);

      // Render Stage Background
      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stylized parallax background mountains/buildings silhouettes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(0, 180, canvas.width, canvas.height - 180);

      // City grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 150);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Horizon Ground lines
      ctx.strokeStyle = isRedMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 310);
      ctx.lineTo(canvas.width, 310);
      ctx.stroke();

      // Draw gaps in platform
      v.obstacles.forEach(obs => {
        if (obs.type === 'gap') {
          ctx.fillStyle = '#070709';
          ctx.fillRect(obs.x - 2, 307, obs.width + 4, 10);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x - 2, 307, obs.width + 4, 10);
        }
      });

      // Render Player Avatar (Neon Box/Silhouette with trail)
      const pX = 80;
      const pY = v.playerY;
      const size = 28;

      ctx.save();
      // Neon glow setup
      ctx.shadowBlur = 15;
      if (localPhase === 'blue') {
        ctx.shadowColor = '#06b6d4';
        ctx.fillStyle = '#22d3ee';
        ctx.strokeStyle = '#0891b2';
      } else {
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#f87171';
        ctx.strokeStyle = '#dc2626';
      }

      // Draw shadow silhouette block
      ctx.fillRect(pX, pY, size, size);
      ctx.lineWidth = 2.5;
      ctx.strokeRect(pX, pY, size, size);

      // Draw visor/eye line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pX + 16, pY + 6, 8, 3);

      ctx.restore();

      // Collision Check & Rendering of Obstacles
      v.obstacles.forEach(obs => {
        if (obs.type === 'gap') {
          // Check falling into pit
          const centerPlayerX = pX + size / 2;
          if (centerPlayerX > obs.x && centerPlayerX < obs.x + obs.width && v.playerY >= 280) {
            // Player fell down
            triggerCrashSound();
            setGameState('gameover');
          }
          return;
        }

        // Standard barrier rendering
        ctx.save();
        ctx.shadowBlur = 10;
        if (obs.type === 'blue') {
          ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.strokeStyle = '#06b6d4';
        } else {
          ctx.shadowColor = '#ef4444';
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.strokeStyle = '#ef4444';
        }

        // Draw vertical neon obstacles
        const obsY = 310 - obs.height;
        ctx.beginPath();
        ctx.roundRect(obs.x, obsY, obs.width, obs.height, 4);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Core Collision Detection algorithm
        const playerRight = pX + size;
        const playerBottom = v.playerY + size;
        const obstacleRight = obs.x + obs.width;
        const obstacleTop = obsY;

        if (
          playerRight - 4 > obs.x &&
          pX + 4 < obstacleRight &&
          playerBottom - 4 > obstacleTop
        ) {
          // Intersecting bounding boxes!
          // Collides ONLY if player phase DOES NOT MATCH obstacle type!
          if (localPhase !== obs.type) {
            triggerCrashSound();
            setGameState('gameover');
          } else {
            // Score bonus or glowing bypass indicator
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(pX - 4, v.playerY - 4, size + 8, size + 8);
          }
        }
      });

      // Target victory distance
      if (v.distanceRun >= 1000) {
        setGameState('victory');
      }

      if (gameState === 'playing') {
        requestRef.current = requestAnimationFrame(updateLoop);
      }
    };

    // Update phase variable for safe local closures
    localPhase = playerPhase;

    if (gameState === 'playing') {
      updateLoop();
    } else {
      // Draw static mock preview inside canvas
      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillText("READY_CYBERSCAPE_EMULATION", 40, 45);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, playerPhase, isRedMode]);

  useEffect(() => {
    if (distance > highScore) {
      setHighScore(distance);
    }
  }, [distance, highScore]);

  return (
    <div className={`liquid-glass border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 ${isRedMode ? 'border-red-500/20 bg-red-950/5' : 'border-white/10'}`}>
      
      {/* Game Stage Canvas */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-[#070709] w-full max-w-[500px] aspect-[4/3] max-h-[350px]">
          <canvas 
            ref={canvasRef} 
            width={500} 
            height={350} 
            className="w-full h-full block"
          />

          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <Zap className={`w-12 h-12 mb-4 ${isRedMode ? 'text-red-500' : 'text-cyan-400'} animate-bounce`} />
              <h4 className="text-xl font-semibold text-white mb-2 uppercase tracking-wide">MIRAGE CITY ENGINE</h4>
              <p className="text-xs text-white/50 max-w-sm mb-6 leading-relaxed">
                Control a phase shadow runner. Press <strong>Space</strong> to Jump/Double Jump. Press <strong>Shift</strong> to toggle your phase. Match barrier colors (Blue/Red) to slide right through them! Reach 1000m.
              </p>
              <button 
                onClick={startGame}
                className={`rounded-full px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isRedMode ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                ХОЛБОГДОХ / BOOT SYSTEM
              </button>
            </div>
          )}

          {gameState === 'victory' && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <Sparkles className="w-14 h-14 text-yellow-500 mb-4 animate-bounce" />
              <h4 className="text-2xl font-bold text-white mb-1 uppercase tracking-wider">GATEWAY ACHIEVED</h4>
              <p className="text-xs text-green-400 font-mono mb-4 uppercase tracking-wider">1000M DISTANCE COMPLETED successfully</p>
              <p className="text-xs text-white/40 max-w-xs mb-6">
                You successfully crossed the digital grid limits and penetrated the shadow server core.
              </p>
              <button 
                onClick={startGame}
                className="bg-white text-black rounded-full px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105"
              >
                ДАХИН ТОГЛОХ / RUN AGAIN
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <ShieldAlert className="w-14 h-14 text-red-500 mb-3 animate-pulse" />
              <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">PHASE CRASH</h4>
              <p className="text-xs text-red-400 font-mono mb-2 uppercase tracking-wider">CRITICAL OUT-OF-PHASE COLLISION</p>
              <p className="text-xs text-white/40 mb-6 font-mono">Distance completed: {distance}m</p>
              <button 
                onClick={startGame}
                className="bg-white hover:bg-neutral-200 text-black rounded-full px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ДАХИН ОРОЛДОХ / RETRY RUN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Details Console Info */}
      <div className="w-full md:w-80 flex flex-col justify-between gap-5 text-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Activity className="w-4 h-4 text-white/50 animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase text-white/60">RUNNING TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col">
              <span className="text-[10px] text-white/30 uppercase">DISTANCE</span>
              <span className={`text-lg font-semibold ${gameState === 'playing' ? 'text-cyan-400' : 'text-white'}`}>{distance}m</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col">
              <span className="text-[10px] text-white/30 uppercase">HIGH SCORE</span>
              <span className="text-lg font-semibold text-yellow-500">{highScore}m</span>
            </div>
          </div>

          {/* Color Phase Switch controller */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
            <span className="text-white/40 uppercase">ACTIVE FIELD PHASE:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => gameState === 'playing' && setPlayerPhase('blue')}
                className={`flex-1 py-2 rounded-xl text-center text-[10px] font-bold tracking-widest uppercase transition-all ${
                  playerPhase === 'blue' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                    : 'bg-white/5 text-white/40 border border-transparent'
                }`}
              >
                CYAN PHASE
              </button>
              <button 
                onClick={() => gameState === 'playing' && setPlayerPhase('red')}
                className={`flex-1 py-2 rounded-xl text-center text-[10px] font-bold tracking-widest uppercase transition-all ${
                  playerPhase === 'red' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                    : 'bg-white/5 text-white/40 border border-transparent'
                }`}
              >
                RED PHASE
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 font-mono text-xs text-white/50 flex flex-col gap-2.5">
          <div className="text-[10px] text-white/30 tracking-widest uppercase font-bold border-b border-white/5 pb-1.5">Гарнаас удирдах / Keys</div>
          <div className="flex justify-between items-center">
            <span>Үсрэх / Jump</span>
            <span className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-white/80 font-bold text-[10px]">SPACE / UP / W</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Өнгө өөрчлөх / Shift Phase</span>
            <span className="bg-white/10 border border-white/10 rounded px-1.5 py-0.5 text-white/80 font-bold text-[10px]">SHIFT / CLICK</span>
          </div>
          <div className="text-[10px] text-white/30 italic leading-snug mt-2 border-t border-white/5 pt-2">
            Tip: You can pass directly through hazards of the exact same color! Keep your hand on the Shift key for high-speed color weaving.
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// GAME 3: SILENCE OF THE HORIZON (Console Simulator)
// ==========================================
function SilenceHorizonGame({ isRedMode }: { isRedMode: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [oxygen, setOxygen] = useState(85);
  const [pressure, setPressure] = useState(40);
  const [carbonDebris, setCarbonDebris] = useState(4);
  const [frequency, setFrequency] = useState(45.0); // Dial tuner
  const [targetFreq] = useState(72.4); // Secret station frequency
  const [signalLocked, setSignalLocked] = useState(0); // 0-100%
  const [decodedLogs, setDecodedLogs] = useState<string[]>([
    "INITIALIZING LONG-RANGE COCKPIT CORES...",
    "WARNING: CELSTIAL ATMOSPHERE SATURATED WITH SULFURIC STATIC.",
    "STATUS: CO2 SCRUBBERS DECAYING. CARBON DEBRIS MANUALLY HARVESTABLE."
  ]);
  const [gameResult, setGameResult] = useState<'playing' | 'victory' | 'failed' | 'idle'>('idle');

  const synthRef = useRef<AudioContext | null>(null);

  const writeLog = (msg: string) => {
    setDecodedLogs(prev => [...prev.slice(-5), `> ${msg}`]);
  };

  const triggerSound = (freq: number, type: 'sine' | 'square' | 'triangle' = 'sine', duration = 0.2) => {
    try {
      if (!synthRef.current) {
        synthRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = synthRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const startGame = () => {
    setGameResult('playing');
    setOxygen(85);
    setPressure(40);
    setCarbonDebris(4);
    setSignalLocked(0);
    setDecodedLogs([
      "INITIALIZING LONG-RANGE COCKPIT CORES...",
      "WARNING: CO2 FILTERS DECAYING. ATMOSPHERIC SCANNING ACTIVE.",
      "INSTRUCTION: LOCK FREQUENCY CLOSE TO 72.4 MHZ TO BROADCAST TRANSMISSION."
    ]);
  };

  // Main ticking interval
  useEffect(() => {
    if (gameResult !== 'playing') return;

    const interval = setInterval(() => {
      // Oxygen drains slowly
      setOxygen(ox => {
        if (ox <= 1) {
          setGameResult('failed');
          writeLog("CRITICAL FAILURE: CO2 CHOKED CABIN LIFE MATRIX.");
          return 0;
        }
        return ox - 1;
      });

      // Pressure rises slowly
      setPressure(pr => {
        if (pr >= 99) {
          setGameResult('failed');
          writeLog("CRITICAL OVERHEAT: COOLANT TANKS EXPLODED.");
          return 100;
        }
        return pr + 2;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [gameResult]);

  // Adjust signal lock calculations
  useEffect(() => {
    if (gameResult !== 'playing') return;

    const delta = Math.abs(frequency - targetFreq);
    let lockPercent = 0;
    
    if (delta < 0.2) lockPercent = 100;
    else if (delta < 1.0) lockPercent = Math.round((1 - delta) * 100);
    else if (delta < 5.0) lockPercent = Math.round((5 - delta) * 10);

    setSignalLocked(lockPercent);

    if (lockPercent === 100) {
      triggerSound(600, 'sine', 0.4);
      triggerSound(900, 'sine', 0.5);
      setGameResult('victory');
      setDecodedLogs(p => [
        ...p,
        "=== DECODED RADIO SIGNAL LOCKED ===",
        "LOG: 'Horizon escape vessel #09 established orbit safely.'",
        "LOG: 'Grid anomalies successfully bypassed.'",
        "STATUS: TRANSLATION TERMINAL COMPLETED SUCCESSFULLY."
      ]);
    }
  }, [frequency, targetFreq, gameResult]);

  const handleVenting = () => {
    if (gameResult !== 'playing') return;
    triggerSound(100, 'square', 0.6);
    
    setPressure(prev => {
      const ventAmount = 30;
      const next = Math.max(0, prev - ventAmount);
      writeLog(`COOLANT LIQUID INJECTED. PRESSURE VENTED TO ${next}%`);
      return next;
    });
  };

  const handleAtmosphericHarvest = () => {
    if (gameResult !== 'playing') return;
    triggerSound(400, 'triangle', 0.15);
    setCarbonDebris(c => c + 2);
    writeLog("ATMOSPHERIC SWEEP RECOVERED +2 CARBON FIBERS.");
  };

  const handleCraftFilter = () => {
    if (gameResult !== 'playing') return;
    if (carbonDebris < 10) {
      triggerSound(180, 'square', 0.2);
      writeLog("INSUFFICIENT RESOURCES. ACCUMULATE 10 CARBON FIBERS.");
      return;
    }

    triggerSound(500, 'sine', 0.35);
    setCarbonDebris(c => c - 10);
    setOxygen(ox => Math.min(100, ox + 35));
    writeLog("CO2 SCRUBBERS RECONSTRUCTED successfully. Oxygen levels restored.");
  };

  return (
    <div className={`liquid-glass border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 ${isRedMode ? 'border-red-500/20 bg-red-950/5' : 'border-white/10'}`}>
      
      {/* Console Interface Cockpit */}
      <div className="flex-1 flex flex-col gap-4 font-mono">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Radio className="w-4 h-4 text-white/50 animate-pulse" />
          <span className="text-xs font-mono tracking-widest uppercase text-white/60">CABIN TERMINAL CONSOLE</span>
        </div>

        {/* Live Output Log Area */}
        <div className="bg-black/60 rounded-2xl border border-white/5 p-4 h-48 flex flex-col gap-1.5 justify-end text-xs leading-relaxed overflow-hidden">
          {decodedLogs.map((log, index) => (
            <div 
              key={index} 
              className={`${
                log.includes("WARNING") || log.includes("CRITICAL") 
                  ? 'text-red-400 font-bold' 
                  : log.includes("DECODED") 
                  ? 'text-yellow-400 font-bold' 
                  : 'text-white/60'
              } truncate`}
            >
              {log}
            </div>
          ))}
          {gameResult === 'idle' && (
            <div className="text-center text-white/30 italic py-8">Cockpit terminal stands by. Boot simulation core to operate.</div>
          )}
        </div>

        {/* Cockpit Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            disabled={gameResult !== 'playing'}
            onClick={handleAtmosphericHarvest}
            className="flex items-center justify-center gap-2 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl py-3.5 text-xs text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>SWEEP DEBRIS</span>
          </button>
          <button 
            disabled={gameResult !== 'playing'}
            onClick={handleCraftFilter}
            className={`flex items-center justify-center gap-2 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl py-3.5 text-xs text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none ${
              carbonDebris >= 10 ? 'border-yellow-500/30 text-yellow-300 animate-pulse' : ''
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>CRAFT FILTER ({carbonDebris}/10)</span>
          </button>
        </div>

        <button 
          disabled={gameResult !== 'playing'}
          onClick={handleVenting}
          className={`w-full py-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 ${
            pressure > 70 
              ? 'bg-red-500 text-white animate-pulse shadow-red-500/20' 
              : 'bg-white text-black hover:bg-neutral-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>VENT OVERPRESSURE (COOL DOWN)</span>
        </button>
      </div>

      {/* Settings Console Dashboard dials */}
      <div className="w-full md:w-80 flex flex-col justify-between gap-5 font-mono text-sm">
        
        {/* Cockpit Status Indicators */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
            
            {/* Oxygen level */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold text-white/60">
                <span>OXYGEN RECIRCULATOR</span>
                <span className={oxygen < 30 ? 'text-red-500 animate-pulse font-bold' : 'text-green-400'}>{oxygen}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${oxygen < 30 ? 'bg-red-500' : 'bg-emerald-400'}`}
                  style={{ width: `${oxygen}%` }}
                />
              </div>
            </div>

            {/* Core Thermal Pressure */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold text-white/60">
                <span>THERMAL OVERPRESSURE</span>
                <span className={pressure > 70 ? 'text-red-500 animate-pulse font-bold' : 'text-cyan-400'}>{pressure}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${pressure > 70 ? 'bg-red-500' : 'bg-cyan-400'}`}
                  style={{ width: `${pressure}%` }}
                />
              </div>
            </div>

          </div>

          {/* Dynamic Radio Static Dial Slider */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-white/60">
              <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-white/40" /> TUNER DIAL</span>
              <span className="text-yellow-500">{frequency.toFixed(1)} MHz</span>
            </div>
            
            <input 
              type="range"
              min="20"
              max="99"
              step="0.2"
              value={frequency}
              disabled={gameResult !== 'playing'}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFrequency(val);
                // Trigger small staticky synth beep
                if (Math.abs(val - targetFreq) < 5) {
                  triggerSound(200 + Math.random() * 80, 'sine', 0.05);
                }
              }}
              className="h-1 w-full bg-white/10 rounded-lg cursor-pointer accent-yellow-500"
            />

            <div className="flex justify-between items-center text-[10px] text-white/40">
              <span>MIN: 20.0</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-white/70">SIGNAL LOCK: {signalLocked}%</span>
              </div>
              <span>MAX: 99.0</span>
            </div>
          </div>
        </div>

        {/* Start Game overlay trigger panels */}
        {gameResult === 'idle' && (
          <button 
            onClick={startGame}
            className={`w-full py-3.5 text-center text-xs font-mono font-bold tracking-widest uppercase transition-all border border-white/5 bg-white text-black hover:bg-neutral-200 rounded-xl`}
          >
            ДАХИН ХОЛБОХ / RUN EMULATOR
          </button>
        )}

        {gameResult === 'failed' && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-red-500 text-center uppercase tracking-wider mb-1 font-mono">☠️ CABIN FLUIDS BREACHED ☠️</div>
            <button 
              onClick={startGame}
              className="w-full py-3 text-center text-xs font-mono font-bold tracking-widest uppercase bg-white text-black hover:bg-neutral-200 rounded-xl"
            >
              СЭРГЭЭХ / RESTORE CABIN
            </button>
          </div>
        )}

        {gameResult === 'victory' && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-yellow-400 text-center uppercase tracking-wider mb-1 font-mono">📡 SIGNAL ALIGNED 📡</div>
            <button 
              onClick={startGame}
              className="w-full py-3 text-center text-xs font-mono font-bold tracking-widest uppercase bg-green-500 hover:bg-green-400 text-black rounded-xl"
            >
              ДАХИН ОРОЛДОХ / RE-STABILIZE
            </button>
          </div>
        )}

        {gameResult === 'playing' && (
          <div className="text-[10px] text-white/30 leading-snug border-t border-white/5 pt-2 italic">
            Mission: Keep Oxygen core up by gathering Carbon sweep fibers & crafting filters. Vent the chamber core pressure constantly, and seek the station transmission dial at 72.4 MHz.
          </div>
        )}
      </div>
    </div>
  );
}
