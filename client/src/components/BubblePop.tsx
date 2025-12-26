import { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  x: number;
  y: number;
}

interface BubblePopProps {
  trigger: number;
  color?: string;
}

export default function BubblePop({ trigger, color = '#00ffff' }: BubblePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const newBubbles: Bubble[] = [];
    for (let i = 0; i < 8; i++) {
      newBubbles.push({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      });
    }

    setBubbles(prev => [...prev, ...newBubbles]);

    const timer = setTimeout(() => {
      setBubbles(prev => prev.filter(b => !newBubbles.find(nb => nb.id === b.id)));
    }, 1000);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full animate-bubble-pop"
          style={{
            backgroundColor: color,
            transform: `translate(${bubble.x}px, ${bubble.y}px)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
    </div>
  );
}
