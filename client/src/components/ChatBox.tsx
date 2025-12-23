import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';

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

interface ChatBoxProps {
  messages: Message[];
}

export function ChatBox({ messages }: ChatBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-30">
      {/* Chat Container */}
      <div className="bg-gradient-to-b from-purple-900/40 via-cyan-900/30 to-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center gap-3">
          <MessageCircle size={20} className="text-cyan-400" />
          <h3 style={{ fontFamily: 'VT323, monospace' }} className="text-lg font-bold text-white">
            CHAT HISTORY
          </h3>
          <span className="ml-auto text-xs text-white/60">
            {messages.length} messages
          </span>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="h-48 overflow-y-auto space-y-2 p-4 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/40">
              <p style={{ fontFamily: 'VT323, monospace' }}>No messages yet...</p>
            </div>
          ) : (
            messages.map((msg) => {
              const color = msg.nicknameColor || '#00ffff';
              return (
                <div
                  key={msg.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                    border: `1px solid ${color}20`,
                  }}
                >
                  <div className="px-4 py-2 rounded-lg">
                    {/* Header: nickname + mood + time */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: color,
                          fontFamily: 'VT323, monospace',
                          textShadow: `0 0 6px ${color}40`,
                        }}
                      >
                        {msg.nickname || 'Anonymous'}
                      </span>
                      <span className="text-xs">{msg.mood || '😊'}</span>
                      <span className="text-xs text-white/40 ml-auto">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Message Content */}
                    <p
                      className="text-white text-sm break-words"
                      style={{ fontFamily: 'VT323, monospace' }}
                    >
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
