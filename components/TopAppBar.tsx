import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function TopAppBar({ title = "STRIDE" }) {
  return (
    <View className="absolute top-0 w-full z-50 bg-[#0d0e10] flex-row justify-between items-center px-6 py-4 pt-12">
      <View className="flex-row items-center gap-3">
        <MaterialIcons name="directions-walk" size={28} color="#f6ffc0" />
        <Text className="text-2xl text-[#f6ffc0] italic font-lexendExtraBold tracking-tight">
          {title}
        </Text>
      </View>
      <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 active:opacity-80">
        {/* Placeholder image, should be replaced with the downloaded avatar */}
        <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlCCLOIO2EtEXEYha-QKskE1y3k9j5QCjYx0es52YaurG1Glc_BIif-oKdY-_uGXkAXeXmTuKE2GPHk19J9VE_WR-IA2UV-HnCjS4qzZunrhgmeTGgxUNeJP7faRrfbkyEpY-aC_wLaHjjpzGQzAOXPU1hB2VdvFDI0_hdr0lTx824Nnq0irRu3jpS_gNycWPJOK50UH5hdJwygYiWC3a2eXqi32daRsVJhmrVAXr2n2BO4tJFdIyR8Whpmgv4CjXn48nA3aF8jeg' }}
            className="w-full h-full"
            resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}
