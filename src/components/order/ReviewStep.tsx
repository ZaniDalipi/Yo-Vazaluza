import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

// Animated yogurt cup preview
const CupPreview: React.FC = () => {
  const { order } = useOrder();
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wobble animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const flavorColors = order.flavors.map(f => f.color);

  return (
    <Animated.View
      style={[
        styles.cupPreview,
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
                outputRange: [0, -10],
              }),
            },
          ],
        },
      ]}
    >
      {/* Cup container */}
      <View style={styles.cup}>
        {/* Cup rim */}
        <View style={styles.cupRim} />

        {/* Yogurt layers */}
        <View style={styles.yogurtContainer}>
          {flavorColors.length > 0 ? (
            <LinearGradient
              colors={[...flavorColors, flavorColors[flavorColors.length - 1]]}
              locations={flavorColors.map((_, i) => i / flavorColors.length)}
              style={styles.yogurtGradient}
            >
              {/* Swirl effect */}
              <View style={styles.swirl} />
              <View style={[styles.swirl, styles.swirl2]} />
            </LinearGradient>
          ) : (
            <View style={styles.emptyYogurt}>
              <Ionicons name="help" size={30} color={colors.text.muted} />
            </View>
          )}
        </View>

        {/* Toppings on top */}
        {order.toppings.length > 0 && (
          <View style={styles.toppingsLayer}>
            {order.toppings.slice(0, 5).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.toppingDot,
                  {
                    left: 15 + (i * 20) % 80,
                    top: 5 + (i * 7) % 15,
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#DDA0DD', '#95E1D3'][i % 5],
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Sauce drizzle */}
        {order.sauces.length > 0 && (
          <View style={styles.sauceLayer}>
            <View style={[styles.sauceDrizzle, { backgroundColor: colors.flavors.chocolate }]} />
            <View style={[styles.sauceDrizzle, styles.sauceDrizzle2, { backgroundColor: colors.flavors.chocolate }]} />
          </View>
        )}

        {/* Cup shine */}
        <View style={styles.cupShine} />
      </View>

      {/* Shadow */}
      <View style={styles.cupShadow} />
    </Animated.View>
  );
};

// Order summary section
const OrderSection: React.FC<{
  title: string;
  emoji: string;
  items: { name: string; color?: string }[];
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
                {item.color && (
                  <View style={[styles.itemDot, { backgroundColor: item.color }]} />
                )}
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
      <CupPreview />

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
          items={order.toppings.map(t => ({ name: `${t.topping.name} (${t.grams}g)` }))}
          emptyText="No toppings added"
        />

        {/* Sauces */}
        <OrderSection
          title="Drizzles"
          emoji="🍫"
          items={order.sauces.map(s => ({ name: s.name }))}
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
  cupPreview: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  cup: {
    width: 140,
    height: 160,
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.large,
  },
  cupRim: {
    height: 15,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#E0E0E0',
  },
  yogurtContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  yogurtGradient: {
    flex: 1,
    position: 'relative',
  },
  swirl: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: 20,
    left: 10,
  },
  swirl2: {
    width: 30,
    height: 30,
    top: 60,
    left: 50,
  },
  emptyYogurt: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toppingsLayer: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    height: 30,
  },
  toppingDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sauceLayer: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
  },
  sauceDrizzle: {
    position: 'absolute',
    width: 3,
    height: 40,
    left: 30,
    transform: [{ rotate: '15deg' }],
    borderRadius: 2,
  },
  sauceDrizzle2: {
    left: 70,
    height: 50,
    transform: [{ rotate: '-10deg' }],
  },
  cupShine: {
    position: 'absolute',
    top: 20,
    left: 15,
    width: 15,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    transform: [{ rotate: '10deg' }],
  },
  cupShadow: {
    width: 100,
    height: 20,
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
    fontWeight: typography.fontWeights.semibold,
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
    fontWeight: typography.fontWeights.semibold,
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
    fontWeight: typography.fontWeights.bold,
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
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  priceFree: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.ui.success,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.ui.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
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
    fontWeight: typography.fontWeights.medium,
  },
});

export default ReviewStep;
