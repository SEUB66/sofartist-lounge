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
    image: "/apple-punk-logo.png" // Apple Punk Logo
  },
  {
    title: "Profound Impact",
    src: "/impact.mp3",
    image: null // Will use default glitch image
  },
  {
    title: "Roots - Northside",
    src: "/roots-northside.mp3",
    image: "/pixel-clouds.jpg"
  },
  {
    title: "Train Heist",
    src: "/train-heist.mp3",
    image: "/banana-heist.png"
  },
  {
    title: "Xmas Lofi",
    src: "/xmas-lofi.mp3",
    image: "/santa-dj.jpg"
  }
];

const RetroTV: React.FC<RetroTVProps> = ({ isOpen, onClose, autoPlayTrigger }) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(2); // Start with Roots - Northside
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    if (audioRef.current && !isTransitioning) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = PLAYLIST[currentTrackIndex].src;
      if (wasPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [currentTrackIndex, isTransitioning]);

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

  const handleTrackChange = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    
    // Pause current audio during transition
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setTimeout(() => {
      if (direction === 'next') {
        setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
      } else {
        setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
      }
      setIsTransitioning(false);
      
      // Resume playing if it was playing before
      if (isPlaying && audioRef.current) {
        // The useEffect for currentTrackIndex will handle loading the new src
        // We just need to ensure it plays after the state update propagates
        setTimeout(() => {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }, 50);
      }
    }, 1000); // 1s transition duration
  };

  const nextTrack = () => handleTrackChange('next');
  const prevTrack = () => handleTrackChange('prev');

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
    if (isTransitioning) {
      return "/tv-static-transition.jpg";
    }
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
        src="/retro-tv-new.png" 
        alt="Retro TV" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-50"
      />

      {/* Screen Content Area - Adjusted for new TV image */}
      <div className={`absolute top-[22%] left-[17%] w-[50%] h-[55%] bg-black rounded-[2rem] overflow-hidden z-40 flex flex-col items-center justify-center ${getScreenGlow()}`}>
        
        {/* Dynamic Screen Image */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
           <img 
             src={getScreenImage()} 
             alt="TV Screen" 
             className={`w-full h-full transition-opacity duration-300 ${!isPlaying ? 'object-contain opacity-90 scale-90' : 'object-cover opacity-60'}`}
           />
        </div>

        {/* Content Overlay (Only show when playing) */}
        {isPlaying && (
          <div className="relative z-10 flex flex-col items-center w-full p-4 bg-black/10 h-full justify-center animate-in fade-in duration-700">
            
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

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40 mix-blend-overlay"></div>
        
        {/* CRT Flicker Animation */}
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none z-50 mix-blend-overlay"></div>
      </div>

      {/* Invisible Click Areas for Physical Knobs */}
      
      {/* Top Knob - Channel/Track Selector */}
      <div className="absolute top-[22%] right-[14%] w-[12%] h-[15%] z-[60] flex flex-col">
        {/* Top half for Next Track */}
        <button 
          onClick={nextTrack}
          className="w-full h-1/2 cursor-pointer hover:bg-white/10 rounded-t-full transition-colors"
          title="Next Track"
          aria-label="Next Track"
        />
        {/* Bottom half for Previous Track */}
        <button 
          onClick={prevTrack}
          className="w-full h-1/2 cursor-pointer hover:bg-white/10 rounded-b-full transition-colors"
          title="Previous Track"
          aria-label="Previous Track"
        />
      </div>

      {/* Middle Knob - Play/Pause */}
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-[40%] right-[15%] w-[10%] h-[12%] z-[60] cursor-pointer hover:bg-white/10 rounded-full transition-colors"
        title={isPlaying ? "Pause" : "Play"}
        aria-label={isPlaying ? "Pause" : "Play"}
      />
    </div>
  );
};

export default RetroTV;
