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
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

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
    height: 480,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  cupContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 260,
  },
  yogurtWrapper: {
    alignItems: 'center',
    marginBottom: -10,
  },
  swirlTop: {
    width: 50,
    height: 45,
    borderRadius: 25,
    transform: [{ rotate: '-5deg' }],
  },
  swirlMiddle: {
    width: 85,
    height: 55,
    borderRadius: 42,
    marginTop: -18,
    transform: [{ rotate: '5deg' }],
  },
  swirlBottom: {
    width: 110,
    height: 60,
    borderRadius: 55,
    marginTop: -24,
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
    width: 140,
  },
  cupRim: {
    width: 130,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 1,
  },
  cupBody: {
    width: 118,
    height: 75,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -2,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cupBrand: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary.darkGray,
    letterSpacing: 0.5,
  },
  infoCircle: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
