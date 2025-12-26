import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import type { InstrumentId } from '../components/InstrumentSelector';

// Initialize Tone.js audio context
let audioInitialized = false;

const initializeAudio = async () => {
  if (!audioInitialized) {
    await Tone.start();
    console.log('🎵 Tone.js Audio Context started!');
    audioInitialized = true;
  }
};

export const useInstrument = (instrumentId: InstrumentId | null) => {
  const synthRef = useRef<Tone.PolySynth | Tone.Sampler | Tone.MembraneSynth | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!instrumentId) {
      // Clean up if no instrument selected
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
      setIsReady(false);
      return;
    }

    // Initialize audio on first use
    initializeAudio();

    // Clean up previous instrument
    if (synthRef.current) {
      synthRef.current.dispose();
    }

    // Create instrument based on type
    switch (instrumentId) {
      case 'keyboard':
        // Piano/Keyboard - PolySynth with piano-like sound
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        }).toDestination();
        break;

      case 'guitar':
        // Guitar - Plucky synth
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.001,
            decay: 0.3,
            sustain: 0.1,
            release: 0.8,
          },
        }).toDestination();
        break;

      case 'bass':
        // Bass - Deep synth
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.4,
            release: 0.5,
          },
        }).toDestination();
        break;

      case 'strings':
        // Strings - Smooth pad-like synth
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.5,
            decay: 0.3,
            sustain: 0.7,
            release: 2,
          },
        }).toDestination();
        break;

      case 'drums':
        // Drums - Membrane synth for kick/snare
        synthRef.current = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 6,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0.01,
            release: 1.4,
          },
        }).toDestination() as any;
        break;

      case 'recorder':
        // Audio recorder - will be handled separately with MediaRecorder API
        break;

      case 'soundlib':
        // Sound library - will load samples
        break;

      default:
        break;
    }

    setIsReady(true);

    // Cleanup on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, [instrumentId]);

  const playNote = (note: string, duration: string = '8n', velocity: number = 1) => {
    if (!synthRef.current || !isReady) return;

    try {
      if (instrumentId === 'drums') {
        // For drums, play specific drum sounds
        const drumNotes: Record<string, string> = {
          kick: 'C1',
          snare: 'D1',
          hihat: 'F#1',
          tom1: 'G1',
          tom2: 'A1',
          crash: 'C2',
        };
        const drumNote = drumNotes[note] || 'C1';
        (synthRef.current as Tone.MembraneSynth).triggerAttackRelease(drumNote, duration, undefined, velocity);
      } else {
        // For melodic instruments
        (synthRef.current as Tone.PolySynth).triggerAttackRelease(note, duration, undefined, velocity);
      }
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  const startNote = (note: string, velocity: number = 1) => {
    if (!synthRef.current || !isReady) return;

    try {
      if (instrumentId !== 'drums') {
        (synthRef.current as Tone.PolySynth).triggerAttack(note, undefined, velocity);
      }
    } catch (error) {
      console.error('Error starting note:', error);
    }
  };

  const stopNote = (note: string) => {
    if (!synthRef.current || !isReady) return;

    try {
      if (instrumentId !== 'drums') {
        (synthRef.current as Tone.PolySynth).triggerRelease(note);
      }
    } catch (error) {
      console.error('Error stopping note:', error);
    }
  };

  return {
    playNote,
    startNote,
    stopNote,
    isReady,
  };
};
