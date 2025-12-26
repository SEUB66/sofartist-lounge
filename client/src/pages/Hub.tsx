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
import CustomizableTV from '@/components/CustomizableTV';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import InstrumentSelector from '@/components/InstrumentSelector';
import type { InstrumentId } from '@/components/InstrumentSelector';
import PianoKeyboard from '@/components/instruments/PianoKeyboard';
import DrumPads from '@/components/instruments/DrumPads';
import GuitarStrings from '@/components/instruments/GuitarStrings';
import { useJamSession } from '@/hooks/useJamSync';

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
  const [tvStartPlaying, setTvStartPlaying] = useState(true);
  const { user, isLoggedIn } = useUser();
  const [, setLocation] = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentId | null>(null);
  
  const { selectInstrument, activeInstruments } = useJamSession(user?.id || null);
  
  const { data: onlineUsers = [] } = trpc.presence.getOnlineUsers.useQuery(undefined, {
    refetchInterval: 5000,
  });
  
  const { data: onlineCount = 0 } = trpc.presence.getOnlineCount.useQuery(undefined, {
    refetchInterval: 5000,
  });
  
  const updatePresenceMutation = trpc.presence.updatePresence.useMutation();
  
  useEffect(() => {
    if (!user) return;
    
    updatePresenceMutation.mutate({ userId: user.id });
    
    const interval = setInterval(() => {
      updatePresenceMutation.mutate({ userId: user.id });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user, updatePresenceMutation]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/');
    }
  }, [isLoggedIn, setLocation]);

  const { data: dbMessages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery({ limit: 100 }, {
    refetchInterval: 3000,
  });
  
  useEffect(() => {
    // Wait minimum 3 seconds before showing messages to prevent flash
    const timer = setTimeout(() => {
      if (dbMessages && dbMessages.length > 0) {
        setMessages(dbMessages.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })));
      }
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [dbMessages]);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  
  const [isSending, setIsSending] = useState(false);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatInput.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        userId: user.id,
        content: chatInput.trim(),
      });
      setChatInput('');
      toast.success('Message sent!');
      await refetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <UnicornBackground />

      <div className="absolute top-4 right-4 z-[100]">
        <ThemeToggle />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100]">
        <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/30 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <span style={{ fontFamily: 'VT323, monospace' }} className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse">
            {onlineUsers.length} DEV{onlineUsers.length > 1 ? 'S' : ''} ONLINE
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 left-4 z-[100] w-14 h-14 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 backdrop-blur-sm border-2 border-teal-400 transition-all hover:scale-105 flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 0 30px rgba(0, 200, 200, 0.6), inset 0 0 20px rgba(0, 200, 200, 0.3)' }}
        title="Settings"
      >
        <Settings size={28} className="text-white drop-shadow-lg" />
      </button>

      <button
        onClick={() => setShowUpload(true)}
        className="absolute top-4 left-20 z-[100] w-14 h-14 rounded-lg bg-gradient-to-br from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 backdrop-blur-sm border-2 border-pink-400 transition-all hover:scale-105 flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 0 30px rgba(236, 72, 153, 0.6), inset 0 0 20px rgba(236, 72, 153, 0.3)' }}
        title="Upload MP3 or Image"
      >
        <Upload size={28} className="text-white drop-shadow-lg" />
      </button>

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      <UploadModal 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)} 
      />

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

      {/* Fixed Chat Box */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
        {/* Chat Messages */}
        <div 
          className="mb-3 p-4 rounded-2xl overflow-y-auto"
          style={{
            maxHeight: '300px',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          {isLoading ? (
            <div className="text-center py-8">
              <div style={{ fontFamily: 'VT323, monospace' }} className="text-2xl text-cyan-400 animate-pulse">
                ⏳ LOADING CHAT...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div style={{ fontFamily: 'VT323, monospace' }} className="text-xl text-white/50">
                💬 NO MESSAGES YET. BE THE FIRST!
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.slice(-20).map((message) => (
                <div key={message.id} className="flex items-start gap-2 hover:bg-white/5 p-2 rounded-lg transition-colors">
                  {/* Avatar */}
                  {message.profilePhoto ? (
                    <img 
                      src={message.profilePhoto} 
                      alt={message.nickname}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                      style={{ 
                        background: message.nicknameColor || '#808080',
                        fontSize: '14px'
                      }}
                    >
                      {message.nickname[0].toUpperCase()}
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="font-bold"
                        style={{ 
                          fontFamily: 'VT323, monospace',
                          fontSize: '18px',
                          color: message.nicknameColor || '#ffffff'
                        }}
                      >
                        {message.nickname}
                      </span>
                      <span 
                        className="text-white/40 text-xs"
                        style={{ fontFamily: 'VT323, monospace' }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div 
                      className="text-white break-words"
                      style={{ 
                        fontFamily: 'VT323, monospace',
                        fontSize: '16px',
                        lineHeight: '1.4'
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}
          />
          <button
            type="submit"
            disabled={isSending}
            className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-full font-bold transition-all hover:scale-105 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}
          >
            {isSending ? 'SENDING...' : 'SEND'}
          </button>
        </form>
      </div>

      <CustomizableTV 
        isOpen={true}
        initialStyle={user?.tvStyle || '1970s'}
        initialPosition={{ x: 20, y: 80 }}
        size="medium"
        startPlaying={tvStartPlaying}
      />

      {/* Instrument Selector */}
      <InstrumentSelector 
        currentInstrument={currentInstrument}
        onSelectInstrument={(instrumentId) => {
          setCurrentInstrument(instrumentId);
          selectInstrument(instrumentId);
        }}
      />

      {/* Active Instrument Interface */}
      {currentInstrument && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-40">
          {currentInstrument === 'keyboard' && <PianoKeyboard userId={user?.id || null} />}
          {currentInstrument === 'drums' && <DrumPads userId={user?.id || null} />}
          {currentInstrument === 'guitar' && <GuitarStrings userId={user?.id || null} />}
          {currentInstrument === 'bass' && <GuitarStrings userId={user?.id || null} />}
          {currentInstrument === 'strings' && <PianoKeyboard userId={user?.id || null} />}
        </div>
      )}

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
        <a 
          href="https://seub.ca" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform duration-300"
        >
          <img 
            src="/applepunk-logo.gif" 
            alt="ApplePunk" 
            className="w-12 h-auto md:w-18 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]"
            style={{ width: '48px' }}
          />
        </a>
      </div>
    </div>
  );
}
