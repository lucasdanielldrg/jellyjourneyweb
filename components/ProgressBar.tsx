import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass = "bg-rose-500" }) => {
  return (
    <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
      <motion.div
        className={`h-full ${colorClass} relative`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Bubbles effect overlay */}
        <div className="absolute inset-0 w-full h-full opacity-30">
           <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
           <div className="absolute bottom-2 right-10 w-3 h-3 bg-white rounded-full opacity-50"></div>
           <div className="absolute top-3 right-4 w-1 h-1 bg-white rounded-full"></div>
        </div>
        
        {/* Liquid Shine */}
        <div className="absolute top-1 left-2 right-2 h-2 bg-white rounded-full opacity-20"></div>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 drop-shadow-sm">
        {Math.round(progress)}% Completed
      </div>
    </div>
  );
};

export default ProgressBar;
