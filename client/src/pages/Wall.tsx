import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, Trash2, Heart, MessageCircle, Search, 
  Image as ImageIcon, Video, Music, FileText, Tv as TvIcon, X
} from "lucide-react";

export default function Wall() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: posts = [], refetch } = trpc.wall.getPosts.useQuery();
  const uploadMutation = trpc.wall.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      refetch();
      setShowUploadModal(false);
      setNewPost({ title: "", content: "", tags: "" });
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
  const deleteMutation = trpc.wall.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted!");
      refetch();
    },
  });
  const likeMutation = trpc.wall.toggleLike.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const commentMutation = trpc.wall.addComment.useMutation({
    onSuccess: () => {
      refetch();
      setCommentText("");
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  const [commentText, setCommentText] = useState("");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthorized = user?.role === "admin" || user?.authorized === 1;

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
  };

  const handleUpload = async () => {
    if (!newPost.title || !newPost.content) {
      toast.error("Title and content are required");
      return;
    }

    setUploading(true);
    try {
      let mediaData: any = {};
      
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          const fileExt = "." + selectedFile.name.split(".").pop()?.toLowerCase();
          
          let mediaType: "image" | "video" | "audio" | "pdf" = "image";
          if ([".mp4", ".mov", ".wmv"].includes(fileExt)) mediaType = "video";
          if ([".mp3", ".wav"].includes(fileExt)) mediaType = "audio";
          if (fileExt === ".pdf") mediaType = "pdf";
          
          mediaData = {
            fileName: selectedFile.name,
            fileData: base64,
            contentType: selectedFile.type,
            mediaType,
          };

          await uploadMutation.mutateAsync({
            ...newPost,
            ...mediaData,
          });
          setUploading(false);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        await uploadMutation.mutateAsync(newPost);
        setUploading(false);
      }
    } catch (error) {
      setUploading(false);
      toast.error("Upload failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await deleteMutation.mutateAsync({ id });
  };

  const handleLike = async (postId: number) => {
    await likeMutation.mutateAsync({ postId });
  };

  const handleComment = async (postId: number) => {
    if (!commentText.trim()) return;
    await commentMutation.mutateAsync({ postId, content: commentText });
  };

  // Filter posts
  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.tags && post.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && post.mediaType === selectedFilter;
  });

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "audio": return <Music className="w-4 h-4" />;
      case "pdf": return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🖼️ WALL</h1>
            <p className="text-purple-300">Creative Multimedia Gallery</p>
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
              🔒 You need authorization to upload content. Contact an admin.
            </p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <Input
                placeholder="Search by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/30 border-purple-500/30 text-white"
              />
            </div>
            <div className="flex gap-2">
              {["all", "image", "video", "audio", "pdf"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={selectedFilter === filter ? "bg-purple-600" : ""}
                >
                  {filter.toUpperCase()}
                </Button>
              ))}
            </div>
            {isAuthorized && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                CREATE POST
              </Button>
            )}
          </div>
        </div>

        {/* Masonry Gallery */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center text-purple-300 py-16">
              No posts yet. Create the first one!
            </div>
          ) : (
            filteredPosts.map((post: any) => (
              <div
                key={post.id}
                className="break-inside-avoid bg-gradient-to-br from-purple-950/90 to-black/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl overflow-hidden hover:border-purple-400 transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)]"
              >
                {/* Media Preview */}
                {post.mediaUrl && (
                  <div className="relative">
                    {post.mediaType === "image" && (
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="w-full object-cover"
                      />
                    )}
                    {post.mediaType === "video" && (
                      <div className="relative">
                        <video
                          src={post.mediaUrl}
                          controls
                          className="w-full"
                        />
                        <Button
                          size="sm"
                          className="absolute top-2 right-2 bg-purple-600/90 hover:bg-purple-500"
                        >
                          <TvIcon className="w-4 h-4 mr-1" />
                          PUSH TO TV
                        </Button>
                      </div>
                    )}
                    {post.mediaType === "audio" && (
                      <div className="p-4 bg-gradient-to-r from-purple-900/50 to-fuchsia-900/50">
                        <Music className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                        <audio controls className="w-full">
                          <source src={post.mediaUrl} />
                        </audio>
                      </div>
                    )}
                    {post.mediaType === "pdf" && (
                      <div className="p-8 bg-gradient-to-r from-purple-900/50 to-fuchsia-900/50 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-3 text-purple-400" />
                        <a
                          href={post.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-300 hover:text-purple-200 underline"
                        >
                          View PDF
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {post.title}
                      </h3>
                      <p className="text-purple-300 text-sm">
                        by {post.uploadedBy}
                      </p>
                    </div>
                    {post.mediaType && (
                      <div className="text-purple-400">
                        {getMediaIcon(post.mediaType)}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-300 mb-4">{post.content}</p>

                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.split(",").map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-xs text-purple-300"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-purple-500/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`text-purple-300 hover:text-purple-200 ${
                        post.userLiked ? "text-pink-400" : ""
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 mr-1 ${post.userLiked ? "fill-current" : ""}`}
                      />
                      {post.likeCount || 0}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedPost(expandedPost === post.id ? null : post.id)
                      }
                      className="text-purple-300 hover:text-purple-200"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.commentCount || 0}
                    </Button>

                    {(user?.role === "admin" || post.userId === user?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Comments Section */}
                  {expandedPost === post.id && (
                    <div className="mt-4 pt-4 border-t border-purple-500/30">
                      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {post.comments?.map((comment: any) => (
                          <div
                            key={comment.id}
                            className="bg-purple-900/20 rounded p-3"
                          >
                            <p className="text-purple-300 text-sm font-bold mb-1">
                              {comment.username}
                            </p>
                            <p className="text-gray-300 text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="bg-black/30 border-purple-500/30 text-white text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleComment(post.id)}
                          className="bg-purple-600 hover:bg-purple-500"
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-950/95 to-black/95 border-2 border-purple-500/50 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Post</h2>
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
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="text-purple-300 text-sm font-bold mb-2 block">
                    Content *
                  </label>
                  <Textarea
                    placeholder="Write something..."
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    className="bg-black/30 border-purple-500/30 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-purple-300 text-sm font-bold mb-2 block">
                    Tags (comma separated)
                  </label>
                  <Input
                    placeholder="art, music, tech..."
                    value={newPost.tags}
                    onChange={(e) =>
                      setNewPost({ ...newPost, tags: e.target.value })
                    }
                    className="bg-black/30 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="text-purple-300 text-sm font-bold mb-2 block">
                    Media (optional)
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
                    {uploading ? "Uploading..." : "Create Post"}
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
