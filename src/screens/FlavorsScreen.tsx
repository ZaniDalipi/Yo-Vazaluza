import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlavorSlider, MagicalParticles } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography } from '../theme';
import { Flavor } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FlavorsScreen: React.FC = () => {
  const { flavors } = useApp();
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const handleFlavorSelect = (flavor: Flavor) => {
    setSelectedFlavor(flavor);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background */}
      <LinearGradient
        colors={[colors.background.main, '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Particles */}
      <MagicalParticles
        count={10}
        colors={[
          colors.accent.gold + '40',
          colors.accent.cream + '40',
          colors.flavors.strawberry + '30',
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>OUR FLAVOURS</Text>

          {/* Animated Arrow */}
          <Animated.View
            style={[
              styles.arrowContainer,
              {
                transform: [{ translateY: arrowTranslate }],
              },
            ]}
          >
            <Text style={styles.arrow}>↓</Text>
          </Animated.View>
        </Animated.View>

        {/* Flavor Slider */}
        <View style={styles.sliderContainer}>
          <FlavorSlider flavors={flavors} onFlavorSelect={handleFlavorSelect} />
        </View>

        {/* Flavor Count */}
        <View style={styles.footer}>
          <Text style={styles.flavorCount}>
            {flavors.length} Delicious Flavors
          </Text>
          <Text style={styles.subtitle}>
            Swipe to explore our collection
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  arrowContainer: {
    marginTop: spacing.md,
  },
  arrow: {
    fontSize: 32,
    color: colors.primary.gray,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  flavorCount: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.accent.gold,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

export default FlavorsScreen;
