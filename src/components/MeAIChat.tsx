import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  RotateCcw, 
  Sparkles, 
  User, 
  Minimize2,
  Gamepad2,
  Key,
  BookOpen,
  Volume2,
  VolumeX,
  Bot
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function MeAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('me_ai_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        content: "Сайн уу! 🏀🏐 Би бол Билгүүндэмбэрэл (Bolderdene)-ийн AI хувилбар буюу түүний найрсаг Me-AI туслах байна. Сагс болон волейбол тоглох дуртай, Linkin Park-ийн Crawling сонсож, Haikyuu үзэж, ирээдүйд IT инженер болох мөрөөдөлтэй түүний хөгжүүлсэн тоглоомууд эсвэл сонирхлын талаар юу ч хамаагүй асуугаарай! Yaaanaaa, эсвэл ooo tgsnuu гээд яриагаа эхлэх үү? 😉",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('me_ai_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(scrollToBottom, 200);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sound synthesis for tech hums
  const playTechClick = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Audio blocked
    }
  };

  const playTechReply = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Cool sci-fi chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(900, ctx.currentTime);
      osc1.frequency.setValueAtTime(1300, ctx.currentTime + 0.08);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(450, ctx.currentTime);
      osc2.frequency.setValueAtTime(650, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Audio blocked
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    playTechClick();

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/me-chat', {
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
        throw new Error('Failed to connect to Bolderdene AI.');
      }

      const data = await response.json();

      setTimeout(() => {
        playTechReply();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsLoading(false);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Уучлаарай, сүлжээний алдаа гарлаа. Дахин нэг оролдоод үзээрэй! 💻⚙️",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleReset = () => {
    playTechClick();
    if (window.confirm("Me-AI-тай хийсэн яриаг шинэчлэх үү?")) {
      const initialMsg: Message = {
        role: 'assistant',
        content: "Яриа шинэчлэгдлээ! 😉 Шинэ тоглолт эхэллээ. Билгүүндэмбэрэлийн сонирхол, зорилго эсвэл хийсэн тоглоомуудаас асуугаарай. Idk man, ямар ч хамаагүй юм асууж болно шүү!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMsg]);
      localStorage.removeItem('me_ai_chat_history');
    }
  };

  const meStarterPrompts = [
    { label: "🎮 Тоглоомууд", text: "Чи Билгүүндэмбэрэлийн хийсэн тоглоомуудын талаар ярьж өгөөч." },
    { label: "🏐 Сонирхол / Хобби", text: "Билгүүндэмбэрэлийн сонирхдог спорт, сонсдог хөгжим, дуртай зүйлсийг хэлээч." },
    { label: "🎯 IT Мөрөөдөл", text: "Түүний ирээдүйн зорилго болон мөрөөдөл нь юу вэ?" },
    { label: "🏀 Idol Coach", text: "Стеф Карригийн AI-тай хэрхэн уулзах вэ? Мөн хэрхэн ажилладаг вэ?" }
  ];

  return (
    <div id="me-ai-floating-container" className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Floating Messenger Icon Trigger */}
      {!isOpen && (
        <button
          id="me-ai-trigger-bubble"
          onClick={() => {
            setIsOpen(true);
            playTechReply();
          }}
          className="relative group p-4 rounded-full bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500 text-white shadow-[0_4px_20px_rgba(14,165,233,0.4)] hover:shadow-[0_8px_25px_rgba(14,165,233,0.6)] border border-white/10 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center"
        >
          {unreadCount > 0 && (
            <span id="me-ai-unread-badge" className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-black animate-bounce">
              {unreadCount}
            </span>
          )}
          <MessageCircle className="w-6 h-6 animate-pulse" />
          
          {/* Tooltip hint on hover */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-black/90 text-white text-[11px] px-3 py-1.5 rounded-xl border border-white/10 tracking-wide font-mono whitespace-nowrap transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100">
            Me-AI туслахтай чатлах 🤖
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          id="me-ai-chat-window" 
          className="w-80 sm:w-96 h-[500px] rounded-3xl overflow-hidden flex flex-col border border-white/10 bg-neutral-950/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] animate-fadeIn duration-300"
        >
          {/* Window Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-sky-950/60 via-neutral-950 to-indigo-950/60 px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center border border-white/10 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-950 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Me-AI Туслах</h4>
                <p className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Bolderdene Clone</p>
              </div>
            </div>

            {/* Window Actions */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition text-white/40 hover:text-white cursor-pointer"
                title={soundEnabled ? "Дуу хаах" : "Дуу нээх"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={handleReset}
                className="p-1.5 rounded-lg hover:bg-white/5 transition text-white/40 hover:text-white cursor-pointer"
                title="Яриаг шинэчлэх"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition text-white/40 hover:text-white cursor-pointer"
                title="Хаах"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Message Bubble */}
                <div className="flex flex-col gap-0.5">
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-tr-none border border-sky-500/30' 
                      : 'bg-white/5 border border-white/10 text-neutral-100 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                  <span className={`text-[8px] font-mono opacity-30 mt-0.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2 max-w-[80%]">
                <div className="flex flex-col gap-0.5">
                  <div className="px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[9px] text-white/30 font-mono tracking-widest ml-1">БОДОЖ БАЙНА...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Starter Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-black/30 border-t border-white/5">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block mb-1">
                Шууд асуух асуултууд:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {meStarterPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    className="p-1.5 text-left rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] text-white/70 hover:text-white transition-all cursor-pointer font-mono truncate"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-white/10 flex gap-2 bg-neutral-950"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Me-AI-аас хөгжүүлэгчийн тухай асуу..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-3 py-2 text-[11px] text-white placeholder-white/25 outline-none transition-all disabled:opacity-40"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl px-3.5 bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
