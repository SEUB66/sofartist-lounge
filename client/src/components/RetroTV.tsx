import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface RetroTVProps {
  isOpen: boolean;
  onClose: () => void;
  autoPlayTrigger: boolean;
}

const PLAYLIST = [
  {
    title: "Ms. Pac-Man Theme",
    src: "/lightbath.mp3", // Using the pacman file
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/2/25/Ms._Pac-Man_arcade_flyer.png/220px-Ms._Pac-Man_arcade_flyer.png"
  },
  {
    title: "Profound Impact",
    src: "/impact.mp3",
    image: null // Will use default glitch image
  }
];

const RetroTV: React.FC<RetroTVProps> = ({ isOpen, onClose, autoPlayTrigger }) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(PLAYLIST[currentTrackIndex].src);
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle Track Change
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = PLAYLIST[currentTrackIndex].src;
      if (wasPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [currentTrackIndex]);

  // Handle Auto-Play Trigger
  useEffect(() => {
    if (autoPlayTrigger && isOpen) {
      setIsPlaying(true);
    } else if (!isOpen) {
      setIsPlaying(false);
    }
  }, [autoPlayTrigger, isOpen]);

  // Handle Play/Pause State
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  if (!isOpen) return null;

  const getScreenGlow = () => {
    switch (theme) {
      case 'dark': return 'shadow-[inset_0_0_50px_rgba(6,182,212,0.5)]';
      case 'light': return 'shadow-[inset_0_0_50px_rgba(249,115,22,0.5)]';
      case 'unicorn': return 'shadow-[inset_0_0_50px_rgba(236,72,153,0.5)]';
      default: return 'shadow-[inset_0_0_50px_rgba(255,255,255,0.5)]';
    }
  };

  // Determine which image to show
  const getScreenImage = () => {
    if (!isPlaying) {
      return "/game-over.jpg";
    }
    // If playing, check if track has specific image, otherwise use glitch
    return PLAYLIST[currentTrackIndex].image || "/static-glitch.jpg";
  };

  return (
    <div className="fixed left-10 top-1/2 -translate-y-1/2 w-[500px] h-[400px] z-40 transition-all duration-500 animate-in slide-in-from-left fade-in">
      {/* TV Frame Image */}
      <img 
        src="/retro-tv.png" 
        alt="Retro TV" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-50"
      />

      {/* Screen Content Area */}
      <div className={`absolute top-[15%] left-[12%] w-[62%] h-[60%] bg-black rounded-[2rem] overflow-hidden z-40 flex flex-col items-center justify-center relative ${getScreenGlow()}`}>
        
        {/* Dynamic Screen Image */}
        <div className="absolute inset-0">
           <img 
             src={getScreenImage()} 
             alt="TV Screen" 
             className={`w-full h-full object-cover transition-opacity duration-300 ${!isPlaying ? 'opacity-80' : 'opacity-60'}`}
           />
        </div>

        {/* Content Overlay (Only show when playing) */}
        {isPlaying && (
          <div className="relative z-10 flex flex-col items-center w-full p-4 bg-black/30 backdrop-blur-sm h-full justify-center animate-in fade-in duration-700">
            
            {/* Track Info */}
            <div className="text-center mb-4">
              <p className={`font-mono text-[10px] tracking-widest uppercase mb-1 ${theme === 'light' ? 'text-orange-300' : 'text-cyan-300'} drop-shadow-md`}>
                Now Playing
              </p>
              <p className="text-white font-bold text-sm truncate w-48 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {PLAYLIST[currentTrackIndex].title}
              </p>
            </div>
          </div>
        )}

        {/* Controls (Always visible but subtle) */}
        <div className="absolute bottom-4 z-20 flex items-center gap-6">
          <button 
            onClick={prevTrack}
            className="text-white/70 hover:text-white hover:scale-110 transition-all drop-shadow-lg"
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-full ${theme === 'light' ? 'bg-orange-500/80' : 'bg-cyan-600/80'} text-white hover:scale-110 transition-transform shadow-lg backdrop-blur-sm border border-white/20`}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="text-white/70 hover:text-white hover:scale-110 transition-all drop-shadow-lg"
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40 mix-blend-overlay"></div>
        
        {/* CRT Flicker Animation */}
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none z-50 mix-blend-overlay"></div>
      </div>
    </div>
  );
};

export default RetroTV;
