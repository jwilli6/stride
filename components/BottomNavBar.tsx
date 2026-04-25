import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="absolute bottom-0 left-0 w-full z-50 flex-row justify-around items-center px-4 pb-8 pt-4 bg-[#121316]/90 border-t border-outline-variant/10" style={styles.shadow}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        // Determine icon name based on route name
        let iconName: keyof typeof MaterialIcons.glyphMap = 'help';
        let label = options.title || route.name;
        
        if (route.name === 'index') {
          iconName = 'explore';
          label = 'Walk';
        } else if (route.name === 'history') {
          iconName = 'history';
          label = 'History';
        } else if (route.name === 'music') {
          iconName = 'speed';
          label = 'Music';
        } else if (route.name === 'settings') {
          iconName = 'settings';
          label = 'Settings';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            className={`flex-col items-center justify-center p-2 rounded-lg ${isFocused ? 'bg-[#1e2022]' : ''}`}
            style={{ width: 64, height: 56 }}
          >
            <MaterialIcons 
                name={iconName} 
                size={24} 
                color={isFocused ? '#f6ffc0' : '#ababad'} 
                style={{ opacity: isFocused ? 1 : 0.6, marginBottom: 4 }} 
            />
            <Text className={`font-lexend text-[10px] uppercase tracking-widest ${isFocused ? 'text-[#f6ffc0]' : 'text-[#ababad] opacity-60'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'rgba(246, 255, 192, 0.08)',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 24,
        elevation: 10,
    }
});
