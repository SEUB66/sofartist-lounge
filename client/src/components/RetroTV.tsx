import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface RetroTVProps {
  isOpen: boolean;
  onClose: () => void;
}

const RetroTV: React.FC<RetroTVProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/lightbath.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle Play/Pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  if (!isOpen) return null;

  const getScreenGlow = () => {
    switch (theme) {
      case 'dark': return 'shadow-[inset_0_0_50px_rgba(6,182,212,0.5)]';
      case 'light': return 'shadow-[inset_0_0_50px_rgba(249,115,22,0.5)]';
      case 'unicorn': return 'shadow-[inset_0_0_50px_rgba(236,72,153,0.5)]';
      default: return 'shadow-[inset_0_0_50px_rgba(255,255,255,0.5)]';
    }
  };

  const getVisualizerColor = () => {
    switch (theme) {
      case 'dark': return 'bg-cyan-400';
      case 'light': return 'bg-orange-500';
      case 'unicorn': return 'bg-pink-500';
      default: return 'bg-white';
    }
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
      <div className={`absolute top-[15%] left-[12%] w-[62%] h-[60%] bg-black/80 rounded-[2rem] overflow-hidden z-40 flex flex-col items-center justify-center p-4 ${getScreenGlow()}`}>
        
        {/* Retro Visualizer */}
        <div className="flex items-end justify-center gap-1 h-20 w-full mb-4">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`w-2 rounded-t-sm transition-all duration-100 ${getVisualizerColor()}`}
              style={{ 
                height: isPlaying ? `${Math.random() * 100}%` : '10%',
                opacity: 0.8 
              }}
            />
          ))}
        </div>

        {/* Track Info */}
        <div className="text-center mb-4">
          <p className={`font-mono text-xs tracking-widest uppercase ${theme === 'light' ? 'text-orange-300' : 'text-cyan-300'}`}>
            Now Playing
          </p>
          <p className="text-white font-bold text-sm truncate w-48">
            Ms. Pac-Man Theme
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-full ${theme === 'light' ? 'bg-orange-500' : 'bg-cyan-600'} text-white hover:scale-110 transition-transform`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40"></div>
      </div>
    </div>
  );
};

export default RetroTV;
