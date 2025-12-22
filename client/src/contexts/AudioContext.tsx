import { createContext, useContext, useState, ReactNode } from "react";

type AudioSource = "radio" | "tv" | null;

interface CurrentVideo {
  url: string;
  title: string;
  broadcaster: string;
}

interface AudioContextType {
  activeSource: AudioSource;
  currentVideo: CurrentVideo | null;
  isTransitioning: boolean;
  hasError: boolean;
  setActiveSource: (source: AudioSource) => void;
  broadcastVideo: (video: CurrentVideo) => void;
  stopBroadcast: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [activeSource, setActiveSource] = useState<AudioSource>(null);
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasError, setHasError] = useState(false);

  const broadcastVideo = (video: CurrentVideo) => {
    // Check if radio is active - show ERROR if so
    if (activeSource === "radio") {
      setHasError(true);
      setTimeout(() => {
        setHasError(false);
      }, 3000); // Show ERROR for 3 seconds
      return;
    }

    // Start transition effect
    setIsTransitioning(true);

    // After 2 seconds, show the video
    setTimeout(() => {
      setCurrentVideo(video);
      setActiveSource("tv");
      setIsTransitioning(false);
    }, 2000);
  };

  const stopBroadcast = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideo(null);
      setActiveSource(null);
      setIsTransitioning(false);
    }, 1000);
  };

  return (
    <AudioContext.Provider
      value={{
        activeSource,
        currentVideo,
        isTransitioning,
        hasError,
        setActiveSource,
        broadcastVideo,
        stopBroadcast,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
