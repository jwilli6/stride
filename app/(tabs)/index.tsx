import BackgroundAudioManager from "@/components/BackgroundAudioManager";
import { useWorkout } from "@/context/WorkoutContext";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WalkScreen() {
  const router = useRouter();
  const {
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
    setIsWorkoutActive,
    isWorkoutActive,
  } = useWorkout();

  const totalTime = getTotalTime();

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Background Audio Manager - Only active during workouts */}
      <BackgroundAudioManager isActive={isWorkoutActive} />

      <ScrollView
        className="flex-1 px-6 pt-12 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-12">
          <Text className="text-primary font-lexendExtraBold uppercase tracking-widest text-xs mb-2">
            STRIDE Precision Training
          </Text>
          <Text className="text-on-surface font-lexendBlack tracking-tighter text-4xl">
            INTERVAL PLANNER
          </Text>
        </View>

        {/* Timeline Summary */}
        <View className="bg-[#1e202280] border border-[#ffffff0d] rounded-2xl p-6 mb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-[10px] uppercase font-lexendBold tracking-widest text-on-surface-variant mb-1">
              Planned Session Timeline
            </Text>
            <Text className="text-3xl font-lexendBlack text-primary tracking-tighter italic">
              {formatTime(totalTime)}
            </Text>
          </View>
          <MaterialIcons
            name="timer"
            size={32}
            color="#f6ffc0"
            style={{ opacity: 0.5 }}
          />
        </View>

        {/* Sliders Area */}
        <View className="flex-col gap-8 mb-12">
          {/* Warm Up */}
          <View className="bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-2xl mb-4">
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
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
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
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
            />
          </View>

          {/* Moderate Pace */}
          <View className="bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-2xl mb-4">
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
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
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
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
            />
          </View>

          {/* Fast Burst */}
          <View className="bg-[#1e202280] border border-[#ffffff0d] p-5 rounded-2xl mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs font-lexendBold uppercase tracking-widest text-primary">
                Fast Burst
              </Text>
              <Text className="text-xl font-lexendBlack italic text-primary">
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
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
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
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
            />
          </View>

          {/* Interval Cycles */}
          <View className="flex-row items-center justify-between bg-[#1e202280] border border-[#ffffff0d] p-4 rounded-2xl mt-4">
            <Text className="text-xs font-lexendBold uppercase tracking-widest text-on-surface-variant">
              Interval Cycles
            </Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                className="w-8 h-8 bg-surface-highest rounded-lg items-center justify-center"
                onPress={() => setCycles(Math.max(1, cycles - 1))}
              >
                <MaterialIcons name="remove" size={20} color="#fdfbfe" />
              </TouchableOpacity>
              <Text className="text-2xl font-lexendBlack italic text-on-surface w-12 text-center">
                {cycles}
              </Text>
              <TouchableOpacity
                className="w-8 h-8 bg-surface-highest rounded-lg items-center justify-center"
                onPress={() => setCycles(Math.min(20, cycles + 1))}
              >
                <MaterialIcons name="add" size={20} color="#f6ffc0" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Start Walk Action Button */}
        <TouchableOpacity
          className="w-full py-5 bg-primary rounded-2xl flex-row items-center justify-center gap-2 shadow-[0_8px_30px_rgba(246,255,192,0.2)] active:opacity-80 mb-24"
          onPress={() => {
            setIsWorkoutActive(true); // Start background audio immediately
            router.push("/live-session");
          }}
        >
          <Text className="text-on-primary font-lexendBlack uppercase tracking-widest text-sm">
            Start Walk
          </Text>
          <MaterialIcons name="directions-walk" size={24} color="#586500" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
