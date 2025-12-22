import React, { useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './UnicornBackground.css';

const UnicornBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef(0);
  const { theme } = useTheme();

  // Configuration based on theme
  const getConfig = useCallback(() => {
    if (theme === 'unicorn') {
      return {
        COLOR_PRIMARY: [0.9, 0.2, 0.7], // Magenta
        COLOR_SECONDARY: [0.2, 0.9, 0.9], // Cyan
        COLOR_TERTIARY: [1.0, 0.9, 0.2], // Yellow
        PARTICLE_COUNT: 300,
        SMOKE_SPEED: 0.0001,
        FRICTION: 0.95,
        MOUSE_INFLUENCE: 0.5,
        BG_IMAGE: '/bg-unicorn.jpg'
      };
    } else if (theme === 'dark') {
      return {
        COLOR_PRIMARY: [0.3, 0.4, 0.5], // Slate Blue
        COLOR_SECONDARY: [0.2, 0.2, 0.3], // Dark Grey
        COLOR_TERTIARY: [0.4, 0.4, 0.5], // Grey
        PARTICLE_COUNT: 150, // Less particles for cleaner look
        SMOKE_SPEED: 0.00005, // Very slow
        FRICTION: 0.98,
        MOUSE_INFLUENCE: 0.3,
        BG_IMAGE: '/bg-dark.jpg'
      };
    } else {
      // Light theme
      return {
        COLOR_PRIMARY: [0.8, 0.9, 1.0], // Pale Blue
        COLOR_SECONDARY: [0.9, 0.8, 0.9], // Pale Purple
        COLOR_TERTIARY: [0.9, 0.9, 0.9], // Light Grey
        PARTICLE_COUNT: 100, // Minimal
        SMOKE_SPEED: 0.00005,
        FRICTION: 0.98,
        MOUSE_INFLUENCE: 0.2,
        BG_IMAGE: '/bg-light.jpg'
      };
    }
  }, [theme]);

  const particles = useRef<any[]>([]);
  const mouse = useRef({ x: 0, y: 0 });

  const initParticles = useCallback(() => {
    const config = getConfig();
    particles.current = [];
    for (let i = 0; i < config.PARTICLE_COUNT; i++) {
      const colorType = Math.random();
      let color = config.COLOR_PRIMARY;
      if (colorType > 0.66) color = config.COLOR_SECONDARY;
      else if (colorType > 0.33) color = config.COLOR_TERTIARY;

      particles.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        color: color,
      });
    }
  }, [getConfig]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const config = getConfig();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current.forEach(p => {
      p.x += p.vx + config.SMOKE_SPEED * canvas.width;
      p.y += p.vy + config.SMOKE_SPEED * canvas.height;

      const dx = mouse.current.x - p.x;
      const dy = mouse.current.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 300) {
        const force = (1 - dist / 300) * config.MOUSE_INFLUENCE * 0.05;
        p.vx -= dx * force;
        p.vy -= dy * force;
      }

      p.vx *= config.FRICTION;
      p.vy *= config.FRICTION;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0] * 255}, ${p.color[1] * 255}, ${p.color[2] * 255}, 0.8)`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fill();
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [getConfig]);

  useEffect(() => {
    initParticles();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', initParticles);
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', initParticles);
    };
  }, [animate, handleMouseMove, initParticles, getConfig]);

  return (
    <div className="unicorn-background-container">
      {/* Background Image Layer */}
      <div 
        className="background-image-layer"
        style={{ backgroundImage: `url(${getConfig().BG_IMAGE})` }}
      />
      
      {/* Unicorn Asset Overlay */}
      {theme === 'unicorn' && (
        <div className="unicorn-asset-overlay" />
      )}
      
      {/* Canvas Layer (Particles) */}
      <canvas ref={canvasRef} className="unicorn-canvas" />
      
      {/* Overlay for better text contrast */}
      <div className={`background-overlay ${theme}`} />
    </div>
  );
};

export default UnicornBackground;
