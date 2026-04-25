import { useWorkout } from "@/context/WorkoutContext";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

type Phase = {
  type: "warmup" | "moderate" | "fast" | "cooldown";
  name: string;
  duration: number; // in seconds
  cycle?: number;
  color: string;
};

export default function LiveSessionScreen() {
  const router = useRouter();
  const {
    warmUp,
    moderatePace,
    fastBurst,
    coolDown,
    cycles,
    warmupBPM,
    setWarmupBPM,
    moderateBPM,
    setModerateBPM,
    fastBPM,
    setFastBPM,
    voiceSelection,
    voiceVolume,
    musicIsPlaying,
    setMusicIsPlaying,
    setCurrentTrackIndex,
    addSession,
  } = useWorkout();

  const phases = useMemo(() => {
    const p: Phase[] = [];
    if (warmUp > 0)
      p.push({
        type: "warmup",
        name: "Warm Up",
        duration: warmUp * 60,
        color: "#ababad",
      });
    for (let i = 1; i <= cycles; i++) {
      if (moderatePace > 0)
        p.push({
          type: "moderate",
          name: "Moderate Pace",
          duration: moderatePace * 60,
          cycle: i,
          color: "#daf900",
        });
      if (fastBurst > 0)
        p.push({
          type: "fast",
          name: "Fast Burst",
          duration: fastBurst * 60,
          cycle: i,
          color: "#f6ffc0",
        });
    }
    if (coolDown > 0)
      p.push({
        type: "cooldown",
        name: "Cool Down",
        duration: coolDown * 60,
        color: "#ababad",
      });
    return p;
  }, [warmUp, moderatePace, fastBurst, coolDown, cycles]);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    phases.length > 0 ? phases[0].duration : 0,
  );
  const [isRunning, setIsRunning] = useState(true);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [voiceStatus, setVoiceStatus] = useState<"ready" | "processing">(
    "ready",
  );

  // Refs for accessing current values in timer callback without causing re-renders
  const currentPhaseIndexRef = useRef(currentPhaseIndex);
  const phasesRef = useRef(phases);

  // Keep refs up to date
  useEffect(() => {
    currentPhaseIndexRef.current = currentPhaseIndex;
  }, [currentPhaseIndex]);

  useEffect(() => {
    phasesRef.current = phases;
  }, [phases]);

  const currentPhase = phases[currentPhaseIndex] || null;
  const isFinished = currentPhaseIndex >= phases.length;

  const lastAnnouncedTime = useRef<number | null>(null);

  // Sync music to workout play/pause
  useEffect(() => {
    setMusicIsPlaying(isRunning);
  }, [isRunning]);

  // Cleanup music and speech on unmount
  useEffect(() => {
    return () => {
      setMusicIsPlaying(false);
      Speech.stop();
    };
  }, []);

  const speak = (text: string) => {
    setVoiceStatus("processing");
    let pitch = 1;
    let rate = 1.1; // Drill instructor pace
    if (voiceSelection === "Marcus") pitch = 0.8;
    if (voiceSelection === "Nova") pitch = 1.2;

    // Scale 0-100 to 0.0-1.0
    const volume = voiceVolume / 100;

    Speech.speak(text, {
      pitch,
      rate,
      volume,
      onDone: () => setVoiceStatus("ready"),
      onError: () => setVoiceStatus("ready"),
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
    else if (seconds === 10)
      speak("Final ten seconds! Dig deep! Finish strong!");
    else if (seconds === Math.floor(duration / 2) && duration > 60)
      speak("Halfway mark! Looking good!");

    lastAnnouncedTime.current = seconds;
  };

  // Initial Announcement
  useEffect(() => {
    if (phases.length > 0 && currentPhaseIndex === 0 && totalElapsed === 0) {
      announceInterval(phases[0]);
      setCurrentTrackIndex(0);
    }
  }, []);

  useEffect(() => {
    if (!isRunning || isFinished) return;

    const interval = setInterval(() => {
      setTotalElapsed((prev) => prev + 1);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = currentPhaseIndexRef.current + 1;
          const currentPhases = phasesRef.current;
          if (nextIndex < currentPhases.length) {
            setCurrentPhaseIndex(nextIndex);
            lastAnnouncedTime.current = null;

            announceInterval(currentPhases[nextIndex]);
            return currentPhases[nextIndex].duration;
          } else {
            setCurrentPhaseIndex(nextIndex);
            // Finished
            speak("Workout complete. Incredible effort today.");
            setTotalElapsed((currentElapsed) => {
              addSession({
                totalDuration: currentElapsed + 1,
                warmupTime: warmUp,
                moderatePace,
                fastBurst,
                cycles,
                warmupBPM,
                moderateBPM,
                fastBPM,
                voiceVolume,
                voiceSelection,
              });
              return currentElapsed + 1;
            });
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isFinished]);

  // Update music track when phase changes (separate from timer to avoid render conflicts)
  useEffect(() => {
    if (currentPhase) {
      const phaseType = currentPhase.type;
      if (phaseType === "warmup" || phaseType === "cooldown")
        setCurrentTrackIndex(0);
      else if (phaseType === "fast") setCurrentTrackIndex(3);
      else if (phaseType === "moderate") setCurrentTrackIndex(1);
    }
  }, [currentPhaseIndex, currentPhase]);

  // Check announcements
  useEffect(() => {
    if (isRunning && currentPhase && timeLeft > 0) {
      announceRemaining(timeLeft, currentPhase.duration);
    }
  }, [timeLeft, isRunning, currentPhase]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const screenWidth = Dimensions.get("window").width;
  const size = screenWidth * 0.7;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = currentPhase ? timeLeft / currentPhase.duration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const currentBPM =
    currentPhase?.type === "warmup" || currentPhase?.type === "cooldown"
      ? warmupBPM
      : currentPhase?.type === "moderate"
        ? moderateBPM
        : fastBPM;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <View className="px-6 py-6 flex-row justify-between items-center w-full z-10">
        <Text className="text-primary font-lexendExtraBold uppercase tracking-widest text-[10px]">
          STRIDE LIVE
        </Text>
        <View className="flex-row items-center gap-4">
          {voiceStatus === "processing" && (
            <View className="bg-primary/20 px-3 py-1 rounded-full flex-row items-center gap-2">
              <MaterialIcons name="volume-up" size={14} color="#f6ffc0" />
              <Text className="text-primary font-lexendBold uppercase text-[10px] tracking-widest">
                Speaking
              </Text>
            </View>
          )}
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-surface-highest items-center justify-center"
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={20} color="#fdfbfe" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {isFinished ? (
          <View className="items-center mt-32">
            <MaterialIcons
              name="check-circle"
              size={80}
              color="#f6ffc0"
              className="mb-4"
            />
            <Text className="text-4xl font-lexendBlack italic text-on-surface mb-2">
              COMPLETE
            </Text>
            <TouchableOpacity
              className="mt-8 px-8 py-4 bg-primary rounded-xl"
              onPress={() => router.back()}
            >
              <Text className="text-on-primary font-lexendBlack uppercase tracking-widest">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center px-6">
            {/* Main Title */}
            <Text className="text-xs font-lexendBlack uppercase tracking-[0.3em] text-on-surface-variant mb-2">
              {currentPhase?.name}
            </Text>
            <Text
              className="text-5xl font-lexendBlack italic uppercase tracking-tighter text-primary mb-1"
              style={{ color: currentPhase?.color || "#f6ffc0" }}
            >
              {currentPhase?.type === "warmup"
                ? "WARM UP"
                : currentPhase?.type === "moderate"
                  ? "MODERATE"
                  : currentPhase?.type === "fast"
                    ? "FAST BURST"
                    : "COOL DOWN"}
            </Text>

            {/* SVG Ring with Timer inside */}
            <View
              className="relative items-center justify-center mb-12 mt-4"
              style={{ width: size, height: size }}
            >
              <Svg width={size} height={size}>
                <Circle
                  stroke="#242629" // surface-highest
                  fill="transparent"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                />
                <Circle
                  stroke={currentPhase?.color || "#f6ffc0"}
                  fill="transparent"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
              </Svg>
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-7xl font-lexendBlack tabular-nums tracking-tighter text-on-surface">
                  {formatTime(timeLeft)}
                </Text>
                <Text className="text-[10px] font-lexendBold uppercase tracking-widest text-on-surface-variant">
                  Remaining
                </Text>
              </View>
            </View>

            {/* Play/Pause Main Control */}
            <TouchableOpacity
              className={`flex-row items-center gap-3 px-8 py-4 rounded-2xl shadow-xl mb-12 ${
                !isRunning
                  ? "bg-primary shadow-primary/20"
                  : "bg-surface-high border border-[#ffffff0d]"
              }`}
              onPress={() => setIsRunning(!isRunning)}
            >
              <MaterialIcons
                name={isRunning ? "pause" : "play-arrow"}
                size={20}
                color={!isRunning ? "#586500" : "#fdfbfe"}
              />
              <Text
                className={`font-lexendBlack italic uppercase tracking-widest text-sm ${
                  !isRunning ? "text-on-primary" : "text-on-surface"
                }`}
              >
                {isRunning ? "Pause Workout" : "Resume Workout"}
              </Text>
            </TouchableOpacity>

            {/* Stats Row */}
            <View className="w-full flex-row justify-between mb-12 px-6">
              <View className="items-center">
                <Text className="text-[10px] font-lexendBold uppercase tracking-widest text-on-surface-variant mb-1">
                  Total Time
                </Text>
                <Text className="text-2xl font-lexendBlack italic text-on-surface">
                  {formatTime(totalElapsed)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-[10px] font-lexendBold uppercase tracking-widest text-on-surface-variant mb-1">
                  Cycle
                </Text>
                <Text className="text-2xl font-lexendBlack italic text-on-surface">
                  {currentPhase?.type === "warmup" ||
                  currentPhase?.type === "cooldown"
                    ? "--"
                    : `${currentPhase?.cycle} / ${cycles}`}
                </Text>
              </View>
            </View>

            {/* Live Cadence Controls */}
            <View className="w-full border-t border-[#ffffff0d] pt-8 mb-8">
              <Text className="text-[10px] font-lexendBold uppercase tracking-widest text-primary text-center mb-6">
                Live Cadence Controls
              </Text>

              {/* Warmup */}
              <View
                className={`w-full p-5 rounded-2xl mb-4 ${
                  currentPhase?.type === "warmup" ||
                  currentPhase?.type === "cooldown"
                    ? "bg-[#f6ffc01a] border border-[#f6ffc033]"
                    : "bg-[#1e202280] opacity-60"
                }`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className={`text-[10px] font-lexendBlack uppercase tracking-[0.2em] ${currentPhase?.type === "warmup" || currentPhase?.type === "cooldown" ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    Warm Up
                  </Text>
                  <Text
                    className={`text-2xl font-lexendBlack italic ${currentPhase?.type === "warmup" || currentPhase?.type === "cooldown" ? "text-primary" : "text-on-surface"}`}
                  >
                    {warmupBPM}{" "}
                    <Text className="text-[10px] uppercase not-italic">
                      BPM
                    </Text>
                  </Text>
                </View>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={80}
                  maximumValue={120}
                  step={1}
                  value={warmupBPM}
                  onSlidingComplete={setWarmupBPM}
                  disabled={
                    !(
                      currentPhase?.type === "warmup" ||
                      currentPhase?.type === "cooldown"
                    )
                  }
                  minimumTrackTintColor={
                    currentPhase?.type === "warmup" ||
                    currentPhase?.type === "cooldown"
                      ? "#f6ffc0"
                      : "#ababad"
                  }
                  maximumTrackTintColor="#242629"
                  thumbTintColor={
                    currentPhase?.type === "warmup" ||
                    currentPhase?.type === "cooldown"
                      ? "#f6ffc0"
                      : "#ababad"
                  }
                />
              </View>

              {/* Moderate */}
              <View
                className={`w-full p-5 rounded-2xl mb-4 ${
                  currentPhase?.type === "moderate"
                    ? "bg-[#f6ffc01a] border border-[#f6ffc033]"
                    : "bg-[#1e202280] opacity-60"
                }`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className={`text-[10px] font-lexendBlack uppercase tracking-[0.2em] ${currentPhase?.type === "moderate" ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    Moderate
                  </Text>
                  <Text
                    className={`text-2xl font-lexendBlack italic ${currentPhase?.type === "moderate" ? "text-primary" : "text-on-surface"}`}
                  >
                    {moderateBPM}{" "}
                    <Text className="text-[10px] uppercase not-italic">
                      BPM
                    </Text>
                  </Text>
                </View>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={110}
                  maximumValue={140}
                  step={1}
                  value={moderateBPM}
                  onSlidingComplete={setModerateBPM}
                  disabled={currentPhase?.type !== "moderate"}
                  minimumTrackTintColor={
                    currentPhase?.type === "moderate" ? "#f6ffc0" : "#ababad"
                  }
                  maximumTrackTintColor="#242629"
                  thumbTintColor={
                    currentPhase?.type === "moderate" ? "#f6ffc0" : "#ababad"
                  }
                />
              </View>

              {/* Fast */}
              <View
                className={`w-full p-5 rounded-2xl ${
                  currentPhase?.type === "fast"
                    ? "bg-[#f6ffc01a] border border-[#f6ffc033]"
                    : "bg-[#1e202280] opacity-60"
                }`}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className={`text-[10px] font-lexendBlack uppercase tracking-[0.2em] ${currentPhase?.type === "fast" ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    Fast Burst
                  </Text>
                  <Text
                    className={`text-2xl font-lexendBlack italic ${currentPhase?.type === "fast" ? "text-primary" : "text-on-surface"}`}
                  >
                    {fastBPM}{" "}
                    <Text className="text-[10px] uppercase not-italic">
                      BPM
                    </Text>
                  </Text>
                </View>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={120}
                  maximumValue={180}
                  step={1}
                  value={fastBPM}
                  onSlidingComplete={setFastBPM}
                  disabled={currentPhase?.type !== "fast"}
                  minimumTrackTintColor={
                    currentPhase?.type === "fast" ? "#f6ffc0" : "#ababad"
                  }
                  maximumTrackTintColor="#242629"
                  thumbTintColor={
                    currentPhase?.type === "fast" ? "#f6ffc0" : "#ababad"
                  }
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
