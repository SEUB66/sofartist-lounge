import { GameBoyLogin } from './GameBoyLogin';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface GameBoyLoginWrapperProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function GameBoyLoginWrapper({ isOpen, onClose, onSuccess }: GameBoyLoginWrapperProps) {
  const { setUser } = useUser();
  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async (nickname: string) => {
    try {
      const result = await loginMutation.mutateAsync({ nickname });
      
      if (result.user) {
        setUser(result.user as any);
        toast.success(result.isNew ? `Bienvenue ${nickname} !` : `Re-bienvenue ${nickname} !`);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Login error:', error);
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
