import React, { useState } from 'react';
import { useInstrument } from '@/hooks/useInstrument';
import { useJamSession } from '@/hooks/useJamSync';

interface GuitarStringsProps {
  userId: number | null;
}

// Guitar strings (standard tuning)
const STRINGS = [
  { id: 'e4', name: 'E', note: 'E4', color: 'bg-red-500' },
  { id: 'b3', name: 'B', note: 'B3', color: 'bg-orange-500' },
  { id: 'g3', name: 'G', note: 'G3', color: 'bg-yellow-500' },
  { id: 'd3', name: 'D', note: 'D3', color: 'bg-green-500' },
  { id: 'a2', name: 'A', note: 'A2', color: 'bg-blue-500' },
  { id: 'e2', name: 'E', note: 'E2', color: 'bg-purple-500' },
];

const GuitarStrings: React.FC<GuitarStringsProps> = ({ userId }) => {
  const { playNote, isReady } = useInstrument('guitar');
  const { playNote: syncPlayNote } = useJamSession(userId);
  const [activeStrings, setActiveStrings] = useState<Set<string>>(new Set());

  const handleStrum = (stringId: string, note: string) => {
    // Visual feedback
    setActiveStrings(prev => new Set(prev).add(stringId));
    setTimeout(() => {
      setActiveStrings(prev => {
        const newSet = new Set(prev);
        newSet.delete(stringId);
        return newSet;
      });
    }, 500);

    // Play sound
    playNote(note, '2n', 0.8);
    syncPlayNote(note, 80);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-white">🎸 Loading guitar...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-900/90 rounded-xl">
      <h3 className="text-white font-bold text-lg">🎸 GUITAR</h3>
      
      {/* Guitar Strings */}
      <div className="flex flex-col gap-6 w-full max-w-md">
        {STRINGS.map((string) => (
          <button
            key={string.id}
            onClick={() => handleStrum(string.id, string.note)}
            className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden group"
          >
            {/* String */}
            <div 
              className={`
                absolute inset-0 ${string.color} transition-all duration-500
                ${activeStrings.has(string.id) 
                  ? 'animate-pulse scale-y-150' 
                  : 'group-hover:scale-y-125'
                }
              `}
            />
            
            {/* String Label */}
            <span className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-white font-bold text-sm">
              {string.name}
            </span>
            
            {/* Note Label */}
            <span className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
              {string.note}
            </span>
          </button>
        ))}
      </div>

      <p className="text-gray-400 text-xs">Click strings to strum</p>
    </div>
  );
};

export default GuitarStrings;
