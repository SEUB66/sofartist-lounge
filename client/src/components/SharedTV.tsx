import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import { Tv } from "lucide-react";

interface SharedTVProps {
  currentVideo: {
    url: string;
    title: string;
    broadcaster: string;
  } | null;
  isTransitioning: boolean;
  hasError?: boolean;
}

export default function SharedTV({ currentVideo, isTransitioning, hasError = false }: SharedTVProps) {
  const [showSnow, setShowSnow] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setShowSnow(true);
      const timer = setTimeout(() => {
        setShowSnow(false);
      }, 2000); // 2 seconds of snow screen
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  return (
    <div className="bg-black border-4 border-green-500/30 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Tv size={24} className="text-green-400 animate-pulse" />
          <h2 className="text-2xl font-black text-green-400 font-mono tracking-tighter">
            SHARED TV
          </h2>
        </div>
        {currentVideo && !showSnow && (
          <div className="text-sm text-green-400/70 font-mono">
            📡 BROADCASTING: <span className="text-green-400 font-bold">{currentVideo.broadcaster}</span>
          </div>
        )}
      </div>

      {/* TV Screen */}
      <div className="relative bg-black rounded-lg overflow-hidden border-2 border-green-500/20" style={{ minHeight: '400px' }}>
        {/* ERROR Screen */}
        {hasError && (
          <div className="absolute inset-0 z-50">
            <img 
              src="/tv-error.jpg" 
              alt="ERROR" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Transition Effect (TV Static Coloré) */}
        {showSnow && !hasError && (
          <div className="absolute inset-0 z-50">
            <img 
              src="/tv-static-transition.jpg" 
              alt="TV Static" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Video Content */}
        {currentVideo && !showSnow ? (
          <div className="p-4">
            <div className="mb-3">
              <h3 className="text-green-400 font-mono font-bold text-lg">
                {currentVideo.title}
              </h3>
            </div>
            <VideoPlayer url={currentVideo.url} />
          </div>
        ) : !showSnow ? (
          <div className="absolute inset-0">
            <img 
              src="/tv-idle.webp" 
              alt="TV Idle" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* CRT Scanlines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)',
          }}
        />
      </div>
    </div>
  );
}
