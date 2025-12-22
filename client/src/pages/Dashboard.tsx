import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, MessageSquare, Image, Layers, LogOut, Users } from "lucide-react";
import { toast } from "sonner";
import ChatModule from "@/components/ChatModule";
import RadioModule from "@/components/RadioModule";
import BoardModule from "@/components/BoardModule";
import WallModule from "@/components/WallModule";
import SharedTV from "@/components/SharedTV";
import { useAudio } from "@/contexts/AudioContext";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const { currentVideo, isTransitioning } = useAudio();
  
  // Track online users
  const { data: onlineCount } = trpc.session.getOnlineCount.useQuery(undefined, {
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  
  // Send heartbeat every 30 seconds
  const heartbeatMutation = trpc.session.heartbeat.useMutation();
  useEffect(() => {
    // Send initial heartbeat
    heartbeatMutation.mutate();
    
    // Set up interval
    const interval = setInterval(() => {
      heartbeatMutation.mutate();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setLocation("/");
  };

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-green-400 text-xl font-mono animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)',
        }}
      />

      {/* CRT curve effect */}
      <div className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Header */}
      <header className="border-b-2 border-green-500/30 bg-black/90 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-pink-500/5" />
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            {/* Apple Punk Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo-applepunk(1).png" 
                alt="Apple Punk" 
                className="h-10 w-auto drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              />
              <div className="text-3xl font-black text-green-400 tracking-tighter font-mono drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                APPLE PUNK
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 border border-green-500/30">
              <Users size={14} className="text-green-400" />
              <span className="text-xs text-green-300 font-mono">
                {onlineCount || 0} {onlineCount === 1 ? 'DEV' : 'DEVS'} ONLINE
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-green-400/70 font-mono uppercase">
              &gt; <span className="text-green-400 font-bold">{user?.name || user?.username}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 font-mono uppercase tracking-wider"
            >
              <LogOut size={16} />
              EXIT
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-20">
        {/* Shared TV - Always visible at the top */}
        <SharedTV currentVideo={currentVideo} isTransitioning={isTransitioning} />
        
        {/* Tabs for modules */}
        <Tabs defaultValue="radio" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black border-2 border-green-500/30 p-1">
            <TabsTrigger 
              value="radio" 
              className="gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-2 data-[state=active]:border-green-500 font-mono uppercase tracking-wider"
            >
              <Radio size={16} />
              RADIO
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-2 data-[state=active]:border-cyan-500 font-mono uppercase tracking-wider"
            >
              <MessageSquare size={16} />
              CHAT
            </TabsTrigger>
            <TabsTrigger 
              value="board" 
              className="gap-2 data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 data-[state=active]:border-2 data-[state=active]:border-pink-500 font-mono uppercase tracking-wider"
            >
              <Image size={16} />
              BOARD
            </TabsTrigger>
            <TabsTrigger 
              value="wall" 
              className="gap-2 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-2 data-[state=active]:border-orange-500 font-mono uppercase tracking-wider"
            >
              <Layers size={16} />
              WALL
            </TabsTrigger>
          </TabsList>

          {/* Radio Tab */}
          <TabsContent value="radio" className="mt-6">
            <RadioModule />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <ChatModule />
          </TabsContent>

          {/* Board Tab */}
          <TabsContent value="board" className="mt-6">
            <BoardModule />
          </TabsContent>

          {/* Wall Tab */}
          <TabsContent value="wall" className="mt-6">
            <WallModule />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t-2 border-green-500/30 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 text-center">
          <p className="text-[10px] font-mono text-green-400/30 tracking-widest uppercase">
            &gt; DESIGNED - CODED WITH LOVE &lt;3 BY SEBASTIEN GERMAIN - ALL RIGHT RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}
