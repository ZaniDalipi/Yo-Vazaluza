import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface AnimatedLogoProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 120,
  color = colors.accent.gold,
  animated = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Star animations
  const star1Opacity = useRef(new Animated.Value(0)).current;
  const star2Opacity = useRef(new Animated.Value(0)).current;
  const star3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Main logo animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Twinkling stars animation
      const createTwinkle = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
      };

      createTwinkle(star1Opacity, 0).start();
      createTwinkle(star2Opacity, 300).start();
      createTwinkle(star3Opacity, 600).start();

      // Subtle floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
      star1Opacity.setValue(1);
      star2Opacity.setValue(1);
      star3Opacity.setValue(1);
    }
  }, [animated]);

  const translateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY }],
        },
      ]}
    >
      {/* Main ice cream icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="ice-cream" size={size * 0.6} color={color} />
      </View>

      {/* Animated stars */}
      <Animated.View style={[styles.star, styles.star1, { opacity: star1Opacity }]}>
        <Ionicons name="sparkle" size={size * 0.12} color={color} />
      </Animated.View>
      <Animated.View style={[styles.star, styles.star2, { opacity: star2Opacity }]}>
        <Ionicons name="sparkle" size={size * 0.08} color={color} />
      </Animated.View>
      <Animated.View style={[styles.star, styles.star3, { opacity: star3Opacity }]}>
        <Ionicons name="sparkle" size={size * 0.1} color={color} />
      </Animated.View>

      {/* Small decorative dots */}
      <View style={[styles.dot, styles.dot1, { backgroundColor: color }]} />
      <View style={[styles.dot, styles.dot2, { backgroundColor: color }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: '10%',
    right: '10%',
  },
  star2: {
    top: '25%',
    right: '5%',
  },
  star3: {
    top: '5%',
    right: '20%',
  },
  dot: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.5,
  },
  dot1: {
    width: 4,
    height: 4,
    bottom: '20%',
    left: '15%',
  },
  dot2: {
    width: 3,
    height: 3,
    bottom: '30%',
    left: '10%',
  },
});

export default AnimatedLogo;
