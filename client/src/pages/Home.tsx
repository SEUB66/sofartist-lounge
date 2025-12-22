import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import ThemeBackground from "@/components/ThemeBackground";
import RetroTV from "@/components/RetroTV";
import GameBoyStarter from "@/components/GameBoyStarter";


export default function Home() {
  const { user, setUser, isLoading } = useAuth();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        toast.success(`Welcome, ${data.user.username}!`);
        window.location.href = "/live";
      }
    },
    onError: (error) => {
      toast.error(error.message || "Invalid username or password");
    },
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleWindow = () => {
    setIsWindowOpen(!isWindowOpen);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    loginMutation.mutate({ username: username.toLowerCase(), password });
  };

  // If already logged in, redirect to live
  if (user && !isLoading) {
    window.location.href = "/live";
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-green-400 font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ThemeBackground />
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Retro TV - Fixed Left (Desktop Only) */}
      <div className="max-md:hidden">
        <RetroTV isOpen={true} onClose={() => {}} autoPlayTrigger={isWindowOpen} />
      </div>

      {/* Game Boy Starter - Fixed Bottom Center (only when window closed) */}
      {!isWindowOpen && <GameBoyStarter onClick={toggleWindow} />}

      {/* Login Window - Appears when Game Boy is clicked */}
      {isWindowOpen && (
        <div className="fixed top-1/2 -translate-y-1/2 right-[10%] w-[400px] max-md:right-auto max-md:left-1/2 max-md:-translate-x-1/2 max-md:w-[90%] max-md:max-w-[400px] z-50">
          <div className="bg-gradient-to-br from-purple-950/95 via-black/95 to-purple-950/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.4),inset_0_0_30px_rgba(168,85,247,0.1)] overflow-hidden">
            {/* Window Header */}
            <div className="bg-gradient-to-r from-purple-900 via-fuchsia-900 to-purple-900 p-3 flex items-center justify-between border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer transition-colors" 
                     onClick={toggleWindow} />
                <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer transition-colors" 
                     onClick={toggleMinimize} />
                <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer transition-colors" />
              </div>
              <div className="flex items-center gap-2 text-purple-300/90 text-sm font-mono">
                <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
                <span>APPLE PUNK HUB</span>
              </div>
            </div>

            {/* Terminal Content */}
            {!isMinimized && (
            <div className="p-8 space-y-6">
              {/* RetroTV - Mobile Only */}
              <div className="md:hidden mb-6">
                <div className="relative w-full aspect-[5/4] max-w-[300px] mx-auto">
                  <RetroTV isOpen={true} onClose={() => {}} autoPlayTrigger={isWindowOpen} />
                </div>
              </div>
              <div className="text-center space-y-4">
                <img 
                  src="/apple-punk-logo.png" 
                  alt="Apple Punk" 
                  className="w-48 h-48 mx-auto object-contain max-md:hidden"
                />
                <p className="text-fuchsia-300/70 font-mono text-sm tracking-widest">
                  ACCESS TERMINAL
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-fuchsia-400 font-mono text-sm uppercase tracking-wider">
                    Identity
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="CODENAME"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loginMutation.isPending}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded text-purple-100 placeholder:text-purple-500/30 font-mono focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-fuchsia-400 font-mono text-sm uppercase tracking-wider">
                    Passphrase
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-purple-500/30 rounded text-purple-100 placeholder:text-purple-500/30 font-mono focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] border-2 border-fuchsia-400/50 hover:border-fuchsia-300 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loginMutation.isPending ? "AUTHENTICATING..." : "ENTER SYSTEM"}
                </button>
              </form>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 right-4 max-md:left-4 max-md:text-center z-20 text-white/60 text-xs font-mono">
        Designed - coded with LOVE &lt;3 by SEBASTIEN GERMAIN - ALL RIGHT RESERVED
      </div>


    </div>
  );
}
