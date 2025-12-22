import { useState, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const TRACKS = [
  { title: "Default Track", url: "/default-track.mp3" },
  { title: "Lightbath", url: "/lightbath.mp3" },
  { title: "Xmas Lofi", url: "/xmas-lofi.mp3" },
  { title: "Train Heist", url: "/train-heist.mp3" },
  { title: "Roots Northside", url: "/roots-northside.mp3" },
];

export default function MobileRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([70]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(false);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(false);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-purple-500/30 p-4 md:hidden z-50">
      <audio
        ref={audioRef}
        src={TRACKS[currentTrack].url}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="max-w-md mx-auto">
        {/* Track Info */}
        <div className="text-center mb-3">
          <div className="text-xs text-purple-400 mb-1">📻 DEVCAVE RADIO</div>
          <div className="text-sm font-bold text-white truncate">
            {TRACKS[currentTrack].title}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTrack}
            className="text-purple-400 hover:text-purple-300"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={togglePlay}
            className="bg-purple-600 hover:bg-purple-500 rounded-full w-12 h-12 p-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6" fill="currentColor" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextTrack}
            className="text-purple-400 hover:text-purple-300"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-purple-400" />
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-purple-400 w-8">{volume[0]}%</span>
        </div>
      </div>
    </div>
  );
}
