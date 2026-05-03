import { useWorkout } from "@/context/WorkoutContext";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useEffect, useMemo, useRef, useState } from "react";

export const MUSIC_TRACKS = {
  "Military Drill": [
    {
      title: "Tactical Prep",
      artist: "Unit Alpha",
      source: require("../assets/music/SoundHelix-Song-12.mp3"),
      cover:
        "https://images.unsplash.com/photo-1518005020480-309a9a0b2048?w=800&q=80",
      type: "warmup",
      baseBPM: 90,
    },
    {
      title: "Iron March",
      artist: "Division II",
      source: require("../assets/music/SoundHelix-Song-5.mp3"),
      cover:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
      type: "moderate",
      baseBPM: 120,
    },
    {
      title: "Drill Cadence",
      artist: "Strike Force",
      source: require("../assets/music/SoundHelix-Song-6.mp3"),
      cover:
        "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80",
      type: "moderate",
      baseBPM: 125,
    },
    {
      title: "Double Time",
      artist: "Special Ops",
      source: require("../assets/music/SoundHelix-Song-7.mp3"),
      cover:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      type: "fast",
      baseBPM: 140,
    },
  ],
  "Neon Circuit": [
    {
      title: "Cyber Flow",
      artist: "Synth Runner",
      source: require("../assets/music/SoundHelix-Song-13.mp3"),
      cover:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      type: "warmup",
      baseBPM: 95,
    },
    {
      title: "Digital Grit",
      artist: "Hardline",
      source: require("../assets/music/SoundHelix-Song-5.mp3"),
      cover:
        "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
      type: "moderate",
      baseBPM: 128,
    },
    {
      title: "Neon Surge",
      artist: "Vector One",
      source: require("../assets/music/SoundHelix-Song-6.mp3"),
      cover:
        "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80",
      type: "moderate",
      baseBPM: 132,
    },
    {
      title: "Overload",
      artist: "CPU Death",
      source: require("../assets/music/SoundHelix-Song-7.mp3"),
      cover:
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
      type: "fast",
      baseBPM: 155,
    },
  ],
  "Acoustic Trail": [
    {
      title: "Morning Mist",
      artist: "Nature Walk",
      source: require("../assets/music/SoundHelix-Song-12.mp3"),
      cover:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      type: "warmup",
      baseBPM: 85,
    },
    {
      title: "River Run",
      artist: "Trail Blazer",
      source: require("../assets/music/SoundHelix-Song-13.mp3"),
      cover:
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80",
      type: "moderate",
      baseBPM: 115,
    },
    {
      title: "Highland Hike",
      artist: "Summit",
      source: require("../assets/music/SoundHelix-Song-14.mp3"),
      cover:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      type: "moderate",
      baseBPM: 118,
    },
    {
      title: "Sprint Peak",
      artist: "Velocity",
      source: require("../assets/music/SoundHelix-Song-15.mp3"),
      cover:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
      type: "fast",
      baseBPM: 135,
    },
  ],
};

export default function AudioPlayer() {
  const {
    musicTheme,
    currentTrackIndex,
    setCurrentTrackIndex,
    musicIsPlaying,
    setMusicCurrentTime,
    setMusicDuration,
    warmupBPM,
    moderateBPM,
    fastBPM,
  } = useWorkout();

  const tracks = useMemo(() => MUSIC_TRACKS[musicTheme], [musicTheme]);
  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const nextTrack = tracks[(currentTrackIndex + 1) % tracks.length]; // Next track for pre-loading

  const targetBPM = useMemo(() => {
    if (currentTrack.type === "warmup") return warmupBPM;
    if (currentTrack.type === "moderate") return moderateBPM;
    if (currentTrack.type === "fast") return fastBPM;
    return 120;
  }, [currentTrack, warmupBPM, moderateBPM, fastBPM]);

  const playbackRate = useMemo(() => {
    return Math.min(Math.max(targetBPM / currentTrack.baseBPM, 0.5), 2.0);
  }, [targetBPM, currentTrack]);

  // Set up audio session for background playback
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          shouldPlayInBackground: true,
          playsInSilentMode: true,
          interruptionModeAndroid: 'duckOthers',
        });
      } catch (error) {
        console.warn("Failed to setup audio session:", error);
      }
    };

    setupAudio();
  }, []);

  const player = useAudioPlayer(currentTrack.source, {
    updateInterval: 500,
  });

  // Pre-load next track
  const nextPlayer = useAudioPlayer(nextTrack.source, {
    updateInterval: 1000,
  });

  // Handle playback rate changes
  useEffect(() => {
    if (player) {
      player.setPlaybackRate(playbackRate, 'high');
    }
  }, [playbackRate, player]);

  // Main sound loading and management effect
  useEffect(() => {
    if (!player) return;
    
    // Set up status update listener
    const listener = player.addListener('playbackStatusUpdate', (status: any) => {
      setMusicCurrentTime(status.currentTime * 1000 || 0);
      setMusicDuration(status.duration * 1000 || 0);

      // Handle track completion
      if (status.didJustFinish) {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
      }
    });

    return () => {
      listener.remove();
    };
  }, [player, tracks.length, setCurrentTrackIndex, setMusicCurrentTime, setMusicDuration]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!player || !player.isLoaded) return;

    if (musicIsPlaying && !player.playing) {
      player.play();
    } else if (!musicIsPlaying && player.playing) {
      player.pause();
    }
  }, [musicIsPlaying, player, player?.isLoaded]);

  return null; // Invisible component managing global audio
}
