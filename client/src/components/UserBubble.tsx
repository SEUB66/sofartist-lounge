import { useEffect, useState } from 'react';

interface User {
  id: number;
  nickname: string;
  profilePhoto: string | null;
  nicknameColor: string | null;
  mood: string | null;
}

interface UserBubbleProps {
  user: User;
  index: number;
  totalUsers: number;
}

export function UserBubble({ user, index, totalUsers }: UserBubbleProps) {
  const userColor = user.nicknameColor || '#00ffff';
  const userMood = user.mood || '😊';
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  // Initialiser la position aléatoire
  useEffect(() => {
    const startX = Math.random() * (window.innerWidth - 100);
    const startY = Math.random() * (window.innerHeight - 100);
    setPosition({ x: startX, y: startY });

    // Vitesse aléatoire lente
    setVelocity({
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
    });
  }, []);

  // Animation de flottement
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;

        // Rebondir sur les bords
        if (newX <= 0 || newX >= window.innerWidth - 80) {
          setVelocity((v) => ({ ...v, x: -v.x }));
          newX = Math.max(0, Math.min(window.innerWidth - 80, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight - 80) {
          setVelocity((v) => ({ ...v, y: -v.y }));
          newY = Math.max(0, Math.min(window.innerHeight - 80, newY));
        }

        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [velocity]);

  return (
    <div
      className="absolute pointer-events-auto transition-all duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Bulle avec effet savon */}
      <div
        className="relative w-20 h-20 rounded-full backdrop-blur-md border-2 flex flex-col items-center justify-center gap-1 shadow-2xl animate-float"
        style={{
          background: `linear-gradient(135deg, 
            ${userColor}20, 
            ${userColor}10, 
            transparent)`,
          borderColor: `${userColor}40`,
          boxShadow: `0 0 30px ${userColor}30, inset 0 0 20px rgba(255,255,255,0.1)`,
        }}
      >
        {/* Photo de profil (ronde avec transparence) */}
        {user.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.nickname}
            className="w-10 h-10 rounded-full object-cover opacity-80 border border-white/30"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg opacity-80"
            style={{ backgroundColor: userColor }}
          >
            {user.nickname[0].toUpperCase()}
          </div>
        )}

        {/* Mood emoji */}
        <div className="text-lg">{userMood}</div>

        {/* Nickname */}
        <div
          className="absolute -bottom-6 text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm"
          style={{
            color: userColor,
            textShadow: `0 0 10px ${userColor}`,
            fontFamily: 'VT323, monospace',
          }}
        >
          {user.nickname}
        </div>
      </div>
    </div>
  );
}
