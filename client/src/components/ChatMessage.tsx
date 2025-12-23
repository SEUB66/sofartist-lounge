import { useEffect, useState } from 'react';

interface Message {
  id: number;
  content: string;
  createdAt: Date | null;
  userId: number;
  nickname: string | null;
  nicknameColor: string | null;
  mood: string | null;
  profilePhoto: string | null;
}

interface ChatMessageProps {
  message: Message;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Faire disparaître le message après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const color = message.nicknameColor || '#00ffff';

  return (
    <div
      className="absolute animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto"
      style={{
        left: `${20 + (index % 3) * 30}%`,
        top: `${20 + (index % 4) * 20}%`,
      }}
    >
      {/* Bulle de message */}
      <div
        className="max-w-xs px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}15, ${color}08)`,
          borderColor: `${color}30`,
          boxShadow: `0 0 20px ${color}20`,
        }}
      >
        {/* Header avec nickname et mood */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold"
            style={{
              color: color,
              fontFamily: 'VT323, monospace',
              textShadow: `0 0 8px ${color}`,
            }}
          >
            {message.nickname || 'Anonymous'}
          </span>
          <span className="text-sm">{message.mood || '😊'}</span>
        </div>

        {/* Message content */}
        <div
          className="text-white text-sm"
          style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
