# STRIDE Pro

A precision interval training app built with React Native and Expo, designed to deliver structured workout sessions with integrated music and voice coaching.

## 🏃‍♂️ Features

### Workout Planning

- **Customizable Intervals**: Configure warm-up, moderate pace, fast burst, and cool-down phases
- **Precision Timing**: Set exact durations for each phase with 0.5-minute increments
- **Multi-Cycle Training**: Plan multiple cycles of moderate/fast intervals
- **BPM Targeting**: Set target cadence (BPM) for each workout phase

### Live Training Sessions

- **Real-time Timer**: Visual countdown with circular progress indicators
- **Phase Transitions**: Automatic progression through workout phases
- **Voice Coaching**: AI-powered voice guidance with multiple personality options (Aria, Marcus, Nova)
- **Workout Controls**: Play, pause, and resume functionality during sessions

### Integrated Music System

- **Theme-Based Playlists**: Choose from Military Drill, Neon Circuit, or Acoustic Trail themes
- **BPM Synchronization**: Music automatically adjusts playback rate to match your target cadence
- **Phase-Matched Tracks**: Different tracks for warm-up, moderate, and fast phases
- **Seamless Transitions**: Music changes instantly with workout phases

### Settings & Customization

- **Voice Options**: Multiple AI coaches with adjustable volume
- **Music Themes**: Switch between different musical styles
- **Haptic Feedback**: Configurable tactile feedback levels
- **Units**: Metric or Imperial measurement support
- **Visual Themes**: Dark mode interfaces (Kinetic Dark, Onyx Black, Pro Grey)

### Session Tracking

- **Workout History**: Complete log of all training sessions
- **Performance Metrics**: Track total duration, phases completed, and settings used
- **Export Capability**: Save and review past workouts

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Audio**: Expo Audio for music playback
- **Speech**: Expo Speech for voice coaching
- **Typography**: Lexend font family
- **Icons**: Expo Vector Icons (Material Icons)
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Expo CLI or Expo Go app on your mobile device
- iOS Simulator or Android Emulator (for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stride-pro
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## 📱 App Structure

```
app/
├── (tabs)/           # Tab navigation screens
│   ├── index.tsx     # Workout planner (main screen)
│   ├── history.tsx   # Session history
│   ├── music.tsx     # Music player controls
│   └── settings.tsx  # App settings
├── live-session.tsx  # Live workout session screen
└── _layout.tsx      # Root layout with providers

components/
├── AudioPlayer.tsx   # Global music player component
├── TopAppBar.tsx    # Navigation header
└── ...              # Other UI components

context/
└── WorkoutContext.tsx # Global state management

constants/
└── Colors.ts        # Theme color definitions
```

## 🎯 Usage

1. **Plan Your Workout**: Use the main screen to set up your interval training session
   - Adjust warm-up, moderate, and fast burst durations
   - Set target BPM for each phase
   - Choose number of cycles

2. **Start Training**: Tap "Start Live Session" to begin your workout
   - Follow voice guidance through each phase
   - Music automatically matches your target cadence
   - Use pause/resume controls as needed

3. **Track Progress**: Review completed sessions in the History tab
   - View past workout details
   - Monitor training consistency

4. **Customize Experience**: Adjust settings for optimal training
   - Change voice coach personality
   - Switch music themes
   - Configure haptic feedback

## 🔧 Configuration

### Audio Features

- **Music Themes**: Military Drill, Neon Circuit, Acoustic Trail
- **Voice Coaches**: Aria (balanced), Marcus (drill instructor), Nova (energetic)
- **BPM Range**: 50-200 BPM with automatic playback rate adjustment

### Workout Parameters

- **Warm-up**: 0-15 minutes
- **Moderate Pace**: 0-20 minutes
- **Fast Burst**: 0-10 minutes
- **Cool-down**: 0-15 minutes
- **Cycles**: 1-20 repetitions

## 🧩 Key Components

### WorkoutContext

Global state management for workout configuration, session data, and app settings.

### AudioPlayer

Manages music playback with BPM synchronization and seamless track transitions.

### LiveSessionScreen

Real-time workout execution with timer, progress tracking, and voice guidance.

## 🎨 Design System

- **Color Palette**: Dark theme with neon accents (#f6ffc0 primary)
- **Typography**: Lexend font family for optimal readability
- **Layout**: Clean, fitness-focused interface with high contrast
- **Animations**: Smooth transitions and progress indicators

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Please contact the maintainer for contribution guidelines.

---

**STRIDE Pro** - Precision interval training for serious athletes and fitness enthusiasts.
