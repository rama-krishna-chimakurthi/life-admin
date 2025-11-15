// src/components/AppIcon.tsx
import React from 'react';
import { View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface AppIconProps {
  size?: number;
  style?: any;
}

export default function AppIcon({ size = 48, style }: AppIconProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.2,
          backgroundColor: '#3778C2',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
    >
      <View style={{ position: 'relative' }}>
        <MaterialIcons 
          name="account-balance-wallet" 
          size={size * 0.8} 
          color="#fff" 
        />
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size * 0.1,
            backgroundColor: '#2ed573',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons 
            name="checkmark" 
            size={size * 0.12} 
            color="#fff" 
          />
        </View>
      </View>
    </View>
  );
}