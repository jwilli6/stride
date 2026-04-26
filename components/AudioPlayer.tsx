import { useWorkout } from "@/context/WorkoutContext";
import { createAudioPlayer, AudioPlayer as ExpAudioPlayer } from "expo-audio";
import { useEffect, useMemo, useRef } from "react";

export const MUSIC_TRACKS = {
  "Military Drill": [
    {
      title: "Tactical Prep",
      artist: "Unit Alpha",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      cover:
        "https://images.unsplash.com/photo-1518005020480-309a9a0b2048?w=800&q=80",
      type: "warmup",
      baseBPM: 90,
    },
    {
      title: "Iron March",
      artist: "Division II",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      cover:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
      type: "moderate",
      baseBPM: 120,
    },
    {
      title: "Drill Cadence",
      artist: "Strike Force",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      cover:
        "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80",
      type: "moderate",
      baseBPM: 125,
    },
    {
      title: "Double Time",
      artist: "Special Ops",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
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
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      cover:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      type: "warmup",
      baseBPM: 95,
    },
    {
      title: "Digital Grit",
      artist: "Hardline",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      cover:
        "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
      type: "moderate",
      baseBPM: 128,
    },
    {
      title: "Neon Surge",
      artist: "Vector One",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      cover:
        "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80",
      type: "moderate",
      baseBPM: 132,
    },
    {
      title: "Overload",
      artist: "CPU Death",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
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
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
      cover:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      type: "warmup",
      baseBPM: 85,
    },
    {
      title: "River Run",
      artist: "Trail Blazer",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
      cover:
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80",
      type: "moderate",
      baseBPM: 115,
    },
    {
      title: "Highland Hike",
      artist: "Summit",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
      cover:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      type: "moderate",
      baseBPM: 118,
    },
    {
      title: "Sprint Peak",
      artist: "Velocity",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
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

  const playerRef = useRef<ExpAudioPlayer | null>(null);
  const isPlayingRef = useRef(musicIsPlaying);
  const trackRef = useRef(currentTrackIndex);
  const themeRef = useRef(musicTheme);
  const isLoadingRef = useRef(false);
  const pendingTrackRef = useRef<{ trackIndex: number; theme: string } | null>(
    null,
  );

  const tracks = useMemo(() => MUSIC_TRACKS[musicTheme], [musicTheme]);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const targetBPM = useMemo(() => {
    if (currentTrack.type === "warmup") return warmupBPM;
    if (currentTrack.type === "moderate") return moderateBPM;
    if (currentTrack.type === "fast") return fastBPM;
    return 120;
  }, [currentTrack, warmupBPM, moderateBPM, fastBPM]);

  const playbackRate = useMemo(() => {
    return Math.min(Math.max(targetBPM / currentTrack.baseBPM, 0.5), 2.0);
  }, [targetBPM, currentTrack]);

  // Handle Playback Rate - Enhanced to prevent conflicts during loading
  useEffect(() => {
    const updateRate = async () => {
      if (playerRef.current && !isLoadingRef.current) {
        try {
          playerRef.current.setPlaybackRate(playbackRate);
        } catch (e) {
          console.warn("Failed to set playback rate", e);
        }
      }
    };
    updateRate();
  }, [playbackRate]);

  // Handle Play/Pause - Enhanced to prevent conflicts during loading
  useEffect(() => {
    const togglePlayback = async () => {
      if (!playerRef.current || isLoadingRef.current) return;

      try {
        if (musicIsPlaying) {
          await playerRef.current.play();
        } else {
          playerRef.current.pause();
        }
      } catch (e) {
        console.warn("Failed to toggle playback", e);
      }
    };

    if (isPlayingRef.current !== musicIsPlaying && !isLoadingRef.current) {
      isPlayingRef.current = musicIsPlaying;
      togglePlayback();
    }
  }, [musicIsPlaying]);

  // Load Track - Ensures only one track loads at a time
  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      // Prevent overlapping load operations
      if (isLoadingRef.current) {
        pendingTrackRef.current = {
          trackIndex: currentTrackIndex,
          theme: musicTheme,
        };
        return;
      }

      isLoadingRef.current = true;
      pendingTrackRef.current = null;

      try {
        // Stop and cleanup current player first
        if (playerRef.current) {
          try {
            playerRef.current.pause();
            await playerRef.current.remove();
          } catch (e) {
            console.warn("Error cleaning up previous player", e);
          }
          playerRef.current = null;
        }

        // Small delay to ensure complete cleanup
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (!isMounted) {
          isLoadingRef.current = false;
          return;
        }

        const track = MUSIC_TRACKS[musicTheme][currentTrackIndex];
        if (!track) {
          console.warn("Track not found for index:", currentTrackIndex);
          isLoadingRef.current = false;
          return;
        }

        const player = createAudioPlayer(track.url);
        player.setPlaybackRate(playbackRate);

        player.addListener("playbackStatusUpdate", (status) => {
          if (!isMounted) return;
          setMusicCurrentTime(status.currentTime);
          setMusicDuration(status.duration);

          if (status.didJustFinish) {
            setCurrentTrackIndex((prev) => (prev + 1) % 4);
          }
        });

        if (isMounted) {
          playerRef.current = player;
          trackRef.current = currentTrackIndex;
          themeRef.current = musicTheme;

          // Apply current play state
          if (musicIsPlaying) {
            await player.play();
          } else {
            player.pause();
          }
        } else {
          await player.remove();
        }
      } catch (e) {
        console.warn("Error loading sound", e);
      } finally {
        isLoadingRef.current = false;

        // Handle any pending track change that was queued during loading
        const pending = pendingTrackRef.current;
        if (pending && isMounted) {
          const { trackIndex: pendingTrack, theme: pendingTheme } = pending;
          if (
            pendingTrack !== currentTrackIndex ||
            pendingTheme !== musicTheme
          ) {
            // Recursively load the pending track
            setTimeout(() => loadSound(), 10);
          }
        }
      }
    };

    // Only load if track/theme actually changed or no player exists
    if (
      trackRef.current !== currentTrackIndex ||
      themeRef.current !== musicTheme ||
      !playerRef.current
    ) {
      loadSound();
    }

    return () => {
      isMounted = false;
    };
  }, [currentTrackIndex, musicTheme, playbackRate]); // Removed playbackRate dependency

  // Cleanup on unmount - Enhanced to ensure complete cleanup
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch (e) {
          console.warn("Error during cleanup", e);
        }
        playerRef.current = null;
      }
      isLoadingRef.current = false;
      pendingTrackRef.current = null;
    };
  }, []);

  return null; // Invisible component managing global audio
}
