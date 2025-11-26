export interface DayLog {
  completed: boolean;
  weight?: number;
  note?: string;
  date?: string;
}

// Map of "phaseIndex-dayIndex" to DayLog
export type UserLogs = Record<string, DayLog>;

export interface PhaseConfig {
  id: number;
  name: string;
  days: number;
  color: string;
  description: string;
  tips?: string[];
}

export interface WeightDataPoint {
  day: string;
  weight: number;
  phase: number;
  date?: string;
  phaseName?: string;
  dayLabel?: string;
  note?: string;
}