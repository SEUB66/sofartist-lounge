import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { useInstrument } from './useInstrument';
import type { InstrumentId } from '../components/InstrumentSelector';

interface JamNote {
  userId: number;
  instrument: string;
  note: string;
  velocity: number;
  timestamp: Date;
}

export const useJamSync = (userId: number | null, currentInstrument: InstrumentId | null) => {
  const lastNoteIdRef = useRef<number>(0);
  const { playNote } = useInstrument(null); // We'll create instruments dynamically for other users

  // Poll for new notes from other users
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        // Get recent notes (last 2 seconds)
        const twoSecondsAgo = new Date(Date.now() - 2000);
        
        // Query notes from database
        const response = await fetch('/api/trpc/jam.getRecentNotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            since: twoSecondsAgo.toISOString(),
            excludeUserId: userId,
          }),
        });

        if (response.ok) {
          const { result } = await response.json();
          const notes: JamNote[] = result?.data || [];

          // Play notes from other users
          notes.forEach((note) => {
            if (note.userId !== userId) {
              // TODO: Create instrument instance for other users and play their notes
              console.log(`🎵 ${note.instrument}: ${note.note}`);
            }
          });
        }
      } catch (error) {
        console.error('Error syncing jam notes:', error);
      }
    }, 100); // Poll every 100ms for low latency

    return () => clearInterval(interval);
  }, [userId]);

  return {
    // Hook is ready
  };
};

// Hook to manage jam session state
export const useJamSession = (userId: number | null) => {
  const utils = trpc.useUtils();

  // Select instrument mutation
  const selectInstrumentMutation = trpc.jam.selectInstrument.useMutation({
    onSuccess: () => {
      // Invalidate active instruments query
      utils.jam.getActiveInstruments.invalidate();
    },
  });

  // Play note mutation
  const playNoteMutation = trpc.jam.playNote.useMutation();

  // Stop playing mutation
  const stopPlayingMutation = trpc.jam.stopPlaying.useMutation();

  // Query active instruments (poll every 2 seconds)
  const { data: activeInstruments } = trpc.jam.getActiveInstruments.useQuery(undefined, {
    refetchInterval: 2000,
  });

  const selectInstrument = async (instrument: InstrumentId) => {
    if (!userId) return;
    
    try {
      await selectInstrumentMutation.mutateAsync({
        userId,
        instrument,
      });
    } catch (error) {
      console.error('Error selecting instrument:', error);
    }
  };

  const playNote = async (note: string, velocity: number = 100) => {
    if (!userId) return;

    try {
      await playNoteMutation.mutateAsync({
        userId,
        instrument: activeInstruments?.find(i => i.userId === userId)?.instrument || 'keyboard',
        note,
        velocity,
      });
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  const stopPlaying = async () => {
    if (!userId) return;

    try {
      await stopPlayingMutation.mutateAsync({ userId });
    } catch (error) {
      console.error('Error stopping:', error);
    }
  };

  return {
    activeInstruments: activeInstruments || [],
    selectInstrument,
    playNote,
    stopPlaying,
    isSelecting: selectInstrumentMutation.isPending,
  };
};
