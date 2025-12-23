import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLocation } from 'wouter';
import UnicornBackground from '@/components/UnicornBackground';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserBubble } from '@/components/UserBubble';
import { ChatMessage } from '@/components/ChatMessage';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UploadModal } from '@/components/UploadModal';
import { Settings, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: Date;
  nicknameColor: string;
  mood: string;
  profilePhoto: string | null;
}

export default function Hub() {
  const { user, isLoggedIn } = useUser();
  const [, setLocation] = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/');
    }
  }, [isLoggedIn, setLocation]);

  // Charger les messages depuis localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('devcave_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })));
      } catch (e) {
        console.error('Failed to parse messages:', e);
      }
    }
  }, []);

  // Sauvegarder les messages dans localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('devcave_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatInput.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      userId: user.id,
      nickname: user.nickname,
      content: chatInput.trim(),
      createdAt: new Date(),
      nicknameColor: user.nicknameColor || '#00ff00',
      mood: user.mood || '😊',
      profilePhoto: user.profilePhoto,
    };

    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
    toast.success('Message sent!');
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  // Pour l'instant, on affiche juste l'utilisateur connecté
  const onlineUsers = [user];

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <UnicornBackground />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Compteur d'utilisateurs en ligne */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/30 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <span style={{ fontFamily: 'VT323, monospace' }} className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse">
            {onlineUsers.length} DEV{onlineUsers.length > 1 ? 'S' : ''} ONLINE
          </span>
        </div>
      </div>

      {/* Settings Button - Discret */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
        title="Settings"
      >
        <Settings size={20} className="text-white" />
      </button>

      {/* Upload Button */}
      <button
        onClick={() => setShowUpload(true)}
        className="absolute top-4 left-16 z-50 p-2 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 backdrop-blur-sm border border-white/20 transition-all hover:scale-110 shadow-lg"
        title="Upload MP3 or Image"
      >
        <Upload size={20} className="text-white" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)} 
      />

      {/* User Bubbles - Flottantes */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {onlineUsers.map((onlineUser, index) => (
          <UserBubble
            key={onlineUser.id}
            user={onlineUser}
            index={index}
            totalUsers={onlineUsers.length}
          />
        ))}
      </div>

      {/* Chat Messages - Flottants */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {messages.slice(-10).map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            index={index}
          />
        ))}
      </div>

      {/* Chat Input - En bas */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
        <form onSubmit={handleSendMessage} className="w-full">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          />
        </form>
      </div>

      {/* Footer Credits */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3 animate-in fade-in duration-1000 delay-500">
        <img
          src="/seub-icon.jpg"
          alt="Seub Germain"
          className="w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-lg shadow-xl md:shadow-2xl animate-pulse-subtle"
        />
        <span
          style={{ fontFamily: 'VT323, monospace' }}
          className="text-xs md:text-base bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent tracking-wide md:tracking-wider font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
        >
          SEBG | APPLEPUNK | ALL RIGHTS RESERVED
        </span>
      </div>
    </div>
  );
}
