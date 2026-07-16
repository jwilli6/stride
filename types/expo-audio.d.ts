declare module 'expo-audio' {
  export interface AudioPlayer {
    loop: boolean;
    volume: number;
    play(): void;
    pause(): void;
    remove(): void;
  }
  export function useAudioPlayer(source: any, options?: any): any;
  export function createAudioPlayer(source: any): AudioPlayer;
  export function setAudioModeAsync(options: any): Promise<void>;
}