import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { 
  Menu, 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Gamepad2, 
  User, 
  Mail, 
  BookOpen, 
  Send, 
  Briefcase, 
  Clock, 
  Terminal,
  Compass,
  Code,
  Flame,
  Gamepad,
  Star,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import PlayableGames from './components/PlayableGames';
import CurryAI from './components/CurryAI';
import MeAIChat from './components/MeAIChat';

export default function App() {
  const [activeLink, setActiveLink] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Playable game state
  const [activePlayGame, setActivePlayGame] = useState<string | null>(null);
  
  // Custom interactive Rose Sunset state - false by default so it's not scary or shocking!
  const [isRedMode, setIsRedMode] = useState(false);

  // Form states for contact me
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');
  
  // Rating state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Music Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [songTitle, setSongTitle] = useState('Bolderdene Crawl');
  const [audioSource, setAudioSource] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [activeMusicSource, setActiveMusicSource] = useState<'helix' | 'suno'>('suno');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Music Player Side Effects
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && activeMusicSource === 'helix') {
        audioRef.current.play().catch(e => {
          console.log("Audio play blocked or error:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioSource, activeMusicSource]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMusicMuted ? 0 : musicVolume;
    }
  }, [musicVolume, isMusicMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMusicMuted(!isMusicMuted);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSource(url);
      setSongTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setIsPlaying(true);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setAudioSource(customUrl.trim());
      const urlParts = customUrl.trim().split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const name = lastPart ? lastPart.split('?')[0] : 'Custom Network Stream';
      setSongTitle(decodeURIComponent(name.replace(/\.[^/.]+$/, "")));
      setIsPlaying(true);
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  // Handle invitation/joining submit
  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please provide a valid email address.');
      return;
    }
    setEmailError('');
    setIsSubmitted(true);
  };

  // Handle contact message submit
  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      setContactError('All fields are required to establish high-fidelity link.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      setContactError('Please enter a valid communication frequency (email).');
      return;
    }
    setContactError('');
    setContactSubmitted(true);
    // Reset form after submission
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 100);
  };

  // Close invite modal and reset form state
  const closeInviteModal = () => {
    setShowInviteModal(false);
    setTimeout(() => {
      setEmail('');
      setIsSubmitted(false);
    }, 400);
  };

  const navLinks = ['Home', 'About Me', 'Contact Me', '🤖 My Idol', 'My Games', 'My Story', '⌨️ Typeracer'];

  const featuredGames = [
    {
      title: "Atmosphere: Zero",
      genre: "Sci-Fi Ambient Puzzle",
      year: "2026",
      desc: "Navigate through monochromatic spatial anomalies in a decaying space sanctuary where sound is your only guide.",
      platforms: ["PC / Windows", "WebGL"],
      status: "Actively Developing",
      hue: "border-red-500/30 shadow-red-500/5",
    },
    {
      title: "Mirage City",
      genre: "Cinematic Narrative Platformer",
      year: "2025",
      desc: "A stylized 2D adventure focusing on a neon-drenched metropolis seen through the eyes of a silent shadow manipulator.",
      platforms: ["PC / Steam", "macOS"],
      status: "Released Pre-Alpha",
      hue: "border-sky-500/20 shadow-sky-500/5",
    },
    {
      title: "Silence of the Horizon",
      genre: "Survival Sandbox Simulation",
      year: "2026",
      desc: "Castaway simulator on a gas-giant celestial dome. Craft filters, manage thermal pressure, and listen to radio static.",
      platforms: ["Steam Deck", "Windows"],
      status: "Prototyping Stage",
      hue: "border-red-500/20 shadow-red-500/5",
    },
    {
      title: "Anime Guesser",
      genre: "Interactive Anime Quiz",
      year: "2026",
      desc: "Аниме сонирхогчдод зориулсан эможи болон баатрын дүр таах хөгжөөнт тоглоом. Зөв хариулбал бонус оноо цуглуулж амьд үлдээрэй!",
      platforms: ["WebGL", "Mobile Friendly"],
      status: "New Release",
      hue: "border-yellow-500/30 shadow-yellow-500/5",
    },
  ];

  return (
    <div id="bolderdene-app-container" className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-background text-foreground select-none transition-all duration-700">
      
      {/* Fullscreen Video Background */}
      <video
        ref={videoRef}
        id="hero-background-video"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-70 transition-opacity duration-1000"
        autoPlay
        loop
        muted={true}
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />

      {/* Background/Ambient Audio Element */}
      <audio
        ref={audioRef}
        id="bg-music-element"
        src={audioSource}
        loop
        preload="auto"
      />

      {/* Cozy Rose/Amber ambient overlay gradient when sunset mode is active */}
      {isRedMode && (
        <div className="absolute inset-0 z-0 bg-radial-gradient from-red-950/10 via-transparent to-amber-950/10 pointer-events-none opacity-40 mix-blend-screen" />
      )}

      {/* Glassmorphic Navigation */}
      <header id="main-navigation" className="relative z-20 w-full">
        <nav className="relative flex items-center justify-between px-10 py-8 max-w-7xl mx-auto">
          
          {/* Logo brand / Personal Name */}
          <a
            id="logo-brand"
            href="#home"
            onClick={() => setActiveLink('Home')}
            className="text-3xl tracking-tighter text-foreground transition-all duration-300 hover:opacity-90 active:scale-95 flex items-center gap-1 group"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Bolderdene
            <sup className={`text-xs ml-0.5 font-sans font-medium hover:rotate-12 transition-all duration-300 ${isRedMode ? 'text-red-500 scale-110 drop-shadow-[0_0_4px_#ff0000]' : 'text-foreground'}`}>®</sup>
          </a>

          {/* Core Navigation menu */}
          <div id="desktop-links" className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              if (link === '⌨️ Typeracer') {
                return (
                  <a
                    key={link}
                    id="nav-typeracer"
                    href="https://typer-sage.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm tracking-wide transition-all duration-300 relative py-1 cursor-pointer font-medium text-white/60 hover:text-white"
                  >
                    {link}
                  </a>
                );
              }
              return (
                <button
                  key={link}
                  id={`nav-${link.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveLink(link)}
                  className={`text-sm tracking-wide transition-all duration-300 relative py-1 cursor-pointer font-medium ${
                    activeLink === link
                      ? 'text-foreground font-semibold scale-102'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link}
                  {activeLink === link && (
                    <span
                      id={`active-indicator-${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full animate-pulse transition-all duration-500 ${
                        isRedMode ? 'bg-red-500 shadow-[0_0_10px_#ff0000]' : 'bg-white shadow-[0_0_8px_#ffffff]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Right action items (Red theme switch & Contact CTA) */}
          <div id="desktop-actions" className="hidden md:flex items-center gap-4 ml-8 lg:ml-14">
            
            {/* Interactive Sunset Theme Custom Controller */}
            <button
              id="red-mode-selector"
              onClick={() => setIsRedMode(!isRedMode)}
              className={`p-2 rounded-full border transition-all duration-300 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono tracking-wider cursor-pointer ${
                isRedMode 
                  ? 'bg-red-950/30 border-red-500/30 text-red-400 font-semibold shadow-[0_0_12px_rgba(255, 0, 0,0.15)]' 
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white'
              }`}
              title="Toggle Cosy Sunset Theme"
            >
              <span className={`w-2 h-2 rounded-full ${isRedMode ? 'bg-red-500 animate-ping' : 'bg-white/30'}`} />
              {isRedMode ? 'COSY SUNSET: ACTIVE' : 'COSY SUNSET OFF'}
            </button>

            <button
              id="nav-cta-begin-journey"
              onClick={() => {
                setActiveLink('Contact Me');
              }}
              className={`liquid-glass rounded-full px-7 py-3 text-sm font-medium tracking-wide uppercase text-foreground transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer ${
                isRedMode ? 'shadow-[inset_0_1px_1px_rgba(255, 0, 0,0.15)] border-red-500/10' : ''
              }`}
            >
              Begin Journey
            </button>
          </div>

          {/* Mobile Navigation controls */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile Sunset toggle */}
            <button
              id="mobile-red-toggle"
              onClick={() => setIsRedMode(!isRedMode)}
              className={`p-2.5 rounded-full border transition-all duration-300 ${
                isRedMode 
                  ? 'bg-red-950/30 border-red-500/30 text-red-500' 
                  : 'liquid-glass border-white/10 text-white/50'
              }`}
            >
              <Flame className={`w-4 h-4 ${isRedMode ? 'animate-pulse' : ''}`} />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="liquid-glass rounded-full p-2.5 text-foreground transition-all duration-300 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu-dropdown"
            className="absolute top-full left-0 right-0 mx-6 mt-1 rounded-3xl liquid-glass border border-white/10 z-50 p-5 flex flex-row flex-wrap justify-center gap-2.5 animate-fade-rise"
          >
            {navLinks.map((link) => {
              if (link === '⌨️ Typeracer') {
                return (
                  <a
                    key={link}
                    id="mobile-nav-typeracer"
                    href="https://typer-sage.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs px-3.5 py-2 rounded-full border border-white/5 bg-white/5 text-muted-foreground hover:text-white transition-all duration-200 font-medium"
                  >
                    {link}
                  </a>
                );
              }
              return (
                <button
                  key={link}
                  id={`mobile-nav-${link.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    setActiveLink(link);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs px-3.5 py-2 rounded-full border transition-all duration-200 cursor-pointer font-medium ${
                    activeLink === link
                      ? 'bg-white/10 text-foreground border-white/20 font-semibold'
                      : 'bg-white/5 border-white/5 text-muted-foreground hover:text-white'
                  }`}
                >
                  {link}
                </button>
              );
            })}
            <button
              id="mobile-cta-begin-journey"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveLink('Contact Me');
              }}
              className="liquid-glass rounded-full w-full py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground mt-2 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Contact Me
            </button>
          </div>
        )}
      </header>

      {/* Main Dynamic Workspace Panel */}
      <main id="hero-main-layout" className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 md:py-[100px] max-w-7xl mx-auto w-full transition-all duration-500">
        
        {/* TAB 1: HOME */}
        {activeLink === 'Home' && (
          <div id="home-view" className="flex flex-col items-center justify-center max-w-5xl mx-auto">
            {/* Dynamic Typography Header */}
            <h1
              id="hero-heading"
              className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-5xl font-normal text-foreground animate-fade-rise"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Агуу зүйлс <em className={`italic opacity-60 font-serif transition-colors duration-500 ${isRedMode ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>нам гүм</em> дундаас <em className={`italic opacity-60 font-serif transition-colors duration-500 ${isRedMode ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>амилан босдог.</em>
            </h1>

            {/* Description body with slow cinematic delay */}
            <p
              id="hero-subtext"
              className="text-white/60 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay font-sans font-medium hover:text-white/80 transition-colors duration-300"
            >
              Намайг <span className="text-white font-semibold">Болд-Эрдэнэ</span> гэдэг. Би 16 настай тоглоом хөгжүүлэгч, програмист. Том мөрөөдөж, тууштай хөдөлмөрлөн өөрийнхөө дижитал ертөнцийг бүтээхийн төлөө цуцалтгүй урагшилдаг. Боломж биднийг хүлээж байдаггүй, бид түүнийг өөрсдийн гараар урлаж бий болгодог.
            </p>

            {/* Micro-actions / Dashboard summary */}
            <div id="home-cta-wrapper" className="animate-fade-rise-delay-2 flex flex-wrap gap-4 items-center justify-center mt-12">
              <button
                id="hero-cta-begin-journey"
                onClick={() => setActiveLink('My Story')}
                className={`liquid-glass rounded-full px-16 py-6 text-lg font-medium tracking-tight text-foreground hover:scale-105 transition-all duration-300 cursor-pointer active:scale-98 relative group ${isRedMode ? 'shadow-[0_4px_24px_rgba(255, 0, 0,0.15)] border-red-500/20' : ''}`}
              >
                <span className="flex items-center gap-3">
                  Read My Story
                  <span className={`inline-block transition-transform duration-300 group-hover:translate-x-1 ${isRedMode ? 'text-red-500' : ''}`}>→</span>
                </span>
              </button>

              <button
                id="hero-cta-view-games"
                onClick={() => setActiveLink('My Games')}
                className={`rounded-full border px-8 py-4 text-sm font-medium backdrop-blur-md transition-all duration-300 active:scale-95 ${
                  isRedMode 
                    ? 'border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/5 bg-red-950/10' 
                    : 'border-white/15 text-white hover:border-white/30'
                }`}
              >
                Explore Games
              </button>
            </div>
            
            {/* Interactive Age Indicator Badge */}
            <div className="mt-16 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 animate-fade-rise-delay-2 py-1.5 px-3 rounded-full bg-white/5 border border-white/5">
              <span className={`h-2 w-2 rounded-full animate-pulse ${isRedMode ? 'bg-red-500 shadow-[0_0_8px_#ff0000]' : 'bg-white shadow-[0_0_4px_#fff]'}`}></span>
              16 Years Orbiting / Active Development Status
            </div>
          </div>
        )}

        {/* TAB 2: ABOUT ME */}
        {activeLink === 'About Me' && (
          <div id="about-view" className="w-full max-w-4xl mx-auto text-left animate-fade-rise flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between border-b border-white/5 pb-6">
              <div className="flex flex-col gap-2 max-w-2xl">
                <span className="text-xs font-mono tracking-widest text-white/40 uppercase flex items-center gap-1">
                  <User className={`w-3 h-3 ${isRedMode ? 'text-red-500' : ''}`} /> Identity Matrix
                </span>
                <h2 className="text-4xl sm:text-5xl leading-tight font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Hey, I am Bolderdene.
                </h2>
                <p className="text-white/60 text-base sm:text-lg font-sans mt-2">
                  At 16, I construct interactive systems, atmospheric video games, and write code to shape experiences out of the void.
                </p>
              </div>
              <div className="shrink-0 relative group self-center md:self-auto">
                <div className={`absolute -inset-2 rounded-2xl blur-xl opacity-20 transition-all duration-500 group-hover:opacity-45 ${isRedMode ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-1.5 flex items-center justify-center shadow-lg hover:border-white/20 transition-all duration-300">
                  <img
                    src="/src/assets/images/minecraft_male_avatar_1782282218085.jpg"
                    alt="Bolderdene Minecraft Avatar"
                    className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Bento Grid Presentation Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              
              <div className={`md:col-span-2 liquid-glass rounded-3xl p-8 border flex flex-col justify-between ${isRedMode ? 'border-red-500/10 shadow-[0_4px_24px_rgba(255, 0, 0,0.03)] bg-red-950/5' : 'border-white/10'}`}>
                <div>
                  <h3 className="text-xl mb-4 text-white font-medium flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    <Code className={`w-4 h-4 ${isRedMode ? 'text-red-500' : 'text-white'}`} /> The Philosophy
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-sans mb-4">
                    "I believe in systems that listen. In an era where tech is loud and cluttered, I dedicate my code to crafting minimalist, safe digital environments, games where silence paints the depth and interactions feel genuinely responsive."
                  </p>
                  <p className="text-xs text-white/40 leading-relaxed font-mono">
                    Current Tech Interests: React 19, TypeScript, Rust, Unreal Engine, Procedural Generation, and Ambient Sound Design.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
                  <span>AGE: 16 YEARS</span>
                  <span className={isRedMode ? 'text-red-500' : ''}>SANCTUARY: DIGITAL</span>
                </div>
              </div>

              <div className={`liquid-glass rounded-3xl p-8 border flex flex-col justify-between ${isRedMode ? 'border-red-500/20 shadow-[0_4px_20px_rgba(255, 0, 0,0.05)] bg-red-950/5' : 'border-white/10'}`}>
                <div>
                  <h3 className="text-xl mb-4 text-white font-medium flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    <Sparkles className={`w-4 h-4 ${isRedMode ? 'text-red-500' : 'text-white'}`} /> Core Focus
                  </h3>
                  <div className="flex flex-col gap-3 font-sans text-xs">
                    <div className="flex items-center gap-2 text-white/80">
                      <div className={`w-1.5 h-1.5 rounded-full ${isRedMode ? 'bg-red-500' : 'bg-white'}`}></div>
                      <span>Atmospheric Game Systems</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <div className={`w-1.5 h-1.5 rounded-full ${isRedMode ? 'bg-red-500' : 'bg-white'}`}></div>
                      <span>Glassmorphic Interface Design</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <div className={`w-1.5 h-1.5 rounded-full ${isRedMode ? 'bg-red-500' : 'bg-white'}`}></div>
                      <span>Interactive Storytelling</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <div className={`w-1.5 h-1.5 rounded-full ${isRedMode ? 'bg-red-500' : 'bg-white'}`}></div>
                      <span>Ambient sound synthesizers</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveLink('My Story')}
                  className={`mt-6 text-xs font-mono tracking-wider hover:text-white transition-colors flex items-center gap-1.5 self-start ${isRedMode ? 'text-red-500 hover:text-red-400' : 'text-white/50'}`}
                >
                  READ MY STORY <span>→</span>
                </button>
              </div>

            </div>

            {/* Suno Audio Anthem Widget */}
            <div className={`liquid-glass rounded-3xl p-6 sm:p-8 border flex flex-col md:flex-row items-stretch justify-between gap-6 ${isRedMode ? 'border-red-500/10 shadow-[0_4px_24px_rgba(255, 0, 0,0.03)] bg-red-950/5' : 'border-white/10'}`}>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Music className={`w-4 h-4 ${isRedMode ? 'text-red-500 animate-pulse' : 'text-yellow-500 animate-pulse'}`} />
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Миний Сүлд Дуу / My Suno Track</span>
                  </div>
                  <h3 className="text-3xl font-normal text-white mb-2 animate-pulse" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Bolderdene's Cosmic Anthem
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans mb-4">
                    Би өөрийн бүтээлүүд болон энэхүү дижитал орон зайд зориулж Suno ашиглан гүн уур амьсгалтай, сансрын аялгууг зохиосон юм. Энэхүү аялгуу нь миний код бичих, мөрөөдөх аяллыг илэрхийлдэг.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 border-t border-white/5 pt-4 mt-2">
                  <span>ЖАНР: AMBIENT / ELECTRONIC</span>
                  <span>•</span>
                  <span>CREATED VIA: SUNO AI</span>
                </div>
              </div>

              <div className="md:w-96 flex flex-col justify-center bg-black/25 rounded-2xl p-2 border border-white/5 relative group overflow-hidden">
                <iframe 
                  src="https://suno.com/embed/DuJLqZH8oVdjPzxd" 
                  width="100%" 
                  height="145" 
                  style={{ width: '100%', borderRadius: '12px', border: 'none', overflow: 'hidden', background: 'transparent' }} 
                  frameBorder="0" 
                  allow="clipboard-write; gamepad; microphone; picture-in-picture; encrypted-media; gyroscope; accelerometer; play-share"
                  title="Bolderdene Suno Audio"
                />
              </div>
            </div>

            {/* Micro achievement indicators */}
            <div className={`flex flex-wrap items-center justify-between gap-6 px-4 py-3 border rounded-2xl text-xs font-mono text-white/60 ${isRedMode ? 'bg-red-950/10 border-red-500/15' : 'bg-white/5 border-white/5'}`}>
              <span className="flex items-center gap-2">
                <Compass className={`w-3.5 h-3.5 animate-spin ${isRedMode ? 'text-red-500' : ''}`} style={{ animationDuration: '8s' }} /> 
                STATUS: INVENTING REALITIES
              </span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="flex items-center gap-2">
                <Briefcase className={`w-3.5 h-3.5 ${isRedMode ? 'text-red-500' : ''}`} /> 
                PROJECTS IN ORBIT: 3 ACTIVE
              </span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="flex items-center gap-2">
                <Clock className={`w-3.5 h-3.5 ${isRedMode ? 'text-red-500' : ''}`} /> 
                EST: 2010 (16 YEARS OLD)
              </span>
            </div>

          </div>
        )}

        {/* TAB 3: CONTACT ME */}
        {activeLink === 'Contact Me' && (
          <div id="contact-view" className="w-full max-w-xl mx-auto text-left animate-fade-rise flex flex-col gap-6">
            <div className="flex flex-col gap-1 items-center text-center">
              <span className="text-xs font-mono tracking-widest text-white/40 uppercase flex items-center gap-1.5 mb-1.5">
                <Terminal className={`w-3.5 h-3.5 ${isRedMode ? 'text-red-500' : ''}`} /> Established Communication Node
              </span>
              <h2 className="text-4xl text-foreground font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Send a message to Bolderdene
              </h2>
              <p className="text-sm text-white/60 max-w-md">
                Have a project idea, a game jam proposal, or just want to discuss deep digital design? Drop a direct line below or email me directly at <a href="mailto:erdeneasanga09@gmail.com" className="text-white hover:underline transition-all duration-300">erdeneasanga09@gmail.com</a>.
              </p>
            </div>

            {/* Custom Contact Form */}
            <div className={`liquid-glass border rounded-3xl p-8 relative overflow-hidden transition-all duration-500 ${isRedMode ? 'border-red-500/20 bg-red-950/5' : 'border-white/10'}`}>
              {!contactSubmitted ? (
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 font-sans">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono text-white/40 tracking-wider">YOUR CODENAME</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g., Nomad"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all duration-300"
                        style={{ borderColor: isRedMode ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)' }}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono text-white/40 tracking-wider">COMMUNICATION FREQUENCY</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all duration-300"
                        style={{ borderColor: isRedMode ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono text-white/40 tracking-wider">THE CORE TRANSMISSION</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Type your authentic narrative/proposal..."
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all duration-300 resize-none"
                      style={{ borderColor: isRedMode ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>

                  {contactError && (
                    <span className="text-xs text-red-500 font-mono mt-1">
                      ⚠️ {contactError}
                    </span>
                  )}

                  <button
                    type="submit"
                    className={`liquid-glass rounded-xl w-full py-4 text-center text-sm font-semibold text-foreground mt-2 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      isRedMode ? 'border-red-500/20 bg-red-950/20 text-red-300 hover:border-red-500/40 shadow-[0_4px_16px_rgba(255, 0, 0, 0.1)]' : ''
                    }`}
                  >
                    Transmit Signal <Send className="w-4 h-4 ml-1" />
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="bg-white/10 rounded-full p-4 mb-4 animate-pulse">
                    <Check className={`w-8 h-8 ${isRedMode ? 'text-red-500' : 'text-white'}`} />
                  </div>
                  
                  <h3 className="text-3xl font-serif text-white font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Transmission Received
                  </h3>
                  
                  <p className="text-sm text-white/60 mb-6 max-w-sm">
                    Thank you, <span className="text-white font-medium">{contactName}</span>. Your signal has bypassed the cosmic noise and reached Bolderdene's terminal successfully. 
                  </p>

                  <div className={`text-[10px] font-mono uppercase px-4 py-2 border rounded-lg select-all mb-6 ${isRedMode ? 'bg-red-950/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-white/40'}`}>
                    SIGNAL FREQUENCY COMPLIANT: #{Math.floor(200000 + Math.random() * 800000)} / BOLDERDENE
                  </div>

                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="rounded-full border border-white/10 px-6 py-2.5 text-xs font-mono hover:text-white hover:border-white/30 transition-all text-white/40"
                  >
                    TRANSMIT ANOTHER SIGNAL
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3.5: STEPHEN CURRY AI */}
        {activeLink === '🤖 My Idol' && (
          <CurryAI isRedMode={isRedMode} />
        )}

        {/* TAB 4: MY GAMES */}
        {activeLink === 'My Games' && (
          <div id="games-view" className="w-full max-w-5xl mx-auto text-left animate-fade-rise flex flex-col gap-6">
            {activePlayGame ? (
              <PlayableGames 
                gameTitle={activePlayGame} 
                onClose={() => setActivePlayGame(null)} 
                isRedMode={isRedMode} 
              />
            ) : (
              <>
                <div className="flex flex-col gap-1 items-center text-center">
                  <span className="text-xs font-mono tracking-widest text-white/40 uppercase flex items-center gap-1.5 mb-1.5">
                    <Gamepad2 className={`w-4 h-4 ${isRedMode ? 'text-red-500' : ''}`} /> The Interactive Artifacts
                  </span>
                  <h2 className="text-5xl text-foreground font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Interactive Creations
                  </h2>
                  <p className="text-sm text-white/60 max-w-2xl mt-1">
                    Explore the atmospheric worlds crafted by a 16-year-old developer. Immersive environments with rich mechanical details.
                  </p>
                </div>

                {/* Interactive Game Showcase Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {featuredGames.map((game, idx) => (
                    <div
                      key={idx}
                      className={`liquid-glass rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${
                        isRedMode 
                          ? 'border-red-500/20 bg-red-950/5 shadow-red-500/5' 
                          : 'border-white/10 bg-white/5 shadow-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-4">
                          <span>EST: {game.year}</span>
                          <span className={`px-2 py-0.5 rounded border ${isRedMode ? 'bg-red-950/20 border-red-500/20 text-red-400' : 'bg-white/5 border-white/5 text-white/80'}`}>{game.status}</span>
                        </div>

                        <h3 className="text-2xl font-normal text-white mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                           {game.title}
                        </h3>

                        <span className={`text-xs font-mono mb-4 block ${isRedMode ? 'text-red-500/80' : 'text-sky-300/80'}`}>
                          {game.genre}
                        </span>

                        <p className="text-xs text-white/60 leading-relaxed font-sans mt-3">
                          {game.desc}
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-white/5 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-1.5 font-mono">
                          {game.platforms.map((plat) => (
                            <span key={plat} className={`text-[9px] border px-2 py-0.5 rounded ${isRedMode ? 'bg-red-950/10 border-red-500/10 text-red-400/50' : 'bg-white/5 border-white/10 text-white/50'}`}>
                              {plat}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => setActivePlayGame(game.title)}
                          className={`w-full py-2.5 rounded-xl font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${
                            isRedMode
                              ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>ТОГЛОХ / PLAY IN BROWSER</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <p className="text-xs font-mono text-white/30 uppercase tracking-widest">
                    MORE EXPERIMENTS LAUNCHING SOON / UNREAL ENGINE 5 & WEBGL ENGINE COMPATIBLE
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 5: MY STORY */}
        {activeLink === 'My Story' && (
          <div id="story-view" className="w-full max-w-3xl mx-auto text-left animate-fade-rise flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono tracking-widest text-white/40 uppercase flex items-center gap-1.5 mb-1">
                <BookOpen className={`w-3.5 h-3.5 ${isRedMode ? 'text-red-500' : ''}`} /> Chronologies of a Creator
              </span>
              <h2 className="text-5xl text-foreground font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
                The Narrative: Bolderdene
              </h2>
            </div>

            {/* Immersive Scrollable Story Space */}
            <div className={`liquid-glass border rounded-3xl p-8 md:p-10 font-sans leading-relaxed text-white/80 flex flex-col gap-6 ${isRedMode ? 'border-red-500/15 bg-red-950/5' : 'border-white/10'}`}>
              
              <div className={`border-l-2 pl-4 py-1 italic font-serif text-lg ${isRedMode ? 'border-red-500/40 text-red-300' : 'border-white/20 text-white/90'}`}>
                "Where dreams rise through the silence... that phrase is not just cosmetic text. It is my operating lifestyle."
              </div>

              <p className="text-sm sm:text-base">
                Миний түүх өвлийн урт шөнүүдэд, анивчих дэлгэцийн өмнө эхэлсэн юм. At 16, while the modern world rushes at a hyper-stimulated, frantic speed, I chose a different road. Би нам гүм байдал, гүн гүнзгий утга санаа, нарийн бодож боловсруулсан дизайн давамгайлсан интерактив урлагийг бүтээхийг зорьсон.
              </p>

              <p className="text-sm sm:text-base">
                As a developer who started compiling lines of code at a young age, electronic worlds became my playground. Энгийн алгоритмын туршилтуудаас эхлээд WebGL дээр процедурын аргаар ертөнц бүтээх хөдөлгүүр бичих хүртэл, миний тоглоомууд амар амгалан руу хөтлөх гарц болж хувирсан билээ. I don't design for instant dopamine; I design for the deep thinker, the quiet developer, the lone astronomer.
              </p>

              <p className="text-sm sm:text-base">
                Ихэнх хүмүүс өсвөр насны хүүхдүүдийн хийсэн төслүүдийг нэг бол эмх замбараагүй, эсвэл том компаниудыг дуурайсан байдаг гэж боддог. But in my world, Bolderdene stands for something genuine. Би интерактив түүхүүд бүтээдэг, учир нь код гэдэг бол хязгааргүй гоо сайхан, гүн бодлын ертөнцийг нээх түлхүүр юм. Every pixel is set under strict design guidelines: minimalism, high context, glassmorphic structures, and absolute harmony with the ambient soundscapes.
              </p>

              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${isRedMode ? 'bg-red-950/30 border-red-500/20 text-red-500 font-extrabold' : 'bg-white/10 border-white/10 text-white'}`}>
                    B
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-semibold text-white">Bolderdene</h5>
                    <p className="text-[10px] font-mono text-white/40">16-Year-Old Visionary</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveLink('Contact Me')}
                  className={`text-xs font-mono tracking-wider hover:underline uppercase flex items-center gap-2 group cursor-pointer ${isRedMode ? 'text-red-500 hover:text-red-400' : 'text-white'}`}
                >
                  PARTICIPATE IN THE EXPEDITION <span className="group-hover:translate-x-1 duration-200 transition-transform">→</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer Utilities */}
      <footer id="cinematic-footer" className="relative z-10 w-full max-w-7xl mx-auto px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
        <div id="footer-copyright">
          © {new Date().getFullYear()} BOLDERDENE STUDIO. DESIGNED SPECIFICALLY FOR HEAVY THINKERS.
        </div>
        
        <div className="flex items-center gap-6">
          <div id="footer-coords" className="text-white/30 hidden lg:block">
            ACTIVE PORTFOLIO ENGINE / 16 Y/O DEVELOPER
          </div>
          <div className="flex items-center gap-1.5" title="Rate this portfolio" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
              const starValue = i + 1;
              const isFilled = hoverRating >= starValue || (!hoverRating && rating >= starValue);
              return (
                <Star 
                  key={i} 
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  className={`w-4 h-4 transition-all duration-300 cursor-pointer ${
                    isFilled 
                      ? (isRedMode ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_#ff0000]' : 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]') 
                      : 'text-white/20 fill-transparent hover:text-white/40'
                  } ${hoverRating === starValue ? 'scale-125' : 'hover:scale-110'}`} 
                />
              );
            })}
          </div>
        </div>
      </footer>

      {/* Floating Ambient Music Player */}
      <div 
        id="ambient-music-player" 
        className="fixed bottom-24 right-4 sm:right-8 z-40 flex flex-col items-end gap-3 font-sans"
      >
        {isPlayerExpanded ? (
          <div 
            id="expanded-music-player"
            className={`w-72 sm:w-80 rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 shadow-2xl flex flex-col gap-4 animate-fadeIn ${
              isRedMode 
                ? 'bg-red-950/20 border-red-500/20 shadow-red-950/30 text-white' 
                : 'bg-zinc-950/45 border-white/10 shadow-black/50 text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Music className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''} ${isRedMode ? 'text-red-500' : 'text-yellow-500'}`} style={{ animationDuration: '3s' }} />
                <span className="text-xs font-mono tracking-wider font-semibold uppercase">Хөгжим Тоглуулагч / Audio Player</span>
              </div>
              <button 
                onClick={() => setIsPlayerExpanded(false)}
                className="text-white/40 hover:text-white transition-colors text-[10px] uppercase font-mono px-2 py-0.5 border border-white/15 rounded hover:border-white/30"
              >
                ХУРААХ / HIDE
              </button>
            </div>

            {/* Source Switcher */}
            <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 text-[9px] font-mono">
              <button
                onClick={() => {
                  setActiveMusicSource('suno');
                  setIsPlaying(false);
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 cursor-pointer ${
                  activeMusicSource === 'suno'
                    ? 'bg-white/10 text-white font-semibold shadow-inner'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                🎵 SUNO ANTHEM
              </button>
              <button
                onClick={() => setActiveMusicSource('helix')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-300 cursor-pointer ${
                  activeMusicSource === 'helix'
                    ? 'bg-white/10 text-white font-semibold shadow-inner'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                📻 AMBIENT SYNTH
              </button>
            </div>

            {activeMusicSource === 'suno' ? (
              <div className="flex flex-col gap-2">
                <div className="bg-white/5 rounded-xl p-1 border border-white/5 overflow-hidden">
                  <iframe 
                    src="https://suno.com/embed/DuJLqZH8oVdjPzxd" 
                    width="100%" 
                    height="130" 
                    style={{ width: '100%', borderRadius: '10px', border: 'none', overflow: 'hidden', background: 'transparent' }} 
                    frameBorder="0" 
                    allow="clipboard-write; gamepad; microphone; picture-in-picture; encrypted-media; gyroscope; accelerometer; play-share"
                    title="Bolderdene Suno Audio Floating"
                  />
                </div>
                <div className="text-[9px] font-mono text-center text-white/30 uppercase tracking-widest mt-0.5">
                  Compose your thoughts in deep resonance
                </div>
              </div>
            ) : (
              <>
                {/* Current Song Display */}
                <div className="flex flex-col gap-1.5 bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Одоо Тоглож буй / NOW PLAYING</span>
                  <div className="text-xs font-medium truncate text-white" title={songTitle}>
                    {songTitle}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={handlePlayPause}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isPlaying 
                        ? (isRedMode ? 'bg-red-500 text-white shadow-[0_0_12px_#ff0000]' : 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.5)]')
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 flex-1">
                    <button 
                      onClick={handleMuteToggle}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {isMusicMuted || musicVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMusicMuted ? 0 : musicVolume}
                      onChange={(e) => {
                        setMusicVolume(parseFloat(e.target.value));
                        if (isMusicMuted) setIsMusicMuted(false);
                      }}
                      className={`h-1 rounded-lg appearance-none cursor-pointer bg-white/10 accent-current flex-1 ${
                        isRedMode ? 'text-red-500' : 'text-yellow-500'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setIsPlayerExpanded(true)}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl cursor-pointer ${
              isPlaying 
                ? (isRedMode ? 'bg-red-500 text-white border-red-500/30 animate-pulse' : 'bg-yellow-500 text-black border-yellow-500/30 animate-pulse')
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-white/80 hover:text-white border-white/10'
            }`}
            title="Нээх / Open Music Player"
          >
            <Music className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
          </button>
        )}
      </div>

      {/* Interactive Invitation Modal */}
      {showInviteModal && (
        <div
          id="invite-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-500 animate-fadeIn"
          onClick={closeInviteModal}
        >
          <div
            id="invite-modal-container"
            className={`w-full max-w-md rounded-3xl liquid-glass border p-8 flex flex-col relative ${isRedMode ? 'border-red-500/20 bg-red-950/10 modal-rose-shadow' : 'border-white/10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              id="invite-modal-close"
              onClick={closeInviteModal}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
              <div id="invite-form-content" className="flex flex-col">
                <span className="text-white/40 font-mono text-xs uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Sparkles className={`w-3 h-3 ${isRedMode ? 'text-red-500' : 'text-white/50'}`} /> Secure your reservation
                </span>
                
                <h3
                  id="invite-modal-title"
                  className="text-3xl text-foreground font-normal mb-3"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Enter Bolderdene's Realm
                </h3>
                
                <p id="invite-modal-description" className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Join a tight-knit network of deep digital creators. VIP access keys to early prototype downloads, atmospheric asset packs, and game builds are dispatched progressively.
                </p>

                <form onSubmit={handleInviteSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label id="invite-email-label" htmlFor="invite-email-input" className="text-xs font-mono text-white/40 tracking-wider">
                      EMAIL ADDRESS
                    </label>
                    <input
                      id="invite-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="presence@bolderdene.dev"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors w-full"
                      style={{ borderColor: isRedMode ? 'rgba(255, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)' }}
                    />
                    {emailError && (
                      <span id="invite-email-error" className="text-xs text-red-500 mt-1">
                        {emailError}
                      </span>
                    )}
                  </div>

                  <button
                    id="invite-submit-button"
                    type="submit"
                    className={`liquid-glass rounded-xl w-full py-4 text-center text-sm font-semibold text-foreground mt-4 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      isRedMode ? 'border-red-500/20 bg-red-950/20 text-red-300 hover:border-red-500/40 shadow-[0_4px_16px_rgba(255, 0, 0, 0.1)]' : ''
                    }`}
                  >
                    Request Reservation <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div id="invite-success-content" className="flex flex-col items-center text-center py-6">
                <div className="bg-white/10 rounded-full p-4 mb-4">
                  <Check className={`w-8 h-8 ${isRedMode ? 'text-red-500' : 'text-white'}`} />
                </div>
                
                <h3
                  id="success-title"
                  className="text-3xl text-foreground font-normal mb-2"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Reservation Confirmed
                </h3>
                
                <p id="success-description" className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                  An exclusive invitation node will soon materialize at <span className="text-foreground font-medium">{email}</span> as we prepare your dedicated link to the alpha repositories.
                </p>

                <div className={`text-[10px] font-mono tracking-wider uppercase border rounded-lg px-4 py-2 select-all ${isRedMode ? 'bg-red-950/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-white/40'}`}>
                  TOKEN # {Math.floor(100000 + Math.random() * 900000)} / Bolderdene
                </div>

                <button
                  id="success-continue-button"
                  onClick={closeInviteModal}
                  className="liquid-glass rounded-full px-8 py-3 text-sm font-semibold text-foreground mt-8 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
                >
                  Return to Silence
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Messenger-style floating icon helper (Me-AI) */}
      <MeAIChat />
    </div>
  );
}
