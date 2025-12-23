import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GameBoyLoginProps {
  isOpen: boolean;
  onLogin: (username: string, password: string) => void;
  onClose?: () => void;
}

export function GameBoyLogin({ isOpen, onLogin, onClose }: GameBoyLoginProps) {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    if (username && password) {
      onLogin(username, password);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 animate-in fade-in duration-500">
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
        <img src={getGameBoyImage()} alt="Game Boy" className="w-[268px] h-auto drop-shadow-2xl" />
        <div className="absolute top-[15%] left-[12%] w-[76%] h-[30%] bg-gradient-to-br from-green-200/90 to-green-300/90 backdrop-blur-sm rounded-sm flex flex-col items-center justify-center p-3 gap-2 animate-fade-in" style={{boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'}}>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="USERNAME" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-3 py-1 text-sm bg-black/20 text-green-900 placeholder:text-green-700/60 border border-green-700/30 rounded font-mono focus:outline-none focus:ring-2 focus:ring-green-600" 
              style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }} 
            />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-3 py-1 text-sm bg-black/20 text-green-900 placeholder:text-green-700/60 border border-green-700/30 rounded font-mono focus:outline-none focus:ring-2 focus:ring-green-600" 
              style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }} 
            />
            <button 
              type="submit" 
              className="w-full px-3 py-1.5 text-base bg-green-700 text-green-100 rounded font-bold hover:bg-green-600 transition-colors border border-green-900" 
              style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
            >
              ENTER SYSTEM
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
