import React, { useState, useEffect, useMemo } from 'react';
import { PHASES, TOTAL_DAYS } from './constants';
import { UserLogs, DayLog, WeightDataPoint } from './types';
import JellyMoji from './components/JellyMoji';
import ProgressBar from './components/ProgressBar';
import WeightChart from './components/WeightChart';
import CelebrationOverlay from './components/CelebrationOverlay';
import { getJellyMotivation } from './services/geminiService';
import { playBubbleSound, playCompletionSound, playMilestoneSound } from './services/audioService';
import { Check, Lock, ChevronRight, Scale, Info, Share2, Sparkles, Target, Settings, Trash2, AlertTriangle, X, FileText, StickyNote, Lightbulb, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activePhaseId, setActivePhaseId] = useState<number>(1);
  const [logs, setLogs] = useState<UserLogs>({});
  const [motivation, setMotivation] = useState<string>("Click me for motivation!");
  const [isMotivating, setIsMotivating] = useState(false);
  const [showModal, setShowModal] = useState<{phaseId: number, day: number} | null>(null);
  const [weightInput, setWeightInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  
  // Settings & Reset State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Phase Info Modal State
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Goal Weight State
  const [goalWeight, setGoalWeight] = useState<number | undefined>(undefined);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Celebration State
  const [celebration, setCelebration] = useState<{title: string, message: string} | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('jellyLogs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
    const savedGoal = localStorage.getItem('jellyGoal');
    if (savedGoal) {
      setGoalWeight(parseFloat(savedGoal));
    }
  }, []);

  // Save to local storage whenever logs change
  useEffect(() => {
    localStorage.setItem('jellyLogs', JSON.stringify(logs));
  }, [logs]);

  // Save goal to local storage
  useEffect(() => {
    if (goalWeight !== undefined) {
      localStorage.setItem('jellyGoal', goalWeight.toString());
    } else {
      localStorage.removeItem('jellyGoal');
    }
  }, [goalWeight]);

  const activePhase = PHASES.find(p => p.id === activePhaseId) || PHASES[0];

  const totalCompleted = useMemo(() => {
    return (Object.values(logs) as DayLog[]).filter(l => l.completed).length;
  }, [logs]);

  const globalProgress = (totalCompleted / TOTAL_DAYS) * 100;
  const isJourneyComplete = totalCompleted === TOTAL_DAYS;

  const chartData: WeightDataPoint[] = useMemo(() => {
    const data: WeightDataPoint[] = [];
    // Iterate through phases to keep chronological order
    PHASES.forEach(phase => {
      for (let d = 1; d <= phase.days; d++) {
        const key = `${phase.id}-${d}`;
        if (logs[key] && logs[key].weight) {
          data.push({
            phase: phase.id,
            day: `P${phase.id}:D${d}`,
            weight: logs[key].weight!,
            date: logs[key].date,
            phaseName: phase.name,
            dayLabel: `Day ${d}`,
            note: logs[key].note
          });
        }
      }
    });
    return data;
  }, [logs]);

  // Helper to check for celebrations based on state change
  const checkCelebration = (prevLogs: UserLogs, newLogs: UserLogs, currentPhaseId: number) => {
    
    // 1. Check if Current Phase is NOW complete (and wasn't before)
    const phaseConfig = PHASES.find(p => p.id === currentPhaseId);
    if (phaseConfig) {
      const wasComplete = Array.from({ length: phaseConfig.days }).every((_, i) => prevLogs[`${currentPhaseId}-${i + 1}`]?.completed);
      const isComplete = Array.from({ length: phaseConfig.days }).every((_, i) => newLogs[`${currentPhaseId}-${i + 1}`]?.completed);
      
      if (!wasComplete && isComplete) {
        setCelebration({
          title: `${phaseConfig.name} Complete!`,
          message: "You smashed this phase! Nothing can stop you now!"
        });
        playMilestoneSound();
        return;
      }
    }

    // 2. Check Global Milestones (50% and 100%)
    const prevTotal = (Object.values(prevLogs) as DayLog[]).filter(l => l.completed).length;
    const newTotal = (Object.values(newLogs) as DayLog[]).filter(l => l.completed).length;

    // 50% Milestone
    const halfWay = Math.ceil(TOTAL_DAYS / 2);
    if (prevTotal < halfWay && newTotal >= halfWay) {
      setCelebration({
        title: "Halfway There!",
        message: "You've reached the top of the mountain! It's all downhill from here!"
      });
      playMilestoneSound();
      return;
    }

    // 100% Milestone
    if (prevTotal < TOTAL_DAYS && newTotal >= TOTAL_DAYS) {
      setCelebration({
        title: "JOURNEY COMPLETE!",
        message: "You are an absolute LEGEND! The gelatin serves you now!"
      });
      playMilestoneSound();
      return;
    }

    // Standard completion sound if no celebration
    if (newTotal > prevTotal) {
      playCompletionSound();
    }
  };

  const handleDayClick = (phaseId: number, day: number) => {
    const key = `${phaseId}-${day}`;
    // Initialize input with existing weight/note if available
    setWeightInput(logs[key]?.weight?.toString() || '');
    setNoteInput(logs[key]?.note || '');
    setShowModal({ phaseId, day });
  };

  const handleSaveDay = () => {
    if (!showModal) return;
    const { phaseId, day } = showModal;
    const key = `${phaseId}-${day}`;
    
    const newLogEntry: DayLog = {
      completed: true, // Marking as done implicitly when saving
      weight: weightInput ? parseFloat(weightInput) : undefined,
      note: noteInput.trim() || undefined,
      date: new Date().toISOString()
    };

    const newLogs = {
      ...logs,
      [key]: { ...logs[key], ...newLogEntry }
    };

    // Check for celebration before updating state
    checkCelebration(logs, newLogs, phaseId);
    
    setLogs(newLogs);
    setShowModal(null);
  };

  const toggleCompletion = (phaseId: number, day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${phaseId}-${day}`;
    
    const isCompleted = logs[key]?.completed;
    const newCompleted = !isCompleted;
    
    const newLogs = {
      ...logs,
      [key]: {
        ...logs[key],
        completed: newCompleted
      }
    };

    if (newCompleted) {
      checkCelebration(logs, newLogs, phaseId);
    } 

    setLogs(newLogs);
  };

  const fetchMotivation = async () => {
    playBubbleSound();
    setIsMotivating(true);
    const msg = await getJellyMotivation(activePhase.name, totalCompleted);
    setMotivation(msg);
    setIsMotivating(false);
  };

  const handleGoalSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    const val = parseFloat((e.currentTarget as HTMLInputElement).value);
    if (!isNaN(val) && val > 0) {
      setGoalWeight(val);
      playCompletionSound();
    }
    setIsEditingGoal(false);
  };

  const handleResetData = () => {
    localStorage.removeItem('jellyLogs');
    localStorage.removeItem('jellyGoal');
    setLogs({});
    setGoalWeight(undefined);
    setActivePhaseId(1);
    setShowResetConfirm(false);
    setShowSettingsModal(false);
    playBubbleSound(); // Subtle confirmation sound
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isJourneyComplete ? 'from-amber-50 to-yellow-50' : 'from-rose-50 to-orange-50'} text-gray-800 pb-20 transition-colors duration-1000`}>
      
      {/* Celebration Overlay */}
      <AnimatePresence>
        {celebration && (
          <CelebrationOverlay 
            title={celebration.title} 
            message={celebration.message} 
            onClose={() => setCelebration(null)} 
          />
        )}
      </AnimatePresence>

      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob ${isJourneyComplete ? 'bg-yellow-300' : 'bg-purple-200'} transition-colors duration-1000`}></div>
        <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 ${isJourneyComplete ? 'bg-orange-300' : 'bg-yellow-200'} transition-colors duration-1000`}></div>
        <div className={`absolute bottom-[-10%] left-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 ${isJourneyComplete ? 'bg-red-300' : 'bg-pink-200'} transition-colors duration-1000`}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6">
        
        {/* Settings Button */}
        <div className="absolute top-6 left-4 z-30">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-white/50 hover:bg-white/80 rounded-full text-gray-500 hover:text-rose-500 transition-colors backdrop-blur-sm shadow-sm"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Header Section */}
        <header className="flex flex-col items-center mb-8">
          <div className="relative">
             <JellyMoji mood={isMotivating ? 'excited' : (isJourneyComplete ? 'excited' : 'happy')} onClick={fetchMotivation} />
             {/* Speech Bubble */}
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={motivation}
               className="absolute top-0 right-[-100px] w-40 bg-white p-3 rounded-2xl rounded-bl-none shadow-lg text-sm text-gray-600 border border-rose-100 z-20"
             >
               {motivation}
             </motion.div>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mt-4 tracking-tight drop-shadow-sm">
            JellyJourney
          </h1>
          <p className="text-rose-400 font-medium text-sm mt-1">Wobble your way to fit!</p>
        </header>

        {/* Global Stats */}
        <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-sm border ${isJourneyComplete ? 'border-yellow-200 shadow-yellow-100' : 'border-white'} mb-8 transition-colors duration-500`}>
           <div className="flex justify-between items-end mb-2">
             <span className={`${isJourneyComplete ? "text-yellow-600 font-bold" : "text-gray-500 font-semibold"} text-xs uppercase tracking-wider transition-colors`}>
                {isJourneyComplete ? "👑 Protocol Completed!" : "Total Progress"}
             </span>
             <span className={`${isJourneyComplete ? "text-yellow-600" : "text-rose-600"} font-bold text-lg`}>
               {totalCompleted} <span className="text-gray-400 text-sm">/ {TOTAL_DAYS} Days</span>
             </span>
           </div>
           <ProgressBar 
              progress={globalProgress} 
              colorClass={isJourneyComplete ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.6)]" : "bg-rose-500"} 
           />
           {isJourneyComplete && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               className="overflow-hidden"
             >
                <p className="text-center text-yellow-700 font-bold text-sm mt-3 flex justify-center items-center gap-2">
                  <Trophy size={16} />
                  <span>Congratulations! You are unstoppable!</span>
                  <Trophy size={16} />
                </p>
             </motion.div>
           )}
        </div>

        {/* Phase Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {PHASES.map(phase => {
            const isActive = activePhaseId === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhaseId(phase.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                  isActive 
                    ? `${phase.color} text-white shadow-md scale-105` 
                    : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                Step {phase.id}: {phase.days} Days
              </button>
            );
          })}
        </div>

        {/* Phase Content */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activePhaseId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-rose-50 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className={`text-2xl font-bold ${activePhase.color.replace('bg-', 'text-')}`}>
                    {activePhase.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">{activePhase.description}</p>
                </div>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className={`p-2 rounded-full ${activePhase.color} bg-opacity-10 hover:bg-opacity-20 transition-colors`}
                >
                   <Info size={20} className={activePhase.color.replace('bg-', 'text-')} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-3 mt-6">
                {Array.from({ length: activePhase.days }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const key = `${activePhase.id}-${dayNum}`;
                  const log = logs[key];
                  const isCompleted = log?.completed;
                  const hasWeight = log?.weight !== undefined;
                  const hasNote = log?.note && log.note.trim().length > 0;

                  return (
                    <motion.div
                      key={dayNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDayClick(activePhase.id, dayNum)}
                      className={`
                        relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 transition-all
                        ${isCompleted 
                          ? `border-${activePhase.color.replace('bg-', '')} bg-opacity-10 bg-${activePhase.color.replace('bg-', '')}` 
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        }
                      `}
                    >
                      <span className={`text-sm font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                        {dayNum}
                      </span>
                      
                      {/* Indicators Container */}
                      <div className="absolute bottom-2 flex gap-1 items-center justify-center">
                        {/* Note Indicator */}
                        {hasNote && (
                           <div className="w-2 h-2 text-rose-400">
                             <StickyNote size={8} fill="currentColor" />
                           </div>
                        )}
                        {/* Weight Dot Indicator */}
                        {hasWeight && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        )}
                      </div>

                      {/* Check Overlay */}
                      <button
                        onClick={(e) => toggleCompletion(activePhase.id, dayNum, e)}
                        className={`
                          absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm transition-colors
                          ${isCompleted ? activePhase.color : 'bg-gray-200 hover:bg-gray-300'}
                        `}
                      >
                         <Check size={12} strokeWidth={4} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Charts Section */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-lg font-bold text-gray-700">Weight Evolution</h3>
            <div className="flex items-center">
              {isEditingGoal ? (
                 <div className="flex items-center bg-white rounded-lg shadow-sm border border-rose-200 p-1">
                   <input 
                     type="number" 
                     className="w-20 text-sm outline-none px-2 font-bold text-lime-600 bg-transparent"
                     placeholder="Goal..."
                     autoFocus
                     defaultValue={goalWeight}
                     onBlur={handleGoalSubmit}
                     onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit(e as any)}
                   />
                 </div>
              ) : (
                 <button 
                   onClick={() => setIsEditingGoal(true)}
                   className="flex items-center text-xs font-bold text-lime-600 hover:text-lime-700 bg-lime-50 hover:bg-lime-100 px-3 py-1.5 rounded-lg transition-colors border border-lime-200"
                 >
                   <Target size={14} className="mr-1.5" />
                   {goalWeight ? `Goal: ${goalWeight}` : 'Set Goal'}
                 </button>
              )}
            </div>
          </div>
          <WeightChart data={chartData} goalWeight={goalWeight} />
        </div>

      </div>

      {/* Day Interaction Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
               onClick={() => setShowModal(null)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden"
             >
               {/* Decoration */}
               <div className={`absolute top-0 left-0 right-0 h-24 ${PHASES[showModal.phaseId - 1].color} opacity-10`}></div>
               
               <div className="relative z-10">
                 <h3 className="text-xl font-bold text-gray-800 mb-1">Day {showModal.day}</h3>
                 <p className="text-sm text-gray-500 mb-6">{PHASES[showModal.phaseId - 1].name}</p>

                 <div className="space-y-4">
                   {/* Weight Input */}
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Log Weight (kg/lbs)</label>
                     <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border focus-within:border-rose-400 transition-colors">
                       <Scale size={20} className="text-gray-400 mr-3" />
                       <input 
                         type="number" 
                         value={weightInput}
                         onChange={(e) => setWeightInput(e.target.value)}
                         placeholder="e.g. 70.5"
                         className="bg-transparent w-full outline-none font-bold text-lg text-gray-700 placeholder-gray-300"
                       />
                     </div>
                   </div>

                   {/* Note Input */}
                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Daily Note</label>
                      <div className="relative">
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="How did you feel today? Any cravings?"
                          className="w-full bg-gray-50 rounded-xl px-4 py-3 border focus-within:border-rose-400 transition-colors outline-none text-sm text-gray-700 placeholder-gray-300 min-h-[80px] resize-none"
                        />
                        <FileText className="absolute top-3 right-3 text-gray-300" size={16} />
                      </div>
                   </div>

                   <button 
                     onClick={handleSaveDay}
                     className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-rose-200 active:scale-95 transition-transform ${PHASES[showModal.phaseId - 1].color}`}
                   >
                     Complete Day & Save
                   </button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowSettingsModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Settings className="mr-2 text-gray-400" size={20}/> Settings
                </h3>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* About Section */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-600 mb-2">About JellyJourney</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Track your gelatin protocol progress across 3 distinct phases. Stay consistent, log your weight, and let Jelly keep you motivated!
                  </p>
                </div>

                {/* Danger Zone */}
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h4>
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center justify-center p-4 rounded-xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} className="mr-2" />
                    Reset All Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowResetConfirm(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl z-20 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This will delete all your logs, weight history, and settings. This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetData}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Phase Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowInfoModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden z-10"
            >
              {/* Colored Header Background */}
              <div className={`absolute top-0 left-0 w-full h-24 ${activePhase.color} opacity-10 z-0`}></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${activePhase.color} text-white shadow-lg`}>
                    <Lightbulb size={24} />
                  </div>
                  <button 
                    onClick={() => setShowInfoModal(false)}
                    className="p-1.5 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <h3 className="text-2xl font-black text-gray-800 mb-2">{activePhase.name}</h3>
                <p className="text-sm text-gray-500 mb-6 border-l-4 border-gray-200 pl-3">
                  {activePhase.description}
                </p>

                <div className="space-y-3">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Guidelines</h4>
                   {activePhase.tips?.map((tip, idx) => (
                     <motion.div 
                       key={idx}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="flex items-start"
                     >
                       <span className={`min-w-[6px] h-1.5 rounded-full mt-2 mr-3 ${activePhase.color}`}></span>
                       <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                     </motion.div>
                   ))}
                </div>

                <button 
                   onClick={() => setShowInfoModal(false)}
                   className="w-full mt-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;