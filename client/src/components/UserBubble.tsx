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
  const [rotation, setRotation] = useState(0);

  // Initialiser la position aléatoire
  useEffect(() => {
    const startX = Math.random() * (window.innerWidth - 150);
    const startY = Math.random() * (window.innerHeight - 150);
    setPosition({ x: startX, y: startY });

    // Vitesse aléatoire lente
    setVelocity({
      x: (Math.random() - 0.5) * 0.3,
      y: (Math.random() - 0.5) * 0.3,
    });
  }, []);

  // Animation de flottement avec rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;

        // Rebondir sur les bords
        if (newX <= 0 || newX >= window.innerWidth - 120) {
          setVelocity((v) => ({ ...v, x: -v.x }));
          newX = Math.max(0, Math.min(window.innerWidth - 120, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight - 120) {
          setVelocity((v) => ({ ...v, y: -v.y }));
          newY = Math.max(0, Math.min(window.innerHeight - 120, newY));
        }

        return { x: newX, y: newY };
      });

      // Rotation lente
      setRotation((prev) => (prev + 0.5) % 360);
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
      {/* Bulle 3D avec reflets arc-en-ciel style savon */}
      <div
        className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* Effet de bulle 3D avec reflets arc-en-ciel */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, 
                rgba(255, 255, 255, 0.8) 0%, 
                rgba(255, 255, 255, 0.3) 20%, 
                transparent 50%
              ),
              linear-gradient(135deg, 
                rgba(255, 0, 255, 0.3) 0%,
                rgba(0, 255, 255, 0.3) 25%,
                rgba(255, 255, 0, 0.3) 50%,
                rgba(0, 255, 0, 0.3) 75%,
                rgba(255, 0, 255, 0.3) 100%
              ),
              radial-gradient(circle at 70% 70%, 
                rgba(255, 255, 255, 0.4) 0%, 
                transparent 40%
              )
            `,
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.3),
              inset -5px -5px 15px rgba(0, 0, 0, 0.1),
              0 0 40px ${userColor}40
            `,
          }}
        />

        {/* Reflet arc-en-ciel animé */}
        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background: `
              linear-gradient(45deg, 
                transparent 0%,
                rgba(255, 0, 255, 0.4) 20%,
                rgba(0, 255, 255, 0.4) 40%,
                rgba(255, 255, 0, 0.4) 60%,
                rgba(0, 255, 0, 0.4) 80%,
                transparent 100%
              )
            `,
            transform: `rotate(${-rotation}deg)`,
            mixBlendMode: 'screen',
          }}
        />

        {/* Contenu de la bulle (ne tourne pas) */}
        <div
          className="relative z-10 flex flex-col items-center justify-center gap-0.5"
          style={{
            transform: `rotate(${-rotation}deg)`,
          }}
        >
          {/* Photo de profil (ronde avec transparence) */}
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.nickname}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-lg"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/50 shadow-lg"
              style={{ 
                backgroundColor: userColor,
                fontFamily: 'VT323, monospace'
              }}
            >
              {user.nickname[0].toUpperCase()}
            </div>
          )}

          {/* Nickname */}
          <div
            className="text-sm font-bold whitespace-nowrap px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm mt-0.5"
            style={{
              color: userColor,
              textShadow: `0 0 10px ${userColor}, 0 0 20px ${userColor}80`,
              fontFamily: 'VT323, monospace',
              fontSize: '14px',
            }}
          >
            {user.nickname}
          </div>

          {/* Mood emoji */}
          <div className="text-xl drop-shadow-lg mt-0.5">{userMood}</div>
        </div>
      </div>
    </div>
  );
}
