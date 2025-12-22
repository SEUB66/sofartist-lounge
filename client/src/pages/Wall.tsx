import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import WallModule from "@/components/WallModule";
import HubNavigation from "@/components/HubNavigation";

export default function Wall() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

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
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <WallModule />
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
          </div>
        </div>
      </div>
    </div>
  );
}
