import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useWorkout } from "@/context/WorkoutContext";
import WorkoutMap from "@/components/WorkoutMap";

export default function WalkScreen() {
  const {
    // Planner state
    warmUp,
    moderatePace,
    fastBurst,
    coolDown,
    cycles,
    setWarmUp,
    setModeratePace,
    setFastBurst,
    setCycles,
    getTotalTime,
    warmupBPM,
    setWarmupBPM,
    moderateBPM,
    setModerateBPM,
    fastBPM,
    setFastBPM,
    units,
    avatarUri,
    isWorkoutActive,

    // Active Workout state
    workoutIsRunning,
    workoutElapsedTime,
    workoutSteps,
    workoutCalories,
    workoutSessionMode,
    workoutCurrentPhaseIndex,
    workoutTimeLeft,
    workoutSplits,
    workoutPhases,
    
    // Hybrid distance state
    workoutDistance,
    distanceConfidence,
    
    // Actions
    startWorkoutSession,
    pauseWorkoutSession,
    resumeWorkoutSession,
    stopWorkoutSession,
    toggleWorkoutSessionMode,
  } = useWorkout();



  const totalTime = getTotalTime();

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Distance computation using hybrid distance engine
  const distance = units === "Imperial (mi)" ? workoutDistance * 0.621371 : workoutDistance;
  const distanceUnitLabel = units === "Imperial (mi)" ? "MI" : "KM";

  // Get current active phase details
  const activePhase = workoutPhases[workoutCurrentPhaseIndex] || null;

  return (
    <SafeAreaView className="flex-1 bg-[#0d0e10]">
      {/* Top Header */}
      <View className="bg-[#0d0e10] flex-row justify-between items-center px-6 py-4 border-b border-[#ffffff0d] z-50">
        <View className="flex-row items-center gap-3">
          <MaterialIcons name="directions-walk" size={28} color="#daf900" />
          <Text className="text-2xl text-[#daf900] italic font-lexendBlack tracking-tight uppercase">
            STRIDE
          </Text>
          {isWorkoutActive && (
            <View className="bg-[#daf900]/10 px-2.5 py-1 rounded-md ml-2 flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-[#daf900] mr-1.5" />
              <Text className="text-[#daf900] font-lexendBold text-[10px] tracking-wider uppercase">
                {formatElapsedTime(workoutElapsedTime)}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 active:opacity-80">
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require("../../assets/images/image_0a21f247.jpg")
            }
            className="w-full h-full"
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {!isWorkoutActive ? (
        /* ================= PLANNER MODE UI ================= */
        <ScrollView
          className="flex-1 px-6 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-[#daf900] font-lexendExtraBold uppercase tracking-widest text-xs mb-1">
              STRIDE Precision Training
            </Text>
            <Text className="text-on-surface font-lexendBlack tracking-tighter text-4xl uppercase">
              INTERVAL PLANNER
            </Text>
          </View>

          {/* Timeline Summary */}
          <View className="bg-[#1e202280] border border-[#ffffff0d] rounded-3xl p-6 mb-8 flex-row justify-between items-center">
            <View>
              <Text className="text-[10px] uppercase font-lexendBold tracking-widest text-on-surface-variant mb-1">
                Planned Session Timeline
              </Text>
              <Text className="text-3xl font-lexendBlack text-[#daf900] tracking-tighter italic">
                {formatTime(totalTime)}
              </Text>
            </View>
            <MaterialIcons
              name="timer"
              size={32}
              color="#daf900"
              style={{ opacity: 0.5 }}
            />
          </View>

          {/* Sliders Area */}
          <View className="flex-col gap-6 mb-8">
            {/* Warm Up */}
            <View className="bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-3xl">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-lexendBold uppercase tracking-widest text-on-surface-variant">
                  Warm Up Time
                </Text>
                <Text className="text-xl font-lexendBlack italic text-on-surface">
                  {formatTime(warmUp)}{" "}
                  <Text className="text-[10px] text-on-surface-variant">MIN</Text>
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40, marginBottom: 8 }}
                minimumValue={0}
                maximumValue={15}
                step={0.5}
                value={warmUp}
                onSlidingComplete={setWarmUp}
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />

              <View className="flex-row justify-between items-center mb-2 mt-2">
                <Text className="text-[10px] font-lexendBold uppercase tracking-[0.2em] text-on-surface-variant">
                  Target Cadence
                </Text>
                <Text className="text-lg font-lexendBlack italic text-on-surface">
                  {warmupBPM}{" "}
                  <Text className="text-[10px] uppercase not-italic text-on-surface-variant">
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
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />
            </View>

            {/* Moderate Pace */}
            <View className="bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-3xl">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-lexendBold uppercase tracking-widest text-on-surface-variant">
                  Moderate Pace
                </Text>
                <Text className="text-xl font-lexendBlack italic text-on-surface">
                  {formatTime(moderatePace)}{" "}
                  <Text className="text-[10px] text-on-surface-variant">MIN</Text>
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40, marginBottom: 8 }}
                minimumValue={1}
                maximumValue={15}
                step={0.5}
                value={moderatePace}
                onSlidingComplete={setModeratePace}
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />

              <View className="flex-row justify-between items-center mb-2 mt-2">
                <Text className="text-[10px] font-lexendBold uppercase tracking-[0.2em] text-on-surface-variant">
                  Target Cadence
                </Text>
                <Text className="text-lg font-lexendBlack italic text-on-surface">
                  {moderateBPM}{" "}
                  <Text className="text-[10px] uppercase not-italic text-on-surface-variant">
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
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />
            </View>

            {/* Fast Burst */}
            <View className="bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-3xl">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-lexendBold uppercase tracking-widest text-[#daf900]">
                  Fast Burst
                </Text>
                <Text className="text-xl font-lexendBlack italic text-[#daf900]">
                  {formatTime(fastBurst)}{" "}
                  <Text className="text-[10px] text-on-surface-variant">MIN</Text>
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40, marginBottom: 8 }}
                minimumValue={0.5}
                maximumValue={5}
                step={0.5}
                value={fastBurst}
                onSlidingComplete={setFastBurst}
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />

              <View className="flex-row justify-between items-center mb-2 mt-2">
                <Text className="text-[10px] font-lexendBold uppercase tracking-[0.2em] text-on-surface-variant">
                  Target Cadence
                </Text>
                <Text className="text-lg font-lexendBlack italic text-on-surface">
                  {fastBPM}{" "}
                  <Text className="text-[10px] uppercase not-italic text-on-surface-variant">
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
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />
            </View>

            {/* Interval Cycles */}
            <View className="flex-row items-center justify-between bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-3xl">
              <Text className="text-xs font-lexendBold uppercase tracking-widest text-on-surface-variant">
                Interval Cycles
              </Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  className="w-8 h-8 bg-[#242629] rounded-lg items-center justify-center"
                  onPress={() => setCycles(Math.max(1, cycles - 1))}
                >
                  <MaterialIcons name="remove" size={20} color="#fdfbfe" />
                </TouchableOpacity>
                <Text className="text-2xl font-lexendBlack italic text-on-surface w-12 text-center">
                  {cycles}
                </Text>
                <TouchableOpacity
                  className="w-8 h-8 bg-[#242629] rounded-lg items-center justify-center"
                  onPress={() => setCycles(Math.min(20, cycles + 1))}
                >
                  <MaterialIcons name="add" size={20} color="#daf900" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Start Walk Action Button */}
          <TouchableOpacity
            className="w-full py-5 bg-[#daf900] rounded-3xl flex-row items-center justify-center gap-2 shadow-[0_8px_30px_rgba(246,255,192,0.2)] active:opacity-80"
            onPress={startWorkoutSession}
          >
            <Text className="text-black font-lexendBlack uppercase tracking-widest text-sm">
              Start Walk
            </Text>
            <MaterialIcons name="directions-walk" size={24} color="#000" />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* ================= ACTIVE TRACKER MODE UI (from image) ================= */
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Distance Display */}
          <View className="mt-4 mb-8 flex-row justify-between items-end">
            <View>
              <Text className="text-on-surface-variant font-lexendBold text-xs uppercase tracking-[0.2em] mb-1">
                Distance
              </Text>
              <View className="flex-row items-baseline gap-2">
                <Text className="text-8xl font-lexendBlack italic tracking-tighter text-[#daf900]">
                  {distance.toFixed(2)}
                </Text>
                <Text className="text-2xl font-lexendBlack text-on-surface-variant italic">
                  {distanceUnitLabel}
                </Text>
              </View>
            </View>
            
            {/* Confidence Indicator Badge */}
            <View className="mb-2">
              <View 
                className={`flex-row items-center px-3 py-1.5 rounded-full ${
                  distanceConfidence === "GPS-strong" 
                    ? "bg-[#daf900]/10 border border-[#daf900]/30" 
                    : "bg-[#f4e650]/10 border border-[#f4e650]/30"
                }`}
              >
                <MaterialIcons
                  name={distanceConfidence === "GPS-strong" ? "gps-fixed" : "gps-off"}
                  size={12}
                  color={distanceConfidence === "GPS-strong" ? "#daf900" : "#f4e650"}
                  style={{ marginRight: 4 }}
                />
                <Text 
                  className={`font-lexendBold text-[9px] uppercase tracking-widest ${
                    distanceConfidence === "GPS-strong" ? "text-[#daf900]" : "text-[#f4e650]"
                  }`}
                >
                  {distanceConfidence === "GPS-strong" ? "GPS-Strong" : "Estimated"}
                </Text>
              </View>
            </View>
          </View>

          {/* Steps & Calories Grid */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-3xl">
              <Text className="text-on-surface-variant font-lexendBold text-[10px] uppercase tracking-widest mb-1">
                Steps
              </Text>
              <Text className="text-3xl font-lexendBlack text-[#fdfbfe] tracking-tight">
                {Math.round(workoutSteps).toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-3xl">
              <Text className="text-on-surface-variant font-lexendBold text-[10px] uppercase tracking-widest mb-1">
                Calories
              </Text>
              <Text className="text-3xl font-lexendBlack text-[#daf900] tracking-tight">
                {Math.round(workoutCalories).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Map Overview Bento Card */}
          <View className="mb-6">
            <WorkoutMap />
          </View>

          {/* Session Mode Configuration Toggle */}
          <View className="bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-3xl mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-col flex-1 pr-4">
                <Text className="text-[#fdfbfe] font-lexendBlack italic text-base uppercase tracking-tight">
                  Session Mode
                </Text>
                <Text className="text-on-surface-variant font-lexend text-xs mt-0.5 mb-3">
                  {workoutSessionMode
                    ? "Dynamic interval tracking enabled"
                    : "Simple duration tracking enabled"}
                </Text>
                {workoutSessionMode && activePhase && (
                  <View className="flex-row items-center gap-3 bg-[#0d0e10]/40 p-3 rounded-2xl border border-[#ffffff05]">
                    <View className="flex-1">
                      <Text className="text-[9px] font-lexendBold uppercase tracking-widest text-on-surface-variant mb-0.5">
                        Interval Phase
                      </Text>
                      <Text 
                        className="text-xl font-lexendBlack italic uppercase tracking-tighter"
                        style={{ color: activePhase.color }}
                      >
                        {activePhase.name}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[9px] font-lexendBold uppercase tracking-widest text-on-surface-variant mb-0.5">
                        Remaining
                      </Text>
                      <Text className="text-2xl font-lexendBlack italic text-[#daf900] tabular-nums tracking-tighter">
                        {formatElapsedTime(workoutTimeLeft)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              {/* Custom Switch Switch */}
              <TouchableOpacity
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 justify-center ${
                  workoutSessionMode
                    ? "bg-[#daf900]/25 border border-[#daf900]/30"
                    : "bg-[#242629] border border-[#ffffff0d]"
                }`}
                onPress={toggleWorkoutSessionMode}
                activeOpacity={0.8}
              >
                <View
                  className={`w-6 h-6 rounded-full ${
                    workoutSessionMode
                      ? "bg-[#daf900] self-end shadow-[0_0_12px_rgba(246,255,192,0.4)]"
                      : "bg-[#ababad] self-start"
                  }`}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Pause/Stop Controls Row */}
          <View className="flex-row gap-4 mb-8">
            {/* Pause/Resume Toggle */}
            <TouchableOpacity
              className={`flex-1 h-20 rounded-3xl flex-row items-center justify-center gap-3 active:scale-[0.98] ${
                workoutIsRunning
                  ? "bg-[#daf900]"
                  : "bg-[#1e202280] border border-[#ffffff0d]"
              }`}
              onPress={workoutIsRunning ? pauseWorkoutSession : resumeWorkoutSession}
            >
              <MaterialIcons
                name={workoutIsRunning ? "pause" : "play-arrow"}
                size={28}
                color={workoutIsRunning ? "#000" : "#daf900"}
              />
              <Text
                className={`font-lexendBlack text-lg italic uppercase tracking-wider ${
                  workoutIsRunning ? "text-black" : "text-[#daf900]"
                }`}
              >
                {workoutIsRunning ? "Pause Session" : "Resume Session"}
              </Text>
            </TouchableOpacity>

            {/* Stop Action */}
            <TouchableOpacity
              className="w-20 h-20 bg-[#b92902] rounded-3xl items-center justify-center active:scale-[0.98]"
              onPress={stopWorkoutSession}
            >
              <MaterialIcons name="stop" size={32} color="#fdfbfe" />
            </TouchableOpacity>
          </View>

          {/* Live Cadence Controls */}
          <View className="mb-6">
            <Text className="font-lexendBlack text-lg italic tracking-tight text-[#fdfbfe] uppercase mb-4">
              Live Cadence Controls
            </Text>

            {/* Moderate Cadence Card */}
            <View
              className={`p-5 rounded-3xl mb-4 ${
                activePhase?.type === "moderate"
                  ? "bg-[#daf900]/10 border border-[#daf900]/30"
                  : "bg-[#1e202280] border border-[#ffffff0d] opacity-60"
              }`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className={`text-xs font-lexendBold uppercase tracking-widest ${
                    activePhase?.type === "moderate" ? "text-[#daf900]" : "text-on-surface-variant"
                  }`}
                >
                  Moderate Pace Cadence
                </Text>
                <Text className="text-xl font-lexendBlack italic text-[#fdfbfe]">
                  {moderateBPM}{" "}
                  <Text className="text-[10px] uppercase not-italic text-on-surface-variant">
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
                onValueChange={setModerateBPM}
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />
            </View>

            {/* Fast Cadence Card */}
            <View
              className={`p-5 rounded-3xl ${
                activePhase?.type === "fast"
                  ? "bg-[#daf900]/10 border border-[#daf900]/30"
                  : "bg-[#1e202280] border border-[#ffffff0d] opacity-60"
              }`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className={`text-xs font-lexendBold uppercase tracking-widest ${
                    activePhase?.type === "fast" ? "text-[#daf900]" : "text-on-surface-variant"
                  }`}
                >
                  Fast Burst Cadence
                </Text>
                <Text className="text-xl font-lexendBlack italic text-[#fdfbfe]">
                  {fastBPM}{" "}
                  <Text className="text-[10px] uppercase not-italic text-on-surface-variant">
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
                onValueChange={setFastBPM}
                minimumTrackTintColor="#daf900"
                maximumTrackTintColor="#242629"
                thumbTintColor="#daf900"
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
