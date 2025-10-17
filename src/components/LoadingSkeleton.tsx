import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface LoadingSkeletonProps {
  count?: number;
}

const SkeletonItem: React.FC = () => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = StyleSheet.create({
    skeletonItem: {
      backgroundColor: colors.cardBackground,
      marginBottom: 8,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    skeletonIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.border,
      marginRight: 12,
    },
    skeletonContent: {
      flex: 1,
    },
    skeletonTitle: {
      height: 18,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginBottom: 8,
      width: "60%",
    },
    skeletonSubtitle: {
      height: 14,
      backgroundColor: colors.border,
      borderRadius: 4,
      width: "40%",
    },
  });

  return (
    <Animated.View style={[styles.skeletonItem, { opacity }]}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>
    </Animated.View>
  );
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default LoadingSkeleton;