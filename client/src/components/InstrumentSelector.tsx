import React, { useState } from 'react';
import { Music, Guitar, Mic, Piano, Drum, Violin } from 'lucide-react';

// Instrument definitions matching GarageBand style
const INSTRUMENTS = [
  { id: 'guitar', name: 'GUITAR', icon: '🎸', description: 'Strum chords or tap notes', color: '#f59e0b' },
  { id: 'bass', name: 'BASS', icon: '🎸', description: 'Play acoustic and electric bass', color: '#ef4444' },
  { id: 'strings', name: 'STRINGS', icon: '🎻', description: 'Orchestral or solo string parts', color: '#8b5cf6' },
  { id: 'recorder', name: 'AUDIO RECORDER', icon: '🎤', description: 'Record your voice or any sound', color: '#ec4899' },
  { id: 'keyboard', name: 'KEYBOARD', icon: '🎹', description: 'Piano, organ, synth sounds', color: '#3b82f6' },
  { id: 'drums', name: 'DRUMMER', icon: '🥁', description: 'Create beats and fills', color: '#f97316' },
  { id: 'soundlib', name: 'SOUND LIBRARY', icon: '🎵', description: 'Browse and play sounds', color: '#10b981' },
] as const;

type InstrumentId = typeof INSTRUMENTS[number]['id'];

interface InstrumentSelectorProps {
  onSelectInstrument: (instrumentId: InstrumentId) => void;
  currentInstrument?: InstrumentId | null;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  onSelectInstrument,
  currentInstrument
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      {/* Current Instrument Display / Open Button */}
      {!isOpen && currentInstrument && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105"
        >
          <span className="text-2xl">
            {INSTRUMENTS.find(i => i.id === currentInstrument)?.icon}
          </span>
          <span className="font-bold">
            {INSTRUMENTS.find(i => i.id === currentInstrument)?.name}
          </span>
          <Music size={20} />
        </button>
      )}

      {/* Open Selector Button (when no instrument) */}
      {!isOpen && !currentInstrument && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 hover:scale-110 animate-pulse"
        >
          <Music size={24} />
          <span className="font-bold text-lg">CHOOSE INSTRUMENT</span>
        </button>
      )}

      {/* Instrument Grid */}
      {isOpen && (
        <div className="bg-gray-900/95 backdrop-blur-xl border-2 border-purple-500 rounded-2xl p-6 shadow-2xl max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-xl">🎵 CHOOSE YOUR INSTRUMENT</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-red-400 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {INSTRUMENTS.map((instrument) => (
              <button
                key={instrument.id}
                onClick={() => {
                  onSelectInstrument(instrument.id);
                  setIsOpen(false);
                }}
                className={`
                  relative group overflow-hidden rounded-xl p-4 transition-all duration-300
                  ${currentInstrument === instrument.id 
                    ? 'ring-4 ring-cyan-400 scale-105' 
                    : 'hover:scale-105'
                  }
                `}
                style={{
                  background: `linear-gradient(135deg, ${instrument.color}22 0%, ${instrument.color}44 100%)`
                }}
              >
                {/* Icon */}
                <div className="text-6xl mb-2 transform group-hover:scale-110 transition-transform">
                  {instrument.icon}
                </div>

                {/* Name */}
                <h4 className="text-white font-bold text-sm mb-1">
                  {instrument.name}
                </h4>

                {/* Description */}
                <p className="text-gray-300 text-xs opacity-80">
                  {instrument.description}
                </p>

                {/* Selected Indicator */}
                {currentInstrument === instrument.id && (
                  <div className="absolute top-2 right-2 bg-cyan-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}

                {/* Hover Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${instrument.color} 0%, transparent 70%)` }}
                />
              </button>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs mt-4">
            🎸 Everyone can see and hear you play in real-time!
          </p>
        </div>
      )}
    </div>
  );
};

export default InstrumentSelector;
export { INSTRUMENTS };
export type { InstrumentId };
