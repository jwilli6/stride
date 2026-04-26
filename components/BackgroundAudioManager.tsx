import { Audio } from "expo-av";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";

interface BackgroundAudioManagerProps {
  isActive: boolean; // When true, plays silent loop to keep app awake
}

export default function BackgroundAudioManager({
  isActive,
}: BackgroundAudioManagerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    let isMounted = true;

    const setupBackgroundAudio = async () => {
      try {
        // Configure audio session for background playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        if (isActive && isMounted) {
          // Activate keep-awake as additional protection
          activateKeepAwake("workout-session");

          // Load and play silent audio loop
          const { sound: newSound } = await Audio.Sound.createAsync(
            require("../assets/audio/silent_loop.wav"),
            {
              shouldPlay: true,
              isLooping: true,
              volume: 0.01, // Very low volume but not completely silent
            },
          );

          if (isMounted) {
            setSound(newSound);
          } else {
            // Component was unmounted before sound finished loading
            newSound.unloadAsync();
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
          await sound.stopAsync();
          await sound.unloadAsync();
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
        sound
          .stopAsync()
          .then(() => sound.unloadAsync())
          .catch(console.warn);
      }
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deactivateKeepAwake("workout-session");
      if (sound) {
        sound
          .stopAsync()
          .then(() => sound.unloadAsync())
          .catch(console.warn);
      }
    };
  }, []);

  return null; // This is an invisible component
}
