import { useWorkout } from "@/context/WorkoutContext";
import Slider from "@react-native-community/slider";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const {
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
    clearHistory,
  } = useWorkout();

  const toggleHaptic = () => {
    const values: ("Off" | "Low" | "High")[] = ["Off", "Low", "High"];
    setHapticFeedback(
      values[(values.indexOf(hapticFeedback) + 1) % values.length],
    );
  };

  const toggleUnits = () => {
    setUnits(units === "Metric (km)" ? "Imperial (mi)" : "Metric (km)");
  };

  const toggleTheme = () => {
    const values: ("Kinetic Dark" | "Onyx Black" | "Pro Grey")[] = [
      "Kinetic Dark",
      "Onyx Black",
      "Pro Grey",
    ];
    setTheme(values[(values.indexOf(theme) + 1) % values.length]);
  };

  const toggleMusicTheme = () => {
    const values: ("Military Drill" | "Neon Circuit" | "Acoustic Trail")[] = [
      "Military Drill",
      "Neon Circuit",
      "Acoustic Trail",
    ];
    setMusicTheme(values[(values.indexOf(musicTheme) + 1) % values.length]);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Application Data",
      "Are you sure you want to clear all history and reset settings?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            clearHistory();
          },
        },
      ],
    );
  };

  const SettingItem = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1e202280] p-5 rounded-2xl border border-[#ffffff0d] flex-row items-center justify-between active:bg-surface-high mb-4"
    >
      <Text className="font-lexendBold uppercase tracking-widest text-xs text-on-surface-variant">
        {label}
      </Text>
      <Text className="font-lexendBlack italic text-primary uppercase tracking-tight">
        {value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 pt-12 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-primary font-lexendExtraBold uppercase tracking-widest text-[10px] mb-1">
            Configuration
          </Text>
          <Text className="text-on-surface font-lexendBlack tracking-tighter text-4xl uppercase">
            System{"\n"}
            <Text className="text-on-surface-variant italic font-lexendBlack opacity-80">
              Settings
            </Text>
          </Text>
        </View>

        {/* Voice Feedback Section */}
        <View className="mb-8">
          <Text className="text-primary font-lexendExtraBold uppercase tracking-widest text-[10px] mb-4">
            Voice Feedback
          </Text>

          <View className="bg-[#1e202280] p-5 rounded-2xl border border-[#ffffff0d] mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-lexendBold uppercase tracking-widest text-xs text-on-surface-variant">
                Voice Selection
              </Text>
              <Text className="font-lexendBlack italic text-primary uppercase tracking-tight">
                {voiceSelection}
              </Text>
            </View>
            <View className="flex-row gap-2">
              {(["Aria", "Marcus", "Nova"] as const).map((voice) => (
                <TouchableOpacity
                  key={voice}
                  onPress={() => setVoiceSelection(voice)}
                  className={`flex-1 py-3 rounded-xl items-center justify-center ${
                    voiceSelection === voice ? "bg-primary" : "bg-surface-high"
                  }`}
                >
                  <Text
                    className={`font-lexendBold text-[10px] uppercase tracking-widest ${
                      voiceSelection === voice
                        ? "text-on-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {voice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-[#1e202280] p-5 rounded-2xl border border-[#ffffff0d]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-lexendBold uppercase tracking-widest text-xs text-on-surface-variant">
                Cue Volume
              </Text>
              <Text className="font-lexendBlack italic text-primary uppercase tracking-tight">
                {voiceVolume}%
              </Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={voiceVolume}
              onValueChange={setVoiceVolume}
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
            />
          </View>
        </View>

        {/* General Section */}
        <View className="mb-8">
          <Text className="text-primary font-lexendExtraBold uppercase tracking-widest text-[10px] mb-4">
            General
          </Text>
          <SettingItem
            label="Haptic Feedback"
            value={hapticFeedback}
            onPress={toggleHaptic}
          />
          <SettingItem label="Units" value={units} onPress={toggleUnits} />
          <SettingItem label="App Theme" value={theme} onPress={toggleTheme} />
          <SettingItem
            label="Music Pack"
            value={musicTheme}
            onPress={toggleMusicTheme}
          />
          <SettingItem
            label="Auto-Save History"
            value={autoSave ? "On" : "Off"}
            onPress={() => setAutoSave(!autoSave)}
          />
        </View>

        {/* Reset */}
        <TouchableOpacity
          onPress={handleReset}
          className="w-full py-4 rounded-2xl border border-red-500/20 mb-24"
        >
          <Text className="text-red-500 font-lexendBold text-center uppercase tracking-widest text-[10px]">
            Reset Application Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
