import React, { useEffect, useRef } from 'react';

interface ParticlesBackgroundProps {
  theme: string;
  effect: string;
  reducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  life?: number;
  maxLife?: number;
  angle?: number;
  spin?: number;
  amplitude?: number;
  wavelength?: number;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  theme,
  effect,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const maxParticles = reducedMotion ? 12 : 55;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Color definitions based on theme/effect
    const getParticleColors = (eff: string): string[] => {
      switch (eff) {
        case 'forest':
        case 'fireflies':
          return ['rgba(163, 230, 53, ', 'rgba(74, 222, 128, ', 'rgba(250, 204, 21, ']; // Lime, Green, Yellow
        case 'ocean':
          return ['rgba(14, 165, 233, ', 'rgba(56, 189, 248, ', 'rgba(45, 212, 191, ']; // Sky, Teal
        case 'galaxy':
        case 'sparkles':
          return ['rgba(244, 63, 94, ', 'rgba(168, 85, 247, ', 'rgba(192, 132, 252, ', 'rgba(255, 255, 255, ']; // Rose, Purple, White
        case 'zen':
        case 'petals':
          return ['rgba(251, 113, 133, ', 'rgba(244, 114, 182, ', 'rgba(253, 164, 186, ']; // Pink petals
        case 'sunrise':
          return ['rgba(251, 146, 60, ', 'rgba(251, 113, 133, ', 'rgba(254, 240, 138, ']; // Orange, Yellow, Rose
        case 'aurora':
          return ['rgba(45, 212, 191, ', 'rgba(52, 211, 153, ', 'rgba(129, 140, 248, ']; // Teal, Green, Indigo
        case 'rainbow':
        case 'confetti':
        default:
          return [
            'rgba(239, 68, 68, ',   // Red
            'rgba(249, 115, 22, ',  // Orange
            'rgba(234, 179, 8, ',   // Yellow
            'rgba(34, 197, 94, ',   // Green
            'rgba(59, 130, 246, ',  // Blue
            'rgba(168, 85, 247, '   // Purple
          ];
      }
    };

    // Helper to generate a new particle
    const createParticle = (init = false): Particle => {
      const colors = getParticleColors(effect || theme);
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      const opacity = 0.2 + Math.random() * 0.6;
      
      const p: Particle = {
        x: Math.random() * canvas.width,
        y: init ? Math.random() * canvas.height : canvas.height + 20,
        size: 1.5 + Math.random() * 4.5,
        speedX: (Math.random() * 2 - 1) * 0.4,
        speedY: -(0.3 + Math.random() * 1.1),
        color: colorBase,
        opacity,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 2 - 1) * 0.02,
        amplitude: 10 + Math.random() * 30,
        wavelength: 100 + Math.random() * 150,
      };

      // Customize physics based on active effect type
      if (effect === 'petals' || theme === 'zen') {
        p.size = 4 + Math.random() * 7;
        p.speedX = 0.3 + Math.random() * 0.9; // drift right
        p.speedY = 0.4 + Math.random() * 0.8; // drift down
        if (!init) {
          p.x = -20;
          p.y = Math.random() * canvas.height * 0.6;
        }
      } else if (effect === 'clouds') {
        p.size = 40 + Math.random() * 70;
        p.speedX = 0.05 + Math.random() * 0.15; // slow drift right
        p.speedY = 0;
        p.opacity = 0.05 + Math.random() * 0.08;
        if (!init) {
          p.x = -p.size - 10;
          p.y = Math.random() * canvas.height * 0.5;
        }
      } else if (effect === 'confetti') {
        p.size = 3 + Math.random() * 5;
        p.speedX = (Math.random() * 2 - 1) * 1.5;
        p.speedY = 1 + Math.random() * 2.5; // fall down
        if (!init) {
          p.x = Math.random() * canvas.width;
          p.y = -20;
        }
      }

      return p;
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Animation Loop
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Theme-Specific Background Overlay Drawings (E.g. Sunrise rays, Aurora bands, Rainbow arcs)
      if (!reducedMotion) {
        if (theme === 'sunrise' || effect === 'sunrise') {
          // Draw subtle sunrise rays from center bottom
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height, 0,
            canvas.width / 2, canvas.height, canvas.height * 0.8
          );
          gradient.addColorStop(0, 'rgba(251, 146, 60, 0.08)'); // Orange
          gradient.addColorStop(0.5, 'rgba(244, 114, 182, 0.03)'); // Rose
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height, canvas.height * 0.8, Math.PI, 0);
          ctx.fill();
        } else if (theme === 'aurora' || effect === 'aurora') {
          // Draw sweeping vertical aurora bands
          const time = Date.now() * 0.0005;
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          
          for (let i = 0; i < 3; i++) {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
            const color1 = i === 0 ? 'rgba(45, 212, 191, 0.05)' : i === 1 ? 'rgba(52, 211, 153, 0.04)' : 'rgba(99, 102, 241, 0.03)';
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.2 + i * 0.2, color1);
            grad.addColorStop(0.5 + i * 0.1, 'rgba(0,0,0,0)');
            grad.addColorStop(0.7 + i * 0.1, color1);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let x = 0; x <= canvas.width; x += 40) {
              const yOffset = Math.sin(x * 0.002 + time + i) * 60 + Math.cos(x * 0.001 - time) * 30;
              ctx.lineTo(x, canvas.height * 0.1 + yOffset + i * 40);
            }
            ctx.lineTo(canvas.width, canvas.height * 0.65);
            ctx.lineTo(0, canvas.height * 0.65);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        } else if (theme === 'rainbow' || effect === 'rainbow') {
          // Draw very subtle full-screen arching rainbow in background
          const radius = Math.min(canvas.width, canvas.height) * 0.75;
          const cx = canvas.width * 0.15;
          const cy = canvas.height * 1.1;
          
          ctx.save();
          ctx.globalAlpha = 0.03;
          ctx.lineWidth = 14;
          
          const rainbowColors = [
            '#EF4444', // Red
            '#F97316', // Orange
            '#EAB308', // Yellow
            '#22C55E', // Green
            '#3B82F6', // Blue
            '#8B5CF6'  // Violet
          ];

          rainbowColors.forEach((col, idx) => {
            ctx.strokeStyle = col;
            ctx.beginPath();
            ctx.arc(cx, cy, radius - idx * 14, Math.PI * 1.5, Math.PI * 2);
            ctx.stroke();
          });
          ctx.restore();
        }
      }

      // 2. Process and Render Particles
      particles.forEach((p, index) => {
        if (!reducedMotion) {
          // Update physics
          p.life = (p.life || 0) + 1;
          p.angle = (p.angle || 0) + (p.spin || 0);

          if (effect === 'petals' || theme === 'zen') {
            // Petals flutter in wave
            p.x += p.speedX + Math.sin(p.life / 20) * 0.4;
            p.y += p.speedY;
          } else if (effect === 'clouds') {
            p.x += p.speedX;
          } else {
            // Standard sparks / fireflies / bubbles rising
            p.y += p.speedY;
            p.x += p.speedX + Math.sin(p.life / (p.wavelength || 100)) * (p.amplitude || 10) * 0.01;
          }
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (effect === 'petals' || theme === 'zen') {
          // Lotus petal drawing
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'clouds') {
          // Subtle soft cloudy puff
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'confetti') {
          // Rotating colorful confetti squares
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        } else {
          // Floating fireflies or bubbles
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle glow for fireflies
          if ((theme === 'forest' || effect === 'fireflies' || effect === 'sparkles') && !reducedMotion) {
            ctx.shadowBlur = p.size * 3;
            ctx.shadowColor = `${p.color}0.8)`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();

        // Boundary checks / respawn
        let outOfBounds = false;
        if (effect === 'petals' || theme === 'zen') {
          if (p.x > canvas.width + 20 || p.y > canvas.height + 20) outOfBounds = true;
        } else if (effect === 'clouds') {
          if (p.x > canvas.width + p.size + 10) outOfBounds = true;
        } else if (effect === 'confetti') {
          if (p.y > canvas.height + 20) outOfBounds = true;
        } else {
          if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) outOfBounds = true;
        }

        if (outOfBounds || (p.life && p.maxLife && p.life > p.maxLife)) {
          particles[index] = createParticle(false);
        }
      });

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [theme, effect, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      id="particles-canvas"
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};
