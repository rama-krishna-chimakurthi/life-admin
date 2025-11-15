// src/components/SwipeableRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SwipeableRow({ children, onEdit, onDelete }: SwipeableRowProps) {
  const renderRightActions = (progress: Animated.AnimatedAddition, dragX: Animated.AnimatedAddition) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            style={{
              backgroundColor: '#3778C2',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={{
              backgroundColor: '#ff4757',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
}