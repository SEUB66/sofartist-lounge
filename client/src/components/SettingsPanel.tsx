import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { trpc } from '@/lib/trpc';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPanelProps {
  onClose: () => void;
}

const MOOD_EMOJIS = ['😊', '😎', '🔥', '💻', '☕', '🎵', '🎮', '🚀', '✨', '💪', '🤔', '😴'];
const COLORS = [
  '#00ffff', // Cyan
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#00ff00', // Green
  '#ff0000', // Red
  '#ff8800', // Orange
  '#8800ff', // Purple
  '#00ff88', // Mint
  '#ff0088', // Pink
  '#ffffff', // White
];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { user, setUser } = useUser();
  const [selectedColor, setSelectedColor] = useState(user?.nicknameColor || '#00ffff');
  const [selectedMood, setSelectedMood] = useState(user?.mood || '😊');
  const [photoUrl, setPhotoUrl] = useState(user?.profilePhoto || '');

  const updateProfileMutation = trpc.settings.updateProfile.useMutation();

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        nicknameColor: selectedColor,
        mood: selectedMood,
        profilePhoto: photoUrl || undefined,
      });

      // Mettre à jour l'utilisateur local
      setUser({
        ...user,
        nicknameColor: selectedColor,
        mood: selectedMood,
        profilePhoto: photoUrl || null,
      });

      toast.success('Profil mis à jour !');
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-purple-900/90 to-cyan-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'VT323, monospace' }}
          >
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Photo URL */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'VT323, monospace' }}>
            PHOTO URL
          </label>
          <input
            type="text"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            style={{ fontFamily: 'VT323, monospace' }}
          />
        </div>

        {/* Nickname Color */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'VT323, monospace' }}>
            NICKNAME COLOR
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-full aspect-square rounded-lg transition-all ${
                  selectedColor === color ? 'ring-4 ring-white scale-110' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 20px ${color}50`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Mood Emoji */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm mb-2" style={{ fontFamily: 'VT323, monospace' }}>
            MOOD
          </label>
          <div className="grid grid-cols-6 gap-2">
            {MOOD_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedMood(emoji)}
                className={`w-full aspect-square rounded-lg bg-white/10 hover:bg-white/20 transition-all text-2xl ${
                  selectedMood === emoji ? 'ring-4 ring-cyan-400 scale-110' : 'hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg"
          style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}
