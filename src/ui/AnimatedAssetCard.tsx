// src/ui/AnimatedAssetCard.tsx
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type Asset = {
  id: string;
  title: string;
  balance: number;
  type?: string;
  color?: string;
};

export default function AnimatedAssetCard({
  asset,
  onPress,
  isLastOdd = false,
}: {
  asset: Asset;
  onPress?: (a: Asset) => void;
  isLastOdd?: boolean;
}) {
  const pressed = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(pressed.value ? 0.95 : 1) }],
    };
  });

  const getGradientColors = () => {
    if (asset.type === 'bank') {
      return ['#6C5CE7', '#3B3B98']; // Purple gradient
    } else if (asset.type === 'cash') {
      return ['#00B894', '#00A085']; // Green gradient
    } else if (asset.type === 'credit') {
      return ['#FD79A8', '#E84393']; // Pink gradient
    }
    return ['#74B9FF', '#0984E3']; // Default blue gradient
  };

  return (
    <Animated.View style={[styles.wrapper, isLastOdd && styles.fullWidth, cardStyle]}>
      <TouchableOpacity
        onPressIn={() => (pressed.value = 1)}
        onPressOut={() => (pressed.value = 0)}
        onPress={() => onPress && onPress(asset)}
        activeOpacity={1}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.card}
        >
          <Text style={styles.title}>{asset.title}</Text>
          <Text style={styles.balance}>
            ₹{Number(asset.balance).toLocaleString()}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginHorizontal: '1%',
    marginTop: 8,
  },
  fullWidth: {
    width: '98%',
  },
  card: {
    height: 140,
    borderRadius: 14,
    padding: 16,
    justifyContent: "flex-end",
  },
  title: {
    color: "#FFFFFFAA",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  balance: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
