import { PhaseConfig } from './types';

export const PHASES: PhaseConfig[] = [
  {
    id: 1,
    name: "Detox Phase",
    days: 21,
    color: "bg-rose-500",
    description: "The initial 21-day reboot. Focus on consistency and breaking old habits.",
    tips: [
      "Consume the gelatin recipe every night 2 hours before bed.",
      "Strictly avoid sugar and alcohol during these 21 days.",
      "Drink at least 2.5 liters of water daily.",
      "Focus on getting 7-8 hours of quality sleep.",
      "If you miss a day, don't worry! Just get back on track immediately."
    ]
  },
  {
    id: 2,
    name: "Adaptation Phase",
    days: 30,
    color: "bg-purple-500",
    description: "Solidifying the routine. Your body is adapting to the new gelatin protocol.",
    tips: [
      "Continue the nightly gelatin routine.",
      "You can start introducing light exercise if you haven't already.",
      "Pay attention to how your body reacts to different foods.",
      "Consistency is key—this is where habits are formed.",
      "Track your weight weekly rather than daily if it causes stress."
    ]
  },
  {
    id: 3,
    name: "Lifestyle Phase",
    days: 65,
    color: "bg-indigo-500",
    description: "The long haul. Turning this into a permanent lifestyle change.",
    tips: [
      "Follow the 80/20 rule: 80% disciplined, 20% flexible.",
      "Use the gelatin recipe for recovery after workouts.",
      "Focus on non-scale victories like energy levels and skin health.",
      "Share your journey to inspire others.",
      "This is your new normal—maintain it with joy!"
    ]
  }
];

export const TOTAL_DAYS = PHASES.reduce((acc, phase) => acc + phase.days, 0);