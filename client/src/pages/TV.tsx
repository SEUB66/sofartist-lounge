import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Play, Upload, Trash2, Image, Video } from "lucide-react";

export default function TV() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: media = [], refetch } = trpc.tv.list.useQuery();
  const uploadMutation = trpc.tv.upload.useMutation({
    onSuccess: () => {
      toast.success("Media uploaded!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteMutation = trpc.tv.delete.useMutation({
    onSuccess: () => {
      toast.success("Media deleted!");
      refetch();
    },
  });

  const [currentMedia, setCurrentMedia] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const imageTypes = [".png", ".gif", ".jpeg", ".jpg"];
    const videoTypes = [".mp4", ".mov", ".wmv"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    
    const isImage = imageTypes.includes(fileExt);
    const isVideo = videoTypes.includes(fileExt);
    
    if (!isImage && !isVideo) {
      toast.error(`Invalid file type. Allowed: Images (${imageTypes.join(", ")}) or Videos (${videoTypes.join(", ")})`);
      return;
    }

    // Validate file size
    const maxSize = isImage ? 10 * 1024 * 1024 : 200 * 1024 * 1024; // 10MB for images, 200MB for videos
    if (file.size > maxSize) {
      toast.error(`File too large! Max ${isImage ? "10MB" : "200MB"}`);
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
          mediaType: isImage ? "image" : "video",
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
    if (!confirm("Delete this media?")) return;
    await deleteMutation.mutateAsync({ id });
    if (currentMedia?.id === id) {
      setCurrentMedia(null);
    }
  };

  const handlePlayMedia = (mediaItem: any) => {
    setCurrentMedia(mediaItem);
    if (mediaItem.mediaType === "video" && videoRef.current) {
      videoRef.current.src = mediaItem.url;
      videoRef.current.play();
    }
  };

  const isAuthorized = user?.role === "admin" || user?.authorized === 1;

  const images = media.filter((m: any) => m.mediaType === "image");
  const videos = media.filter((m: any) => m.mediaType === "video");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📺 TV</h1>
            <p className="text-purple-300">Shared Media Gallery</p>
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
              🔒 You need authorization to upload media. Contact an admin.
            </p>
          </div>
        )}

        {/* TV Screen / Player */}
        <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-8 mb-8 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
            {currentMedia ? (
              currentMedia.mediaType === "video" ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full object-contain"
                  src={currentMedia.url}
                />
              ) : (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.title}
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-300">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select media to display</p>
                </div>
              </div>
            )}
          </div>
          {currentMedia && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">
                {currentMedia.title}
              </h2>
              <p className="text-purple-300 text-sm">
                Uploaded by {currentMedia.uploadedBy}
              </p>
            </div>
          )}
        </div>

        {/* Upload */}
        {isAuthorized && (
          <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Upload Media</h3>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.gif,.jpeg,.jpg,.mp4,.mov,.wmv"
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
              <div className="text-purple-300 text-sm">
                <p>Images: .PNG, .GIF, .JPEG, .JPG (Max: 10MB)</p>
                <p>Videos: .MP4, .MOV, .WMV (Max: 200MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Images ({images.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {images.length === 0 ? (
                <p className="text-purple-300 text-center py-8 col-span-2">
                  No images yet
                </p>
              ) : (
                images.map((img: any) => (
                  <div
                    key={img.id}
                    className="group relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500/50 transition-all"
                    onClick={() => handlePlayMedia(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    {(user?.role === "admin" ||
                      img.uploadedBy === user?.username) && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(img.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">
                        {img.title}
                      </p>
                      <p className="text-purple-300 text-xs truncate">
                        {img.uploadedBy}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Videos */}
          <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Videos ({videos.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {videos.length === 0 ? (
                <p className="text-purple-300 text-center py-8 col-span-2">
                  No videos yet
                </p>
              ) : (
                videos.map((vid: any) => (
                  <div
                    key={vid.id}
                    className="group relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-500/50 transition-all"
                    onClick={() => handlePlayMedia(vid)}
                  >
                    <video
                      src={vid.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    {(user?.role === "admin" ||
                      vid.uploadedBy === user?.username) && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vid.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">
                        {vid.title}
                      </p>
                      <p className="text-purple-300 text-xs truncate">
                        {vid.uploadedBy}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
