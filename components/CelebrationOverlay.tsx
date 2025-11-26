import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CelebrationOverlayProps {
  title: string;
  message: string;
  onClose: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ title, message, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#f43f5e', '#fb7185', '#e11d48', '#fecdd3', '#fda4af', '#fbbf24', '#a3e635'];

    // Create explosion of particles
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 20, // Velocity X
        vy: (Math.random() - 0.5) * 20, // Velocity Y
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.2,
        drag: 0.95,
        life: 1.0,
        decay: Math.random() * 0.01 + 0.005
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        if (p.life <= 0) return;
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.life -= p.decay;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Random shapes: circle or square
        if (Math.random() > 0.5) {
             ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        } else {
             ctx.rect(p.x, p.y, p.size, p.size);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (particles.some(p => p.life > 0)) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // Auto close after 4.5 seconds
    const timer = setTimeout(onClose, 4500);

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      {/* Backdrop */}
      <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }}
         className="absolute inset-0 bg-white/30 backdrop-blur-sm"
         onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10, y: 50 }}
        animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl border-4 border-rose-200 text-center max-w-sm mx-4 overflow-hidden"
      >
         {/* Shiny effect */}
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-50 -translate-x-full animate-[shimmer_2s_infinite]"></div>

         <motion.div 
           animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} 
           transition={{ repeat: Infinity, duration: 2 }}
           className="text-7xl mb-6 filter drop-shadow-md"
         >
           🎉
         </motion.div>
         <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-3">{title}</h2>
         <p className="text-gray-600 font-bold text-lg leading-tight">{message}</p>
         
         <button 
           onClick={onClose}
           className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-full font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors"
         >
           Woohoo!
         </button>
      </motion.div>
    </div>
  );
};

export default CelebrationOverlay;