import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Flavor } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface FlavorCardProps {
  flavor: Flavor;
  isActive: boolean;
  onPress?: () => void;
}

const FlavorCard: React.FC<FlavorCardProps> = ({ flavor, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.85,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.6,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const renderYogurtCup = () => {
    const yogurtColor = flavor.color;

    return (
      <View style={styles.cupContainer}>
        {/* Yogurt Swirl - using styled views */}
        <View style={styles.yogurtWrapper}>
          {/* Top swirl */}
          <View style={[styles.swirlTop, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>
          {/* Middle swirl */}
          <View style={[styles.swirlMiddle, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>
          {/* Bottom swirl */}
          <View style={[styles.swirlBottom, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>
        </View>

        {/* Cup */}
        <View style={styles.cup}>
          <View style={styles.cupRim} />
          <View style={styles.cupBody}>
            <Text style={styles.cupBrand}>YO-VAZALUZA</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F8F8']}
          style={styles.cardGradient}
        >
          {/* Yogurt Cup Illustration */}
          {renderYogurtCup()}

          {/* Info Circle */}
          <View style={styles.infoCircle}>
            <Text style={styles.flavorName}>{flavor.name}</Text>
            <Text style={styles.flavorDescription}>{flavor.description}</Text>

            {/* Badges */}
            <View style={styles.badgeContainer}>
              {flavor.isVegan && (
                <View style={[styles.badge, styles.veganBadge]}>
                  <Ionicons name="leaf" size={10} color={colors.text.light} />
                  <Text style={styles.badgeText}>Vegan</Text>
                </View>
              )}
              {flavor.isNew && (
                <View style={[styles.badge, styles.newBadge]}>
                  <Ionicons name="sparkles" size={10} color={colors.text.light} />
                  <Text style={styles.badgeText}>New</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 420,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  cupContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 220,
  },
  yogurtWrapper: {
    alignItems: 'center',
    marginBottom: -10,
  },
  swirlTop: {
    width: 40,
    height: 35,
    borderRadius: 20,
    transform: [{ rotate: '-5deg' }],
  },
  swirlMiddle: {
    width: 70,
    height: 45,
    borderRadius: 35,
    marginTop: -15,
    transform: [{ rotate: '5deg' }],
  },
  swirlBottom: {
    width: 90,
    height: 50,
    borderRadius: 45,
    marginTop: -20,
  },
  swirlHighlight: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: '30%',
    height: '25%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 50,
  },
  cup: {
    alignItems: 'center',
    width: 120,
  },
  cupRim: {
    width: 110,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 1,
  },
  cupBody: {
    width: 100,
    height: 65,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: -2,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cupBrand: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.darkGray,
    letterSpacing: 0.5,
  },
  infoCircle: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    width: '90%',
    ...shadows.medium,
  },
  flavorName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  flavorDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  veganBadge: {
    backgroundColor: colors.flavors.pistachio,
  },
  newBadge: {
    backgroundColor: colors.accent.gold,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.light,
  },
});

export default FlavorCard;
