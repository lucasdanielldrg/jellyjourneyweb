import React from 'react';
import { motion } from 'framer-motion';

interface JellyMojiProps {
  mood?: 'happy' | 'excited' | 'chill';
  size?: number;
  onClick?: () => void;
}

const JellyMoji: React.FC<JellyMojiProps> = ({ mood = 'happy', size = 120, onClick }) => {
  
  const variants = {
    happy: {
      scale: [1, 1.05, 0.95, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    excited: {
      y: [0, -20, 0],
      scale: [1, 1.2, 0.9, 1],
      transition: { duration: 0.5, repeat: Infinity, repeatType: "mirror" as const }
    },
    chill: {
      scale: [1, 1.02, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const eyesVariants = {
    happy: { scaleY: 1 },
    excited: { scaleY: [1, 0.2, 1], transition: { duration: 2, repeat: Infinity } }, // blinking
    chill: { scaleY: 0.5 }
  };

  return (
    <div className="relative cursor-pointer select-none" style={{ width: size, height: size }} onClick={onClick}>
      <motion.svg
        viewBox="0 0 200 200"
        animate={mood}
        variants={variants}
        className="w-full h-full drop-shadow-xl"
      >
        {/* Body Gradient */}
        <defs>
          <linearGradient id="jellyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
        </defs>

        {/* Jelly Body */}
        <path
          d="M30,150 Q20,100 50,50 Q100,10 150,50 Q180,100 170,150 Q160,190 100,190 Q40,190 30,150 Z"
          fill="url(#jellyGradient)"
          className="opacity-90"
        />
        
        {/* Highlight/Shine */}
        <path
          d="M60,60 Q80,40 120,55"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          className="opacity-40"
        />

        {/* Face */}
        <motion.g transform="translate(0, 10)">
          {/* Eyes */}
          <motion.ellipse cx="70" cy="110" rx="8" ry="12" fill="white" variants={eyesVariants} />
          <motion.ellipse cx="130" cy="110" rx="8" ry="12" fill="white" variants={eyesVariants} />
          <circle cx="70" cy="110" r="4" fill="#333" />
          <circle cx="130" cy="110" r="4" fill="#333" />

          {/* Mouth */}
          {mood === 'excited' ? (
             <path d="M85,140 Q100,160 115,140 Z" fill="#701a2b" />
          ) : (
             <path d="M85,140 Q100,150 115,140" fill="none" stroke="#701a2b" strokeWidth="3" strokeLinecap="round" />
          )}
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default JellyMoji;
