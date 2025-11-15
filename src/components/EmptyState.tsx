// src/components/EmptyState.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
}

export default function EmptyState({ 
  title, 
  message, 
  actionText, 
  onAction, 
  iconName = 'description' 
}: EmptyStateProps) {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 32 
    }}>
      <MaterialIcons name={iconName} size={64} color="#ccc" style={{ marginBottom: 16 }} />
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        textAlign: 'center', 
        marginBottom: 8 
      }}>
        {title}
      </Text>
      <Text style={{ 
        color: '#666', 
        textAlign: 'center', 
        marginBottom: 24 
      }}>
        {message}
      </Text>
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            backgroundColor: '#3778C2',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}