import { useWorkout } from "@/context/WorkoutContext";
import { Audio } from "expo-av";
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

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const preloadedSoundRef = useRef<Audio.Sound | null>(null); // For instant track switching
  const isPlayingRef = useRef(musicIsPlaying);
  const trackIndexRef = useRef(currentTrackIndex);
  const themeRef = useRef(musicTheme);

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
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: 1, // DoNotMix
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1, // DoNotMix
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.warn("Failed to setup audio session:", error);
      }
    };

    setupAudio();
  }, []);

  // Update refs when state changes
  useEffect(() => {
    isPlayingRef.current = musicIsPlaying;
  }, [musicIsPlaying]);

  useEffect(() => {
    trackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    themeRef.current = musicTheme;
  }, [musicTheme]);

  // Handle playback rate changes
  useEffect(() => {
    const updatePlaybackRate = async () => {
      if (soundRef.current) {
        try {
          await soundRef.current.setRateAsync(playbackRate, true);
        } catch (error) {
          console.warn("Failed to set playback rate:", error);
        }
      }
    };

    updatePlaybackRate();
  }, [playbackRate]);

  // Main sound loading and management effect
  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      if (isLoading) return;
      setIsLoading(true);

      try {
        // Cleanup existing sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
          setSound(null);
        }

        // Small delay for cleanup
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return;

        // Load new sound
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          currentTrack.source,
          {
            shouldPlay: false,
            rate: playbackRate,
            shouldCorrectPitch: true,
            volume: 1.0,
            isLooping: false,
          },
        );

        if (!isMounted) {
          await newSound.unloadAsync();
          return;
        }

        soundRef.current = newSound;
        setSound(newSound);

        // Set up status update listener
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (!isMounted || !status.isLoaded) return;

          setMusicCurrentTime(status.positionMillis || 0);
          setMusicDuration(status.durationMillis || 0);

          // Handle track completion
          if (status.didJustFinish) {
            setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
          }
        });

        // Apply current play state
        if (isPlayingRef.current) {
          await newSound.playAsync();
        }
      } catch (error) {
        console.warn("Failed to load sound:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
    };
  }, [currentTrackIndex, musicTheme]);

  // Handle play/pause state changes
  useEffect(() => {
    const handlePlayPause = async () => {
      if (!soundRef.current || isLoading) return;

      try {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) return;

        if (musicIsPlaying && !status.isPlaying) {
          await soundRef.current.playAsync();
        } else if (!musicIsPlaying && status.isPlaying) {
          await soundRef.current.pauseAsync();
        }
      } catch (error) {
        console.warn("Failed to handle play/pause:", error);
      }
    };

    handlePlayPause();
  }, [musicIsPlaying, isLoading]);

  // Pre-load next track for instant switching
  useEffect(() => {
    const preloadNextTrack = async () => {
      try {
        // Clean up previous preloaded sound
        if (preloadedSoundRef.current) {
          await preloadedSoundRef.current.unloadAsync();
          preloadedSoundRef.current = null;
        }

        // Pre-load next track
        const { sound: preloadedSound } = await Audio.Sound.createAsync(
          nextTrack.source,
          { shouldPlay: false },
        );
        preloadedSoundRef.current = preloadedSound;
      } catch (error) {
        console.warn("Failed to preload next track:", error);
      }
    };

    preloadNextTrack();
  }, [nextTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.warn);
      }
      if (preloadedSoundRef.current) {
        preloadedSoundRef.current.unloadAsync().catch(console.warn);
      }
    };
  }, []);

  return null; // Invisible component managing global audio
}
