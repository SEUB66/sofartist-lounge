import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function BoardModule() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images, refetch } = trpc.media.getImages.useQuery();
  
  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: () => {
      toast.success("Image uploaded successfully!");
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
      toast.success("Image deleted");
      refetch();
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const fileKey = `images/${Date.now()}-${file.name}`;

        uploadMutation.mutate({
          type: "image",
          filename: file.name,
          url: base64,
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

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  return (
    <div className="bg-black border-2 border-pink-500/30 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.2)]">
      {/* Header */}
      <div className="border-b-2 border-pink-500/20 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-pink-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={20} className="animate-pulse" />
            &gt; SHARED IMAGE BOARD
          </h3>
          <p className="text-xs text-pink-400/50 font-mono mt-1">
            {images?.length || 0} images shared
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border-2 border-pink-500 font-mono uppercase tracking-wider gap-2"
        >
          <Upload size={16} />
          {uploading ? "UPLOADING..." : "UPLOAD IMAGE"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      <ScrollArea className="h-[500px] p-4">
        {images && images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative bg-pink-500/5 border-2 border-pink-500/20 rounded overflow-hidden hover:border-pink-500 transition-all hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
              >
                <div className="aspect-square">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-pink-400 text-xs font-mono text-center truncate w-full px-2">
                    {img.filename}
                  </p>
                  <Button
                    onClick={() => handleDelete(img.id)}
                    size="sm"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-pink-400/50 font-mono text-sm py-12">
            &gt; NO IMAGES YET. SHARE YOUR FIRST SCREENSHOT!
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
