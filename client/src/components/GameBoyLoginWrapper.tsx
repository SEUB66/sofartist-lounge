import { GameBoyLogin } from './GameBoyLogin';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface GameBoyLoginWrapperProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function GameBoyLoginWrapper({ isOpen, onClose, onSuccess }: GameBoyLoginWrapperProps) {
  const { setUser } = useUser();
  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async (nickname: string, password?: string) => {
    console.log('[LOGIN] Attempting login with nickname:', nickname, 'password:', password ? 'provided' : 'none');
    try {
      // Use real tRPC login to get/create user in database
      const result = await loginMutation.mutateAsync({ nickname, password });
      
      if (result.user) {
        const user = {
          id: result.user.id,
          nickname: result.user.nickname,
          profilePhoto: result.user.profilePhoto,
          nicknameColor: result.user.nicknameColor,
          mood: result.user.mood,
          createdAt: new Date(result.user.createdAt),
          lastSeenAt: new Date(result.user.lastSeenAt || result.user.createdAt)
        };
        
        setUser(user as any);
        
        if (result.isNew) {
          toast.success(`Bienvenue ${nickname} ! Nouveau compte créé 🎉`);
        } else {
          toast.success(`Content de te revoir ${nickname} ! 🎮`);
        }
        
        if (password && result.isNew) {
          toast.info('🔒 Nickname protégé par mot de passe!');
        }
        
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('[LOGIN] Error:', error);
      if (error.message?.includes('Password required')) {
        toast.error('🔒 Ce nickname est protégé par mot de passe!');
      } else if (error.message?.includes('Invalid password')) {
        toast.error('❌ Mot de passe incorrect!');
      } else {
        toast.error('Erreur de connexion - réessaie!');
      }
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
