import React, { useState, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { useWorkout } from "@/context/WorkoutContext";

const TRAIL_POINTS = [
  { x: 30, y: 85 },
  { x: 34, y: 72 },
  { x: 32, y: 55 },
  { x: 42, y: 46 },
  { x: 49, y: 35 },
  { x: 41, y: 22 },
  { x: 46, y: 15 },
  { x: 55, y: 22 },
  { x: 53, y: 36 },
  { x: 62, y: 42 },
  { x: 58, y: 56 },
  { x: 64, y: 70 },
  { x: 52, y: 78 },
  { x: 48, y: 88 }
];

export default function WorkoutMap() {
  const { 
    workoutElapsedTime, 
    workoutSessionMode, 
    getTotalTime, 
    workoutPhases,
    gpsSignalQuality,
    workoutRoute
  } = useWorkout();

  const [expanded, setExpanded] = useState(false);

  // Compute total duration in seconds for the path drawing progress
  const totalDurationSeconds = useMemo(() => {
    if (workoutSessionMode) {
      return getTotalTime() * 60;
    }
    return 15 * 60;
  }, [workoutSessionMode, workoutPhases]);

  // Calculate path progress percentage (0.0 to 1.0)
  const progress = useMemo(() => {
    if (totalDurationSeconds === 0) return 0;
    const duration = Math.min(totalDurationSeconds, 300); 
    return Math.min(1, workoutElapsedTime / duration);
  }, [workoutElapsedTime, totalDurationSeconds]);

  // Map real-world GPS coordinates to 0-100 SVG space (dynamic bounding box fit)
  const pathPoints = useMemo(() => {
    if (workoutRoute.length < 2) return [];

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    workoutRoute.forEach((pt) => {
      if (pt.latitude < minLat) minLat = pt.latitude;
      if (pt.latitude > maxLat) maxLat = pt.latitude;
      if (pt.longitude < minLng) minLng = pt.longitude;
      if (pt.longitude > maxLng) maxLng = pt.longitude;
    });

    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;

    if (latRange === 0 || lngRange === 0) return [];

    // Map each coordinate to 0-100 viewbox with a 15px padding margin
    return workoutRoute.map((pt) => {
      const x = ((pt.longitude - minLng) / lngRange) * 70 + 15;
      const y = 85 - ((pt.latitude - minLat) / latRange) * 70; // Invert y for SVG space
      return { x, y };
    });
  }, [workoutRoute]);

  const isDemoMode = pathPoints.length === 0;

  // Decide whether to render the actual GPS route or the animated demo route
  const pointsToDraw = useMemo(() => {
    if (!isDemoMode) return pathPoints;
    
    if (TRAIL_POINTS.length === 0) return [];
    const count = Math.max(2, Math.floor(progress * TRAIL_POINTS.length));
    return TRAIL_POINTS.slice(0, count);
  }, [isDemoMode, pathPoints, progress]);

  const lastPoint = pointsToDraw[pointsToDraw.length - 1] || TRAIL_POINTS[0];
  const firstPoint = pointsToDraw[0] || TRAIL_POINTS[0];

  const pathData = useMemo(() => {
    if (pointsToDraw.length === 0) return "";
    return pointsToDraw.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [pointsToDraw]);

  const fullPathData = useMemo(() => {
    if (!isDemoMode) return ""; // No static background trail in actual GPS tracking mode
    return TRAIL_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [isDemoMode]);

  const renderMapContent = (isFullscreen = false) => {
    return (
      <View className="w-full h-full relative bg-[#121316]">
        {/* Map Background Image */}
        <Image
          source={require("../assets/images/image_19c407fa.jpg")}
          className="w-full h-full opacity-40"
          style={{ tintColor: "#555" }} // grayscale effect overlay
          resizeMode="cover"
        />
        
        {/* SVG Drawing Layer */}
        <View className="absolute inset-0">
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Background Full Track Trail (Shadow) - only in demo mode */}
            {isDemoMode && fullPathData ? (
              <Path
                d={fullPathData}
                stroke="#242629"
                strokeWidth={1.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {/* Active Highlighted Trail */}
            {pathData ? (
              <Path
                d={pathData}
                stroke="#daf900"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {/* Start Marker */}
            <Circle
              cx={firstPoint.x}
              cy={firstPoint.y}
              r={1.5}
              fill="#ababad"
            />

            {/* Pulsing GPS Dot at last point */}
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={2.5}
              fill="rgba(218, 249, 0, 0.4)"
            />
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={1.2}
              fill="#daf900"
            />
          </Svg>
        </View>

        {/* Live GPS Tag */}
        <View className="absolute top-4 left-4 flex-row items-center bg-[#0d0e10]/80 border border-[#ffffff0d] px-3 py-1.5 rounded-lg">
          <View 
            className={`w-2.5 h-2.5 rounded-full mr-2 ${
              gpsSignalQuality === "good" 
                ? "bg-[#daf900]" 
                : gpsSignalQuality === "poor"
                  ? "bg-[#f4e650]"
                  : "bg-[#ff7351]"
            }`} 
            style={{ 
              shadowColor: gpsSignalQuality === "good" ? "#daf900" : gpsSignalQuality === "poor" ? "#f4e650" : "#ff7351",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4 
            }} 
          />
          <Text className="text-[10px] font-lexendBold uppercase tracking-widest text-[#fdfbfe]">
            {gpsSignalQuality === "good" ? "Live GPS" : gpsSignalQuality === "poor" ? "Poor GPS" : "No GPS"}
          </Text>
        </View>

        {/* Fullscreen Expand / Close Button */}
        <View className="absolute bottom-4 right-4">
          <TouchableOpacity
            className="w-11 h-11 rounded-lg bg-[#0d0e10]/90 border border-[#ffffff0d] items-center justify-center active:opacity-80"
            onPress={() => setExpanded(!isFullscreen)}
          >
            <MaterialIcons
              name={isFullscreen ? "close" : "fullscreen"}
              size={24}
              color="#fdfbfe"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="w-full aspect-video rounded-3xl overflow-hidden border border-[#ffffff0d] bg-[#1e202280]">
      {renderMapContent(false)}

      {/* Expanded Map Modal */}
      <Modal visible={expanded} animationType="slide" transparent={false}>
        <View className="flex-1 bg-[#0d0e10] pt-12">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#ffffff0d]">
            <Text className="text-on-surface font-lexendBlack italic text-xl uppercase">
              GPS Route Map
            </Text>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-surface-highest items-center justify-center"
              onPress={() => setExpanded(false)}
            >
              <MaterialIcons name="close" size={20} color="#fdfbfe" />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            {renderMapContent(true)}
          </View>
        </View>
      </Modal>
    </View>
  );
}
