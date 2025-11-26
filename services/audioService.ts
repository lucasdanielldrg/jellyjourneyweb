// Web Audio API implementation for procedural sound effects
// No external assets required

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playBubbleSound = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Liquid "bloop" effect: Sine wave sweeping up
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
    
    // Quick volume envelope
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.25);
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};

export const playCompletionSound = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    
    // Pleasant "Ding"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(523.25, t + 0.05); 
    osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.1); // Slide up to C6
    
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};

export const playMilestoneSound = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    
    // Major chord fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const start = t + (i * 0.08);
      const duration = 0.8;
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration + 0.1);
    });
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};
