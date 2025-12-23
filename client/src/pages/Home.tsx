import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import UnicornBackground from "@/components/UnicornBackground";
import RetroTV from "@/components/RetroTV";
import GameBoyStarter from "@/components/GameBoyStarter";
import { Minus, Square, X } from "lucide-react";

export default function Home() {
  const { user, setUser, isLoading } = useAuth();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        toast.success(`Welcome, ${data.user.username}!`);
        window.location.href = "/dashboard";
      }
    },
    onError: (error) => {
      toast.error(error.message || "Invalid username or password");
    },
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleWindow = () => {
    setIsWindowOpen(!isWindowOpen);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    loginMutation.mutate({ username: username.toLowerCase(), password });
  };

  // If already logged in, redirect to dashboard
  if (user && !isLoading) {
    window.location.href = "/dashboard";
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
      <UnicornBackground />
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Retro TV - Fixed Left */}
      <RetroTV isOpen={true} onClose={() => {}} autoPlayTrigger={isWindowOpen} />

      {/* Game Boy Starter - Fixed Bottom Center (only when window closed) */}
      {!isWindowOpen && <GameBoyStarter onClick={toggleWindow} />}

      {/* Login Window - Appears when Game Boy is clicked */}
      {isWindowOpen && (
        <div 
          className={`fixed z-50 transition-all duration-500 ease-in-out
            ${isMaximized 
              ? 'inset-4 w-auto h-auto' 
              : 'top-1/2 -translate-y-1/2 right-[10%] w-[400px]'
            }
          `}
        >
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-2 border-cyan-500/50 rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.3),inset_0_0_30px_rgba(6,182,212,0.1)] h-full flex flex-col">
            
            {/* Window Controls Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/30 bg-black/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                  Secure_Shell
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={toggleWindow}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors text-white"
                >
                  <Minus size={12} />
                </button>
                <button 
                  onClick={toggleMaximize}
                  className="p-0.5 rounded hover:bg-white/10 transition-colors text-white"
                >
                  <Square size={10} />
                </button>
                <button 
                  onClick={toggleWindow}
                  className="p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors text-white/50"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Terminal Content */}
            <div className={`flex-1 flex flex-col p-8 space-y-6 ${isMaximized ? 'justify-center max-w-md mx-auto w-full' : ''}`}>
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] tracking-wider">
                  DEVCAVE BAR
                </h1>
                <p className="text-cyan-300/70 font-mono text-sm tracking-widest">
                  ACCESS TERMINAL
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-red-400 font-mono text-sm uppercase tracking-wider">
                    Identity
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="CODENAME"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loginMutation.isPending}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-cyan-500/30 rounded text-cyan-100 placeholder:text-cyan-500/30 font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-red-400 font-mono text-sm uppercase tracking-wider">
                    Passphrase
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-cyan-500/30 rounded text-cyan-100 placeholder:text-cyan-500/30 font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] border-2 border-cyan-400/50 hover:border-cyan-300 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loginMutation.isPending ? "AUTHENTICATING..." : "ENTER SYSTEM"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer Credits */}
      <div className="absolute bottom-2 right-4 z-20 text-[10px] font-mono text-white/30 tracking-widest pointer-events-none select-none">
        Designed - coded with LOVE &lt;3 by SEBASTIEN GERMAIN - ALL RIGHT RESERVED
      </div>
    </div>
  );
}
