import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { trpc } from '@/lib/trpc';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

// TV Style configurations - screen positions precisely measured for each TV
const TV_STYLES = {
  '1960s': {
    name: '1960s Vintage',
    image: '/tv-frame-1960s.png',
    // Wooden TV with screen on left side, knobs on right - adjusted for perfect centering
    screen: { top: '15%', left: '14%', width: '53%', height: '51%', borderRadius: '6px' }
  },
  '1970s': {
    name: '1970s Space Age',
    image: '/tv-frame-1970s.png',
    // Orange retro TV with rounded screen, knobs on right side - centered perfectly
    screen: { top: '24%', left: '20%', width: '61%', height: '51%', borderRadius: '10px' }
  },
  'retro': {
    name: 'Retro Antenna',
    image: '/tv-frame-retro-antenna.png',
    // Retro TV with rabbit ear antennas, wood frame - transparent screen
    screen: { top: '31%', left: '13%', width: '66%', height: '39%', borderRadius: '6px' }
  },
  '1980s': {
    name: '1980s Classic',
    image: '/tv-frame-1980s-ugly.png',
    // Black TV with speaker grille on right side - transparent screen
    screen: { top: '6%', left: '6%', width: '73%', height: '86%', borderRadius: '4px' }
  },
  '1990s': {
    name: '1990s VCR Combo',
    image: '/tv-frame-1990s.png',
    // Dark gray TV with VCR slot at bottom, large curved screen
    screen: { top: '14%', left: '11%', width: '81%', height: '63%', borderRadius: '12px' }
  },
  'crt': {
    name: 'CRT Monitor',
    image: '/tv-frame-crt.png',
    // Beige CRT monitor with buttons at bottom
    screen: { top: '15%', left: '12%', width: '79%', height: '67%', borderRadius: '6px' }
  },
  'trinitron': {
    name: 'Sony Trinitron',
    image: '/tv-frame-trinitron.png',
    // Legendary Sony Trinitron CRT - transparent screen
    screen: { top: '11%', left: '11%', width: '81%', height: '79%', borderRadius: '4px' }
  },
  'sony2005': {
    name: 'Sony 2005 Widescreen',
    image: '/tv-frame-sony-widescreen.png',
    // Sony widescreen flat panel TV from 2005 - 16:9 aspect ratio, x3 size on desktop, transparent screen
    screen: { top: '11%', left: '15%', width: '73%', height: '79%', borderRadius: '4px' },
    desktopScale: 3,
    mobileScale: 1
  }
} as const;

type TVStyleKey = keyof typeof TV_STYLES;

// Default music tracks
const DEFAULT_TRACKS = [
  { id: 0, title: 'Upside Down Snowglobe', artist: 'SEUB', file: '/SEUB-FUCKYOUFUCKINGFUCK.mp3', cover: '/upsidedownsnowglobe.jpg' },
  { id: 1, title: 'Laboratorium', artist: 'Joel Rampage', file: '/ES_Laboratorium-JoelRampage.mp3', cover: '/ride.jpg' },
  { id: 2, title: 'Ur Face', artist: 'Le Dorean', file: '/ES_UrFace-LeDorean.mp3', cover: '/level-up.jpg' },
  { id: 3, title: 'Mind Obsession', artist: 'Baegel', file: '/ES_mindobsession-baegel.mp3', cover: '/game-over.jpg' },
  { id: 4, title: 'Roots Northside', artist: 'Unknown', file: '/roots-northside.mp3', cover: '/gangsta-claus.jpg' },
  { id: 5, title: 'Train Heist', artist: 'Unknown', file: '/train-heist.mp3', cover: '/santa-dj.jpg' },
  { id: 6, title: 'Xmas Bromance', artist: 'Unknown', file: '/xmas-bromance.mp3', cover: '/gangsta-claus.jpg' },
  { id: 7, title: 'Xmas Lofi', artist: 'Unknown', file: '/xmas-lofi.mp3', cover: '/santa-dj.jpg' },
];

interface CustomizableTVProps {
  isOpen: boolean;
  onClose?: () => void;
  initialStyle?: TVStyleKey;
  initialPosition?: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
  onStyleChange?: (style: TVStyleKey) => void;
  startPlaying?: boolean;
}

const CustomizableTV: React.FC<CustomizableTVProps> = ({
  isOpen,
  onClose,
  initialStyle = '1970s',
  initialPosition = { x: 16, y: 16 },
  size = 'medium',
  onStyleChange,
  startPlaying = false
}) => {
  const { theme } = useTheme();
  const { user } = useUser();
  
  // TV State
  const [tvStyle, setTvStyle] = useState<TVStyleKey>(initialStyle);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Transition State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  
  // Music State
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Refs
  const tvRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const transitionSoundRef = useRef<HTMLAudioElement>(null);
  
  // tRPC
  const { data: playbackState, refetch: refetchPlayback } = trpc.playback.getPlaybackState.useQuery();
  const { data: uploadedMedia, refetch: refetchMedia } = trpc.upload.listMedia.useQuery(
    { type: 'music' },
    { refetchInterval: 5000 } // Auto-refresh every 5 seconds to catch new uploads
  );
  const setTrackMutation = trpc.playback.setCurrentTrack.useMutation();
  const setPlayingMutation = trpc.playback.setIsPlaying.useMutation();
  
  const { data: savedTvStyle } = trpc.settings.getTvStyle.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );
  const updateTvStyleMutation = trpc.settings.updateTvStyle.useMutation();
  
  // Size configurations
  const sizeConfig = {
    small: { width: 180, height: 180 },
    medium: { width: 280, height: 280 },
    large: { width: 400, height: 400 }
  };
  
  // Calculate size with desktop/mobile scaling for specific TVs
  const baseSize = sizeConfig[size];
  const styleConfig = TV_STYLES[tvStyle];
  
  // Check if desktop (width > 768px)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Apply scale based on device
  const scale = (styleConfig as any).desktopScale && isDesktop 
    ? (styleConfig as any).desktopScale 
    : (styleConfig as any).mobileScale || 1;
  
  const currentSize = {
    width: baseSize.width * scale,
    height: baseSize.height * scale
  };
  
  const currentStyleConfig = styleConfig;
  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  
  // Merge uploaded tracks with default tracks
  useEffect(() => {
    if (uploadedMedia && uploadedMedia.length > 0) {
      const uploadedTracks = uploadedMedia.map((m, idx) => ({
        id: DEFAULT_TRACKS.length + idx,
        title: m.title,
        artist: m.uploaderNickname || 'Unknown',
        file: m.fileUrl,
        cover: m.coverUrl || '/game-over.jpg',
      }));
      setTracks([...DEFAULT_TRACKS, ...uploadedTracks]);
    }
  }, [uploadedMedia]);
  
  // Load TV style from database
  useEffect(() => {
    if (savedTvStyle && TV_STYLES[savedTvStyle as TVStyleKey]) {
      setTvStyle(savedTvStyle as TVStyleKey);
    }
  }, [savedTvStyle]);
  
  // Handle startPlaying prop - glitch transition then play
  useEffect(() => {
    if (startPlaying && !hasStarted) {
      setHasStarted(true);
      playTransitionEffect(() => {
        setIsPlaying(true);
        setPlayingMutation.mutate({ isPlaying: true });
      });
    }
  }, [startPlaying, hasStarted]);
  
  // Sync with database playback state
  useEffect(() => {
    if (playbackState) {
      if (playbackState.currentTrackId !== null && playbackState.currentTrackId !== currentTrackIndex) {
        setCurrentTrackIndex(playbackState.currentTrackId % tracks.length);
      }
      if (playbackState.isPlaying !== isPlaying) {
        setIsPlaying(playbackState.isPlaying);
      }
    }
  }, [playbackState, tracks.length]);
  
  // Periodic sync
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPlayback();
    }, 2000);
    return () => clearInterval(interval);
  }, [refetchPlayback]);
  
  // Audio playback control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying && !showGlitch && !isTransitioning) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, showGlitch, isTransitioning, currentTrackIndex, volume, isMuted]);
  
  // Play transition effect (snow + sound) - only for 1 second
  const playTransitionEffect = useCallback((onComplete?: () => void) => {
    setIsTransitioning(true);
    setShowGlitch(true);
    
    if (transitionSoundRef.current) {
      transitionSoundRef.current.currentTime = 0;
      transitionSoundRef.current.volume = 0.4;
      transitionSoundRef.current.play().catch(() => {});
    }
    
    setTimeout(() => {
      setShowGlitch(false);
      setIsTransitioning(false);
      onComplete?.();
    }, 1000);
  }, []);
  
  // Handle track end
  const handleTrackEnd = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTransitionEffect(() => {
      setCurrentTrackIndex(nextIndex);
      setTrackMutation.mutate({ trackId: nextIndex });
    });
  }, [currentTrackIndex, tracks.length, setTrackMutation, playTransitionEffect]);
  
  // Next track
  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTransitionEffect(() => {
      setCurrentTrackIndex(nextIndex);
      setTrackMutation.mutate({ trackId: nextIndex });
    });
  }, [currentTrackIndex, tracks.length, isTransitioning, setTrackMutation, playTransitionEffect]);
  
  // Previous track
  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTransitionEffect(() => {
      setCurrentTrackIndex(prevIndex);
      setTrackMutation.mutate({ trackId: prevIndex });
    });
  }, [currentTrackIndex, tracks.length, isTransitioning, setTrackMutation, playTransitionEffect]);
  
  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    const newPlaying = !isPlaying;
    setIsPlaying(newPlaying);
    setPlayingMutation.mutate({ isPlaying: newPlaying });
  }, [isPlaying, setPlayingMutation]);
  
  // Volume toggle
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);
  
  // Style change
  const handleStyleChange = useCallback((newStyle: TVStyleKey) => {
    setTvStyle(newStyle);
    setShowStylePicker(false);
    onStyleChange?.(newStyle);
    
    if (user?.id) {
      updateTvStyleMutation.mutate({ userId: user.id, tvStyle: newStyle });
    }
  }, [onStyleChange, user?.id, updateTvStyleMutation]);
  
  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, e.clientX - dragStart.x),
          y: Math.max(0, e.clientY - dragStart.y)
        });
      }
    };
    
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);
  
  if (!isOpen) return null;
  
  // Get current display image
  const getDisplayImage = () => {
    if (showGlitch || isTransitioning) {
      return '/static-glitch.jpg';
    }
    if (!isPlaying) {
      return '/game-over.jpg';
    }
    return currentTrack?.cover || '/game-over.jpg';
  };
  
  return (
    <div
      ref={tvRef}
      className={`fixed z-[100] cursor-move transition-transform duration-200 ${isDragging ? 'scale-105' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Hidden Audio Elements */}
      <audio
        ref={audioRef}
        src={currentTrack?.file}
        onEnded={handleTrackEnd}
        loop={false}
      />
      <audio ref={transitionSoundRef} src="/tv-channel-change.mp3" preload="auto" />
      
      {/* LAYER 1: Screen Content (BOTTOM - z-index 1) */}
      <div
        className="absolute"
        style={{
          top: currentStyleConfig.screen.top,
          left: currentStyleConfig.screen.left,
          width: currentStyleConfig.screen.width,
          height: currentStyleConfig.screen.height,
          borderRadius: currentStyleConfig.screen.borderRadius,
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {isPoweredOn && (
          <>
            {/* Widescreen Video for Sony 2005 TV */}
            {tvStyle === 'sony2005' ? (
              <video
                src="/widescreen-default.webm"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  objectPosition: 'center center'
                }}
              />
            ) : (
              /* Album Cover / Static Image - Centered and fitted */
              <img
                src={getDisplayImage()}
                alt={currentTrack?.title || 'TV Screen'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: 'center center'
                }}
              />
            )}
            
            {/* Now Playing Overlay - Only when playing */}
            {isPlaying && !showGlitch && !isTransitioning && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <p className="text-white text-[9px] font-bold truncate flex items-center gap-1" style={{ fontFamily: 'VT323, monospace' }}>
                  <span className="text-green-400">▶</span> {currentTrack?.title}
                </p>
                <p className="text-cyan-400 text-[7px] truncate" style={{ fontFamily: 'VT323, monospace' }}>
                  {currentTrack?.artist}
                </p>
              </div>
            )}
            
            {/* Paused Overlay - NO BLACK BACKGROUND so album cover shows through */}
            {!isPlaying && !showGlitch && !isTransitioning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p style={{ fontFamily: 'VT323, monospace' }} className="text-white text-sm animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  ⏸ PAUSED
                </p>
              </div>
            )}
            
            {/* Scanline Effect */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
              }}
            />
          </>
        )}
      </div>
      
      {/* LAYER 2: TV Frame Template (TOP - z-index 10) */}
      <img
        src={currentStyleConfig.image}
        alt={`${currentStyleConfig.name} TV`}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ zIndex: 10 }}
        draggable={false}
      />
      
      {/* LAYER 3: Radio Controls Overlay (visible on hover - z-index 20) */}
      {showControls && isPoweredOn && (
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 rounded-b-lg"
          style={{ zIndex: 20 }}
        >
          <div className="flex items-center justify-center gap-2">
            {/* Back Button */}
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              title="Previous"
            >
              <SkipBack size={14} className="text-white" />
            </button>
            
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-cyan-500/80 hover:bg-cyan-400 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={16} className="text-white" />
              ) : (
                <Play size={16} className="text-white" />
              )}
            </button>
            
            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              title="Next"
            >
              <SkipForward size={14} className="text-white" />
            </button>
            
            {/* Volume Button */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX size={14} className="text-white" />
              ) : (
                <Volume2 size={14} className="text-white" />
              )}
            </button>
            
            {/* Volume Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-12 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>
          
          {/* Track info */}
          <p className="text-center text-[8px] text-white/60 mt-1" style={{ fontFamily: 'VT323, monospace' }}>
            {currentTrackIndex + 1}/{tracks.length} tracks
          </p>
        </div>
      )}
      
      {/* LAYER 4: Style Picker Button (z-index 30) */}
      <button
        onClick={() => setShowStylePicker(!showStylePicker)}
        className="absolute top-0 right-0 bg-purple-600 hover:bg-purple-500 text-white text-xs px-2 py-1 rounded-bl-lg transition-colors"
        style={{ zIndex: 30 }}
        title="Change TV Style"
      >
        📺
      </button>
      
      {/* Style Picker Dropdown */}
      {showStylePicker && (
        <div 
          className="absolute top-8 right-0 bg-gray-900 border border-purple-500 rounded-lg shadow-xl p-2 min-w-[150px]"
          style={{ zIndex: 40 }}
        >
          <p className="text-purple-400 text-xs font-bold mb-2 px-2">Choose TV Era:</p>
          {(Object.keys(TV_STYLES) as TVStyleKey[]).map((styleKey) => (
            <button
              key={styleKey}
              onClick={() => handleStyleChange(styleKey)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                tvStyle === styleKey
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {TV_STYLES[styleKey].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomizableTV;
