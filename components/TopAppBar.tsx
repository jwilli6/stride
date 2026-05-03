import { useWorkout } from "@/context/WorkoutContext";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function TopAppBar({ title = "STRIDE" }) {
  const { avatarUri } = useWorkout();
  return (
    <View className="absolute top-0 w-full z-50 bg-[#0d0e10] flex-row justify-between items-center px-6 py-4 pt-12">
      <View className="flex-row items-center gap-3">
        <MaterialIcons name="directions-walk" size={28} color="#f6ffc0" />
        <Text className="text-2xl text-[#f6ffc0] italic font-lexendExtraBold tracking-tight">
          {title}
        </Text>
      </View>
      <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 active:opacity-80">
        <Image
          source={
            avatarUri
              ? { uri: avatarUri }
              : require("../assets/images/image_0a21f247.jpg")
          }
          className="w-full h-full"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}
