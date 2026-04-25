import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, Lexend_400Regular, Lexend_700Bold, Lexend_800ExtraBold, Lexend_900Black } from '@expo-google-fonts/lexend';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lexend: Lexend_400Regular,
    LexendBold: Lexend_700Bold,
    LexendExtraBold: Lexend_800ExtraBold,
    LexendBlack: Lexend_900Black,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { StatusBar } from 'expo-status-bar';
import { WorkoutProvider } from '@/context/WorkoutContext';
import AudioPlayer from '@/components/AudioPlayer';

function RootLayoutNav() {
  return (
    <WorkoutProvider>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="live-session" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
        <AudioPlayer />
      </ThemeProvider>
    </WorkoutProvider>
  );
}
