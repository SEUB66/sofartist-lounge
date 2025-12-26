import React, { useState } from 'react';
import { useInstrument } from '@/hooks/useInstrument';
import { useJamSession } from '@/hooks/useJamSync';

interface PianoKeyboardProps {
  userId: number | null;
}

// Piano keys layout (2 octaves)
const WHITE_KEYS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'];
const BLACK_KEYS = ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null, 'C#5', 'D#5', null, 'F#5', 'G#5', 'A#5'];

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ userId }) => {
  const { playNote, startNote, stopNote, isReady } = useInstrument('keyboard');
  const { playNote: syncPlayNote } = useJamSession(userId);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = (note: string) => {
    if (activeKeys.has(note)) return;
    
    setActiveKeys(prev => new Set(prev).add(note));
    startNote(note);
    syncPlayNote(note, 100);
  };

  const handleKeyUp = (note: string) => {
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
    stopNote(note);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-white">🎹 Loading keyboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-900/90 rounded-xl">
      <h3 className="text-white font-bold text-lg">🎹 KEYBOARD</h3>
      
      {/* Piano Keys */}
      <div className="relative">
        {/* White Keys */}
        <div className="flex gap-0.5">
          {WHITE_KEYS.map((note, index) => (
            <button
              key={note}
              onMouseDown={() => handleKeyDown(note)}
              onMouseUp={() => handleKeyUp(note)}
              onMouseLeave={() => handleKeyUp(note)}
              onTouchStart={() => handleKeyDown(note)}
              onTouchEnd={() => handleKeyUp(note)}
              className={`
                w-12 h-48 rounded-b-lg border-2 border-gray-800 transition-all duration-75
                ${activeKeys.has(note) 
                  ? 'bg-cyan-400 scale-95' 
                  : 'bg-white hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xs text-gray-600 absolute bottom-2 left-1/2 transform -translate-x-1/2">
                {note}
              </span>
            </button>
          ))}
        </div>

        {/* Black Keys */}
        <div className="absolute top-0 left-0 flex gap-0.5 pointer-events-none">
          {BLACK_KEYS.map((note, index) => {
            if (!note) {
              return <div key={`spacer-${index}`} className="w-12" />;
            }

            return (
              <button
                key={note}
                onMouseDown={() => handleKeyDown(note)}
                onMouseUp={() => handleKeyUp(note)}
                onMouseLeave={() => handleKeyUp(note)}
                onTouchStart={() => handleKeyDown(note)}
                onTouchEnd={() => handleKeyUp(note)}
                className={`
                  w-8 h-28 rounded-b-lg border-2 border-gray-900 transition-all duration-75 pointer-events-auto
                  ${activeKeys.has(note) 
                    ? 'bg-purple-600 scale-95' 
                    : 'bg-gray-900 hover:bg-gray-800'
                  }
                `}
                style={{ marginLeft: index === 0 ? '32px' : '16px' }}
              />
            );
          })}
        </div>
      </div>

      <p className="text-gray-400 text-xs">Click or tap keys to play</p>
    </div>
  );
};

export default PianoKeyboard;
