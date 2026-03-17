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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const CARD_HEIGHT = Math.min(520, SCREEN_HEIGHT * 0.55);

interface FlavorCardProps {
  flavor: Flavor;
  isActive: boolean;
  onPress?: () => void;
}

const FlavorCard: React.FC<FlavorCardProps> = ({ flavor, isActive, onPress }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -6,
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
          { transform: [{ translateY: floatAnim }] },
        ]}
      >
        {/* Yogurt Swirl */}
        <View style={styles.yogurtWrapper}>
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
          <View style={[styles.swirlTop, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>
          <View style={[styles.swirlMiddle, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
            <View style={[styles.swirlShadow, { backgroundColor: yogurtColor }]} />
          </View>
          <View style={[styles.swirlLower, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>
          <View style={[styles.swirlBottom, { backgroundColor: yogurtColor }]}>
            <View style={styles.swirlHighlight} />
          </View>
        </View>

        {/* Cup */}
        <View style={styles.cup}>
          <View style={styles.cupRimOuter}>
            <View style={styles.cupRim} />
          </View>
          <View style={styles.cupBody}>
            <View style={styles.cupPattern}>
              <View style={[styles.cupStripe, { backgroundColor: yogurtColor + '20' }]} />
              <View style={[styles.cupStripe, { backgroundColor: yogurtColor + '15' }]} />
              <View style={[styles.cupStripe, { backgroundColor: yogurtColor + '10' }]} />
            </View>
            <View style={styles.brandContainer}>
              <Text style={styles.cupBrand}>YO-VAZALUZA</Text>
              <Text style={styles.cupSubBrand}>DALIPI</Text>
            </View>
            <View style={styles.cupShine} />
          </View>
        </View>

        {/* Shadow */}
        <View style={styles.cupShadow} />
      </Animated.View>
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={onPress} disabled={!onPress}>
      <View style={styles.card}>
        <LinearGradient
          colors={['#FFFFFF', flavor.color + '08', flavor.color + '15']}
          locations={[0, 0.6, 1]}
          style={styles.cardGradient}
        >
          {/* Background decoration */}
          <View style={[styles.bgCircle, { backgroundColor: flavor.color + '15' }]} />
          <View style={[styles.bgCircle2, { backgroundColor: flavor.color + '10' }]} />

          {/* Yogurt Cup - compact */}
          {renderYogurtCup()}

          {/* Info Section - prominent */}
          <View style={styles.infoSection}>
            {/* Flavor name with color accent */}
            <View style={styles.nameRow}>
              <View style={[styles.colorAccent, { backgroundColor: flavor.color }]} />
              <Text style={styles.flavorName} numberOfLines={1}>{flavor.name}</Text>
            </View>

            {/* Description */}
            <Text style={styles.flavorDescription} numberOfLines={2}>{flavor.description}</Text>

            {/* Details row */}
            <View style={styles.detailsRow}>
              {/* Badges */}
              <View style={styles.badgeContainer}>
                {flavor.isVegan && (
                  <LinearGradient
                    colors={[colors.flavors.pistachio, '#6B8E23']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.badge}
                  >
                    <Ionicons name="leaf" size={11} color="#FFF" />
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
                    <Ionicons name="sparkles" size={11} color="#FFF" />
                    <Text style={styles.badgeText}>New</Text>
                  </LinearGradient>
                )}
              </View>

              {/* Calories */}
              {flavor.calories ? (
                <View style={styles.caloriesBadge}>
                  <Ionicons name="flame-outline" size={13} color={colors.accent.gold} />
                  <Text style={styles.caloriesText}>{flavor.calories} cal</Text>
                </View>
              ) : null}
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
    height: CARD_HEIGHT,
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
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  bgCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 80,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  cupContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: spacing.lg,
    flex: 1,
  },
  yogurtWrapper: {
    alignItems: 'center',
    marginBottom: -12,
    transform: [{ scale: 0.75 }],
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
    height: 85,
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
    fontSize: 13,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  cupSubBrand: {
    fontSize: 7,
    fontWeight: '600',
    color: colors.accent.gold,
    letterSpacing: 3,
    marginTop: 1,
  },
  cupShine: {
    position: 'absolute',
    top: 8,
    left: 15,
    width: 10,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
    transform: [{ rotate: '8deg' }],
  },
  cupShadow: {
    width: 90,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 45,
    marginTop: spacing.xs,
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  colorAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  flavorName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  flavorDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm + 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.sm + 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    backgroundColor: colors.accent.gold + '15',
    borderRadius: borderRadius.round,
    gap: 4,
  },
  caloriesText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
  },
});

export default FlavorCard;
