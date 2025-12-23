import React, { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useUser } from "@/contexts/UserContext";
import { useLocation } from "wouter";
import UnicornBackground from "@/components/UnicornBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { GameBoyLoginWrapper } from "@/components/GameBoyLoginWrapper";

export default function Home() {
  const { theme } = useTheme();
  const { isLoggedIn } = useUser();
  const [, setLocation] = useLocation();
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const handleStart = () => {
    console.log('🎮 PRESS START CLICKED!');
    setIsWindowOpen(prev => !prev);
    
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
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <UnicornBackground />
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Desktop Taskbar / Dock Area (Bottom) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom fade-in duration-500 flex flex-col items-center gap-3">
        {/* PRESS START Text */}
        <div className="animate-pulse">
          <p style={{ fontFamily: 'VT323, monospace' }} className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            ▶ PRESS START ◀
          </p>
        </div>
        
        <button 
          onClick={handleStart}
          className="hover:scale-110 transition-transform duration-300 active:scale-95 pointer-events-auto cursor-pointer z-50 relative focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-lg"
          type="button"
        >
          <img 
            src="/snes-controller.png" 
            alt="SNES Controller" 
            className="h-24 w-auto drop-shadow-[0_0_20px_rgba(139,92,246,0.6)] pointer-events-none"
          />
        </button>
      </div>

      {/* Footer Credits */}
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
          onClose={() => setIsWindowOpen(false)}
          onSuccess={() => {
            setLocation('/hub');
          }}
        />
      )}
    </div>
  );
}
