import { MUSIC_TRACKS } from "@/components/AudioPlayer";
import { useWorkout } from "@/context/WorkoutContext";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React from "react";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MusicScreen() {
  const {
    musicTheme,
    currentTrackIndex,
    setCurrentTrackIndex,
    musicIsPlaying,
    setMusicIsPlaying,
    musicCurrentTime,
    musicDuration,
  } = useWorkout();

  const currentTrack = MUSIC_TRACKS[musicTheme][currentTrackIndex];

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    setCurrentTrackIndex(
      (prev) => (prev + 1) % MUSIC_TRACKS[musicTheme].length,
    );
  };

  const handlePrev = () => {
    setCurrentTrackIndex(
      (prev) =>
        (prev - 1 + MUSIC_TRACKS[musicTheme].length) %
        MUSIC_TRACKS[musicTheme].length,
    );
  };

  const togglePlay = () => {
    setMusicIsPlaying(!musicIsPlaying);
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
            Audio Sync
          </Text>
          <Text className="text-on-surface font-lexendBlack tracking-tighter text-4xl uppercase">
            Training{"\n"}
            <Text className="text-on-surface-variant italic font-lexendBlack opacity-80">
              Rhythm
            </Text>
          </Text>
        </View>

        <View className="bg-[#1e202280] p-8 rounded-3xl border border-[#ffffff0d] mb-24 items-center">
          {/* Album Art Container */}
          <View className="w-full aspect-square bg-surface-high rounded-2xl overflow-hidden mb-8 relative justify-center items-center shadow-2xl">
            <Image
              source={{ uri: currentTrack.cover }}
              className={`w-full h-full absolute ${musicIsPlaying ? "opacity-100" : "opacity-80"}`}
              style={{ transform: [{ scale: musicIsPlaying ? 1.05 : 1 }] }}
            />
            <View className="absolute inset-0 bg-black/40" />
            {!musicIsPlaying && (
              <MaterialIcons
                name="music-note"
                size={80}
                color="#f6ffc0"
                style={{ opacity: 0.6 }}
              />
            )}
          </View>

          {/* Track Info */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-lexendBlack italic uppercase tracking-tight text-on-surface mb-1">
              {currentTrack.title}
            </Text>
            <Text className="text-xs font-lexendBold uppercase tracking-widest text-on-surface-variant">
              {currentTrack.artist}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="w-full mb-8">
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={musicDuration || 1}
              value={musicCurrentTime}
              minimumTrackTintColor="#f6ffc0"
              maximumTrackTintColor="#242629"
              thumbTintColor="#f6ffc0"
              disabled // Read-only for now without complex expo-av seek logic
            />
            <View className="flex-row justify-between px-2">
              <Text className="text-[10px] font-lexendBold text-on-surface-variant uppercase tracking-widest">
                {formatTime(musicCurrentTime)}
              </Text>
              <Text className="text-[10px] font-lexendBold text-on-surface-variant uppercase tracking-widest">
                {formatTime(musicDuration)}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View className="flex-row items-center justify-between w-full px-4">
            <TouchableOpacity className="p-2">
              <MaterialIcons name="replay" size={24} color="#ababad" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-6">
              <TouchableOpacity onPress={handlePrev} className="p-2">
                <MaterialIcons name="skip-previous" size={36} color="#fdfbfe" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlay}
                className="w-16 h-16 rounded-full bg-primary items-center justify-center shadow-[0_0_20px_rgba(246,255,192,0.3)]"
              >
                <MaterialIcons
                  name={musicIsPlaying ? "pause" : "play-arrow"}
                  size={36}
                  color="#586500"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext} className="p-2">
                <MaterialIcons name="skip-next" size={36} color="#fdfbfe" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="p-2">
              <MaterialIcons name="volume-up" size={24} color="#ababad" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
