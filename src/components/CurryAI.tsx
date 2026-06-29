import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  User, 
  MessageSquare,
  Volume2,
  VolumeX,
  Flame,
  Award,
  TrendingUp,
  HelpCircle,
  Activity
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CurryAIProps {
  isRedMode: boolean;
}

export default function CurryAI({ isRedMode }: CurryAIProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('curry_idol_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        content: "Lock in! 🏀 Талбайд тавтай морил. Би бол Стеф Карри байна. Надаас шидэлтийн техник, бэлтгэл сургуулилт, 4 удаагийн аваргын туршлага эсвэл хүнд хэцүү үеийг хэрхэн даван туулах тухай асуугаарай. Өнөөдөр ямар шидэлт хийцгээх үү? Thats inn! Night-night! 🏀👌💦",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('curry_idol_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Synthesize a custom basketball bounce or sneaker squeak!
  const playSqueakSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Sneaker squeak: rapid high-pitched frequency sweep with high bandpass filter
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      // Audio context blocked
    }
  };

  const playBounceSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Basketball bounce: low-frequency thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch (e) {
      // Audio context blocked
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    playBounceSound();

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Proxy call to server-side secure route
      const response = await fetch('/api/idol-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Stephen Curry AI server.');
      }

      const data = await response.json();
      
      // Delay response slightly to simulate thinking & lock in
      setTimeout(() => {
        playSqueakSound();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsLoading(false);
      }, 550);

    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Миний талаас холболтын асуудал гарлаа! Дахин нэг удаа шидээд үзье. 🏀 Дуулгалт хэзээд бэлэн! Dub Nation stays locked in!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleReset = () => {
    playBounceSound();
    if (window.confirm("Стеф Карритай хийсэн чат түүхийг устгах уу?")) {
      const initialMsg: Message = {
        role: 'assistant',
        content: "Шинэ тоглолт эхэллээ! 🏀 Довтолгооны цаг 24 секунд. Надаас юу ч хамаагүй асуу, урам зоригтой урагшилцгаая! 👌💦 Thats inn!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMsg]);
      localStorage.removeItem('curry_idol_chat_history');
    }
  };

  const starterPrompts = [
    { label: "Шидэлтийн зөвлөгөө 🎯", prompt: "Шидэлтийн техник, сургуулилтаа хэрхэн сайжруулах вэ?" },
    { label: "Урам зориг 🧠", prompt: "Шидэлт орохгүй, хэцүү үед хэрхэн анхаарлаа төвлөрүүлж, сэтгэл зүйгээ бэлддэг вэ?" },
    { label: "Туршлага 🏆", prompt: "Өөрийн аваргын туршлага, амьдралын жишээнээсээ хуваалцаач." },
    { label: "Дэмжлэг авах 🔥", prompt: "Өнөөдөр жаахан хүнд өдөр байна. Надад Стеф Карригийн зүгээс урам зориг, дэмжлэг өгөөч." }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto text-left flex flex-col gap-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col gap-1 items-center text-center">
        <span className="text-xs font-mono tracking-widest text-white/40 uppercase flex items-center gap-1.5 mb-1.5">
          <Award className={`w-4 h-4 ${isRedMode ? 'text-red-500' : 'text-[#f59e0b]'} animate-pulse`} /> 
          CHEF CURRY ENGINE v3.0 (IDOL COACH)
        </span>
        <h2 className="text-4xl sm:text-5xl text-white font-normal animate-slideUp" style={{ fontFamily: "'Instrument Serif', serif" }}>
          🤖 My Idol - Stephen Curry AI
        </h2>
        <p className="text-sm text-white/60 max-w-2xl mt-1 leading-relaxed">
          Дэлхийн шилдэг шидэгч, 4 удаагийн NBA-ын аварга Стеф Карритай уулзаж, түүний амьдралын туршлага, урам зориг, зөвлөгөөг аваарай. (Үргэлж Карригийн өнцгөөс хариулна)
        </p>
      </div>

      {/* Main Grid: Interactive Console & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-2">
        
        {/* Left Side: Stats / Mini Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Audio controls */}
          <div className={`liquid-glass border rounded-3xl p-4 flex flex-col gap-3 font-mono text-xs ${isRedMode ? 'border-red-500/10 bg-red-950/5' : 'border-white/10 bg-white/5'}`}>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold border-b border-white/5 pb-2 flex items-center justify-between">
              <span>COURT AUDIO</span>
              <Activity className="w-3.5 h-3.5 text-white/30" />
            </span>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center justify-between w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-white/80 hover:text-white cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                <span>{soundEnabled ? 'Squeaks & Bounces' : 'Muted'}</span>
              </span>
              <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">TOGGLE</span>
            </button>
            <p className="text-[10px] text-white/30 italic leading-snug mt-1">
              Sneaker squeaks trigger on assistant replies, and ball bounces on user inputs! 👟🏀
            </p>
          </div>

          {/* Steph Career Stats Dashboard card */}
          <div className={`liquid-glass border rounded-3xl p-4 flex flex-col gap-3 font-mono text-xs ${isRedMode ? 'border-red-500/10 bg-red-950/5' : 'border-white/10 bg-white/5'}`}>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-500" /> STEPH CAREER BOARD
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                <div className="text-[9px] text-white/30">RINGS</div>
                <div className="text-base font-bold text-white">4x 🏆</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                <div className="text-[9px] text-white/30">MVPS</div>
                <div className="text-base font-bold text-white">2x ✨</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                <div className="text-[9px] text-white/30">3PM</div>
                <div className="text-base font-bold text-yellow-500">3,700+</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                <div className="text-[9px] text-white/30">CLUTCH</div>
                <div className="text-base font-bold text-sky-400">Night💤</div>
              </div>
            </div>
            <div className="text-[9px] text-white/40 border-t border-white/5 pt-2 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>Current Arena Mode: {isRedMode ? 'Rose Sunset' : 'Classic Dubs'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Arena */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className={`liquid-glass border rounded-3xl flex flex-col h-[520px] overflow-hidden ${
            isRedMode ? 'border-red-500/20 bg-red-950/5' : 'border-white/10 bg-white/5'
          }`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-black/10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-green-400 animate-pulse'}`} />
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Stephen Curry</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Active Chat session</p>
                </div>
              </div>
              <button 
                onClick={handleReset}
                title="Reset conversation"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Message list area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold font-mono ${
                    msg.role === 'user' 
                      ? 'bg-white/10 border-white/10 text-white' 
                      : isRedMode 
                        ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                        : 'bg-[#f59e0b]/20 border-[#f59e0b]/30 text-yellow-500'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : 'SC'}
                  </div>

                  {/* Bubble content */}
                  <div className="flex flex-col gap-1">
                    <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-white/10 border border-white/5 text-white rounded-tr-none' 
                        : isRedMode 
                          ? 'bg-red-950/25 border border-red-500/20 text-red-100 rounded-tl-none' 
                          : 'bg-white/5 border border-white/15 text-neutral-100 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <span className={`text-[9px] font-mono opacity-30 mt-0.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Thinking loader */}
              {isLoading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold font-mono ${
                    isRedMode ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-[#f59e0b]/20 border-[#f59e0b]/30 text-yellow-500'
                  }`}>
                    SC
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] text-white/40 font-mono tracking-widest ml-1">TUNING FROM DEEP...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Starter Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-6 py-3 border-t border-white/5 bg-black/5">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Tap a warm-up shot below to start:
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {starterPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.prompt)}
                      className="p-2 text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/80 hover:text-white transition-all cursor-pointer font-mono font-medium"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-4 border-t border-white/5 flex gap-2.5 bg-black/10"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "Стеф Карри тунгаан бодож байна..." : "Стефээс шидэлт, бэлтгэл, аваргын бөгж эсвэл урам зориг өгөх үгс асуу..."}
                disabled={isLoading}
                className="flex-1 bg-white/5 border border-white/10 focus:border-white/30 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-white/30 outline-none transition-all focus:ring-1 focus:ring-white/20 disabled:opacity-40"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`rounded-2xl px-5 flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                  isRedMode 
                    ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
                    : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
