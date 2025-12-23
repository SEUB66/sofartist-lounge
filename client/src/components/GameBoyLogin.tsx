import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GameBoyLoginProps {
  isOpen: boolean;
  onLogin: (nickname: string) => void;
  onClose?: () => void;
}

export function GameBoyLogin({ isOpen, onLogin, onClose }: GameBoyLoginProps) {
  const { theme } = useTheme();
  const [nickname, setNickname] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  }, [isOpen]);

  const getGameBoyImage = () => {
    if (theme === 'unicorn') return '/gameboy-teal.png';
    if (theme === 'light') return '/gameboy-purple.png';
    return '/gameboy-classic.png';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[GameBoyLogin] handleSubmit called, nickname:', nickname);
    if (nickname.trim()) {
      console.log('[GameBoyLogin] Calling onLogin with:', nickname.trim());
      onLogin(nickname.trim());
    } else {
      console.log('[GameBoyLogin] Nickname is empty!');
    }
  };

  if (!isOpen) {
    console.log('[GameBoyLogin] Not rendering (isOpen=false)');
    return null;
  }

  console.log('[GameBoyLogin] Rendering with isOpen=true');
  return (
    <div className="fixed inset-0 flex items-center justify-end pr-8 md:pr-16 z-40 animate-in fade-in duration-500">
      <audio ref={audioRef} src="/gameboy-startup.mp3" preload="auto" />
      <div className="relative">
        {/* Minimize Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-50 w-8 h-8 bg-yellow-400 hover:bg-yellow-300 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border-2 border-yellow-600"
            title="Minimize"
          >
            <span className="text-yellow-900 font-bold text-xl leading-none">−</span>
          </button>
        )}
        <img src={getGameBoyImage()} alt="Game Boy" className="w-[200px] md:w-[268px] h-auto drop-shadow-2xl" />
        <div className="absolute top-[15%] left-[12%] w-[76%] h-[30%] bg-gradient-to-br from-green-200/90 to-green-300/90 backdrop-blur-sm rounded-sm flex flex-col items-center justify-center p-2 md:p-3 gap-1 md:gap-2 animate-fade-in" style={{boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'}}>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="NICKNAME" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              className="w-full px-2 md:px-3 py-2 text-sm md:text-base bg-black/20 text-green-900 placeholder:text-green-700/60 border border-green-700/30 rounded font-mono focus:outline-none focus:ring-2 focus:ring-green-600" 
              style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
              autoFocus
            />
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }}
              className="w-full px-2 md:px-3 py-2 text-base md:text-lg bg-green-700 text-green-100 rounded font-bold hover:bg-green-600 transition-colors border border-green-900" 
              style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}
            >
              ENTER HUB
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
