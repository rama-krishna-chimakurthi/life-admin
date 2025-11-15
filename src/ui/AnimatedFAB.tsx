// src/ui/AnimatedFAB.tsx
import React, { useEffect } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AntDesign } from "@expo/vector-icons";

const AView = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedFAB({ onPress }: any) {
  const mounted = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    mounted.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
  }, []);

  const style = useAnimatedStyle(() => {
    const scale = pressed.value ? withSpring(0.93) : withSpring(1);
    const appear = mounted.value;
    return {
      transform: [{ scale: appear * scale }],
      opacity: appear,
      shadowOpacity: appear ? 0.35 : 0,
      shadowRadius: 12 * appear,
      elevation: 8 * appear,
    };
  });

  return (
    <AView
      style={[styles.fab, style]}
      activeOpacity={0.9}
      onPressIn={() => (pressed.value = 1)}
      onPressOut={() => (pressed.value = 0)}
      onPress={onPress}
    >
      <AntDesign name="plus" size={22} color="#fff" />
    </AView>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 22,
    bottom: 22,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 6 },
  },
});
