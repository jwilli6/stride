import { useWorkout, WorkoutSession } from "@/context/WorkoutContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { history } = useWorkout();

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

    // Distance estimation: steps * average step length (approx 0.75m)
    const totalSteps =
      warmupBPM * warmupMin +
      moderateBPM * moderateMin +
      fastBPM * fastMin +
      warmupBPM * cooldownMin;
    const distanceKm = (totalSteps * 0.75) / 1000;

    return { avgBPM, peakBPM, distanceKm };
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
              const { avgBPM, peakBPM, distanceKm } = calculateMetrics(session);
              const dateObj = new Date(session.date);
              const dateStr = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              const m = Math.floor(session.totalDuration / 60);
              const s = session.totalDuration % 60;

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

                  <View className="flex-row pt-4 border-t border-[#ffffff0d]">
                    <View className="flex-1 items-center border-r border-[#ffffff0d]">
                      <Text className="text-[9px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-1">
                        Avg BPM
                      </Text>
                      <Text className="text-lg font-lexendBlack italic text-primary">
                        {avgBPM}
                      </Text>
                    </View>
                    <View className="flex-1 items-center border-r border-[#ffffff0d]">
                      <Text className="text-[9px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-1">
                        Peak BPM
                      </Text>
                      <Text className="text-lg font-lexendBlack italic text-primary">
                        {peakBPM}
                      </Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-[9px] font-lexendBold text-on-surface-variant uppercase tracking-widest mb-1">
                        Distance
                      </Text>
                      <Text className="text-lg font-lexendBlack italic text-primary">
                        {distanceKm.toFixed(2)}
                        <Text className="text-[10px] ml-0.5 text-primary lowercase not-italic font-lexendBold">
                          km
                        </Text>
                      </Text>
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
