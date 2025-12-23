import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, Trash2, Share2, Tv as TvIcon, Radio, 
  Image as ImageIcon, Video, Music, FileText, X, FolderOpen
} from "lucide-react";

export default function Library() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: assets = [], refetch } = trpc.library.getAssets.useQuery();
  const uploadMutation = trpc.library.uploadAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset uploaded to your library!");
      refetch();
      setShowUploadModal(false);
      setNewAsset({ title: "" });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
  const deleteMutation = trpc.library.deleteAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset deleted!");
      refetch();
    },
  });
  const shareToWallMutation = trpc.library.shareToWall.useMutation({
    onSuccess: () => {
      toast.success("Shared to WALL!");
    },
  });
  const pushToTVMutation = trpc.library.pushToTV.useMutation({
    onSuccess: () => {
      toast.success("Pushed to TV!");
    },
  });
  const addToRadioMutation = trpc.library.addToRadio.useMutation({
    onSuccess: () => {
      toast.success("Added to RADIO!");
    },
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newAsset, setNewAsset] = useState({ title: "" });
  const [filterType, setFilterType] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const imageTypes = [".png", ".gif", ".jpeg", ".jpg"];
    const videoTypes = [".mp4", ".mov", ".wmv"];
    const audioTypes = [".mp3", ".wav"];
    const pdfTypes = [".pdf"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    
    const isImage = imageTypes.includes(fileExt);
    const isVideo = videoTypes.includes(fileExt);
    const isAudio = audioTypes.includes(fileExt);
    const isPdf = pdfTypes.includes(fileExt);
    
    if (!isImage && !isVideo && !isAudio && !isPdf) {
      toast.error("Invalid file type. Allowed: Images, Videos, Audio, PDF");
      return;
    }

    // Validate file size
    let maxSize = 10 * 1024 * 1024; // 10MB default
    if (isVideo) maxSize = 200 * 1024 * 1024; // 200MB for videos
    if (isAudio) maxSize = 80 * 1024 * 1024; // 80MB for audio
    if (isPdf) maxSize = 20 * 1024 * 1024; // 20MB for PDF
    
    if (file.size > maxSize) {
      toast.error(`File too large! Max ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
    // Auto-fill title with filename
    if (!newAsset.title) {
      setNewAsset({ title: file.name.split(".")[0] });
    }
  };

  const handleUpload = async () => {
    if (!newAsset.title || !selectedFile) {
      toast.error("Title and file are required");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const fileExt = "." + selectedFile.name.split(".").pop()?.toLowerCase();
        
        let mediaType: "image" | "video" | "audio" | "pdf" = "image";
        if ([".mp4", ".mov", ".wmv"].includes(fileExt)) mediaType = "video";
        if ([".mp3", ".wav"].includes(fileExt)) mediaType = "audio";
        if (fileExt === ".pdf") mediaType = "pdf";
        
        await uploadMutation.mutateAsync({
          title: newAsset.title,
          fileName: selectedFile.name,
          fileData: base64,
          contentType: selectedFile.type,
          mediaType,
        });
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setUploading(false);
      toast.error("Upload failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this asset from your library?")) return;
    await deleteMutation.mutateAsync({ id });
  };

  const handleShareToWall = async (assetId: number) => {
    await shareToWallMutation.mutateAsync({ assetId });
  };

  const handlePushToTV = async (assetId: number) => {
    await pushToTVMutation.mutateAsync({ assetId });
  };

  const handleAddToRadio = async (assetId: number) => {
    await addToRadioMutation.mutateAsync({ assetId });
  };

  // Filter assets
  const filteredAssets = assets.filter((asset: any) => {
    if (filterType === "all") return true;
    return asset.mediaType === filterType;
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      case "audio": return <Music className="w-5 h-5" />;
      case "pdf": return <FileText className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FolderOpen className="w-10 h-10 text-purple-400" />
              MY LIBRARY
            </h1>
            <p className="text-purple-300">Your personal asset collection</p>
          </div>
          <a
            href="/dashboard"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Filters & Upload */}
        <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-2">
              {["all", "image", "video", "audio", "pdf"].map((filter) => (
                <Button
                  key={filter}
                  variant={filterType === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter)}
                  className={filterType === filter ? "bg-purple-600" : ""}
                >
                  {filter.toUpperCase()}
                </Button>
              ))}
            </div>
            <div className="flex-1" />
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              UPLOAD ASSET
            </Button>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full text-center text-purple-300 py-16">
              <FolderOpen className="w-20 h-20 mx-auto mb-4 text-purple-500/50" />
              <p className="text-xl">Your library is empty</p>
              <p className="text-sm text-purple-400 mt-2">Upload your first asset!</p>
            </div>
          ) : (
            filteredAssets.map((asset: any) => (
              <div
                key={asset.id}
                className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl overflow-hidden hover:border-purple-400 transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)]"
              >
                {/* Media Preview */}
                <div className="relative aspect-video bg-black/50 flex items-center justify-center">
                  {asset.mediaType === "image" && (
                    <img
                      src={asset.mediaUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {asset.mediaType === "video" && (
                    <div className="relative w-full h-full">
                      <video src={asset.mediaUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}
                  {asset.mediaType === "audio" && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-fuchsia-900/50">
                      <Music className="w-16 h-16 text-purple-300" />
                    </div>
                  )}
                  {asset.mediaType === "pdf" && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-fuchsia-900/50">
                      <FileText className="w-16 h-16 text-purple-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getMediaIcon(asset.mediaType)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-bold mb-3 truncate">{asset.title}</h3>

                  {/* Share Actions */}
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareToWall(asset.id)}
                      className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
                    >
                      <Share2 className="w-3 h-3 mr-2" />
                      Share to WALL
                    </Button>

                    {asset.mediaType === "video" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePushToTV(asset.id)}
                        className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
                      >
                        <TvIcon className="w-3 h-3 mr-2" />
                        Push to TV
                      </Button>
                    )}

                    {asset.mediaType === "audio" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToRadio(asset.id)}
                        className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
                      >
                        <Radio className="w-3 h-3 mr-2" />
                        Add to RADIO
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(asset.id)}
                      className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-950/95 to-black/95 border-2 border-purple-500/50 rounded-xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Upload Asset</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  className="text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-purple-300 text-sm font-bold mb-2 block">
                    Title *
                  </label>
                  <Input
                    placeholder="Enter title..."
                    value={newAsset.title}
                    onChange={(e) =>
                      setNewAsset({ title: e.target.value })
                    }
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="text-purple-300 text-sm font-bold mb-2 block">
                    File *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.gif,.jpeg,.jpg,.mp4,.mov,.wmv,.mp3,.wav,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </Button>
                  <p className="text-purple-400 text-xs mt-2">
                    Images (10MB), Videos (200MB), Audio (80MB), PDF (20MB)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="border-purple-500/50 text-purple-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
