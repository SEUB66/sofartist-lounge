import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { trpc } from '@/lib/trpc';

interface GameBoyLoginProps {
  isOpen: boolean;
  onLogin: (nickname: string, password?: string) => void;
  onClose?: () => void;
}

export function GameBoyLogin({ isOpen, onLogin, onClose }: GameBoyLoginProps) {
  const { theme } = useTheme();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Jouer le son et l'animation au démarrage
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
      // Arrêter l'animation après 1 seconde
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getGameBoyImage = () => {
    if (theme === 'unicorn') return '/gameboy-teal.png';
    if (theme === 'light') return '/gameboy-purple.png';
    return '/gameboy-classic.png';
  };

  // Vérifier si le nickname existe et est protégé
  const checkNicknameMutation = trpc.auth.checkNickname.useQuery(
    { nickname: nickname.trim() },
    { enabled: false }
  );

  const handleNicknameBlur = async () => {
    if (nickname.trim().length > 0) {
      setIsCheckingNickname(true);
      const result = await checkNicknameMutation.refetch();
      if (result.data?.requiresPassword) {
        setRequiresPassword(true);
        setShowPassword(true);
      } else {
        setRequiresPassword(false);
        setShowPassword(false);
      }
      setIsCheckingNickname(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[GameBoyLogin] handleSubmit called, nickname:', nickname);
    if (nickname.trim()) {
      console.log('[GameBoyLogin] Calling onLogin with:', nickname.trim(), 'password:', password ? '***' : 'none');
      onLogin(nickname.trim(), password || undefined);
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
    <div className={`fixed inset-0 flex items-center justify-end pr-8 md:pr-16 z-40 animate-in fade-in duration-500 ${
      isAnimating ? 'animate-pulse' : ''
    }`}>
      <audio ref={audioRef} src="/gameboy-startup-real.mp3" preload="auto" />
      <div className={`relative transition-all duration-500 ${
        isAnimating ? 'scale-110 animate-bounce' : 'scale-100'
      }`}>
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
        <img 
          src={getGameBoyImage()} 
          alt="Game Boy" 
          className={`w-[150px] md:w-[200px] h-auto drop-shadow-2xl transition-all duration-500 ${
            isAnimating ? 'filter brightness-150 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' : ''
          }`}
        />
        <div className={`absolute top-[15%] left-[12%] w-[76%] h-[30%] rounded-sm flex flex-col items-center justify-center p-2 md:p-3 gap-1 md:gap-2 transition-all duration-500 ${
          isAnimating ? 'animate-pulse' : 'animate-fade-in'
        }`} style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.95) 0%, rgba(14, 165, 233, 0.95) 100%)',
          boxShadow: isAnimating 
            ? 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(6,182,212,0.8)' 
            : 'inset 0 2px 8px rgba(0,0,0,0.3), inset 0 0 60px rgba(6,182,212,0.2)',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.03) 3px)',
        }}>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="NICKNAME" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)}
              onBlur={handleNicknameBlur}
              className="w-full px-2 md:px-3 py-2 text-sm md:text-base bg-black/20 text-white placeholder:text-white/70 border-none rounded focus:outline-none focus:ring-2 focus:ring-cyan-300/50" 
              style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
              autoFocus
            />
            {isCheckingNickname && (
              <div className="text-xs text-white font-bold" style={{ fontFamily: 'VT323, monospace' }}>
                Checking nickname...
              </div>
            )}
            
            {/* Password toggle button - only show if user manually wants it or if required */}
            {!requiresPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-full px-2 py-1 text-xs bg-black/20 text-white rounded hover:bg-black/30 transition-colors border-none"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                {showPassword ? '▲ HIDE PASSWORD' : '▼ HAVE PASSWORD?'}
              </button>
            )}
            
            {showPassword && (
              <div className="flex flex-col gap-1">
                {requiresPassword && (
                  <div className="text-xs text-yellow-300 font-bold" style={{ fontFamily: 'VT323, monospace' }}>
                    🔒 This nickname is protected!
                  </div>
                )}
                <input 
                  type="password" 
                  placeholder={requiresPassword ? "PASSWORD REQUIRED" : "PASSWORD (OPTIONAL)"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full px-2 md:px-3 py-2 text-sm md:text-base bg-black/20 text-white placeholder:text-white/70 border-none rounded focus:outline-none focus:ring-2 focus:ring-cyan-300/50" 
                  style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
                  required={requiresPassword}
                />
              </div>
            )}
            
            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }}
              className="w-full px-2 md:px-3 py-2 text-base md:text-lg bg-cyan-500/80 text-white rounded font-bold hover:bg-cyan-400 transition-colors border-none shadow-lg" 
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
