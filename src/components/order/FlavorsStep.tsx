import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Flavor } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.4, 160);
const CUP_HEIGHT = CUP_WIDTH * 1.15;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

// Realistic froyo cup preview with mixed flavor colors inside
const CupPreview: React.FC = () => {
  const { order } = useOrder();
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  // Calculate fill level based on selected size
  const fillLevel = useMemo(() => {
    if (!order.cupSize) return 0.75;
    switch (order.cupSize.size) {
      case 'small': return 0.5;
      case 'medium': return 0.75;
      case 'large': return 1;
      default: return 0.75;
    }
  }, [order.cupSize]);

  // Get flavor colors - for swirl mixing effect
  const flavorColors = useMemo(() => {
    if (order.flavors.length === 0) return ['#FFFFFF', '#F8F8F8'];
    if (order.flavors.length === 1) return [order.flavors[0].color, order.flavors[0].color];
    return order.flavors.map(f => f.color);
  }, [order.flavors]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cupBottomWidth = CUP_WIDTH * 0.7;

  return (
    <Animated.View
      style={[
        styles.cupPreviewContainer,
        {
          transform: [
            {
              rotate: wobbleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['-1deg', '1deg'],
              }),
            },
          ],
        },
      ]}
    >
      {/* Cup body */}
      <View style={[styles.cupBody, { width: CUP_WIDTH, height: CUP_HEIGHT }]}>
        <View style={[
          styles.cupOuter,
          {
            width: CUP_WIDTH,
            height: CUP_HEIGHT,
            borderBottomLeftRadius: cupBottomWidth * 0.5,
            borderBottomRightRadius: cupBottomWidth * 0.5,
          }
        ]}>
          {/* Rim */}
          <View style={[styles.cupRim, { width: CUP_WIDTH + 8 }]}>
            <View style={styles.rimInner} />
          </View>

          {/* Cup wall */}
          <LinearGradient
            colors={['#FAFAFA', '#F0F0F0', '#E8E8E8'] as const}
            style={styles.cupWall}
          >
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.cupStripe, { top: 18 + i * (CUP_HEIGHT * 0.22) }]} />
            ))}
            <View style={styles.cupBrand}>
              <Text style={styles.cupBrandText}>Yo-V</Text>
            </View>
            <View style={[styles.cupShine, { height: CUP_HEIGHT * 0.5 }]} />
          </LinearGradient>

          {/* Inner cup with yogurt */}
          <View style={styles.cupInner}>
            {/* Yogurt fill with mixed colors */}
            <View style={[styles.yogurtFill, { height: `${fillLevel * 85}%` }]}>
              <LinearGradient
                colors={flavorColors.length > 1 ? flavorColors as [string, string, ...string[]] : [flavorColors[0], flavorColors[0]] as [string, string]}
                locations={flavorColors.map((_, i) => i / (flavorColors.length - 1 || 1))}
                style={styles.yogurtGradient}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
              >
                {/* Swirl pattern on surface */}
                <View style={styles.yogurtSurface}>
                  {flavorColors.length > 1 && (
                    <>
                      <View style={[styles.swirlMark, { backgroundColor: flavorColors[0] + '80', left: '15%', width: 20 }]} />
                      <View style={[styles.swirlMark, { backgroundColor: flavorColors[1] + '80', left: '45%', width: 18, top: 6 }]} />
                      {flavorColors.length > 2 && (
                        <View style={[styles.swirlMark, { backgroundColor: flavorColors[2] + '80', right: '15%', width: 16, top: 4 }]} />
                      )}
                    </>
                  )}
                  <View style={[styles.swirlHighlight, { left: '25%' }]} />
                  <View style={[styles.swirlHighlight, { right: '20%', top: 8 }]} />
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: cupBottomWidth + 15 }]} />

      {/* Flavor count badge */}
      <View style={styles.flavorCountBadge}>
        <Text style={styles.flavorCountText}>{order.flavors.length}/3 flavors</Text>
      </View>
    </Animated.View>
  );
};

// Flavor selection indicator (shows up to 3 slots)
const FlavorSlots: React.FC = () => {
  const { order, removeFlavor } = useOrder();
  const slots = [0, 1, 2];

  return (
    <View style={styles.slotsContainer}>
      <View style={styles.slots}>
        {slots.map((index) => {
          const flavor = order.flavors[index];
          const isActive = !!flavor;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.slot, isActive && { backgroundColor: flavor?.color + '30', borderColor: flavor?.color }]}
              onPress={() => flavor && removeFlavor(flavor.id)}
              disabled={!flavor}
            >
              {flavor ? (
                <>
                  <View style={[styles.slotColor, { backgroundColor: flavor.color }]} />
                  <Text style={styles.slotName} numberOfLines={1}>{flavor.name}</Text>
                  <View style={styles.slotRemove}>
                    <Ionicons name="close" size={12} color={colors.text.muted} />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.slotEmpty}>
                    <Ionicons name="add" size={18} color={colors.text.muted} />
                  </View>
                  <Text style={styles.slotEmptyText}>Empty</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Animated flavor card
const FlavorCard: React.FC<{
  flavor: Flavor;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  disabled: boolean;
}> = ({ flavor, isSelected, onSelect, index, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    if (isSelected) {
      // Shine animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(shineAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      shineAnim.setValue(0);
    }
  }, [isSelected]);

  const handlePress = () => {
    if (disabled && !isSelected) return;

    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    onSelect();
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: scaleAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, bounceAnim) },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          disabled && !isSelected && styles.cardDisabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Color splash background */}
        <View style={[styles.colorSplash, { backgroundColor: flavor.color + '20' }]} />

        {/* Selected checkmark */}
        {isSelected && (
          <Animated.View style={[styles.checkmark, { opacity: shineAnim }]}>
            <LinearGradient
              colors={[flavor.color, flavor.color + 'DD']}
              style={styles.checkmarkGradient}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </LinearGradient>
          </Animated.View>
        )}

        {/* Yogurt swirl illustration */}
        <View style={styles.flavorSwirlContainer}>
          <View style={[styles.flavorSwirlBase, { backgroundColor: flavor.color }]}>
            <View style={[styles.flavorSwirlLayer1, { backgroundColor: flavor.color + 'CC' }]} />
            <View style={[styles.flavorSwirlLayer2, { backgroundColor: flavor.color + '99' }]} />
            <View style={styles.flavorSwirlHighlight} />
          </View>

          {/* Sparkles when selected */}
          {isSelected && (
            <>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    top: 5,
                    left: 10,
                    opacity: shineAnim,
                  },
                ]}
              >
                <Ionicons name="sparkles" size={12} color={flavor.color} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    bottom: 10,
                    right: 5,
                    opacity: shineAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5],
                    }),
                  },
                ]}
              >
                <Ionicons name="sparkles" size={10} color={flavor.color} />
              </Animated.View>
            </>
          )}
        </View>

        {/* Flavor name */}
        <Text style={[styles.flavorName, isSelected && { color: flavor.color }]}>
          {flavor.name}
        </Text>

        {/* Description */}
        <Text style={styles.flavorDesc} numberOfLines={2}>
          {flavor.description}
        </Text>

        {/* Badges */}
        <View style={styles.badges}>
          {flavor.isVegan && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Vegan</Text>
            </View>
          )}
          {flavor.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={[styles.badgeText, styles.newBadgeText]}>NEW</Text>
            </View>
          )}
        </View>

        {/* Add/Remove indicator */}
        <View style={[styles.indicator, isSelected && { backgroundColor: flavor.color }]}>
          <Ionicons
            name={isSelected ? 'remove' : 'add'}
            size={16}
            color={isSelected ? '#FFF' : colors.text.muted}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FlavorsStep: React.FC = () => {
  const { order, addFlavor, removeFlavor } = useOrder();
  const { flavors } = useApp();

  const handleFlavorPress = (flavor: Flavor) => {
    const isSelected = order.flavors.find(f => f.id === flavor.id);
    if (isSelected) {
      removeFlavor(flavor.id);
    } else {
      addFlavor(flavor);
    }
  };

  const isMaxSelected = order.flavors.length >= 3;

  return (
    <View style={styles.container}>
      {/* Cup preview at top */}
      <View style={styles.previewSection}>
        <CupPreview />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected flavors slots */}
        <FlavorSlots />

        {/* Hint */}
        <View style={styles.hintContainer}>
          <Ionicons name="color-palette-outline" size={18} color={colors.accent.gold} />
          <Text style={styles.hintText}>
            {isMaxSelected
              ? 'Maximum flavors selected! Tap to swap'
              : `Pick ${3 - order.flavors.length} more flavor${3 - order.flavors.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* Flavor grid */}
        <View style={styles.grid}>
          {flavors.map((flavor, index) => {
            const isSelected = !!order.flavors.find(f => f.id === flavor.id);
            return (
              <FlavorCard
                key={flavor.id}
                flavor={flavor}
                isSelected={isSelected}
                onSelect={() => handleFlavorPress(flavor)}
                index={index}
                disabled={isMaxSelected}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  cupPreviewContainer: {
    alignItems: 'center',
  },
  cupBody: {
    alignItems: 'center',
    position: 'relative',
  },
  cupOuter: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    ...shadows.medium,
  },
  cupRim: {
    position: 'absolute',
    top: -2,
    left: -4,
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    zIndex: 10,
  },
  rimInner: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
    height: 5,
    backgroundColor: '#D8D8D8',
    borderRadius: 2,
  },
  cupWall: {
    flex: 1,
    position: 'relative',
  },
  cupStripe: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  cupBrand: {
    position: 'absolute',
    bottom: '22%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cupBrandText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 0.5,
  },
  cupShine: {
    position: 'absolute',
    top: 14,
    left: 8,
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
  },
  cupInner: {
    position: 'absolute',
    top: 10,
    left: 5,
    right: 5,
    bottom: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  yogurtFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  yogurtGradient: {
    flex: 1,
  },
  yogurtSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
  },
  swirlMark: {
    position: 'absolute',
    top: 3,
    height: 5,
    borderRadius: 2,
  },
  swirlHighlight: {
    position: 'absolute',
    top: 4,
    width: 10,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 1,
  },
  cupShadow: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  flavorCountBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  flavorCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.accent.gold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  slotsContainer: {
    marginVertical: spacing.md,
  },
  slots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ui.border,
    gap: spacing.xs,
  },
  slotColor: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  slotName: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    fontWeight: '500' as const,
    color: colors.text.primary,
  },
  slotRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmptyText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.gold + '10',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  hintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardSelected: {
    borderColor: colors.accent.gold,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  colorSplash: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },
  checkmarkGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  flavorSwirlContainer: {
    width: 65,
    height: 65,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  flavorSwirlBase: {
    width: 65,
    height: 65,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flavorSwirlLayer1: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22,
    top: 5,
    left: 15,
  },
  flavorSwirlLayer2: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    bottom: 10,
    right: 10,
  },
  flavorSwirlHighlight: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    top: 10,
    left: 12,
  },
  sparkle: {
    position: 'absolute',
  },
  flavorName: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  flavorDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    minHeight: 30,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.ui.success + '20',
    borderRadius: borderRadius.round,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: colors.ui.success,
  },
  newBadge: {
    backgroundColor: colors.accent.gold + '20',
  },
  newBadgeText: {
    color: colors.accent.gold,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});

export default FlavorsStep;
