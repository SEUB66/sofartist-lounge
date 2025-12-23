import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function DefaultPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-black border-2 border-green-500/30 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
      <audio ref={audioRef} src="/default-track.mp3" />
      
      {/* Album Art */}
      <div className="mb-6 relative group">
        <div className="aspect-square rounded-lg overflow-hidden border-2 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <img
            src="/apple-punk-logo.jpg"
            alt="Apple Punk"
            className="w-full h-full object-cover"
          />
        </div>
        {isPlaying && (
          <div className="absolute inset-0 bg-green-500/10 animate-pulse rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Track Info */}
      <div className="mb-4 text-center">
        <h3 className="text-green-400 font-mono font-bold text-lg mb-1 tracking-wider">
          DISINTEGRATE
        </h3>
        <p className="text-green-400/70 font-mono text-sm">
          Timothy Infinite
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-xs font-mono text-green-400/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Button
            onClick={toggleMute}
            size="sm"
            variant="ghost"
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24 cursor-pointer"
          />
        </div>

        <Button
          onClick={togglePlay}
          size="lg"
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-2 border-green-500 rounded-full w-14 h-14 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </Button>

        <div className="flex-1" />
      </div>

      {/* Equalizer Effect */}
      {isPlaying && (
        <div className="flex items-end justify-center gap-1 mt-6 h-12">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-green-500 rounded-t animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.3 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
