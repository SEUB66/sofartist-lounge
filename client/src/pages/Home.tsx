import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/contexts/UserContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import UnicornBackground from "@/components/UnicornBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

import { GameBoyLoginWrapper } from "@/components/GameBoyLoginWrapper";
import { Minus, Square, X, Monitor } from "lucide-react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { isLoggedIn } = useUser();
  const [, setLocation] = useLocation();
  const [isWindowOpen, setIsWindowOpen] = useState(false); // Start minimized
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // Track if user has started

  const toggleWindow = () => {
    setIsWindowOpen(!isWindowOpen);
  };

  const handleStart = () => {
    if (!hasStarted) {
      // Play Game Boy startup sound
      const gameboySound = new Audio('/gameboy-startup-real.mp3');
      gameboySound.volume = 0.5;
      gameboySound.play().catch(e => console.log('Audio play failed:', e));
      
      // Play TV power on sound after a short delay
      setTimeout(() => {
        const tvSound = new Audio('/tv-power-on.mp3');
        tvSound.volume = 0.4;
        tvSound.play().catch(e => console.log('Audio play failed:', e));
      }, 500);
      
      // Show Game Boy
      setIsWindowOpen(true);
      setHasStarted(true);
    } else {
      // Just toggle Game Boy if already started
      toggleWindow();
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Define glass styles based on theme - MORE TRANSPARENT
  const getGlassStyle = () => {
    switch (theme) {
      case 'dark':
        return "bg-cyan-900/10 border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]";
      case 'light':
        return "bg-orange-500/10 border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.15)]";
      case 'unicorn':
        return "bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.2)]";
      default:
        return "bg-black/20 border-white/10";
    }
  };

  const getTitleStyle = () => {
    switch (theme) {
      case 'dark':
        return "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]";
      case 'light':
        return "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]";
      case 'unicorn':
        return "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]";
      default:
        return "text-white";
    }
  };

  const getButtonStyle = () => {
    switch (theme) {
      case 'dark':
        return "bg-cyan-600/80 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]";
      case 'light':
        return "bg-orange-500/80 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]";
      case 'unicorn':
        return "bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]";
      default:
        return "bg-white/10 hover:bg-white/20";
    }
  };

  const getInputStyle = () => {
    switch (theme) {
      case 'dark':
        return "border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 placeholder:text-cyan-300/30 text-cyan-100";
      case 'light':
        return "border-orange-500/30 focus:border-orange-400 focus:ring-orange-400/20 placeholder:text-orange-300/50 text-orange-900 font-medium";
      case 'unicorn':
        return "border-pink-500/30 focus:border-pink-400 focus:ring-pink-400/20 placeholder:text-pink-300/50 text-white";
      default:
        return "border-white/20";
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <UnicornBackground />
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* RetroTV is now global in App.tsx */}

      {/* Desktop Taskbar / Dock Area (Bottom) - Always visible, toggles Game Boy */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom fade-in duration-500">
        <button 
          onClick={handleStart}
          className="hover:scale-110 transition-transform duration-300 active:scale-95 pointer-events-auto cursor-pointer"
        >
          <img 
            src="/snes-controller.png" 
            alt="SNES Controller" 
            className="h-24 w-auto drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]"
          />
        </button>
      </div>

      {/* Footer Credits with Icon - Centered, Bigger, More Visible */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3 animate-in fade-in duration-1000 delay-500">
        <img 
          src="/seub-icon.jpg" 
          alt="Seub Germain" 
          className="w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-lg shadow-xl md:shadow-2xl animate-pulse-subtle"
        />
        <span style={{ fontFamily: 'VT323, monospace' }} className="text-xs md:text-base bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent tracking-wide md:tracking-wider font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
          SEBG | APPLEPUNK | ALL RIGHTS RESERVED
        </span>
      </div>

      {/* Game Boy Login */}
      {!isLoggedIn && (
        <GameBoyLoginWrapper 
          isOpen={isWindowOpen} 
          onClose={toggleWindow}
          onSuccess={() => {
            setLocation('/hub');
          }}
        />
      )}

      {/* OLD Login Window - REMOVED */}
      {false && isWindowOpen && (
        <div className={`absolute transition-all duration-500 ease-in-out z-50 
          ${isMaximized 
            ? 'inset-4 w-auto h-auto' 
            : 'top-1/2 -translate-y-1/2 right-[10%] w-[300px]' // Reduced width to 300px
          }
        `}>
          <Card className={`w-full h-full backdrop-blur-xl border transition-all duration-500 flex flex-col ${getGlassStyle()}`}>
            
            {/* Window Controls Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/10">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${theme === 'light' ? 'bg-orange-400' : 'bg-cyan-400'} animate-pulse`} />
                <span className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'light' ? 'text-orange-800/70' : 'text-white/50'}`}>
                  Secure_Shell
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={toggleWindow}
                  className={`p-0.5 rounded hover:bg-white/10 transition-colors ${theme === 'light' ? 'text-orange-800' : 'text-white'}`}
                >
                  <Minus size={12} />
                </button>
                <button 
                  onClick={toggleMaximize}
                  className={`p-0.5 rounded hover:bg-white/10 transition-colors ${theme === 'light' ? 'text-orange-800' : 'text-white'}`}
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

            <div className={`flex-1 flex flex-col ${isMaximized ? 'justify-center max-w-sm mx-auto w-full' : ''}`}>
              <CardHeader className="space-y-1 pb-4 pt-4">
                <CardTitle className={`text-2xl font-black text-center tracking-tighter uppercase transition-all duration-500 ${getTitleStyle()}`}>
                  DEVCAVE BAR
                </CardTitle>
                <CardDescription className={`text-center text-xs font-light tracking-widest uppercase ${theme === 'light' ? 'text-orange-800/70' : 'text-gray-300'}`}>
                  Access Terminal
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <form>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="username" className={`font-bold uppercase tracking-widest text-[10px] ${theme === 'light' ? 'text-orange-700' : 'text-gray-300'}`}>
                        Identity
                      </Label>
                      <Input 
                        id="username" 
                        placeholder="CODENAME" 
                        className={`bg-white/5 h-9 text-sm transition-all duration-300 ${getInputStyle()}`} 
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="password" className={`font-bold uppercase tracking-widest text-[10px] ${theme === 'light' ? 'text-orange-700' : 'text-gray-300'}`}>
                        Passphrase
                      </Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className={`bg-white/5 h-9 text-sm transition-all duration-300 ${getInputStyle()}`} 
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 pt-2 pb-6">
                <Button className={`w-full h-10 text-sm border-0 font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] ${getButtonStyle()}`}>
                  Enter System
                </Button>
                <Button variant="link" className={`text-xs font-light h-auto p-0 ${theme === 'light' ? 'text-orange-800 hover:text-orange-600' : 'text-gray-400 hover:text-white'}`}>
                  Forgot credentials?
                </Button>
              </CardFooter>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
