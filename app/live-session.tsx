import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function LiveSessionScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect immediately to the main WALK tab which now displays the active session dashboard
    router.replace("/(tabs)");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0d0e10", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#daf900" />
    </View>
  );
}
