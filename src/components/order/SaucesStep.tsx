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
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.45, 180);
const CUP_HEIGHT = CUP_WIDTH * 1.2;

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

// Frozen yogurt cup with toppings and sauces
const FroYoCup: React.FC = () => {
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

  // Get flavor colors
  const flavorColors = useMemo(() => {
    if (order.flavors.length === 0) return ['#FFFFFF', '#F5F5F5'];
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

  const swirlHeight = CUP_WIDTH * 0.5;

  // Topping positions
  const toppingPositions = [
    { top: 15, left: '15%' },
    { top: 8, left: '45%' },
    { top: 20, left: '70%' },
    { top: 35, left: '25%' },
    { top: 30, left: '55%' },
    { top: 45, left: '40%' },
  ];

  return (
    <Animated.View
      style={[
        styles.cupContainer,
        {
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
      {/* Soft-serve swirl with flavor colors */}
      <View style={[styles.swirlContainer, { height: swirlHeight, marginBottom: -swirlHeight * 0.15 }]}>
        <View style={[styles.swirlLayer, styles.swirlLayer1, { backgroundColor: flavorColors[0], width: CUP_WIDTH * 0.6 }]} />
        <View style={[styles.swirlLayer, styles.swirlLayer2, { backgroundColor: flavorColors[flavorColors.length > 1 ? 1 : 0], width: CUP_WIDTH * 0.5 }]} />
        <View style={[styles.swirlLayer, styles.swirlLayer3, { backgroundColor: flavorColors[0], width: CUP_WIDTH * 0.4 }]} />
        <View style={[styles.swirlLayer, styles.swirlLayer4, { backgroundColor: flavorColors[flavorColors.length > 2 ? 2 : flavorColors.length > 1 ? 1 : 0], width: CUP_WIDTH * 0.32 }]} />
        <View style={[styles.swirlTip, { backgroundColor: flavorColors[0] }]} />
        <View style={styles.swirlHighlight1} />
        <View style={styles.swirlHighlight2} />

        {/* Toppings on swirl */}
        {order.toppings.slice(0, 6).map((sel, i) => {
          const icon = getToppingIcon(sel.topping.id);
          const pos = toppingPositions[i];
          return (
            <Text key={sel.topping.id} style={[styles.toppingEmoji, { top: pos.top, left: pos.left as any }]}>
              {icon}
            </Text>
          );
        })}

        {/* Sauce drizzles */}
        {order.sauces.map((sauce, i) => {
          const data = getSauceData(sauce.name);
          return (
            <SauceDrizzle
              key={sauce.id}
              color={data.color}
              index={i}
            />
          );
        })}
      </View>

      {/* Cup */}
      <View style={[styles.cup, { width: CUP_WIDTH, height: CUP_HEIGHT }]}>
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5', '#EEEEEE'] as const}
          style={[styles.cupGradient, { borderBottomLeftRadius: CUP_WIDTH * 0.35, borderBottomRightRadius: CUP_WIDTH * 0.35 }]}
        >
          {/* Cup rim */}
          <View style={[styles.cupRim, { width: CUP_WIDTH + 10 }]} />

          {/* Yogurt fill */}
          <View style={[styles.yogurtFill, { height: CUP_HEIGHT * fillLevel * 0.65 }]}>
            <LinearGradient
              colors={flavorColors.length > 1 ? flavorColors as [string, string, ...string[]] : [flavorColors[0], flavorColors[0]] as [string, string]}
              locations={flavorColors.map((_, i) => i / (flavorColors.length - 1 || 1))}
              style={styles.yogurtGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>

          {/* Cup stripes */}
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.cupStripe, { top: 25 + i * (CUP_HEIGHT / 5) }]} />
          ))}

          {/* Brand */}
          <View style={styles.cupBrand}>
            <Text style={styles.cupBrandText}>Yo-V</Text>
          </View>

          {/* Shine */}
          <View style={styles.cupShine} />
        </LinearGradient>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: CUP_WIDTH * 0.5 }]} />

      {/* Sauce count badge */}
      {order.sauces.length > 0 && (
        <View style={styles.sauceBadge}>
          <Text style={styles.sauceBadgeText}>{order.sauces.length} drizzle{order.sauces.length > 1 ? 's' : ''}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// Animated sauce drizzle on swirl
const SauceDrizzle: React.FC<{ color: string; index: number }> = ({ color, index }) => {
  const drizzleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drizzleAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const positions = [
    { left: 20, rotation: -15, height: 55 },
    { left: 50, rotation: 10, height: 60 },
    { left: 80, rotation: -5, height: 50 },
  ];
  const pos = positions[index % positions.length];

  return (
    <Animated.View
      style={[
        styles.drizzle,
        {
          backgroundColor: color,
          left: pos.left,
          height: pos.height,
          transform: [
            { rotate: `${pos.rotation}deg` },
            {
              scaleY: drizzleAnim,
            },
          ],
          opacity: drizzleAnim,
        },
      ]}
    />
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
    paddingVertical: spacing.md,
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  cupContainer: {
    alignItems: 'center',
  },
  swirlContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  swirlLayer: {
    position: 'absolute',
    height: 22,
    borderRadius: 50,
  },
  swirlLayer1: {
    bottom: 0,
  },
  swirlLayer2: {
    bottom: 14,
    transform: [{ rotate: '-5deg' }],
  },
  swirlLayer3: {
    bottom: 26,
    transform: [{ rotate: '8deg' }],
  },
  swirlLayer4: {
    bottom: 38,
    transform: [{ rotate: '-3deg' }],
  },
  swirlTip: {
    position: 'absolute',
    width: 16,
    height: 25,
    bottom: 50,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '12deg' }],
  },
  swirlHighlight1: {
    position: 'absolute',
    width: 12,
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    bottom: 45,
    left: '25%',
  },
  swirlHighlight2: {
    position: 'absolute',
    width: 8,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    bottom: 18,
    right: '25%',
  },
  toppingEmoji: {
    position: 'absolute',
    fontSize: 14,
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
    left: -5,
    height: 13,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  yogurtFill: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  yogurtGradient: {
    flex: 1,
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
    bottom: '28%',
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
    letterSpacing: 0.5,
  },
  cupShine: {
    position: 'absolute',
    top: 20,
    left: 14,
    width: 8,
    height: CUP_HEIGHT * 0.4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
  },
  cupShadow: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  sauceBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  sauceBadgeText: {
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
