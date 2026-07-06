import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Gamepad2, 
  Heart, 
  Award, 
  Sparkles, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  HelpCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  Flame,
  CheckCircle2,
  XCircle,
  Code,
  Trophy,
  User,
  ListOrdered,
  Loader2
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import gameData from '../data.json';

interface Question {
  id: number;
  emojis?: string;
  characterImage?: string;
  answer: string;
  answers: string[];
  options: string[];
  image: string;
  video: string;
}

interface AnswerHistoryItem {
  questionId: number;
  questionText: string;
  givenAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export default function AnimeGuesser({ isRedMode }: { isRedMode: boolean }) {
  const [mode, setMode] = useState<'menu' | 'playing' | 'gameover' | 'victory' | 'leaderboard'>('menu');
  const [quizType, setQuizType] = useState<'emoji' | 'character'>('emoji');
  
  // Game metrics
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  
  // Sound controls
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Answer states
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const [bonusTriggered, setBonusTriggered] = useState(false);

  // Firestore & Leaderboard states
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('anime_guesser_player_name') || 'Тоглогч');
  const [sessionAnswers, setSessionAnswers] = useState<AnswerHistoryItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load questions based on selected quiz type
  const questions: Question[] = quizType === 'emoji' ? gameData.emojiQuiz : gameData.characterQuiz;
  const currentQuestion = questions[currentQuestionIndex];

  // Synthesize game sound effects using Web Audio API
  const playSound = (type: 'ding' | 'buzz' | 'bonus' | 'click') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'ding') {
        // High-pitched happy chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'buzz') {
        // Low-pitched buzzer
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'bonus') {
        // Star sparkle chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'click') {
        // Subtle interface tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (err) {
      console.warn("Audio Context blocked by browser autoplay rules.", err);
    }
  };

  // Start a fresh game session
  const startGame = (type: 'emoji' | 'character') => {
    playSound('click');
    setQuizType(type);
    setScore(0);
    setLives(3);
    setStreak(0);
    setCurrentQuestionIndex(0);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setTypedAnswer('');
    setIsCorrect(null);
    setShowReveal(false);
    setWrongShake(false);
    setBonusTriggered(false);
    setSessionAnswers([]);
    setScoreSaved(false);
    setMode('playing');
  };

  // Fetch High Scores from Firestore
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(15));
      const querySnapshot = await getDocs(q);
      const scoresList: any[] = [];
      querySnapshot.forEach((doc) => {
        scoresList.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboard(scoresList);
    } catch (err) {
      console.error("Error fetching leaderboard: ", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Save Score to Firestore
  const saveScoreToFirestore = async (finalScore: number, finalAnswers: AnswerHistoryItem[]) => {
    if (!playerName.trim()) return;
    setIsSavingScore(true);
    try {
      localStorage.setItem('anime_guesser_player_name', playerName.trim());
      await addDoc(collection(db, 'scores'), {
        playerName: playerName.trim(),
        score: finalScore,
        quizType: quizType,
        answers: finalAnswers,
        timestamp: new Date().toISOString()
      });
      setScoreSaved(true);
      playSound('bonus');
      await fetchLeaderboard();
      setMode('leaderboard');
    } catch (err) {
      console.error("Error saving score: ", err);
    } finally {
      setIsSavingScore(false);
    }
  };

  // Answer Submission logic
  const handleAnswerSubmit = (answerStr: string) => {
    if (showReveal || isCorrect !== null) return; // Block multiple submissions

    const normAnswer = answerStr.trim().toLowerCase().replace(/\s+/g, '');
    const correctOptions = currentQuestion.answers.map(ans => ans.trim().toLowerCase().replace(/\s+/g, ''));
    
    // Check if correct (either matching the options or the answers database)
    const isAnswerCorrect = 
      answerStr === currentQuestion.answer || 
      correctOptions.includes(normAnswer);

    setSelectedAnswer(answerStr);
    setIsCorrect(isAnswerCorrect);
    setShowReveal(true);

    // Save answer details to history
    const historyItem: AnswerHistoryItem = {
      questionId: currentQuestion.id,
      questionText: quizType === 'emoji' ? currentQuestion.emojis || '' : `Баатар: ${currentQuestion.answer}`,
      givenAnswer: answerStr === '__TIMEOUT__' ? 'Хугацаа дууссан ⏱️' : answerStr,
      correctAnswer: currentQuestion.answer,
      isCorrect: isAnswerCorrect
    };
    setSessionAnswers(prev => [...prev, historyItem]);

    if (isAnswerCorrect) {
      playSound('ding');
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Check for consecutive streak bonus (+3 correct = bonus 20 points)
      if (newStreak > 0 && newStreak % 3 === 0) {
        setScore(prev => prev + 10 + 20); // Regular +10, Bonus +20
        setBonusTriggered(true);
        setTimeout(() => playSound('bonus'), 200);
      } else {
        setScore(prev => prev + 10);
        setBonusTriggered(false);
      }
    } else {
      playSound('buzz');
      setStreak(0); // Reset streak on mistake
      setBonusTriggered(false);
      setWrongShake(true);
      setLives(prev => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          // Will transition to GameOver after reveal or next step
        }
        return nextLives;
      });
      setTimeout(() => setWrongShake(false), 600);
    }
  };

  // Form submit for typing input
  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    handleAnswerSubmit(typedAnswer);
  };

  // Move to next question or end game
  const handleNextQuestion = () => {
    playSound('click');
    setTypedAnswer('');
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowReveal(false);
    setBonusTriggered(false);

    if (lives <= 0) {
      setMode('gameover');
      return;
    }

    if (currentQuestionIndex + 1 >= questions.length) {
      setMode('victory');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(15);
    }
  };

  // Timer Countdown Logic
  useEffect(() => {
    if (mode !== 'playing' || showReveal) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time ran out! Count as wrong
          if (timerRef.current) clearInterval(timerRef.current);
          handleAnswerSubmit("__TIMEOUT__");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, currentQuestionIndex, showReveal]);

  return (
    <div id="anime-guesser-court" className="w-full bg-neutral-900/60 rounded-3xl border border-white/10 p-5 md:p-8 flex flex-col gap-6 text-white relative overflow-hidden select-none">
      
      {/* Glow ambient circle */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-15 ${
        isRedMode ? 'bg-red-500' : 'bg-yellow-500'
      }`} />

      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Tv className={`w-5 h-5 ${isRedMode ? 'text-red-500 animate-pulse' : 'text-yellow-500 animate-pulse'}`} />
          <span className="text-xs font-mono tracking-wider text-white/50 uppercase">Anime Guesser v1.2</span>
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          title={soundEnabled ? "Дуу хаах" : "Дуу нээх"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* GAME MENU */}
      {mode === 'menu' && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-6 animate-fadeIn">
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl md:text-5xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Anime Guesser 🎮
            </h3>
            <p className="text-sm text-white/60 max-w-lg leading-relaxed">
              Эможи тааж эсвэл аниме баатрын зургийг харж нэрийг нь таагаарай. 15 секундын хугацаатай, 3 амьтай! Сэтгэл хөдөлгөм аниме ертөнцөд нэвтэрцгээе.
            </p>
          </div>

          {/* Player Name and Leaderboard access */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Тоглогчийн нэр:</span>
              <div className="relative">
                <input 
                  type="text" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white outline-none focus:border-white/20 transition-all"
                  placeholder="Тоглогч"
                />
                <User className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
              </div>
            </div>
            
            <button
              onClick={async () => {
                playSound('click');
                await fetchLeaderboard();
                setMode('leaderboard');
              }}
              className="w-full sm:w-auto h-[38px] px-4 self-end bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-white rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span>Leaderboard</span>
            </button>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 max-w-md w-full text-left flex flex-col gap-2.5 font-mono text-xs text-white/70">
            <div className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-1">Тоглоомын дүрмүүд:</div>
            <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
              <span>⏱️ ХУГАЦАА (Асуулт бүрт)</span>
              <span className="text-yellow-400 font-bold">15 секунд</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
              <span>❤️ АМЬ (Буруу хариултын лимит)</span>
              <span className="text-red-500 font-bold">3 амь</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
              <span>⭐ ОНОО (Зөв хариулт тутамд)</span>
              <span className="text-green-400 font-bold">+10 оноо</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🔥 BONUS (3 дараалан зөв)</span>
              <span className="text-indigo-400 font-bold">+20 оноо</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-2">
            <button
              onClick={() => startGame('emoji')}
              className={`flex-1 py-4 px-6 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
                isRedMode 
                  ? 'bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]' 
                  : 'bg-yellow-500 text-black shadow-[0_4px_15px_rgba(234,179,8,0.3)]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>ЭМОЖИ ТААВАР / EMOJI QUIZ</span>
            </button>
            <button
              onClick={() => startGame('character')}
              className="flex-1 py-4 px-6 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              <Gamepad2 className="w-4 h-4 text-sky-400" />
              <span>БААТРЫН ДҮР ТААХ / CHARACTERS</span>
            </button>
          </div>
        </div>
      )}

      {/* GAMEPLAY ACTIVE SCREEN */}
      {mode === 'playing' && currentQuestion && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Game Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-mono">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-white/50">Score:</span>
                <span className="text-white font-bold text-sm">{score}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-orange-500 animate-bounce' : 'text-white/30'}`} />
                <span className="text-white/50">Streak:</span>
                <span className={`font-bold text-sm ${streak >= 3 ? 'text-orange-400' : 'text-white'}`}>{streak}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Lives tracker */}
              <div className="flex items-center gap-1">
                <span className="text-white/50 mr-1.5">Lives:</span>
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < lives 
                        ? 'text-red-500 fill-red-500 animate-pulse' 
                        : 'text-white/10 fill-transparent'
                    }`} 
                  />
                ))}
              </div>

              {/* Timer dial */}
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-sky-400'}`} />
                <span className={`font-bold font-mono text-sm ${timeLeft <= 5 ? 'text-red-400' : 'text-sky-300'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Question / Target Panel */}
          <div className={`w-full bg-neutral-950/40 rounded-3xl p-6 border flex flex-col items-center justify-center text-center gap-6 relative transition-all duration-300 ${
            wrongShake ? 'animate-shake border-red-500/50 bg-red-950/5' : 'border-white/5'
          }`}>
            
            <div className="absolute top-3 left-3 bg-white/5 text-[9px] font-mono px-2 py-0.5 rounded text-white/40">
              QUESTION {currentQuestionIndex + 1} OF {questions.length}
            </div>

            {/* Render Emoji mode */}
            {quizType === 'emoji' && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="text-5xl sm:text-6xl tracking-widest drop-shadow-[0_4px_10px_rgba(255,255,255,0.1)] hover:scale-115 transition-transform duration-300 select-all cursor-default">
                  {currentQuestion.emojis}
                </div>
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-2">
                  Таах аниме эможи
                </div>
              </div>
            )}

            {/* Render Character image mode */}
            {quizType === 'character' && currentQuestion.characterImage && (
              <div className="flex flex-col items-center gap-3 py-2 w-full max-w-md">
                <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/10 shadow-lg relative bg-neutral-900 group">
                  <img 
                    src={currentQuestion.characterImage} 
                    alt="Anime Character" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">
                  Энэ аниме баатрын нэрийг таана уу
                </div>
              </div>
            )}
          </div>

          {/* Question options and answer panels */}
          {!showReveal ? (
            <div className="flex flex-col gap-4 animate-slideUp">
              
              {/* Option Cards (4 choices) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQuestion.options.map((option, idx) => {
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(option)}
                      className="group relative flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs tracking-wide text-neutral-200 font-mono hover:scale-[1.03] hover:bg-white/10 hover:border-white/30 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.06)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                    >
                      <span>{idx + 1}. {option}</span>
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/20 group-hover:border-white/30 flex items-center justify-center transition-all text-[10px] text-white/40 group-hover:text-white">
                        ✓
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Text Input typing alternative matching "answers" */}
              <form onSubmit={handleTypeSubmit} className="flex gap-2.5 mt-2 bg-neutral-950/30 p-2.5 rounded-2xl border border-white/5">
                <input 
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Эсвэл хариултыг шууд бичих (Ван пийс, Luffy гэх мэт)..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-all font-mono"
                />
                <button 
                  type="submit"
                  disabled={!typedAnswer.trim()}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase cursor-pointer transition-all disabled:opacity-30 flex items-center justify-center gap-1 ${
                    isRedMode ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                  }`}
                >
                  Шидээд үзэх
                </button>
              </form>
            </div>
          ) : (
            /* REVEAL SCREEN (Displays on answer, showing images and youtube embed) */
            <div className="flex flex-col gap-5 bg-white/5 border border-white/5 rounded-3xl p-5 md:p-6 animate-fadeIn">
              
              {/* Feedback indicator header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <div className="flex items-center gap-1.5 text-green-400 font-mono text-sm font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>ЗӨВ ХАРИУЛЛАА! (+10 Оноо)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500 font-mono text-sm font-bold">
                      <XCircle className="w-5 h-5" />
                      <span>БУРУУ БАЙНА!</span>
                    </div>
                  )}
                </div>
                {bonusTriggered && (
                  <div className="px-3 py-1 bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] rounded-lg animate-bounce uppercase font-bold flex items-center gap-1">
                    🔥 3 СТРЕАК БОНУС +20!
                  </div>
                )}
                <div className="text-xs font-mono text-white/50">
                  Зөв хариулт: <span className="text-green-400 font-bold">{currentQuestion.answer}</span>
                </div>
              </div>

              {/* Reveal content (anime image + video trailer) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Reveal illustration image */}
                <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 group">
                  <img 
                    src={currentQuestion.image} 
                    alt="Anime scene" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 font-mono">
                    <h4 className="text-lg font-bold text-white tracking-wide">{currentQuestion.answer}</h4>
                    <p className="text-[10px] text-white/40 uppercase">Аниме ертөнц</p>
                  </div>
                </div>

                {/* Embedded YouTube video trailer/music video */}
                <div className="h-48 md:h-56 rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`${currentQuestion.video}?autoplay=1&mute=1`} 
                    title="Anime trailer" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full object-cover"
                  />
                </div>

              </div>

              {/* Next navigation trigger */}
              <button 
                onClick={handleNextQuestion}
                className={`w-full py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
                  isRedMode 
                    ? 'bg-red-500 hover:bg-red-400 text-white' 
                    : 'bg-white hover:bg-neutral-200 text-black'
                }`}
              >
                <span>Үргэлжлүүлэх / Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      )}

      {/* VICTORY OVERLAY SCREEN */}
      {mode === 'victory' && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl animate-bounce">
            🏆
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Аваргын Титэм! Game Cleared!
            </h3>
            <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed font-sans">
              Баяр хүргэе! Та бүх асуултуудад маш амжилттай хариулж, аниме ертөнцийг сайн мэддэгээ баталлаа.
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-5 max-w-sm w-full text-center flex flex-col gap-2 font-mono">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Эцсийн амжилт</span>
            <div className="text-3xl font-bold text-green-400">{score} Оноо</div>
            <div className="text-xs text-white/50">Мөрөөдөлдөө хүрэх алхам: <span className="text-yellow-500">IT Engineer 💻</span></div>
          </div>

          {/* Submit high score */}
          <div className="flex flex-col gap-2.5 bg-white/5 border border-white/5 p-4 rounded-2xl w-full max-w-sm text-left">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Оноогоо самбарт бүртгүүлэх:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                placeholder="Таны нэр..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/20 transition-all font-mono"
              />
              <button
                onClick={() => saveScoreToFirestore(score, sessionAnswers)}
                disabled={isSavingScore || scoreSaved || !playerName.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  scoreSaved 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 cursor-default' 
                    : isRedMode 
                      ? 'bg-red-500 hover:bg-red-400 text-white' 
                      : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                }`}
              >
                {isSavingScore ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : scoreSaved ? (
                  <span>ХАДГАЛАГДЛАА ✓</span>
                ) : (
                  <span>ИЛГЭЭХ</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-md mt-2">
            <button
              onClick={() => setMode('menu')}
              className="flex-1 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer"
            >
              Цэс рүү буцах
            </button>
            <button
              onClick={() => startGame(quizType)}
              className={`flex-1 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider cursor-pointer ${
                isRedMode ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
              }`}
            >
              Дахин тоглох
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {mode === 'gameover' && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 text-2xl animate-pulse">
            ☠️
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Тоглоом Дууслаа! Game Over
            </h3>
            <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed font-sans">
              Уучлаарай, таны 3 амь дуусчихлаа. Бууж өгөлгүй, дахин оролдоод аниме ур чадвараа сайжруулаарай!
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-5 max-w-sm w-full text-center flex flex-col gap-1 font-mono">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Таны цуглуулсан</span>
            <div className="text-3xl font-bold text-red-400">{score} Оноо</div>
          </div>

          {/* Submit high score */}
          <div className="flex flex-col gap-2.5 bg-white/5 border border-white/5 p-4 rounded-2xl w-full max-w-sm text-left">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Оноогоо самбарт бүртгүүлэх:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                placeholder="Таны нэр..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/20 transition-all font-mono"
              />
              <button
                onClick={() => saveScoreToFirestore(score, sessionAnswers)}
                disabled={isSavingScore || scoreSaved || !playerName.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  scoreSaved 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 cursor-default' 
                    : isRedMode 
                      ? 'bg-red-500 hover:bg-red-400 text-white' 
                      : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                }`}
              >
                {isSavingScore ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : scoreSaved ? (
                  <span>ХАДГАЛАГДЛАА ✓</span>
                ) : (
                  <span>ИЛГЭЭХ</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-md mt-2">
            <button
              onClick={() => setMode('menu')}
              className="flex-1 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer"
            >
              Цэс рүү буцах
            </button>
            <button
              onClick={() => startGame(quizType)}
              className={`flex-1 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider cursor-pointer ${
                isRedMode ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
              }`}
            >
              Шинээр эхлэх
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW */}
      {mode === 'leaderboard' && (
        <div className="flex flex-col gap-6 animate-fadeIn font-mono">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
              <h3 className="text-lg font-bold tracking-wider uppercase">Онооны самбар</h3>
            </div>
            <button
              onClick={() => setMode('menu')}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white transition-all cursor-pointer"
            >
              Буцах
            </button>
          </div>

          {loadingLeaderboard ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs text-white/40">Онооны мэдээллийг уншиж байна...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 text-xs text-white/40 flex flex-col gap-2">
              <span>Одоогоор оноо бүртгэгдээгүй байна.</span>
              <span>Эхний аварга болох боломж танд байна! 🌟</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
              {leaderboard.map((entry, idx) => {
                const isTopThree = idx < 3;
                const badgeColor = idx === 0 
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                  : idx === 1 
                    ? 'bg-slate-300/20 text-slate-200 border-slate-300/30' 
                    : 'bg-amber-600/20 text-amber-300 border-amber-600/30';
                
                return (
                  <div 
                    key={entry.id || idx}
                    className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center border ${
                          isTopThree ? badgeColor : 'bg-white/5 text-white/40 border-white/5'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{entry.playerName}</span>
                          <span className="text-[9px] text-white/40 uppercase">Mode: {entry.quizType === 'emoji' ? 'Эможи' : 'Баатрууд'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">{entry.score} pts</div>
                        <div className="text-[9px] text-white/30">{entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : ''}</div>
                      </div>
                    </div>

                    {/* Expandable answers history details */}
                    {entry.answers && entry.answers.length > 0 && (
                      <div className="mt-1 border-t border-white/5 pt-2 flex flex-col gap-1.5">
                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Хариултын түүх:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9px]">
                          {entry.answers.map((ans: any, aIdx: number) => (
                            <div key={aIdx} className="bg-black/20 rounded-lg p-2 border border-white/5 flex justify-between items-center gap-2">
                              <span className="text-white/60 truncate max-w-[120px]">{ans.questionText}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={ans.isCorrect ? "text-green-400" : "text-red-400"}>
                                  {ans.givenAnswer}
                                </span>
                                <span>{ans.isCorrect ? "✓" : "✗"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Custom CSS for Shake/Wiggle animation and fade entrances */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: wiggle 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.35s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
