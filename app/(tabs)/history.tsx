import { useWorkout, WorkoutSession } from "@/context/WorkoutContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { history, units } = useWorkout();

  const calculateMetrics = (session: WorkoutSession) => {
    const warmupBPM = session.warmupBPM || 100;
    const moderateBPM = session.moderateBPM || 125;
    const fastBPM = session.fastBPM || 145;

    // Durations in minutes
    const warmupMin = session.warmupTime;
    const moderateMin = session.moderatePace * session.cycles;
    const fastMin = session.fastBurst * session.cycles;
    const cooldownMin = 2.5;

    const totalMin = warmupMin + moderateMin + fastMin + cooldownMin;

    // Average BPM calculation weighted by time
    const avgBPM = Math.round(
      (warmupBPM * warmupMin +
        moderateBPM * moderateMin +
        fastBPM * fastMin +
        warmupBPM * cooldownMin) /
        totalMin,
    );

    const peakBPM = fastBPM;

    // Use saved data when available, otherwise fall back to estimations
    const estimatedSteps =
      (warmupBPM * warmupMin +
        moderateBPM * moderateMin +
        fastBPM * fastMin +
        warmupBPM * cooldownMin) * 60;
    
    const steps = session.steps !== undefined ? session.steps : estimatedSteps;
    const calories = session.calories !== undefined ? session.calories : (steps * 0.04);
    const distanceKm = session.distanceKm !== undefined ? session.distanceKm : (steps * 0.75) / 1000;

    return { avgBPM, peakBPM, steps, calories, distanceKm };
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 pt-12 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-primary font-lexendExtraBold uppercase tracking-widest text-[10px] mb-1">
            Performance Log
          </Text>
          <Text className="text-on-surface font-lexendBlack tracking-tighter text-4xl uppercase">
            Workout{"\n"}
            <Text className="text-on-surface-variant italic font-lexendBlack opacity-80">
              History
            </Text>
          </Text>
        </View>

        {history.length === 0 ? (
          <View className="py-20 items-center opacity-40">
            <MaterialIcons
              name="calendar-today"
              size={48}
              color="#fdfbfe"
              className="mb-4"
            />
            <Text className="font-lexendBold uppercase tracking-widest text-xs text-on-surface mt-4">
              No sessions recorded yet
            </Text>
          </View>
        ) : (
          <View className="flex-col gap-4 mb-24">
            {history.map((session) => {
              const { avgBPM, peakBPM, steps, calories, distanceKm } = calculateMetrics(session);
              const dateObj = new Date(session.date);
              const dateStr = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              const m = Math.floor(session.totalDuration / 60);
              const s = session.totalDuration % 60;

              const displayDistance = units === "Imperial (mi)" ? distanceKm * 0.621371 : distanceKm;
              const distanceUnit = units === "Imperial (mi)" ? "mi" : "km";

              return (
                <View
                  key={session.id}
                  className="bg-[#1e202280] p-6 rounded-3xl border border-[#ffffff0d]"
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary/20">
                        <MaterialIcons
                          name="emoji-events"
                          size={24}
                          color="#586500"
                        />
                      </View>
                      <View>
                        <Text className="text-[10px] font-lexendBlack text-primary uppercase tracking-[0.2em] mb-1">
                          {dateStr}
                        </Text>
                        <Text className="text-xl font-lexendBlack italic uppercase tracking-tighter text-on-surface">
                          {m}m {s}s
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-[10px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-1">
                        Cycles
                      </Text>
                      <Text className="text-2xl font-lexendBlack italic text-on-surface">
                        x{session.cycles}
                      </Text>
                    </View>
                  </View>

                  {/* Performance Metrics Grid */}
                  <View className="flex-col gap-4 pt-4 border-t border-[#ffffff0d]">
                    {/* Row 1: Core Physical Outputs */}
                    <View className="flex-row">
                      <View className="flex-1 items-center border-r border-[#ffffff0d]">
                        <Text className="text-[9px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-1">
                          Steps
                        </Text>
                        <Text className="text-lg font-lexendBlack italic text-[#fdfbfe]">
                          {Math.round(steps).toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-1 items-center border-r border-[#ffffff0d]">
                        <Text className="text-[9px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-1">
                          Calories
                        </Text>
                        <Text className="text-lg font-lexendBlack italic text-[#daf900]">
                          {Math.round(calories).toLocaleString()}
                          <Text className="text-[10px] ml-0.5 text-on-surface-variant lowercase not-italic font-lexendBold">
                            {" "}kcal
                          </Text>
                        </Text>
                      </View>
                      <View className="flex-1 items-center">
                        <Text className="text-[9px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-1">
                          Distance
                        </Text>
                        <Text className="text-lg font-lexendBlack italic text-primary">
                          {displayDistance.toFixed(2)}
                          <Text className="text-[10px] ml-0.5 text-primary lowercase not-italic font-lexendBold">
                            {" "}{distanceUnit}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {/* Row 2: Heart Rate Telemetry */}
                    <View className="flex-row pt-3 border-t border-[#ffffff05] justify-around">
                      <View className="flex-1 items-center">
                        <Text className="text-[8px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-0.5">
                          Avg Heart Rate
                        </Text>
                        <Text className="text-sm font-lexendBold text-on-surface-variant">
                          {avgBPM} <Text className="text-[8px] text-on-surface-variant uppercase tracking-normal">BPM</Text>
                        </Text>
                      </View>
                      <View className="flex-1 items-center">
                        <Text className="text-[8px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-0.5">
                          Peak Heart Rate
                        </Text>
                        <Text className="text-sm font-lexendBold text-on-surface-variant">
                          {peakBPM} <Text className="text-[8px] text-on-surface-variant uppercase tracking-normal">BPM</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
