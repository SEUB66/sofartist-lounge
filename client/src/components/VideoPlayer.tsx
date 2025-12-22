import { useEffect, useState } from "react";

interface VideoPlayerProps {
  url: string;
  className?: string;
}

// Helper function to extract video ID from various URL formats
function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Direct video files (MP4, WEBM, OGG)
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return url;
  }

  // MSN videos - try to extract the actual video URL
  if (url.includes('msn.com')) {
    // MSN videos are usually embedded and protected, return null for now
    return null;
  }

  return null;
}

export default function VideoPlayer({ url, className = "" }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isDirectVideo, setIsDirectVideo] = useState(false);

  useEffect(() => {
    const processedUrl = getVideoEmbedUrl(url);
    setEmbedUrl(processedUrl);
    setIsDirectVideo(processedUrl?.match(/\.(mp4|webm|ogg)$/i) !== null);
  }, [url]);

  if (!embedUrl) {
    return (
      <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded p-4 text-center">
        <p className="text-orange-400/70 font-mono text-sm">
          ⚠️ UNSUPPORTED VIDEO FORMAT
        </p>
        <p className="text-orange-400/50 font-mono text-xs mt-2">
          Supported: YouTube, Vimeo, MP4, WEBM
        </p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline font-mono text-xs mt-2 inline-block"
        >
          Open Original Link →
        </a>
      </div>
    );
  }

  if (isDirectVideo) {
    return (
      <div className={`rounded overflow-hidden border-2 border-orange-500/30 ${className}`}>
        <video 
          controls 
          className="w-full"
          style={{ maxHeight: '500px' }}
        >
          <source src={embedUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className={`rounded overflow-hidden border-2 border-orange-500/30 ${className}`}>
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
