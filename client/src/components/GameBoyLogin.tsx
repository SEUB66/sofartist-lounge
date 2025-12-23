import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GameBoyLoginProps {
  onLogin: (username: string, password: string) => void;
}

export function GameBoyLogin({ onLogin }: GameBoyLoginProps) {
  const { theme } = useTheme();
  const [isBooting, setIsBooting] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Choisir l'image selon le thème
  const getGameBoyImage = () => {
    if (theme === 'unicorn') return '/gameboy-teal.png';
    if (theme === 'light') return '/gameboy-purple.png';
    return '/gameboy-classic.png'; // dark theme
  };

  const handlePowerOn = () => {
    if (isBooted || isBooting) return;
    
    setIsBooting(true);
    
    // Jouer le son de startup
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }

    // Animation de boot (2 secondes)
    setTimeout(() => {
      setIsBooting(false);
      setIsBooted(true);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="relative">
      {/* Audio element */}
      <audio ref={audioRef} src="/gameboy-startup.mp3" preload="auto" />

      {/* Game Boy Container */}
      <div 
        className={`relative transition-all duration-500 ${
          !isBooted ? 'cursor-pointer hover:scale-105' : ''
        }`}
        onClick={!isBooted ? handlePowerOn : undefined}
      >
        {/* Game Boy Image */}
        <img
          src={getGameBoyImage()}
          alt="Game Boy"
          className="w-64 h-auto drop-shadow-2xl"
        />

        {/* Screen Overlay - Login Window */}
        {isBooted && (
          <div 
            className="absolute top-[15%] left-[12%] w-[76%] h-[30%] 
                       bg-gradient-to-br from-green-200/90 to-green-300/90
                       backdrop-blur-sm rounded-sm
                       flex flex-col items-center justify-center
                       p-2 gap-1
                       animate-fade-in"
            style={{
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-1">
              <input
                type="text"
                placeholder="USER"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-2 py-0.5 text-xs bg-black/20 text-green-900 
                           placeholder:text-green-700/60 border border-green-700/30
                           rounded font-mono focus:outline-none focus:ring-1 
                           focus:ring-green-600"
                style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}
              />
              <input
                type="password"
                placeholder="PASS"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2 py-0.5 text-xs bg-black/20 text-green-900 
                           placeholder:text-green-700/60 border border-green-700/30
                           rounded font-mono focus:outline-none focus:ring-1 
                           focus:ring-green-600"
                style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}
              />
              <button
                type="submit"
                className="w-full px-2 py-1 text-xs bg-green-700 text-green-100 
                           rounded font-bold hover:bg-green-600 transition-colors
                           border border-green-900"
                style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}
              >
                ENTER
              </button>
            </form>
          </div>
        )}

        {/* Boot Animation Overlay */}
        {isBooting && (
          <div 
            className="absolute top-[15%] left-[12%] w-[76%] h-[30%] 
                       bg-gradient-to-br from-green-400 to-green-500
                       rounded-sm flex items-center justify-center
                       animate-pulse"
            style={{
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <div 
              className="text-green-900 font-bold text-lg animate-bounce"
              style={{ fontFamily: 'VT323, monospace' }}
            >
              NINTENDO
            </div>
          </div>
        )}

        {/* Press Start Text (when not booted) */}
        {!isBooted && !isBooting && (
          <div 
            className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2
                       text-white/80 text-sm font-bold animate-pulse
                       pointer-events-none"
            style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}
          >
            PRESS START
          </div>
        )}
      </div>
    </div>
  );
}
