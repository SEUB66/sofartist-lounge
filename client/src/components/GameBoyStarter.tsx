import React from 'react';

interface GameBoyStarterProps {
  onClick: () => void;
}

const GameBoyStarter: React.FC<GameBoyStarterProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom fade-in duration-500">
      <button 
        onClick={onClick}
        className="relative hover:scale-110 transition-transform duration-300 active:scale-95 cursor-pointer group"
      >
        {/* Game Boy Image */}
        <img 
          src="/gameboy.png" 
          alt="Game Boy" 
          className="h-48 w-auto drop-shadow-[0_0_30px_rgba(139,92,246,0.6)] group-hover:drop-shadow-[0_0_50px_rgba(139,92,246,0.9)] transition-all duration-300"
        />
        
        {/* Screen Overlay with "PRESS START" text */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[52%] h-[22%] bg-[#9bbc0f] flex items-center justify-center overflow-hidden">
          {/* Pixel Art Text */}
          <div className="text-[#0f380f] font-['VT323'] text-[11px] font-bold tracking-wider animate-pulse leading-tight text-center px-2">
            PRESS<br/>START
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-purple-500/10 rounded-lg transition-all duration-300 pointer-events-none" />
      </button>
    </div>
  );
};

export default GameBoyStarter;
