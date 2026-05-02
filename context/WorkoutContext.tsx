import React, { createContext, useContext, useState } from "react";

export interface WorkoutSession {
  id: string;
  date: string;
  totalDuration: number;
  warmupTime: number;
  moderatePace: number;
  fastBurst: number;
  cycles: number;
  warmupBPM?: number;
  moderateBPM?: number;
  fastBPM?: number;
  voiceVolume?: number;
  voiceSelection?: string;
}

type WorkoutContextType = {
  // Timing
  warmUp: number;
  moderatePace: number;
  fastBurst: number;
  coolDown: number;
  cycles: number;
  setWarmUp: (val: number) => void;
  setModeratePace: (val: number) => void;
  setFastBurst: (val: number) => void;
  setCoolDown: (val: number) => void;
  setCycles: (val: number) => void;
  getTotalTime: () => number;

  // Settings
  warmupBPM: number;
  setWarmupBPM: (val: number) => void;
  moderateBPM: number;
  setModerateBPM: (val: number) => void;
  fastBPM: number;
  setFastBPM: (val: number) => void;
  voiceVolume: number;
  setVoiceVolume: (val: number) => void;
  voiceSelection: "Aria" | "Marcus" | "Nova";
  setVoiceSelection: (val: "Aria" | "Marcus" | "Nova") => void;
  hapticFeedback: "Off" | "Low" | "High";
  setHapticFeedback: (val: "Off" | "Low" | "High") => void;
  units: "Metric (km)" | "Imperial (mi)";
  setUnits: (val: "Metric (km)" | "Imperial (mi)") => void;
  theme: "Kinetic Dark" | "Onyx Black" | "Pro Grey";
  setTheme: (val: "Kinetic Dark" | "Onyx Black" | "Pro Grey") => void;
  musicTheme: "Military Drill" | "Neon Circuit" | "Acoustic Trail";
  setMusicTheme: (
    val: "Military Drill" | "Neon Circuit" | "Acoustic Trail",
  ) => void;
  autoSave: boolean;
  setAutoSave: (val: boolean) => void;

  // Music Player State
  musicIsPlaying: boolean;
  setMusicIsPlaying: (val: boolean) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (val: number | ((prev: number) => number)) => void;
  musicCurrentTime: number;
  setMusicCurrentTime: (val: number) => void;
  musicDuration: number;
  setMusicDuration: (val: number) => void;

  // Background Audio (Keep Alive)
  isWorkoutActive: boolean;
  setIsWorkoutActive: (val: boolean) => void;

  // History
  history: WorkoutSession[];
  addSession: (session: Omit<WorkoutSession, "id" | "date">) => void;
  clearHistory: () => void;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [warmUp, setWarmUp] = useState(0.5);
  const [moderatePace, setModeratePace] = useState(1);
  const [fastBurst, setFastBurst] = useState(1);
  const [coolDown, setCoolDown] = useState(0.5);
  const [cycles, setCycles] = useState(6);

  const [warmupBPM, setWarmupBPM] = useState(80);
  const [moderateBPM, setModerateBPM] = useState(110);
  const [fastBPM, setFastBPM] = useState(125);

  const [voiceVolume, setVoiceVolume] = useState(80);
  const [voiceSelection, setVoiceSelection] = useState<
    "Aria" | "Marcus" | "Nova"
  >("Aria");
  const [hapticFeedback, setHapticFeedback] = useState<"Off" | "Low" | "High">(
    "High",
  );
  const [units, setUnits] = useState<"Metric (km)" | "Imperial (mi)">(
    "Metric (km)",
  );
  const [theme, setTheme] = useState<
    "Kinetic Dark" | "Onyx Black" | "Pro Grey"
  >("Kinetic Dark");
  const [musicTheme, setMusicTheme] = useState<
    "Military Drill" | "Neon Circuit" | "Acoustic Trail"
  >("Military Drill");
  const [autoSave, setAutoSave] = useState(true);

  // Music Player State
  const [musicIsPlaying, setMusicIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);

  // Background Audio (Keep Alive)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  const [history, setHistory] = useState<WorkoutSession[]>([]);

  const getTotalTime = () => {
    return warmUp + (moderatePace + fastBurst) * cycles + coolDown;
  };

  const addSession = (sessionData: Omit<WorkoutSession, "id" | "date">) => {
    const newSession: WorkoutSession = {
      ...sessionData,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    setHistory((prev) => [newSession, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <WorkoutContext.Provider
      value={{
        warmUp,
        moderatePace,
        fastBurst,
        coolDown,
        cycles,
        setWarmUp,
        setModeratePace,
        setFastBurst,
        setCoolDown,
        setCycles,
        getTotalTime,
        warmupBPM,
        setWarmupBPM,
        moderateBPM,
        setModerateBPM,
        fastBPM,
        setFastBPM,
        voiceVolume,
        setVoiceVolume,
        voiceSelection,
        setVoiceSelection,
        hapticFeedback,
        setHapticFeedback,
        units,
        setUnits,
        theme,
        setTheme,
        musicTheme,
        setMusicTheme,
        autoSave,
        setAutoSave,
        musicIsPlaying,
        setMusicIsPlaying,
        currentTrackIndex,
        setCurrentTrackIndex,
        musicCurrentTime,
        setMusicCurrentTime,
        musicDuration,
        setMusicDuration,
        isWorkoutActive,
        setIsWorkoutActive,
        history,
        addSession,
        clearHistory,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
