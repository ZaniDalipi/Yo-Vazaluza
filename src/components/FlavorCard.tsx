import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Flavor } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;

interface FlavorCardProps {
  flavor: Flavor;
  isActive: boolean;
  onPress?: () => void;
}

const FlavorCard: React.FC<FlavorCardProps> = ({ flavor, isActive, onPress }) => {
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Gentle float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shine effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  const renderYogurtCup = () => {
    const yogurtColor = flavor.color;

    return (
      <Animated.View
        style={[
          styles.cupContainer,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {/* Large Yogurt Swirl */}
        <View style={styles.yogurtWrapper}>
          {/* Top peak swirl */}
          <View style={[styles.swirlPeak, { backgroundColor: yogurtColor }]}>
            <Animated.View
              style={[
                styles.swirlShine,
                {
                  opacity: shineAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.2, 0.6, 0.2],
                  }),
                },
              ]}
            />
          </View>

          {/* Upper swirl */}
          <View style={[styles.swirlTop, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>

          {/* Middle swirl */}
          <View style={[styles.swirlMiddle, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
            <View style={[styles.swirlShadow, { backgroundColor: yogurtColor }]} />
          </View>

          {/* Lower swirl */}
          <View style={[styles.swirlLower, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>

          {/* Bottom base */}
          <View style={[styles.swirlBottom, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>
        </View>

        {/* Large Cup */}
        <View style={styles.cup}>
          {/* Cup rim with shadow */}
          <View style={styles.cupRimOuter}>
            <View style={styles.cupRim} />
          </View>

          {/* Cup body */}
          <View style={styles.cupBody}>
            {/* Cup pattern */}
            <View style={styles.cupPattern}>
              <View style={[styles.cupStripe, { backgroundColor: yogurtColor + '20' }]} />
              <View style={[styles.cupStripe, { backgroundColor: yogurtColor + '15' }]} />
              <View style={[styles.cupStripe, { backgroundColor: yogurtColor + '10' }]} />
            </View>

            {/* Brand */}
            <View style={styles.brandContainer}>
              <Text style={styles.cupBrand}>YO-VAZALUZA</Text>
              <Text style={styles.cupSubBrand}>DALIPI</Text>
            </View>

            {/* Cup shine */}
            <View style={styles.cupShine} />
          </View>
        </View>

        {/* Shadow under cup */}
        <View style={styles.cupShadow} />
      </Animated.View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={['#FFFFFF', flavor.color + '08', flavor.color + '12']}
          locations={[0, 0.7, 1]}
          style={styles.cardGradient}
        >
          {/* Background decoration */}
          <View style={[styles.bgCircle, { backgroundColor: flavor.color + '18' }]} />
          <View style={[styles.bgCircle2, { backgroundColor: flavor.color + '12' }]} />

          {/* Yogurt Cup Illustration */}
          {renderYogurtCup()}

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={[styles.colorDot, { backgroundColor: flavor.color }]} />
            <Text style={styles.flavorName}>{flavor.name}</Text>
            <Text style={styles.flavorDescription}>{flavor.description}</Text>

            {/* Badges */}
            <View style={styles.badgeContainer}>
              {flavor.isVegan && (
                <LinearGradient
                  colors={[colors.flavors.pistachio, '#6B8E23']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Ionicons name="leaf" size={12} color="#FFF" />
                  <Text style={styles.badgeText}>Vegan</Text>
                </LinearGradient>
              )}
              {flavor.isNew && (
                <LinearGradient
                  colors={[colors.accent.gold, '#E6A100']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Ionicons name="sparkles" size={12} color="#FFF" />
                  <Text style={styles.badgeText}>New</Text>
                </LinearGradient>
              )}
              {flavor.calories && (
                <View style={styles.caloriesBadge}>
                  <Text style={styles.caloriesText}>{flavor.calories} cal</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 580,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.xl + 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 18,
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
  },
  bgCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 50,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  cupContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 380,
    paddingTop: spacing.xl,
  },
  yogurtWrapper: {
    alignItems: 'center',
    marginBottom: -15,
  },
  swirlPeak: {
    width: 35,
    height: 40,
    borderRadius: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    transform: [{ rotate: '-8deg' }],
    overflow: 'hidden',
  },
  swirlShine: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 12,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
  },
  swirlTop: {
    width: 70,
    height: 55,
    borderRadius: 35,
    marginTop: -20,
    transform: [{ rotate: '6deg' }],
    overflow: 'hidden',
  },
  swirlMiddle: {
    width: 110,
    height: 70,
    borderRadius: 55,
    marginTop: -25,
    transform: [{ rotate: '-4deg' }],
    overflow: 'hidden',
  },
  swirlLower: {
    width: 140,
    height: 75,
    borderRadius: 70,
    marginTop: -30,
    transform: [{ rotate: '3deg' }],
    overflow: 'hidden',
  },
  swirlBottom: {
    width: 165,
    height: 80,
    borderRadius: 82,
    marginTop: -35,
    overflow: 'hidden',
  },
  swirlHighlight: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: '35%',
    height: '30%',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 50,
  },
  swirlShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    opacity: 0.3,
  },
  cup: {
    alignItems: 'center',
    width: 200,
  },
  cupRimOuter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cupRim: {
    width: 180,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    zIndex: 1,
  },
  cupBody: {
    width: 165,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginTop: -3,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cupPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cupStripe: {
    width: 3,
    height: '100%',
  },
  brandContainer: {
    alignItems: 'center',
  },
  cupBrand: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  cupSubBrand: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.accent.gold,
    letterSpacing: 3,
    marginTop: 2,
  },
  cupShine: {
    position: 'absolute',
    top: 8,
    left: 15,
    width: 12,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 6,
    transform: [{ rotate: '8deg' }],
  },
  cupShadow: {
    width: 120,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 60,
    marginTop: spacing.sm,
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  flavorName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  flavorDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    gap: 5,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  caloriesBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  caloriesText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
  },
});

export default FlavorCard;
