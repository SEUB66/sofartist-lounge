import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Upload, Trash2, Music } from "lucide-react";
import { toast } from "sonner";

export default function RadioModule() {
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: audioFiles, refetch } = trpc.media.getAudio.useQuery();
  
  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: () => {
      toast.success("Track uploaded successfully!");
      refetch();
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Upload failed");
      setUploading(false);
    },
  });

  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      toast.success("Track deleted");
      refetch();
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // In a real implementation, you would upload to S3 here
        // For now, we'll use a placeholder URL
        const fileKey = `audio/${Date.now()}-${file.name}`;
        const url = base64; // In production, this would be the S3 URL

        uploadMutation.mutate({
          type: "audio",
          filename: file.name,
          url: url,
          fileKey: fileKey,
          mimeType: file.type,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload file");
      setUploading(false);
    }
  };

  const handlePlayPause = (trackId: number, url: string) => {
    if (currentTrack === trackId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setCurrentTrack(trackId);
        setIsPlaying(true);
      }
    }
  };

  const handleDelete = (id: number) => {
    if (currentTrack === id) {
      audioRef.current?.pause();
      setCurrentTrack(null);
      setIsPlaying(false);
    }
    deleteMutation.mutate({ id });
  };

  return (
    <div className="bg-black border-2 border-green-500/30 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.2)]">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      
      {/* Header */}
      <div className="border-b-2 border-green-500/20 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-green-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <Music size={20} className="animate-pulse" />
            &gt; SYNCHRONIZED RADIO
          </h3>
          <p className="text-xs text-green-400/50 font-mono mt-1">
            {audioFiles?.length || 0} tracks available
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-2 border-green-500 font-mono uppercase tracking-wider gap-2"
        >
          <Upload size={16} />
          {uploading ? "UPLOADING..." : "UPLOAD MP3"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Playlist */}
      <ScrollArea className="h-[500px] p-4">
        {audioFiles && audioFiles.length > 0 ? (
          <div className="space-y-2">
            {audioFiles.map((track) => (
              <div
                key={track.id}
                className={`bg-green-500/5 border-2 rounded p-3 font-mono flex items-center justify-between transition-all ${
                  currentTrack === track.id
                    ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    : "border-green-500/20"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Button
                    onClick={() => handlePlayPause(track.id, track.url)}
                    size="sm"
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500"
                  >
                    {currentTrack === track.id && isPlaying ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 text-sm font-bold truncate">
                      {track.filename}
                    </p>
                    <p className="text-green-400/50 text-xs">
                      {track.size ? `${(track.size / 1024 / 1024).toFixed(2)} MB` : "Unknown size"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDelete(track.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-green-400/50 font-mono text-sm py-12">
            &gt; NO TRACKS YET. UPLOAD YOUR FIRST MP3!
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
