import React from 'react';

export type InstrumentId = 'keyboard' | 'drums' | 'guitar' | 'bass' | 'strings' | 'mic' | 'library';

interface Instrument {
  id: InstrumentId;
  name: string;
  icon: string;
  label: string;
}

const INSTRUMENTS: Instrument[] = [
  { id: 'keyboard', name: 'Keyboard', icon: '/instruments/keyboard-icon.png', label: 'KEY' },
  { id: 'drums', name: 'Drums', icon: '/instruments/drums-icon.png', label: 'DRUM' },
  { id: 'guitar', name: 'Guitar', icon: '/instruments/guitar-icon.png', label: 'GUIT' },
  { id: 'bass', name: 'Bass', icon: '/instruments/bass-icon.png', label: 'BASS' },
  { id: 'strings', name: 'Strings', icon: '/instruments/strings-icon.png', label: 'STRI' },
  { id: 'mic', name: 'Microphone', icon: '/instruments/mic-icon.png', label: 'MIC' },
  { id: 'library', name: 'Sound Library', icon: '/instruments/library-icon.png', label: 'LIB' },
];

interface InstrumentSelectorProps {
  currentInstrument: InstrumentId | null;
  onSelectInstrument: (instrumentId: InstrumentId) => void;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  currentInstrument,
  onSelectInstrument,
}) => {
  return (
    <div className="fixed bottom-[380px] left-1/2 transform -translate-x-1/2 z-40">
      {/* Windows 95 Taskbar Style Container */}
      <div 
        className="flex gap-1 p-2 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #c0c0c0 0%, #808080 100%)',
          boxShadow: 'inset 2px 2px 0px rgba(255,255,255,0.8), inset -2px -2px 0px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.5)',
          border: '2px solid #808080',
        }}
      >
        {INSTRUMENTS.map((instrument) => {
          const isSelected = currentInstrument === instrument.id;
          
          return (
            <button
              key={instrument.id}
              onClick={() => onSelectInstrument(instrument.id)}
              className="group relative transition-all duration-100"
              style={{
                width: '80px',
                height: '80px',
                background: isSelected 
                  ? 'linear-gradient(135deg, #808080 0%, #c0c0c0 100%)'
                  : 'linear-gradient(135deg, #dfdfdf 0%, #c0c0c0 100%)',
                border: isSelected
                  ? '2px solid #000'
                  : '2px solid #fff',
                borderTopColor: isSelected ? '#000' : '#fff',
                borderLeftColor: isSelected ? '#000' : '#fff',
                borderRightColor: isSelected ? '#808080' : '#000',
                borderBottomColor: isSelected ? '#808080' : '#000',
                boxShadow: isSelected
                  ? 'inset 2px 2px 4px rgba(0,0,0,0.5), 0 0 15px rgba(0,200,255,0.8)'
                  : 'inset -1px -1px 2px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.8)',
                transform: isSelected ? 'translateY(2px)' : 'translateY(0)',
              }}
              title={instrument.name}
            >
              {/* Icon */}
              <div className="flex flex-col items-center justify-center h-full p-1">
                <img 
                  src={instrument.icon} 
                  alt={instrument.name}
                  className="w-10 h-10 mb-1"
                  style={{
                    imageRendering: 'pixelated',
                    filter: isSelected ? 'brightness(1.2) drop-shadow(0 0 4px cyan)' : 'none',
                  }}
                />
                
                {/* Label */}
                <span 
                  className="text-xs font-bold tracking-tight"
                  style={{
                    fontFamily: 'VT323, monospace',
                    fontSize: '14px',
                    color: isSelected ? '#00ffff' : '#000',
                    textShadow: isSelected 
                      ? '0 0 8px rgba(0,255,255,0.8), 1px 1px 0 rgba(255,255,255,0.5)' 
                      : '1px 1px 0 rgba(255,255,255,0.8)',
                  }}
                >
                  {instrument.label}
                </span>
              </div>

              {/* Hover Effect */}
              {!isSelected && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,200,255,0.1) 0%, rgba(0,150,255,0.1) 100%)',
                  }}
                />
              )}

              {/* Selection Glow */}
              {isSelected && (
                <div 
                  className="absolute inset-0 pointer-events-none animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,255,255,0.2) 0%, transparent 70%)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* CRT Scanline Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, transparent 2px, transparent 4px)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
};

export default InstrumentSelector;
