import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Layers, Tv } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { useAudio } from "@/contexts/AudioContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function WallModule() {
  const { broadcastVideo, activeSource } = useAudio();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const { data: posts, refetch } = trpc.wall.getPosts.useQuery();
  
  const createPostMutation = trpc.wall.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      refetch();
      setIsDialogOpen(false);
      setTitle("");
      setContent("");
      setImageUrl("");
      setVideoUrl("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const deletePostMutation = trpc.wall.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      refetch();
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    createPostMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });
  };

  const handleDelete = (id: number) => {
    deletePostMutation.mutate({ id });
  };

  return (
    <div className="bg-black border-2 border-orange-500/30 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.2)]">
      {/* Header */}
      <div className="border-b-2 border-orange-500/20 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-orange-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers size={20} className="animate-pulse" />
            &gt; WALL OF CREATIONS
          </h3>
          <p className="text-xs text-orange-400/50 font-mono mt-1">
            {posts?.length || 0} posts shared
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-2 border-orange-500 font-mono uppercase tracking-wider gap-2">
              <Plus size={16} />
              NEW POST
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-2 border-orange-500/30">
            <DialogHeader>
              <DialogTitle className="text-orange-400 font-mono uppercase">
                &gt; CREATE NEW POST
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-orange-400 font-mono text-sm mb-2 block">
                  TITLE
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title..."
                  className="bg-black border-orange-500/30 text-orange-100 font-mono"
                />
              </div>
              <div>
                <label className="text-orange-400 font-mono text-sm mb-2 block">
                  CONTENT
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your creation, idea, or project..."
                  rows={6}
                  className="bg-black border-orange-500/30 text-orange-100 font-mono resize-none"
                />
              </div>
              <div>
                <label className="text-orange-400 font-mono text-sm mb-2 block">
                  IMAGE URL (OPTIONAL)
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black border-orange-500/30 text-orange-100 font-mono"
                />
              </div>
              <div>
                <label className="text-orange-400 font-mono text-sm mb-2 block">
                  VIDEO URL (OPTIONAL - YouTube, Vimeo, MP4)
                </label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or .mp4 URL"
                  className="bg-black border-orange-500/30 text-orange-100 font-mono"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createPostMutation.isPending}
                className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-2 border-orange-500 font-mono uppercase tracking-wider"
              >
                {createPostMutation.isPending ? "POSTING..." : "PUBLISH POST"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Feed */}
      <ScrollArea className="h-[500px] p-4">
        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-orange-500/5 border-2 border-orange-500/20 rounded p-4 hover:border-orange-500 transition-all hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-orange-400 font-mono font-bold text-lg mb-1">
                      {post.title}
                    </h4>
                    <p className="text-orange-400/50 text-xs font-mono">
                      USER_{post.userId} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDelete(post.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                {post.imageUrl && (
                  <div className="mb-3 rounded overflow-hidden border border-orange-500/20">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full max-h-64 object-cover"
                    />
                  </div>
                )}
                
                {post.videoUrl && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        onClick={() => {
                          if (activeSource === "radio") {
                            toast.error("⚠️ STOP THE RADIO FIRST!");
                            return;
                          }
                          broadcastVideo({
                            url: post.videoUrl!,
                            title: post.title,
                            broadcaster: user?.name || user?.username || "Unknown",
                          });
                          toast.success("📡 Broadcasting to Shared TV!");
                        }}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-2 border-green-500 font-mono uppercase tracking-wider gap-2"
                        size="sm"
                      >
                        <Tv size={16} />
                        PUSH TO TV
                      </Button>
                    </div>
                    <VideoPlayer url={post.videoUrl} />
                  </div>
                )}
                
                <p className="text-orange-100/80 font-mono text-sm whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-orange-400/50 font-mono text-sm py-12">
            &gt; NO POSTS YET. SHARE YOUR FIRST CREATION!
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
