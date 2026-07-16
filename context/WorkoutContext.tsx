import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import * as Speech from "expo-speech";
import * as Location from "expo-location";

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
  steps?: number;
  calories?: number;
  distanceKm?: number;
}

export interface Phase {
  type: "warmup" | "moderate" | "fast" | "cooldown";
  name: string;
  duration: number; // in seconds
  cycle?: number;
  color: string;
}

type WorkoutContextType = {
  // Timing / Planner
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

  // User Profile
  avatarUri: string | null;
  setAvatarUri: (val: string | null) => void;

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

  // Live Workout Session State (Integrated from screenshot dashboard)
  workoutIsRunning: boolean;
  workoutElapsedTime: number;
  workoutSteps: number;
  workoutCalories: number;
  workoutSessionMode: boolean;
  workoutCurrentPhaseIndex: number;
  workoutTimeLeft: number;
  workoutSplits: { id: string; name: string; pace: string; type: "up" | "bolt" }[];
  workoutPhases: Phase[];
  
  // Real GPS Distance & Fallback properties
  gpsSignalQuality: "good" | "poor" | "missing";
  workoutDistance: number;
  distanceConfidence: "GPS-strong" | "Estimated";
  workoutRoute: { latitude: number; longitude: number }[];

  // Controls
  startWorkoutSession: () => void;
  pauseWorkoutSession: () => void;
  resumeWorkoutSession: () => void;
  stopWorkoutSession: () => void;
  toggleWorkoutSessionMode: () => void;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Helper function to calculate Haversine distance in km
const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  // Planner State
  const [warmUp, setWarmUp] = useState(0.5);
  const [moderatePace, setModeratePace] = useState(1);
  const [fastBurst, setFastBurst] = useState(1);
  const [coolDown, setCoolDown] = useState(0.5);
  const [cycles, setCycles] = useState(6);

  // Settings State
  const [warmupBPM, setWarmupBPM] = useState(80);
  const [moderateBPM, setModerateBPM] = useState(110);
  const [fastBPM, setFastBPM] = useState(125);
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [voiceSelection, setVoiceSelection] = useState<"Aria" | "Marcus" | "Nova">("Aria");
  const [hapticFeedback, setHapticFeedback] = useState<"Off" | "Low" | "High">("High");
  const [units, setUnits] = useState<"Metric (km)" | "Imperial (mi)">("Imperial (mi)"); // Default to imperial to match screenshot (MI)
  const [theme, setTheme] = useState<"Kinetic Dark" | "Onyx Black" | "Pro Grey">("Kinetic Dark");
  const [musicTheme, setMusicTheme] = useState<"Military Drill" | "Neon Circuit" | "Acoustic Trail">("Military Drill");
  const [autoSave, setAutoSave] = useState(true);

  // User Profile
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Music Player State
  const [musicIsPlaying, setMusicIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);

  // Background Audio (Keep Alive)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  // History State
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  // --- Live Session Dashboard State ---
  const [workoutIsRunning, setWorkoutIsRunning] = useState(false);
  const [workoutElapsedTime, setWorkoutElapsedTime] = useState(0);
  const [workoutSteps, setWorkoutSteps] = useState(0);
  const [workoutCalories, setWorkoutCalories] = useState(0);
  const [workoutSessionMode, setWorkoutSessionMode] = useState(true);
  const [workoutCurrentPhaseIndex, setWorkoutCurrentPhaseIndex] = useState(0);
  const [workoutTimeLeft, setWorkoutTimeLeft] = useState(0);
  const [workoutSplits, setWorkoutSplits] = useState<{ id: string; name: string; pace: string; type: "up" | "bolt" }[]>([]);

  // --- Hybrid Distance State (Real GPS & Fallbacks) ---
  const [gpsSignalQuality, setGpsSignalQuality] = useState<"good" | "poor" | "missing">("missing"); // Default to missing until active tracking begins
  const [workoutDistance, setWorkoutDistance] = useState(0); // in kilometers
  const [distanceConfidence, setDistanceConfidence] = useState<"GPS-strong" | "Estimated">("Estimated");
  const [workoutRoute, setWorkoutRoute] = useState<{ latitude: number; longitude: number }[]>([]);

  const workoutIsRunningRef = useRef(workoutIsRunning);
  const workoutElapsedTimeRef = useRef(workoutElapsedTime);
  const workoutStepsRef = useRef(workoutSteps);
  const workoutCaloriesRef = useRef(workoutCalories);
  const workoutCurrentPhaseIndexRef = useRef(workoutCurrentPhaseIndex);
  const workoutTimeLeftRef = useRef(workoutTimeLeft);
  const workoutSessionModeRef = useRef(workoutSessionMode);
  
  // GPS position tracking refs
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  const workoutDistanceRef = useRef(workoutDistance);
  const distanceConfidenceRef = useRef(distanceConfidence);
  const workoutRouteRef = useRef(workoutRoute);
  const gpsDistanceUpdatedRef = useRef(false);

  const lastAnnouncedTime = useRef<number | null>(null);
  const lastSplitTime = useRef<number>(0);

  // Sync refs
  useEffect(() => { workoutIsRunningRef.current = workoutIsRunning; }, [workoutIsRunning]);
  useEffect(() => { workoutElapsedTimeRef.current = workoutElapsedTime; }, [workoutElapsedTime]);
  useEffect(() => { workoutStepsRef.current = workoutSteps; }, [workoutSteps]);
  useEffect(() => { workoutCaloriesRef.current = workoutCalories; }, [workoutCalories]);
  useEffect(() => { workoutCurrentPhaseIndexRef.current = workoutCurrentPhaseIndex; }, [workoutCurrentPhaseIndex]);
  useEffect(() => { workoutTimeLeftRef.current = workoutTimeLeft; }, [workoutTimeLeft]);
  useEffect(() => { workoutSessionModeRef.current = workoutSessionMode; }, [workoutSessionMode]);
  useEffect(() => { workoutDistanceRef.current = workoutDistance; }, [workoutDistance]);
  useEffect(() => { distanceConfidenceRef.current = distanceConfidence; }, [distanceConfidence]);
  useEffect(() => { workoutRouteRef.current = workoutRoute; }, [workoutRoute]);

  // Compute workout phases dynamically
  const workoutPhases = useMemo<Phase[]>(() => {
    const p: Phase[] = [];
    if (warmUp > 0) {
      p.push({
        type: "warmup",
        name: "Warm Up",
        duration: warmUp * 60,
        color: "#ababad",
      });
    }
    for (let i = 1; i <= cycles; i++) {
      if (moderatePace > 0) {
        p.push({
          type: "moderate",
          name: "Moderate Pace",
          duration: moderatePace * 60,
          cycle: i,
          color: "#daf900",
        });
      }
      if (fastBurst > 0) {
        p.push({
          type: "fast",
          name: "Fast Burst",
          duration: fastBurst * 60,
          cycle: i,
          color: "#f6ffc0",
        });
      }
    }
    if (coolDown > 0) {
      p.push({
        type: "cooldown",
        name: "Cool Down",
        duration: coolDown * 60,
        color: "#ababad",
      });
    }
    return p;
  }, [warmUp, moderatePace, fastBurst, coolDown, cycles]);

  const workoutPhasesRef = useRef(workoutPhases);
  useEffect(() => {
    workoutPhasesRef.current = workoutPhases;
  }, [workoutPhases]);

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

  // --- Voice Assistant & Music Control functions ---
  const speak = (text: string) => {
    let pitch = 1;
    let rate = 1.1; // Drill instructor pace
    if (voiceSelection === "Marcus") pitch = 0.8;
    if (voiceSelection === "Nova") pitch = 1.2;
    const volume = voiceVolume / 100;

    Speech.speak(text, {
      pitch,
      rate,
      volume,
      onDone: () => {},
      onError: () => {},
    });
  };

  const announceInterval = (phase: Phase) => {
    let message = "";
    switch (phase.type) {
      case "warmup":
        message = "Attention! Warm up started. Move out!";
        break;
      case "moderate":
        message = `Moderate rhythm! Phase ${phase.cycle || ""}. Maintain the pace!`;
        break;
      case "fast":
        message = `Fast burst! Phase ${phase.cycle || ""}. Maximum effort, soldier!`;
        break;
      case "cooldown":
        message = "Mission accomplished. Start cool down. At ease!";
        break;
    }
    speak(message);
  };

  const announceRemaining = (seconds: number, duration: number) => {
    if (lastAnnouncedTime.current === seconds) return;

    if (seconds === 60) speak("One minute remaining! Hold the line!");
    else if (seconds === 30) speak("Thirty seconds left! Don't quit now!");
    else if (seconds === 10) speak("Final ten seconds! Dig deep! Finish strong!");
    else if (seconds === Math.floor(duration / 2) && duration > 60) speak("Halfway mark! Looking good!");

    lastAnnouncedTime.current = seconds;
  };

  // Sync music track with current phase
  useEffect(() => {
    if (isWorkoutActive && workoutSessionMode) {
      const currentPhase = workoutPhases[workoutCurrentPhaseIndex];
      if (currentPhase) {
        const phaseType = currentPhase.type;
        if (phaseType === "warmup" || phaseType === "cooldown") {
          setCurrentTrackIndex(0);
        } else if (phaseType === "fast") {
          setCurrentTrackIndex(3);
        } else if (phaseType === "moderate") {
          setCurrentTrackIndex(1);
        }
      }
    }
  }, [workoutCurrentPhaseIndex, isWorkoutActive, workoutSessionMode, workoutPhases]);

  // Sync musicIsPlaying state with workoutIsRunning
  useEffect(() => {
    setMusicIsPlaying(isWorkoutActive && workoutIsRunning);
  }, [workoutIsRunning, isWorkoutActive]);

  // --- Actual Location Update Callback Handler ---
  const handleLocationUpdate = (location: Location.LocationObject) => {
    const { latitude, longitude, accuracy, speed } = location.coords;
    const timestamp = location.timestamp;

    // 1. Evaluate accuracy to determine signal status
    let signal: "good" | "poor" | "missing" = "good";
    if (!accuracy || accuracy > 25) {
      signal = "poor";
    }
    setGpsSignalQuality(signal);

    if (signal === "good") {
      const prevPosition = lastPositionRef.current;
      if (prevPosition) {
        const distKm = calculateHaversine(prevPosition.lat, prevPosition.lng, latitude, longitude);
        const timeDiffSec = (timestamp - prevPosition.timestamp) / 1000;

        if (timeDiffSec > 0) {
          const speedMeterPerSecond = (distKm * 1000) / timeDiffSec;
          const isWildJump = speedMeterPerSecond > 25; // Physically impossible speed check (> 90 km/h)

          if (!isWildJump) {
            if (distKm > 0.0001) {
              setWorkoutDistance((prev) => prev + distKm);
              gpsDistanceUpdatedRef.current = true;
            }
            setDistanceConfidence("GPS-strong");
            lastPositionRef.current = { lat: latitude, lng: longitude, timestamp };
            
            // Append point to coordinates trail list
            const newPt = { latitude, longitude };
            setWorkoutRoute((prev) => [...prev, newPt]);
            return;
          }
        }
      } else {
        // Initialize first coordinate
        lastPositionRef.current = { lat: latitude, lng: longitude, timestamp };
        setDistanceConfidence("GPS-strong");
        const newPt = { latitude, longitude };
        setWorkoutRoute([newPt]);
        return;
      }
    }

    // Set fallback flag for the 1-second timer loop if signal quality fails or outlier is rejected
    setDistanceConfidence("Estimated");
  };

  const startLocationTracking = async () => {
    try {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsSignalQuality("missing");
        setDistanceConfidence("Estimated");
        speak("Location permission denied. Running in step-estimation mode.");
        return;
      }

      setGpsSignalQuality("good");
      setDistanceConfidence("GPS-strong");
      lastPositionRef.current = null;

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          handleLocationUpdate(location);
        }
      );
      locationSubscriptionRef.current = sub;
    } catch (e) {
      console.warn("Error starting location tracking:", e);
      setGpsSignalQuality("missing");
      setDistanceConfidence("Estimated");
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    lastPositionRef.current = null;
  };

  // Global Workout Timer Loop
  useEffect(() => {
    if (!isWorkoutActive || !workoutIsRunning) return;

    const interval = setInterval(() => {
      // 1. Increment elapsed time
      const nextElapsed = workoutElapsedTimeRef.current + 1;
      setWorkoutElapsedTime(nextElapsed);

      // 2. Determine cadence and calorie rate based on mode/phase
      let stepsPerMin = 110;
      let caloriesPerMin = 7;
      let currentPhase: Phase | null = null;

      if (workoutSessionModeRef.current && workoutPhasesRef.current.length > 0) {
        currentPhase = workoutPhasesRef.current[workoutCurrentPhaseIndexRef.current];
        if (currentPhase) {
          switch (currentPhase.type) {
            case "warmup":
            case "cooldown":
              stepsPerMin = warmupBPM;
              caloriesPerMin = 5;
              break;
            case "moderate":
              stepsPerMin = moderateBPM;
              caloriesPerMin = 8;
              break;
            case "fast":
              stepsPerMin = fastBPM;
              caloriesPerMin = 12;
              break;
          }
        }
      }

      // Add steps (fractional accumulator)
      const stepsToAdd = stepsPerMin / 60;
      setWorkoutSteps((prev) => prev + stepsToAdd);

      // Add calories (fractional accumulator)
      const calsToAdd = caloriesPerMin / 60;
      setWorkoutCalories((prev) => prev + calsToAdd);

      // --- Fallback & Hybrid distance calculator ---
      // If we did not successfully update GPS distance in the last second
      // (e.g. stationary, indoor, on a simulator, or missing GPS signal),
      // we fall back to step-based distance calculation so the metrics never freeze!
      if (!gpsDistanceUpdatedRef.current || distanceConfidenceRef.current === "Estimated") {
        const stepBasedDistToAddKm = (stepsToAdd * 0.75) / 1000;
        setWorkoutDistance((prev) => prev + stepBasedDistToAddKm);
      }
      
      // Reset GPS update tracker for the next tick
      gpsDistanceUpdatedRef.current = false;

      // 3. Dynamic splits generation (every 60 seconds, mock a split)
      if (nextElapsed - lastSplitTime.current >= 60) {
        lastSplitTime.current = nextElapsed;
        const splitNum = workoutSplits.length + 1;
        const padNum = String(splitNum).padStart(2, "0");
        
        let splitPace = "";
        let splitType: "up" | "bolt" = "up";

        if (currentPhase) {
          if (currentPhase.type === "fast") {
            splitPace = units === "Imperial (mi)" ? "9'42\" /mi" : "6'02\" /km";
            splitType = "bolt";
          } else if (currentPhase.type === "moderate") {
            splitPace = units === "Imperial (mi)" ? "11'58\" /mi" : "7'26\" /km";
            splitType = "bolt";
          } else {
            splitPace = units === "Imperial (mi)" ? "12'42\" /mi" : "7'53\" /km";
            splitType = "up";
          }
        } else {
          splitPace = units === "Imperial (mi)" ? "11'30\" /mi" : "7'08\" /km";
          splitType = "up";
        }

        setWorkoutSplits((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            name: padNum,
            pace: splitPace,
            type: splitType,
          },
        ]);
      }

      // 4. Session Mode phase tracking
      if (workoutSessionModeRef.current && workoutPhasesRef.current.length > 0) {
        const newTimeLeft = workoutTimeLeftRef.current - 1;

        if (newTimeLeft <= 0) {
          const nextIndex = workoutCurrentPhaseIndexRef.current + 1;
          const totalPhases = workoutPhasesRef.current;

          if (nextIndex < totalPhases.length) {
            setWorkoutCurrentPhaseIndex(nextIndex);
            lastAnnouncedTime.current = null;
            announceInterval(totalPhases[nextIndex]);
            setWorkoutTimeLeft(totalPhases[nextIndex].duration);
          } else {
            // Workout finished!
            setIsWorkoutActive(false);
            setWorkoutIsRunning(false);
            stopLocationTracking();
            speak("Workout complete. Incredible effort today.");

            // Calculate final stats
            const finalSteps = Math.round(workoutStepsRef.current + stepsToAdd);
            const finalCalories = Math.round(workoutCaloriesRef.current + calsToAdd);
            const finalDistanceKm = workoutDistanceRef.current;

            addSession({
              totalDuration: nextElapsed,
              warmupTime: warmUp,
              moderatePace,
              fastBurst,
              cycles,
              warmupBPM,
              moderateBPM,
              fastBPM,
              voiceVolume,
              voiceSelection,
              steps: finalSteps,
              calories: finalCalories,
              distanceKm: finalDistanceKm,
            });

            // Clean up
            setWorkoutElapsedTime(0);
            setWorkoutSteps(0);
            setWorkoutCalories(0);
            setWorkoutDistance(0);
            setWorkoutCurrentPhaseIndex(0);
            setWorkoutTimeLeft(0);
            setWorkoutSplits([]);
            setWorkoutRoute([]);
            lastSplitTime.current = 0;
          }
        } else {
          setWorkoutTimeLeft(newTimeLeft);
          if (currentPhase) {
            announceRemaining(newTimeLeft, currentPhase.duration);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isWorkoutActive,
    workoutIsRunning,
    workoutSessionMode,
    warmupBPM,
    moderateBPM,
    fastBPM,
    units,
    workoutSplits.length,
  ]);

  // Session Control Actions
  const startWorkoutSession = () => {
    // Initialize active session metrics to 0
    setWorkoutElapsedTime(0);
    setWorkoutSteps(0);
    setWorkoutCalories(0);
    setWorkoutDistance(0);
    setWorkoutRoute([]);
    setWorkoutSplits([]);
    lastSplitTime.current = 0;
    lastAnnouncedTime.current = null;

    if (workoutSessionMode && workoutPhases.length > 0) {
      setWorkoutCurrentPhaseIndex(0);
      setWorkoutTimeLeft(workoutPhases[0].duration);
      announceInterval(workoutPhases[0]);
    } else {
      setWorkoutCurrentPhaseIndex(0);
      setWorkoutTimeLeft(0);
      speak("Session started. Keep moving!");
    }

    setIsWorkoutActive(true);
    setWorkoutIsRunning(true);
    setCurrentTrackIndex(0);

    // Trigger location tracking subscription
    startLocationTracking();
  };

  const pauseWorkoutSession = () => {
    setWorkoutIsRunning(false);
    stopLocationTracking();
    speak("Session paused.");
  };

  const resumeWorkoutSession = () => {
    setWorkoutIsRunning(true);
    startLocationTracking();
    speak("Resuming session.");
  };

  const stopWorkoutSession = () => {
    // Save workout session to history
    const finalSteps = Math.round(workoutStepsRef.current);
    const finalCalories = Math.round(workoutCaloriesRef.current);
    const finalDistanceKm = workoutDistanceRef.current;

    addSession({
      totalDuration: workoutElapsedTimeRef.current,
      warmupTime: warmUp,
      moderatePace,
      fastBurst,
      cycles,
      warmupBPM,
      moderateBPM,
      fastBPM,
      voiceVolume,
      voiceSelection,
      steps: finalSteps,
      calories: finalCalories,
      distanceKm: finalDistanceKm,
    });

    setIsWorkoutActive(false);
    setWorkoutIsRunning(false);
    stopLocationTracking();

    setWorkoutElapsedTime(0);
    setWorkoutSteps(0);
    setWorkoutCalories(0);
    setWorkoutDistance(0);
    setWorkoutCurrentPhaseIndex(0);
    setWorkoutTimeLeft(0);
    setWorkoutSplits([]);
    setWorkoutRoute([]);
    lastSplitTime.current = 0;

    speak("Workout stopped. Session details saved.");
  };

  const toggleWorkoutSessionMode = () => {
    setWorkoutSessionMode((prev) => {
      const newVal = !prev;
      speak(newVal ? "Dynamic interval tracking enabled." : "Simple duration tracking enabled.");
      return newVal;
    });
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

        // User Profile
        avatarUri,
        setAvatarUri,
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

        // Live Workout Session State
        workoutIsRunning,
        workoutElapsedTime,
        workoutSteps,
        workoutCalories,
        workoutSessionMode,
        workoutCurrentPhaseIndex,
        workoutTimeLeft,
        workoutSplits,
        workoutPhases,
        
        // Real GPS Distance & Fallback properties
        gpsSignalQuality,
        workoutDistance,
        distanceConfidence,
        workoutRoute,

        // Controls
        startWorkoutSession,
        pauseWorkoutSession,
        resumeWorkoutSession,
        stopWorkoutSession,
        toggleWorkoutSessionMode,
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
