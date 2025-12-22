import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import UnicornBackground from "@/components/UnicornBackground";
import RetroTV from "@/components/RetroTV";

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
    <div className="relative min-h-screen overflow-hidden bg-black">
      <UnicornBackground />
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Retro TV */}
          <div className="flex justify-center">
            <RetroTV isOpen={true} onClose={() => {}} autoPlayTrigger={isWindowOpen} />
          </div>

          {/* Right: Login Terminal */}
          <div className="flex justify-center">
            {!isWindowOpen ? (
              <button
                onClick={toggleWindow}
                className="group relative px-12 py-6 bg-gradient-to-r from-green-600 via-emerald-500 to-cyan-500 
                         hover:from-green-500 hover:via-emerald-400 hover:to-cyan-400
                         text-white font-bold text-2xl rounded-lg
                         shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)]
                         border-2 border-green-400/50 hover:border-green-300
                         transition-all duration-300 transform hover:scale-105
                         animate-pulse"
              >
                <span className="relative z-10 tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                  PRESS START
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              animate-shimmer rounded-lg" />
              </button>
            ) : (
              <div 
                className={`
                  bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95
                  backdrop-blur-xl border-2 border-cyan-500/50 rounded-lg
                  shadow-[0_0_50px_rgba(6,182,212,0.3),inset_0_0_30px_rgba(6,182,212,0.1)]
                  transition-all duration-500 ease-out
                  ${isMaximized ? 'w-full h-[80vh]' : 'w-full max-w-md'}
                `}
              >
                {/* Window Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-t-lg flex items-center justify-between border-b-2 border-cyan-400/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer transition-colors" 
                         onClick={toggleWindow} />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer transition-colors"
                         onClick={toggleMaximize} />
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm font-mono">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                    <span>SECURE-SHELL</span>
                  </div>
                </div>

                {/* Terminal Content */}
                <div className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
                                   drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] tracking-wider">
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
                        className="w-full px-4 py-3 bg-black/50 border-2 border-cyan-500/30 rounded
                                 text-cyan-100 placeholder:text-cyan-500/30 font-mono
                                 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                                 transition-all duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-full px-4 py-3 bg-black/50 border-2 border-cyan-500/30 rounded
                                 text-cyan-100 placeholder:text-cyan-500/30 font-mono
                                 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
                                 transition-all duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500
                               text-white font-bold uppercase tracking-widest rounded
                               shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]
                               border-2 border-cyan-400/50 hover:border-cyan-300
                               transition-all duration-300 transform hover:scale-[1.02]
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loginMutation.isPending ? "AUTHENTICATING..." : "ENTER SYSTEM"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 right-4 z-20 text-white/60 text-xs font-mono">
        Designed - coded with LOVE &lt;3 by SEBASTIEN GERMAIN - ALL RIGHT RESERVED
      </div>
    </div>
  );
}
