import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}

interface MagicalParticlesProps {
  count?: number;
  colors?: string[];
}

const MagicalParticles: React.FC<MagicalParticlesProps> = ({
  count = 20,
  colors: particleColors = [
    colors.accent.gold,
    colors.accent.cream,
    '#FFFFFF',
    colors.flavors.strawberry,
    colors.flavors.blueberry,
  ],
}) => {
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Initialize particles
    particles.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(Math.random() * SCREEN_HEIGHT),
      opacity: new Animated.Value(Math.random() * 0.5 + 0.2),
      scale: new Animated.Value(Math.random() * 0.5 + 0.3),
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }));

    // Animate each particle
    particles.current.forEach((particle) => {
      animateParticle(particle);
    });
  }, []);

  const animateParticle = (particle: Particle) => {
    const duration = Math.random() * 5000 + 3000;
    const newX = Math.random() * SCREEN_WIDTH;
    const newY = Math.random() * SCREEN_HEIGHT;

    Animated.parallel([
      Animated.timing(particle.x, {
        toValue: newX,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.y, {
        toValue: newY,
        duration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.6 + 0.2,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.3,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: Math.random() * 0.8 + 0.2,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: Math.random() * 0.4 + 0.2,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => animateParticle(particle));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default MagicalParticles;
