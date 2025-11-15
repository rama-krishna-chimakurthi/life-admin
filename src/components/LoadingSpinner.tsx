// src/components/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f6f8fb' 
    }}>
      <ActivityIndicator size="large" color="#3778C2" />
      <Text style={{ marginTop: 16, color: '#666' }}>{message}</Text>
    </View>
  );
}