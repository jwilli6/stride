import React from 'react';
import { Tabs } from 'expo-router';

import { BottomNavBar } from '@/components/BottomNavBar';
import { TopAppBar } from '@/components/TopAppBar';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <Tabs
        tabBar={(props) => <BottomNavBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen name="index" options={{ title: 'Walk' }} />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="music" options={{ title: 'Music' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </View>
  );
}

