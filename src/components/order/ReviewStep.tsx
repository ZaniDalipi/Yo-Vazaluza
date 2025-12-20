import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.5, 200);
const CUP_HEIGHT = CUP_WIDTH * 1.25;

// Topping icons
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

// Sauce data
const getSauceData = (name: string): { color: string; emoji: string } => {
  const lower = name.toLowerCase();
  if (lower.includes('chocolate') || lower.includes('fudge')) {
    return { color: '#5C4033', emoji: '🍫' };
  }
  if (lower.includes('caramel')) {
    return { color: '#D4A574', emoji: '🍯' };
  }
  if (lower.includes('strawberry')) {
    return { color: '#E53935', emoji: '🍓' };
  }
  if (lower.includes('peanut')) {
    return { color: '#C19A6B', emoji: '🥜' };
  }
  return { color: '#5C4033', emoji: '🍫' };
};

// Animated final cup preview
const FinalCup: React.FC = () => {
  const { order } = useOrder();
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

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
    // Wobble animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const swirlHeight = CUP_WIDTH * 0.55;

  // Topping positions
  const toppingPositions = [
    { top: 18, left: '12%' },
    { top: 10, left: '42%' },
    { top: 22, left: '72%' },
    { top: 40, left: '22%' },
    { top: 35, left: '58%' },
    { top: 50, left: '38%' },
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
                outputRange: ['-3deg', '3deg'],
              }),
            },
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            },
          ],
        },
      ]}
    >
      {/* Sparkles around cup */}
      <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkleAnim }]}>
        <Ionicons name="sparkles" size={20} color={colors.accent.gold} />
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }]}>
        <Ionicons name="sparkles" size={16} color={flavorColors[0]} />
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkleAnim }]}>
        <Ionicons name="sparkles" size={14} color={colors.accent.gold} />
      </Animated.View>

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
          const positions = [
            { left: 25, rotation: -15, height: 60 },
            { left: 55, rotation: 10, height: 65 },
            { left: 85, rotation: -5, height: 55 },
          ];
          const pos = positions[i % positions.length];
          return (
            <View
              key={sauce.id}
              style={[
                styles.drizzle,
                {
                  backgroundColor: data.color,
                  left: pos.left,
                  height: pos.height,
                  transform: [{ rotate: `${pos.rotation}deg` }],
                },
              ]}
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
          <View style={[styles.cupRim, { width: CUP_WIDTH + 12 }]} />

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
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.cupStripe, { top: 28 + i * (CUP_HEIGHT / 6) }]} />
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
      <View style={[styles.cupShadow, { width: CUP_WIDTH * 0.55 }]} />
    </Animated.View>
  );
};

// Order summary section
const OrderSection: React.FC<{
  title: string;
  emoji: string;
  items: { name: string; color?: string; icon?: string }[];
  emptyText: string;
}> = ({ title, emoji, items, emptyText }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.length > 0 && (
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{items.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionContent}>
        {items.length > 0 ? (
          <View style={styles.itemsList}>
            {items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                {item.icon ? (
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                ) : item.color ? (
                  <View style={[styles.itemDot, { backgroundColor: item.color }]} />
                ) : null}
                <Text style={styles.itemName}>{item.name}</Text>
                <Ionicons name="checkmark-circle" size={16} color={colors.ui.success} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>{emptyText}</Text>
        )}
      </View>
    </Animated.View>
  );
};

// Price breakdown
const PriceBreakdown: React.FC = () => {
  const { order, getTotalPrice } = useOrder();
  const total = getTotalPrice();

  // Calculate toppings total
  const toppingsTotal = order.toppings.reduce((sum, sel) => {
    const pricePerGram = sel.topping.pricePerGram || 0.05;
    return sum + (pricePerGram * sel.grams);
  }, 0);

  const totalGrams = order.toppings.reduce((sum, sel) => sum + sel.grams, 0);

  return (
    <View style={styles.priceContainer}>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>
          {order.cupSize?.name || 'Cup'}
        </Text>
        <Text style={styles.priceValue}>${order.cupSize?.price.toFixed(2) || '0.00'}</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>
          Toppings {totalGrams > 0 ? `(${totalGrams}g)` : ''}
        </Text>
        {toppingsTotal > 0 ? (
          <Text style={styles.priceValue}>+${toppingsTotal.toFixed(2)}</Text>
        ) : (
          <Text style={styles.priceFree}>-</Text>
        )}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Sauces</Text>
        <Text style={styles.priceFree}>FREE</Text>
      </View>

      <View style={styles.priceDivider} />

      <View style={styles.priceRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const ReviewStep: React.FC = () => {
  const { order } = useOrder();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Cup preview */}
      <View style={styles.cupPreviewSection}>
        <FinalCup />
      </View>

      {/* Ready message */}
      <View style={styles.readyMessage}>
        <Text style={styles.readyEmoji}>😋</Text>
        <Text style={styles.readyText}>Your cup looks delicious!</Text>
      </View>

      {/* Order details */}
      <View style={styles.orderDetails}>
        {/* Size */}
        <OrderSection
          title="Cup Size"
          emoji="🥤"
          items={order.cupSize ? [{ name: `${order.cupSize.name} (${order.cupSize.ounces}oz)` }] : []}
          emptyText="No size selected"
        />

        {/* Flavors */}
        <OrderSection
          title="Flavors"
          emoji="🍦"
          items={order.flavors.map(f => ({ name: f.name, color: f.color }))}
          emptyText="No flavors selected"
        />

        {/* Toppings */}
        <OrderSection
          title="Toppings"
          emoji="🍓"
          items={order.toppings.map(t => ({
            name: `${t.topping.name} (${t.grams}g)`,
            icon: getToppingIcon(t.topping.id)
          }))}
          emptyText="No toppings added"
        />

        {/* Sauces */}
        <OrderSection
          title="Drizzles"
          emoji="🍫"
          items={order.sauces.map(s => ({
            name: s.name,
            icon: getSauceData(s.name).emoji
          }))}
          emptyText="No sauces added"
        />
      </View>

      {/* Price breakdown */}
      <PriceBreakdown />

      {/* Final message */}
      <View style={styles.finalMessage}>
        <LinearGradient
          colors={[colors.accent.gold + '20', colors.accent.gold + '10']}
          style={styles.finalMessageGradient}
        >
          <Ionicons name="heart" size={20} color={colors.accent.gold} />
          <Text style={styles.finalMessageText}>
            Thank you for choosing Yo-Vazaluza!
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  cupPreviewSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  cupContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 20,
  },
  sparkle1: {
    top: -10,
    left: -20,
  },
  sparkle2: {
    top: 30,
    right: -25,
  },
  sparkle3: {
    bottom: 50,
    left: -15,
  },
  swirlContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
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
    bottom: 16,
    transform: [{ rotate: '-5deg' }],
  },
  swirlLayer3: {
    bottom: 30,
    transform: [{ rotate: '8deg' }],
  },
  swirlLayer4: {
    bottom: 44,
    transform: [{ rotate: '-3deg' }],
  },
  swirlTip: {
    position: 'absolute',
    width: 18,
    height: 28,
    bottom: 58,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '12deg' }],
  },
  swirlHighlight1: {
    position: 'absolute',
    width: 14,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    bottom: 52,
    left: '22%',
  },
  swirlHighlight2: {
    position: 'absolute',
    width: 10,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    bottom: 22,
    right: '22%',
  },
  toppingEmoji: {
    position: 'absolute',
    fontSize: 18,
  },
  drizzle: {
    position: 'absolute',
    width: 5,
    top: 5,
    borderRadius: 2,
  },
  cup: {
    overflow: 'hidden',
  },
  cupGradient: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',
    ...shadows.large,
  },
  cupRim: {
    position: 'absolute',
    top: -4,
    left: -6,
    height: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  yogurtFill: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    borderRadius: 12,
    overflow: 'hidden',
  },
  yogurtGradient: {
    flex: 1,
  },
  cupStripe: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  cupBrand: {
    position: 'absolute',
    bottom: '28%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cupBrandText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 1,
  },
  cupShine: {
    position: 'absolute',
    top: 22,
    left: 16,
    width: 10,
    height: CUP_HEIGHT * 0.45,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 5,
  },
  cupShadow: {
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 50,
    marginTop: spacing.sm,
  },
  readyMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  readyEmoji: {
    fontSize: 28,
  },
  readyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  orderDetails: {
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  sectionCount: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  sectionCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  sectionContent: {},
  itemsList: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  itemIcon: {
    fontSize: 16,
  },
  itemDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemName: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  priceContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.small,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  priceLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  priceValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: '500' as const,
    color: colors.text.primary,
  },
  priceFree: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.ui.success,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.accent.gold,
  },
  finalMessage: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  finalMessageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  finalMessageText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
});

export default ReviewStep;
