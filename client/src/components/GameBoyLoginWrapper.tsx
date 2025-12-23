import { GameBoyLogin } from './GameBoyLogin';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface GameBoyLoginWrapperProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function GameBoyLoginWrapper({ isOpen, onClose, onSuccess }: GameBoyLoginWrapperProps) {
  const { setUser } = useUser();

  const handleLogin = async (nickname: string) => {
    console.log('[LOGIN] Attempting login with nickname:', nickname);
    try {
      // Simple localStorage login for now
      const user = {
        id: Date.now(),
        nickname,
        profilePhoto: null,
        nicknameColor: '#00ff00',
        mood: '😊',
        createdAt: new Date(),
        lastSeenAt: new Date()
      };
      
      setUser(user as any);
      toast.success(`Bienvenue ${nickname} !`);
      onSuccess?.();
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      toast.error('Erreur de connexion');
    }
  };

  return (
    <GameBoyLogin 
      isOpen={isOpen}
      onLogin={handleLogin}
      onClose={onClose}
    />
  );
}
