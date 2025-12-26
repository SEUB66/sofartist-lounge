import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { trpc } from '@/lib/trpc';
import BubblePop from './BubblePop';

interface RetroTVProps {
  isOpen: boolean;
  onClose: () => void;
  autoPlayTrigger: boolean;
}

const DEFAULT_playlist = [
  {
    title: "Ms. Pac-Man Theme",
    src: "/lightbath.mp3",
    image: "/apple-punk-logo.png"
  },
  {
    title: "Profound Impact",
    src: "/impact.mp3",
    image: null
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
  },
  {
    title: "Mind Obsession - Baegel",
    src: "/ES_mindobsession-baegel.mp3",
    image: "/ambiancemusic.jpg"
  },
  {
    title: "Ur Face - Le Dorean",
    src: "/ES_UrFace-LeDorean.mp3",
    image: "/yougottasprint.jpg"
  },
  {
    title: "Laboratorium - Joel Rampage",
    src: "/ES_Laboratorium-JoelRampage.mp3",
    image: "/ride.jpg"
  },
  {
    title: "Elevex - Chanson Officielle",
    src: "/Elevex-ChansonOfficielle.mp3",
    image: "/logo.png"
  }
];

const RetroTV: React.FC<RetroTVProps> = ({ isOpen, onClose, autoPlayTrigger }) => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(2);
  const [playlist, setPlaylist] = useState(DEFAULT_playlist);
  const [likeTrigger, setLikeTrigger] = useState(0);
  const [dislikeTrigger, setDislikeTrigger] = useState(0);
  const [trackLikes, setTrackLikes] = useState<{[key: number]: {likes: number, dislikes: number}}>({});
  
  // Charger l'etat de lecture depuis la DB
  const { data: playbackState, refetch: refetchPlayback } = trpc.playback.getPlaybackState.useQuery();
  const setCurrentTrackMutation = trpc.playback.setCurrentTrack.useMutation();
  const setIsPlayingMutation = trpc.playback.setIsPlaying.useMutation();
  const likeMutation = trpc.upload.likeMedia.useMutation();
  const dislikeMutation = trpc.upload.dislikeMedia.useMutation();
  
  // Charger les tracks uploadees depuis la DB
  const { data: uploadedTracks } = trpc.upload.listMedia.useQuery({ type: 'music' });
  
  // Combiner la playlist par defaut avec les tracks uploadees
  useEffect(() => {
    if (uploadedTracks && uploadedTracks.length > 0) {
      const userTracks = uploadedTracks.map(track => ({
        title: track.title,
        src: track.fileUrl,
        image: track.coverUrl || '/apple-punk-logo.png',
        id: track.id
      }));
      setPlaylist([...DEFAULT_playlist, ...userTracks]);
      
      // Initialize likes/dislikes
      const likesData: {[key: number]: {likes: number, dislikes: number}} = {};
      uploadedTracks.forEach(track => {
        likesData[track.id] = { likes: track.likes || 0, dislikes: track.dislikes || 0 };
      });
      setTrackLikes(likesData);
    }
  }, [uploadedTracks]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [volume, setVolume] = useState(50);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tvRef = useRef<HTMLDivElement>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(playlist[currentTrackIndex].src);
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync playback state to DB
  useEffect(() => {
    setIsPlayingMutation.mutate({ isPlaying });
  }, [isPlaying]);

  // Sync current track to DB
  useEffect(() => {
    if (playlist.length > 0) {
      setCurrentTrackMutation.mutate({ trackId: currentTrackIndex });
    }
  }, [currentTrackIndex]);

  // Handle Track Change
  useEffect(() => {
    if (audioRef.current && !isTransitioning) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.src = playlist[currentTrackIndex].src;
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

  // Periodically refresh playback state
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPlayback();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchPlayback]);

  const handleTrackChange = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    
    const channelSound = new Audio('/tv-channel-change.mp3');
    channelSound.volume = 0.3;
    channelSound.play().catch(e => console.log('Channel change sound failed:', e));
    
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setTimeout(() => {
      if (direction === 'next') {
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
      } else {
        setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      }
      setIsTransitioning(false);
      
      if (isPlaying && audioRef.current) {
        setTimeout(() => {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        }, 50);
      }
    }, 1000);
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

  const getScreenImage = () => {
    if (isTransitioning) {
      return "/tv-static-transition.jpg";
    }
    if (!isPlaying) {
      return "/game-over.jpg";
    }
    return playlist[currentTrackIndex].image || "/static-glitch.jpg";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div 
      ref={tvRef}
      className="fixed w-[180px] h-[144px] md:w-[280px] md:h-[224px] z-[15] transition-all duration-500 animate-in slide-in-from-left fade-in cursor-move"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
    >
      <img 
        src="/retro-tv-new.png" 
        alt="Retro TV" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-50"
      />

      <div className={`absolute top-[42px] left-[42px] w-[120px] h-[105px] md:top-[74px] md:left-[74px] md:w-[210px] md:h-[185px] bg-black rounded-[0.8rem] md:rounded-[1.5rem] overflow-hidden z-40 flex flex-col items-center justify-center ${getScreenGlow()}`}>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black">
           <img 
             src={getScreenImage()} 
             alt="TV Screen" 
             className={`w-full h-full transition-opacity duration-300 ${!isPlaying ? 'object-contain opacity-90 scale-90' : 'object-cover opacity-60'}`}
           />
        </div>

        {isPlaying && (
          <div className="relative z-10 flex flex-col items-center w-full p-4 bg-black/10 h-full justify-center animate-in fade-in duration-700">
            
            <div className="text-center mb-4">
              <p className={`text-[6px] md:text-[10px] tracking-widest uppercase mb-1 ${theme === 'light' ? 'text-orange-300' : 'text-cyan-300'} drop-shadow-md`}>
                Now Playing
              </p>
              <p className="text-white font-bold text-[8px] md:text-sm truncate w-24 md:w-48 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {playlist[currentTrackIndex].title}
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40 mix-blend-overlay"></div>
        
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none z-50 mix-blend-overlay"></div>
      </div>

      <div className="absolute top-[42px] right-[34px] w-[29px] h-[29px] md:top-[74px] md:right-[59px] md:w-[50px] md:h-[50px] z-[60] flex flex-col">
        <button 
          onClick={nextTrack}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full h-1/2 cursor-pointer hover:bg-white/10 rounded-t-full transition-colors"
          title="Next Track"
          aria-label="Next Track"
        />
        <button 
          onClick={prevTrack}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full h-1/2 cursor-pointer hover:bg-white/10 rounded-b-full transition-colors"
          title="Previous Track"
          aria-label="Previous Track"
        />
      </div>

      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-[77px] right-[36px] w-[24px] h-[23px] md:top-[134px] md:right-[63px] md:w-[42px] md:h-[40px] z-[60] cursor-pointer hover:bg-white/10 rounded-full transition-colors"
        title={isPlaying ? "Pause" : "Play"}
        aria-label={isPlaying ? "Pause" : "Play"}
      />

      {/* Like/Dislike Buttons */}
      <div className="absolute bottom-[12px] left-[12px] right-[12px] md:bottom-[20px] md:left-[20px] md:right-[20px] z-[60] flex items-center justify-between">
        {/* Like Button */}
        <div className="relative">
          <button
            onClick={() => {
              const currentTrack = playlist[currentTrackIndex];
              if ((currentTrack as any).id) {
                likeMutation.mutate({ mediaId: (currentTrack as any).id }, {
                  onSuccess: (data) => {
                    setTrackLikes(prev => ({
                      ...prev,
                      [(currentTrack as any).id]: { ...prev[(currentTrack as any).id], likes: data.likes }
                    }));
                    setLikeTrigger(prev => prev + 1);
                  }
                });
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative bg-green-500/80 hover:bg-green-400 text-white rounded-full p-1 md:p-2 transition-all hover:scale-110 shadow-lg"
            title="Like"
          >
            <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
            {(playlist[currentTrackIndex] as any).id && trackLikes[(playlist[currentTrackIndex] as any).id] && (
              <span className="absolute -top-1 -right-1 bg-white text-green-600 text-[6px] md:text-[8px] font-bold rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                {trackLikes[(playlist[currentTrackIndex] as any).id].likes}
              </span>
            )}
            <BubblePop trigger={likeTrigger} color="#22c55e" />
          </button>
        </div>

        {/* Dislike Button */}
        <div className="relative">
          <button
            onClick={() => {
              const currentTrack = playlist[currentTrackIndex];
              if ((currentTrack as any).id) {
                dislikeMutation.mutate({ mediaId: (currentTrack as any).id }, {
                  onSuccess: (data) => {
                    setTrackLikes(prev => ({
                      ...prev,
                      [(currentTrack as any).id]: { ...prev[(currentTrack as any).id], dislikes: data.dislikes }
                    }));
                    setDislikeTrigger(prev => prev + 1);
                  }
                });
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative bg-red-500/80 hover:bg-red-400 text-white rounded-full p-1 md:p-2 transition-all hover:scale-110 shadow-lg"
            title="Dislike"
          >
            <ThumbsDown className="w-3 h-3 md:w-4 md:h-4" />
            {(playlist[currentTrackIndex] as any).id && trackLikes[(playlist[currentTrackIndex] as any).id] && (
              <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[6px] md:text-[8px] font-bold rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                {trackLikes[(playlist[currentTrackIndex] as any).id].dislikes}
              </span>
            )}
            <BubblePop trigger={dislikeTrigger} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetroTV;
