import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, Upload, Trash2, Volume2 } from "lucide-react";

export default function Live() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: tracks = [], refetch } = trpc.radio.list.useQuery();
  const uploadMutation = trpc.radio.upload.useMutation({
    onSuccess: () => {
      toast.success("Track uploaded!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteMutation = trpc.radio.delete.useMutation({
    onSuccess: () => {
      toast.success("Track deleted!");
      refetch();
    },
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    handleNext();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".mp3", ".wav", ".mp4"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(fileExt)) {
      toast.error(`Invalid file type. Allowed: ${validTypes.join(", ")}`);
      return;
    }

    // Validate file size (80MB max)
    const maxSize = 80 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large! Max 80MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          contentType: file.type,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      toast.error("Upload failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this track?")) return;
    await deleteMutation.mutateAsync({ id });
    if (currentTrackIndex >= tracks.length - 1) {
      setCurrentTrackIndex(Math.max(0, tracks.length - 2));
    }
  };

  const isAuthorized = user?.role === "admin" || user?.authorized === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📻 RADIO</h1>
            <p className="text-purple-300">Collaborative Playlist</p>
          </div>
          <a
            href="/dashboard"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Authorization Warning */}
        {!isAuthorized && (
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mb-6">
            <p className="text-purple-300 text-center">
              🔒 You need authorization to upload tracks. Contact an admin.
            </p>
          </div>
        )}

        {/* Player */}
        <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-8 mb-8 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentTrack?.title || "No track selected"}
            </h2>
            <p className="text-purple-300">
              {currentTrack?.uploadedBy || "—"}
            </p>
          </div>

          <audio
            ref={audioRef}
            onEnded={handleTrackEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={handlePrevious}
              disabled={tracks.length === 0}
              variant="outline"
              size="icon"
              className="rounded-full border-purple-500/50 hover:bg-purple-500/20"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={handlePlayPause}
              disabled={tracks.length === 0}
              size="icon"
              className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </Button>

            <Button
              onClick={handleNext}
              disabled={tracks.length === 0}
              variant="outline"
              size="icon"
              className="rounded-full border-purple-500/50 hover:bg-purple-500/20"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 max-w-xs mx-auto">
            <Volume2 className="w-5 h-5 text-purple-300" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-purple-500"
            />
          </div>
        </div>

        {/* Upload */}
        {isAuthorized && (
          <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Upload Track</h3>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.mp4"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
              <p className="text-purple-300 text-sm">
                Formats: .MP3, .WAV, .MP4 | Max: 80MB
              </p>
            </div>
          </div>
        )}

        {/* Playlist */}
        <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Playlist ({tracks.length})
          </h3>
          <div className="space-y-2">
            {tracks.length === 0 ? (
              <p className="text-purple-300 text-center py-8">
                No tracks yet. Upload the first one!
              </p>
            ) : (
              tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                    index === currentTrackIndex
                      ? "bg-purple-500/30 border border-purple-500/50"
                      : "bg-purple-900/20 hover:bg-purple-900/30"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-purple-300 font-mono text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-white font-medium">{track.title}</p>
                      <p className="text-purple-300 text-sm">
                        {track.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setCurrentTrackIndex(index);
                        setIsPlaying(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-purple-300 hover:text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    {(user?.role === "admin" ||
                      track.uploadedBy === user?.username) && (
                      <Button
                        onClick={() => handleDelete(track.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
