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
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.38, 150);
const CUP_HEIGHT = CUP_WIDTH * 1.15;

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

// Elegant final cup preview - compact design
const FinalCup: React.FC = () => {
  const { order } = useOrder();
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
    if (order.flavors.length === 0) return ['#FFFFFF', '#F8F8F8'];
    if (order.flavors.length === 1) return [order.flavors[0].color, order.flavors[0].color];
    return order.flavors.map(f => f.color);
  }, [order.flavors]);

  useEffect(() => {
    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cupBottomWidth = CUP_WIDTH * 0.7;

  return (
    <Animated.View
      style={[
        styles.cupContainer,
        {
          transform: [
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -6],
              }),
            },
          ],
        },
      ]}
    >
      {/* Sparkles around cup */}
      <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkleAnim }]}>
        <Ionicons name="sparkles" size={18} color={colors.accent.gold} />
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) }]}>
        <Ionicons name="sparkles" size={14} color={flavorColors[0]} />
      </Animated.View>

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
          <View style={[styles.cupRim, { width: CUP_WIDTH + 8 }]} />

          {/* Cup wall */}
          <LinearGradient
            colors={['#FAFAFA', '#F0F0F0', '#E8E8E8'] as const}
            style={styles.cupWall}
          >
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.cupStripe, { top: 20 + i * (CUP_HEIGHT * 0.22) }]} />
            ))}
            <View style={styles.cupBrand}>
              <Text style={styles.cupBrandText}>Yo-V</Text>
            </View>
            <View style={[styles.cupShine, { height: CUP_HEIGHT * 0.5 }]} />
          </LinearGradient>

          {/* Inner cup with everything */}
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
              {order.toppings.slice(0, 5).map((sel, i) => {
                const icon = getToppingIcon(sel.topping.id);
                const positions = [
                  { left: 6, top: 3 },
                  { left: 22, top: 6 },
                  { left: 38, top: 2 },
                  { left: 54, top: 5 },
                  { left: 70, top: 4 },
                ];
                const pos = positions[i];
                return (
                  <Text key={sel.topping.id} style={[styles.toppingEmoji, { left: pos.left, top: pos.top }]}>
                    {icon}
                  </Text>
                );
              })}
            </View>

            {/* Sauce drizzles */}
            <View style={styles.sauceDrizzles}>
              {order.sauces.slice(0, 3).map((sauce, i) => {
                const data = getSauceData(sauce.name);
                const positions = [
                  { left: 8, width: 35 },
                  { left: 28, width: 30 },
                  { left: 48, width: 32 },
                ];
                const pos = positions[i];
                return (
                  <View
                    key={sauce.id}
                    style={[
                      styles.drizzle,
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
      <View style={[styles.cupShadow, { width: cupBottomWidth + 15 }]} />
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
    paddingVertical: spacing.md,
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
    top: -8,
    left: -15,
  },
  sparkle2: {
    top: 25,
    right: -18,
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
  cupWall: {
    flex: 1,
    position: 'relative',
  },
  cupStripe: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  cupBrand: {
    position: 'absolute',
    bottom: '22%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  cupBrandText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 0.5,
  },
  cupShine: {
    position: 'absolute',
    top: 16,
    left: 10,
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
  },
  cupInner: {
    position: 'absolute',
    top: 10,
    left: 6,
    right: 6,
    bottom: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
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
    top: 2,
    left: 0,
    right: 0,
    height: 20,
  },
  toppingEmoji: {
    position: 'absolute',
    fontSize: 11,
  },
  sauceDrizzles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 15,
  },
  drizzle: {
    position: 'absolute',
    top: 3,
    height: 4,
    borderRadius: 2,
  },
  cupShadow: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50,
    marginTop: spacing.xs,
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
