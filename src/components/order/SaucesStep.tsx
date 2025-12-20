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
import { Topping } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.32, 130);
const CUP_HEIGHT = CUP_WIDTH * 1.1;

// Topping data with icons
const TOPPING_ICONS: Record<string, string> = {
  'fresh-strawberries': '🍓',
  'blueberries': '🫐',
  'mango-chunks': '🥭',
  'banana-slices': '🍌',
  'm&ms': '🍬',
  'gummy-bears': '🐻',
  'sprinkles': '✨',
  'cookie-crumbs': '🍪',
  'walnuts': '🥜',
  'almonds': '🌰',
  'peanuts': '🥜',
  'granola': '🥣',
  'fruity-pebbles': '🌈',
};

const getToppingIcon = (id: string) => {
  const key = id.toLowerCase().replace(/\s+/g, '-');
  return TOPPING_ICONS[key] || '🍬';
};

// Sauce color and data
const getSauceData = (name: string): { color: string; darkColor: string; emoji: string } => {
  const lower = name.toLowerCase();
  if (lower.includes('chocolate') || lower.includes('fudge')) {
    return { color: '#5C4033', darkColor: '#3E2723', emoji: '🍫' };
  }
  if (lower.includes('caramel')) {
    return { color: '#D4A574', darkColor: '#B8860B', emoji: '🍯' };
  }
  if (lower.includes('strawberry')) {
    return { color: '#E53935', darkColor: '#C62828', emoji: '🍓' };
  }
  if (lower.includes('peanut')) {
    return { color: '#C19A6B', darkColor: '#8B7355', emoji: '🥜' };
  }
  return { color: '#5C4033', darkColor: '#3E2723', emoji: '🍫' };
};

// Compact froyo cup with toppings and sauce drizzles
const FroYoCup: React.FC = () => {
  const { order } = useOrder();

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

  // Get flavor colors
  const flavorColors = useMemo(() => {
    if (order.flavors.length === 0) return ['#FFFFFF', '#F8F8F8'];
    if (order.flavors.length === 1) return [order.flavors[0].color, order.flavors[0].color];
    return order.flavors.map(f => f.color);
  }, [order.flavors]);

  const cupBottomWidth = CUP_WIDTH * 0.7;

  return (
    <View style={styles.cupContainer}>
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
          <View style={[styles.cupRim, { width: CUP_WIDTH + 6 }]} />

          {/* Cup wall */}
          <LinearGradient
            colors={['#FAFAFA', '#F0F0F0', '#E8E8E8'] as const}
            style={styles.cupWall}
          >
            <View style={styles.cupBrand}>
              <Text style={styles.cupBrandText}>Yo-V</Text>
            </View>
          </LinearGradient>

          {/* Inner cup with yogurt, toppings, and drizzles */}
          <View style={styles.cupInner}>
            {/* Yogurt fill */}
            <View style={[styles.yogurtFill, { height: `${fillLevel * 85}%` }]}>
              <LinearGradient
                colors={flavorColors.length > 1 ? flavorColors as [string, string, ...string[]] : [flavorColors[0], flavorColors[0]] as [string, string]}
                locations={flavorColors.map((_, i) => i / (flavorColors.length - 1 || 1))}
                style={styles.yogurtGradient}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
              />
            </View>

            {/* Toppings on surface */}
            <View style={styles.toppingsOnYogurt}>
              {order.toppings.slice(0, 3).map((sel, i) => {
                const icon = getToppingIcon(sel.topping.id);
                const positions = [
                  { left: 8, top: 4 },
                  { left: 28, top: 2 },
                  { left: 48, top: 5 },
                ];
                const pos = positions[i];
                return (
                  <Text key={sel.topping.id} style={[styles.toppingMini, { left: pos.left, top: pos.top }]}>
                    {icon}
                  </Text>
                );
              })}
            </View>

            {/* Sauce drizzles on top */}
            <View style={styles.sauceDrizzles}>
              {order.sauces.slice(0, 3).map((sauce, i) => {
                const data = getSauceData(sauce.name);
                const positions = [
                  { left: 10, width: 30 },
                  { left: 25, width: 25 },
                  { left: 40, width: 28 },
                ];
                const pos = positions[i];
                return (
                  <View
                    key={sauce.id}
                    style={[
                      styles.drizzleLine,
                      {
                        backgroundColor: data.color,
                        left: pos.left,
                        width: pos.width,
                      }
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: cupBottomWidth + 10 }]} />

      {/* Sauce count badge */}
      {order.sauces.length > 0 && (
        <View style={styles.sauceBadge}>
          <Text style={styles.sauceBadgeText}>{order.sauces.length}</Text>
        </View>
      )}
    </View>
  );
};


// Sauce nozzle/bottle card
const SauceNozzle: React.FC<{
  sauce: Topping;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}> = ({ sauce, isSelected, onSelect, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const dripAnim = useRef(new Animated.Value(0)).current;

  const data = getSauceData(sauce.name);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    if (isSelected) {
      // Tilt and drip animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(tiltAnim, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.delay(400),
          Animated.timing(tiltAnim, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.delay(1500),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(dripAnim, { toValue: 1, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(dripAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(1800),
        ])
      ).start();
    } else {
      tiltAnim.setValue(0);
      dripAnim.setValue(0);
    }
  }, [isSelected]);

  return (
    <Animated.View
      style={[
        styles.nozzleContainer,
        {
          opacity: scaleAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.nozzleCard, isSelected && styles.nozzleCardSelected]}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        {/* Selected badge */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
        )}

        {/* Nozzle/bottle illustration */}
        <Animated.View
          style={[
            styles.bottleIllustration,
            {
              transform: [
                {
                  rotate: tiltAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-25deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Bottle cap */}
          <View style={[styles.bottleCap, { backgroundColor: data.color }]} />

          {/* Bottle neck/nozzle */}
          <View style={[styles.bottleNeck, { backgroundColor: data.color + 'DD' }]} />

          {/* Bottle body */}
          <View style={[styles.bottleBody, { backgroundColor: data.color }]}>
            <View style={styles.bottleShine} />
            <View style={styles.bottleLabel}>
              <Text style={styles.bottleLabelText}>{data.emoji}</Text>
            </View>
          </View>

          {/* Drip */}
          {isSelected && (
            <Animated.View
              style={[
                styles.drip,
                {
                  backgroundColor: data.color,
                  opacity: dripAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: dripAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 35],
                      }),
                    },
                    {
                      scale: dripAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1, 0.3],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </Animated.View>

        {/* Sauce name */}
        <Text style={[styles.sauceName, isSelected && { color: data.color }]}>
          {sauce.name}
        </Text>

        {/* Add indicator */}
        <View style={[styles.addButton, isSelected && { backgroundColor: data.color }]}>
          <Ionicons
            name={isSelected ? 'remove' : 'add'}
            size={18}
            color={isSelected ? '#FFF' : colors.text.muted}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Selected sauces preview
const SelectedSauces: React.FC = () => {
  const { order, removeSauce } = useOrder();

  if (order.sauces.length === 0) return null;

  return (
    <View style={styles.selectedContainer}>
      <View style={styles.selectedHeader}>
        <Text style={styles.selectedTitle}>Your Drizzles</Text>
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>{order.sauces.length}</Text>
        </View>
      </View>
      <View style={styles.selectedList}>
        {order.sauces.map((sauce) => {
          const data = getSauceData(sauce.name);
          return (
            <TouchableOpacity
              key={sauce.id}
              style={[styles.selectedChip, { borderColor: data.color }]}
              onPress={() => removeSauce(sauce.id)}
            >
              <Text style={styles.selectedChipEmoji}>{data.emoji}</Text>
              <Text style={[styles.selectedChipText, { color: data.color }]}>{sauce.name}</Text>
              <Ionicons name="close" size={14} color={data.color} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const SaucesStep: React.FC = () => {
  const { order, addSauce, removeSauce } = useOrder();
  const { toppings: allToppings } = useApp();

  // Filter only sauces
  const sauces = allToppings.filter(t => t.category === 'sauces');

  const handleToggle = (sauce: Topping) => {
    const isSelected = order.sauces.find(s => s.id === sauce.id);
    if (isSelected) {
      removeSauce(sauce.id);
    } else {
      addSauce(sauce);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cup preview */}
      <View style={styles.cupSection}>
        <FroYoCup />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected sauces */}
        <SelectedSauces />

        {/* Hint */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintEmoji}>🍫</Text>
          <Text style={styles.hintText}>Add drizzles to your frozen yogurt!</Text>
        </View>

        {/* Skip hint */}
        <View style={styles.skipHint}>
          <Ionicons name="information-circle-outline" size={14} color={colors.text.muted} />
          <Text style={styles.skipHintText}>Sauces are free and optional</Text>
        </View>

        {/* Sauce nozzles grid */}
        <View style={styles.grid}>
          {sauces.map((sauce, index) => (
            <SauceNozzle
              key={sauce.id}
              sauce={sauce}
              isSelected={!!order.sauces.find(s => s.id === sauce.id)}
              onSelect={() => handleToggle(sauce)}
              index={index}
            />
          ))}
        </View>

        {sauces.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍯</Text>
            <Text style={styles.emptyTitle}>No sauces available</Text>
            <Text style={styles.emptyText}>Check back soon for yummy drizzles!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cupSection: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  cupContainer: {
    alignItems: 'center',
  },
  cupBody: {
    alignItems: 'center',
    position: 'relative',
  },
  cupOuter: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    overflow: 'hidden',
    ...shadows.small,
  },
  cupRim: {
    position: 'absolute',
    top: -2,
    left: -3,
    height: 10,
    backgroundColor: '#E8E8E8',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    zIndex: 10,
  },
  cupWall: {
    flex: 1,
    position: 'relative',
  },
  cupBrand: {
    position: 'absolute',
    bottom: '20%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  cupBrandText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 0.3,
  },
  cupInner: {
    position: 'absolute',
    top: 8,
    left: 4,
    right: 4,
    bottom: 5,
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
  toppingsOnYogurt: {
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    height: 18,
  },
  toppingMini: {
    position: 'absolute',
    fontSize: 9,
  },
  sauceDrizzles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
  },
  drizzleLine: {
    position: 'absolute',
    top: 2,
    height: 3,
    borderRadius: 1,
  },
  cupShadow: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 50,
    marginTop: 2,
  },
  sauceBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent.gold,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sauceBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  selectedContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  selectedCount: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    marginLeft: spacing.sm,
  },
  selectedCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    gap: spacing.xs,
  },
  selectedChipEmoji: {
    fontSize: 14,
  },
  selectedChipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500' as const,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hintEmoji: {
    fontSize: 24,
  },
  hintText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  skipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  skipHintText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nozzleContainer: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  nozzleCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.medium,
  },
  nozzleCardSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '08',
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.ui.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  bottleIllustration: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bottleCap: {
    width: 22,
    height: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  bottleNeck: {
    width: 18,
    height: 16,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  bottleBody: {
    width: 55,
    height: 65,
    borderRadius: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bottleShine: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 8,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    transform: [{ rotate: '10deg' }],
  },
  bottleLabel: {
    width: 35,
    height: 28,
    backgroundColor: '#FFF',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleLabelText: {
    fontSize: 18,
  },
  drip: {
    position: 'absolute',
    bottom: -12,
    width: 10,
    height: 14,
    borderRadius: 5,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  sauceName: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
});

export default SaucesStep;
