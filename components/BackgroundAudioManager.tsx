import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";

interface BackgroundAudioManagerProps {
  isActive: boolean; // When true, plays silent loop to keep app awake
}

export default function BackgroundAudioManager({
  isActive,
}: BackgroundAudioManagerProps) {
  const [sound, setSound] = useState<AudioPlayer | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    let isMounted = true;

    const setupBackgroundAudio = async () => {
      try {
        // Configure audio session for background playback
        await setAudioModeAsync({
          shouldPlayInBackground: true,
          playsInSilentMode: true,
          interruptionModeAndroid: 'duckOthers',
        });

        if (isActive && isMounted) {
          // Activate keep-awake as additional protection
          activateKeepAwakeAsync("workout-session");

          // Load and play silent audio loop
          const newPlayer = createAudioPlayer(
            require("../assets/audio/silent_loop.wav"),
          );
          newPlayer.loop = true;
          newPlayer.volume = 0.01; // Very low volume but not completely silent
          newPlayer.play();

          if (isMounted) {
            setSound(newPlayer);
          } else {
            // Component was unmounted before sound finished loading
            newPlayer.remove();
          }
        }
      } catch (error) {
        console.warn("Failed to setup background audio:", error);
      }
    };

    const cleanupBackgroundAudio = async () => {
      // Deactivate keep-awake
      deactivateKeepAwake("workout-session");

      if (sound) {
        try {
          sound.pause();
          sound.remove();
        } catch (error) {
          console.warn("Failed to cleanup background audio:", error);
        }
        if (isMounted) {
          setSound(null);
        }
      }
    };

    if (isActive) {
      setupBackgroundAudio();
    } else {
      cleanupBackgroundAudio();
    }

    return () => {
      isMounted = false;
      deactivateKeepAwake("workout-session");
      if (sound) {
        try {
          sound.pause();
          sound.remove();
        } catch (e) {
          console.warn(e);
        }
      }
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deactivateKeepAwake("workout-session");
      if (sound) {
        try {
          sound.pause();
          sound.remove();
        } catch (e) {
          console.warn(e);
        }
      }
    };
  }, []);

  return null; // This is an invisible component
}
