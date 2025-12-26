import React, { useState } from 'react';
import { useInstrument } from '@/hooks/useInstrument';
import { useJamSession } from '@/hooks/useJamSync';

interface DrumPadsProps {
  userId: number | null;
}

// Drum pad configuration
const DRUM_PADS = [
  { id: 'kick', name: 'KICK', color: 'from-red-600 to-red-800', note: 'kick' },
  { id: 'snare', name: 'SNARE', color: 'from-blue-600 to-blue-800', note: 'snare' },
  { id: 'hihat', name: 'HI-HAT', color: 'from-yellow-600 to-yellow-800', note: 'hihat' },
  { id: 'tom1', name: 'TOM 1', color: 'from-green-600 to-green-800', note: 'tom1' },
  { id: 'tom2', name: 'TOM 2', color: 'from-purple-600 to-purple-800', note: 'tom2' },
  { id: 'crash', name: 'CRASH', color: 'from-orange-600 to-orange-800', note: 'crash' },
];

const DrumPads: React.FC<DrumPadsProps> = ({ userId }) => {
  const { playNote, isReady } = useInstrument('drums');
  const { playNote: syncPlayNote } = useJamSession(userId);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());

  const handlePadHit = (padId: string, note: string) => {
    // Visual feedback
    setActivePads(prev => new Set(prev).add(padId));
    setTimeout(() => {
      setActivePads(prev => {
        const newSet = new Set(prev);
        newSet.delete(padId);
        return newSet;
      });
    }, 150);

    // Play sound
    playNote(note, '8n', 1);
    syncPlayNote(note, 100);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-white">🥁 Loading drums...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-900/90 rounded-xl">
      <h3 className="text-white font-bold text-lg">🥁 DRUMMER</h3>
      
      {/* Drum Pads Grid */}
      <div className="grid grid-cols-3 gap-4">
        {DRUM_PADS.map((pad) => (
          <button
            key={pad.id}
            onMouseDown={() => handlePadHit(pad.id, pad.note)}
            onTouchStart={() => handlePadHit(pad.id, pad.note)}
            className={`
              w-24 h-24 rounded-xl font-bold text-white text-sm
              bg-gradient-to-br ${pad.color}
              transition-all duration-150
              ${activePads.has(pad.id) 
                ? 'scale-90 brightness-150 shadow-2xl' 
                : 'scale-100 hover:scale-105 shadow-lg'
              }
              active:scale-90
            `}
          >
            {pad.name}
          </button>
        ))}
      </div>

      <p className="text-gray-400 text-xs">Click or tap pads to play drums</p>
    </div>
  );
};

export default DrumPads;
