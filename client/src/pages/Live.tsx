import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAudio } from "@/contexts/AudioContext";
import SharedTV from "@/components/SharedTV";
import ChatModule from "@/components/ChatModule";
import RadioModule from "@/components/RadioModule";
import HubNavigation from "@/components/HubNavigation";

export default function Live() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { currentVideo, isTransitioning, hasError } = useAudio();

  // Track online users
  const { data: onlineCount } = trpc.session.getOnlineCount.useQuery(undefined, {
    refetchInterval: 10000,
  });

  // Send heartbeat every 30 seconds
  const heartbeatMutation = trpc.session.heartbeat.useMutation();
  useEffect(() => {
    heartbeatMutation.mutate();
    const interval = setInterval(() => {
      heartbeatMutation.mutate();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-cyan-400 font-mono">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Banner */}
      <div className="w-full bg-black border-b-2 border-cyan-500/30">
        <div className="flex items-center justify-between p-4">
          <img 
            src="/apple-punk-banner.png" 
            alt="Apple Punk" 
            className="h-16 object-contain"
          />
          <HubNavigation />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: TV + Radio */}
        <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Shared TV */}
          <div className="flex-1 min-h-[400px]">
            <SharedTV currentVideo={currentVideo} isTransitioning={isTransitioning} hasError={hasError} />
          </div>

          {/* Radio Module */}
          <div className="h-[200px]">
            <RadioModule />
          </div>
        </div>

        {/* Right Side: Chat Sidebar (Fixed) */}
        <div className="w-96 border-l-2 border-cyan-500/30 bg-black/50">
          <ChatModule />
        </div>
      </div>

      {/* Bottom Banner with Credits */}
      <div className="w-full bg-black border-t-2 border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <img 
            src="/apple-punk-banner.png" 
            alt="Apple Punk" 
            className="h-12 object-contain"
          />
          <div className="text-xs text-cyan-400/70 font-mono text-right">
            <div>Designed + coded with LOVE &lt;3 by SEBASTIEN GERMAIN</div>
            <div className="text-green-400 mt-1">
              {onlineCount || 0} {onlineCount === 1 ? 'DEV' : 'DEVS'} ONLINE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
