import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrder } from '../../context/OrderContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Topping } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Get topping visual data from the actual topping object (from admin)
const getToppingDisplay = (topping: Topping) => {
  return {
    emoji: topping.emoji || '🍬',
    color: topping.color || '#FFB74D',
  };
};

// Sauce colors
const getSauceColor = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('chocolate') || lower.includes('fudge')) return '#5C4033';
  if (lower.includes('caramel')) return '#D4A574';
  if (lower.includes('strawberry')) return '#E53935';
  if (lower.includes('peanut')) return '#C19A6B';
  return '#5C4033';
};

interface SharedCupProps {
  size?: number; // Cup width
  showSwirl?: boolean;
  showToppings?: boolean;
  showSauces?: boolean;
  fillLevel?: number; // 0-1 for how full the cup is (0.5 = 50%, etc.)
  animate?: boolean;
  selectedSizeId?: string; // For SizeStep preview
}

export const SharedCup: React.FC<SharedCupProps> = ({
  size = 160,
  showSwirl = true,
  showToppings = true,
  showSauces = true,
  fillLevel,
  animate = true,
  selectedSizeId,
}) => {
  const { order } = useOrder();

  // Animations
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const swirlAnim = useRef(new Animated.Value(0)).current;

  // Calculate fill level based on size if not provided
  const calculatedFillLevel = useMemo(() => {
    if (fillLevel !== undefined) return fillLevel;
    if (!order.cupSize && !selectedSizeId) return 0;

    const sizeId = selectedSizeId || order.cupSize?.id;
    switch (sizeId) {
      case 'small': return 0.5;
      case 'medium': return 0.75;
      case 'large': return 1;
      default: return 0;
    }
  }, [fillLevel, order.cupSize, selectedSizeId]);

  // Get flavor colors - spread equally based on number of flavors
  const flavorColors = useMemo(() => {
    if (order.flavors.length === 0) return ['#FFFFFF', '#F5F5F5'];
    if (order.flavors.length === 1) return [order.flavors[0].color, order.flavors[0].color];
    return order.flavors.map(f => f.color);
  }, [order.flavors]);

  // Generate gradient locations based on flavor count
  const gradientLocations = useMemo(() => {
    const count = flavorColors.length;
    return flavorColors.map((_, i) => i / (count - 1 || 1));
  }, [flavorColors]);

  useEffect(() => {
    if (animate) {
      // Wobble animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [animate]);

  useEffect(() => {
    // Fill animation
    Animated.timing(fillAnim, {
      toValue: calculatedFillLevel,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Swirl animation
    if (calculatedFillLevel > 0 && showSwirl) {
      Animated.spring(swirlAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [calculatedFillLevel, showSwirl]);

  const cupHeight = size * 1.3;
  const cupWidth = size;
  const swirlHeight = size * 0.6;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: cupWidth,
          transform: animate ? [
            {
              rotate: wobbleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['-2deg', '2deg'],
              }),
            },
          ] : [],
        },
      ]}
    >
      {/* Soft-serve swirl on top */}
      {showSwirl && calculatedFillLevel > 0 && (
        <Animated.View
          style={[
            styles.swirlContainer,
            {
              height: swirlHeight,
              marginBottom: -swirlHeight * 0.2,
              zIndex: 10,
              opacity: swirlAnim,
              transform: [{ scale: swirlAnim }],
            },
          ]}
        >
          {/* Swirl layers */}
          <View style={[styles.swirlLayer, styles.swirlLayer1, { backgroundColor: flavorColors[0], width: cupWidth * 0.65 }]} />
          <View style={[styles.swirlLayer, styles.swirlLayer2, { backgroundColor: flavorColors[flavorColors.length > 1 ? 1 : 0], width: cupWidth * 0.55 }]} />
          <View style={[styles.swirlLayer, styles.swirlLayer3, { backgroundColor: flavorColors[0], width: cupWidth * 0.45 }]} />
          <View style={[styles.swirlLayer, styles.swirlLayer4, { backgroundColor: flavorColors[flavorColors.length > 1 ? 1 : 0], width: cupWidth * 0.35 }]} />

          {/* Tip */}
          <View style={[styles.swirlTip, { backgroundColor: flavorColors[flavorColors.length > 2 ? 2 : 0] }]} />

          {/* Highlights */}
          <View style={styles.swirlHighlight1} />
          <View style={styles.swirlHighlight2} />

          {/* Toppings on swirl */}
          {showToppings && order.toppings.length > 0 && (
            <View style={styles.toppingsOnSwirl}>
              {order.toppings.slice(0, 6).map((sel, i) => {
                const display = getToppingDisplay(sel.topping);
                const positions = [
                  { top: 15, left: '15%' },
                  { top: 25, left: '60%' },
                  { top: 5, left: '40%' },
                  { top: 35, left: '25%' },
                  { top: 20, left: '75%' },
                  { top: 40, left: '50%' },
                ];
                const pos = positions[i % positions.length];
                return (
                  <Text
                    key={sel.topping.id}
                    style={[
                      styles.toppingEmoji,
                      { top: pos.top, left: pos.left as any },
                    ]}
                  >
                    {display.emoji}
                  </Text>
                );
              })}
            </View>
          )}

          {/* Sauce drizzles on swirl */}
          {showSauces && order.sauces.length > 0 && (
            <View style={styles.sauceDrizzles}>
              {order.sauces.map((sauce, i) => {
                const sauceColor = getSauceColor(sauce.name);
                return (
                  <View
                    key={sauce.id}
                    style={[
                      styles.drizzle,
                      {
                        backgroundColor: sauceColor,
                        left: 15 + i * 25,
                        height: 50 + (i % 2) * 20,
                        transform: [{ rotate: `${-15 + i * 10}deg` }],
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}
        </Animated.View>
      )}

      {/* Cup body */}
      <View style={[styles.cup, { width: cupWidth, height: cupHeight }]}>
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5', '#EEEEEE'] as const}
          style={[
            styles.cupGradient,
            { borderBottomLeftRadius: cupWidth * 0.35, borderBottomRightRadius: cupWidth * 0.35 },
          ]}
        >
          {/* Cup rim */}
          <View style={[styles.cupRim, { width: cupWidth + 12 }]} />

          {/* Yogurt fill inside - animated height based on fill level */}
          <Animated.View
            style={[
              styles.yogurtFill,
              {
                height: fillAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, cupHeight * 0.65],
                }),
                bottom: 15,
              },
            ]}
          >
            <LinearGradient
              colors={flavorColors.length > 1 ? flavorColors as [string, string, ...string[]] : [flavorColors[0], flavorColors[0]] as [string, string]}
              locations={gradientLocations}
              style={styles.yogurtGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </Animated.View>

          {/* Cup stripes */}
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.cupStripe, { top: 30 + i * (cupHeight / 6) }]} />
          ))}

          {/* Brand logo */}
          <View style={styles.cupBrand}>
            <Text style={styles.cupBrandText}>Yo-V</Text>
          </View>

          {/* Shine effect */}
          <View style={[styles.cupShine, { height: cupHeight * 0.5 }]} />
        </LinearGradient>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: cupWidth * 0.6 }]} />

      {/* Flavor label */}
      {order.flavors.length > 0 && (
        <View style={styles.flavorLabel}>
          <Text style={styles.flavorLabelText} numberOfLines={1}>
            {order.flavors.map(f => f.name).join(' + ')}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// Empty cup for size selection
export const EmptyCup: React.FC<{
  sizeId: string;
  cupWidth?: number;
  isSelected?: boolean;
}> = ({ sizeId, cupWidth = 120, isSelected = false }) => {
  const fillLevel = sizeId === 'small' ? 0.5 : sizeId === 'medium' ? 0.75 : 1;
  const cupHeight = cupWidth * 1.2;

  const fillAnim = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      // Animate fill
      Animated.timing(fillAnim, {
        toValue: fillLevel,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // Wobble
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      fillAnim.setValue(0);
      wobbleAnim.setValue(0);
    }
  }, [isSelected, fillLevel]);

  return (
    <Animated.View
      style={[
        styles.emptyCupContainer,
        { width: cupWidth },
        isSelected && {
          transform: [
            {
              rotate: wobbleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['-2deg', '2deg'],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.cup, { width: cupWidth, height: cupHeight }]}>
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5', '#EEEEEE'] as const}
          style={[
            styles.cupGradient,
            { borderBottomLeftRadius: cupWidth * 0.35, borderBottomRightRadius: cupWidth * 0.35 },
          ]}
        >
          {/* Cup rim */}
          <View style={[styles.cupRim, { width: cupWidth + 10 }]} />

          {/* Yogurt fill - animated */}
          <Animated.View
            style={[
              styles.yogurtFill,
              {
                height: fillAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, cupHeight * 0.7],
                }),
                bottom: 10,
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8F8F8'] as const}
              style={styles.yogurtGradient}
            />
          </Animated.View>

          {/* Empty indicator when not selected */}
          {!isSelected && (
            <View style={styles.emptyIndicator}>
              <Text style={styles.emptyIndicatorText}>Empty</Text>
            </View>
          )}

          {/* Cup stripes */}
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.cupStripe, { top: 25 + i * (cupHeight / 5) }]} />
          ))}

          {/* Brand logo */}
          <View style={[styles.cupBrand, { bottom: '25%' }]}>
            <Text style={[styles.cupBrandText, { fontSize: 12 }]}>Yo-V</Text>
          </View>

          {/* Shine effect */}
          <View style={[styles.cupShine, { height: cupHeight * 0.4 }]} />
        </LinearGradient>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: cupWidth * 0.5 }]} />

      {/* Fill percentage label */}
      {isSelected && (
        <View style={styles.fillLabel}>
          <Text style={styles.fillLabelText}>{Math.round(fillLevel * 100)}% fill</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyCupContainer: {
    alignItems: 'center',
  },
  swirlContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  swirlLayer: {
    position: 'absolute',
    height: 24,
    borderRadius: 50,
  },
  swirlLayer1: {
    bottom: 0,
  },
  swirlLayer2: {
    bottom: 15,
    transform: [{ rotate: '-5deg' }],
  },
  swirlLayer3: {
    bottom: 28,
    transform: [{ rotate: '8deg' }],
  },
  swirlLayer4: {
    bottom: 40,
    transform: [{ rotate: '-3deg' }],
  },
  swirlTip: {
    position: 'absolute',
    width: 18,
    height: 28,
    bottom: 52,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '12deg' }],
  },
  swirlHighlight1: {
    position: 'absolute',
    width: 12,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    bottom: 50,
    left: '25%',
    transform: [{ rotate: '-10deg' }],
  },
  swirlHighlight2: {
    position: 'absolute',
    width: 8,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    bottom: 20,
    right: '25%',
  },
  toppingsOnSwirl: {
    ...StyleSheet.absoluteFillObject,
  },
  toppingEmoji: {
    position: 'absolute',
    fontSize: 14,
  },
  sauceDrizzles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  drizzle: {
    position: 'absolute',
    width: 4,
    top: 5,
    borderRadius: 2,
  },
  cup: {
    overflow: 'hidden',
  },
  cupGradient: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    ...shadows.medium,
  },
  cupRim: {
    position: 'absolute',
    top: -4,
    left: -6,
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  yogurtFill: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  yogurtGradient: {
    flex: 1,
  },
  emptyIndicator: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  emptyIndicatorText: {
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  cupStripe: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  cupBrand: {
    position: 'absolute',
    bottom: '30%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cupBrandText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 1,
  },
  cupShine: {
    position: 'absolute',
    top: 20,
    left: 15,
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
  },
  cupShadow: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  flavorLabel: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    ...shadows.small,
  },
  flavorLabelText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.text.primary,
    textAlign: 'center',
  },
  fillLabel: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  fillLabelText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.accent.gold,
  },
});

export default SharedCup;
