declare module 'expo-audio' {
  export function useAudioPlayer(source: any, options?: any): any;
  export function setAudioModeAsync(options: any): Promise<void>;
}