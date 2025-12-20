import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Topping, ToppingSelection } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOWL_SIZE = Math.min(SCREEN_WIDTH * 0.7, 280);
const PLATE_ITEM_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3;

// Topping pricing data - sorted by price (most expensive first)
const TOPPING_PRICES: Record<string, { pricePerGram: number; maxGrams: number; emoji: string; color: string }> = {
  'walnuts': { pricePerGram: 0.15, maxGrams: 20, emoji: '🥜', color: '#8D6E63' },
  'almonds': { pricePerGram: 0.15, maxGrams: 20, emoji: '🥜', color: '#A1887F' },
  'peanuts': { pricePerGram: 0.12, maxGrams: 25, emoji: '🥜', color: '#BCAAA4' },
  'blueberries': { pricePerGram: 0.10, maxGrams: 30, emoji: '🫐', color: '#3949AB' },
  'fresh-strawberries': { pricePerGram: 0.10, maxGrams: 30, emoji: '🍓', color: '#E53935' },
  'mango-chunks': { pricePerGram: 0.08, maxGrams: 30, emoji: '🥭', color: '#FFB300' },
  'banana-slices': { pricePerGram: 0.06, maxGrams: 35, emoji: '🍌', color: '#FFF59D' },
  'm&ms': { pricePerGram: 0.08, maxGrams: 25, emoji: '🍬', color: '#E91E63' },
  'gummy-bears': { pricePerGram: 0.07, maxGrams: 30, emoji: '🐻', color: '#FF7043' },
  'sprinkles': { pricePerGram: 0.05, maxGrams: 20, emoji: '✨', color: '#EC407A' },
  'cookie-crumbs': { pricePerGram: 0.06, maxGrams: 30, emoji: '🍪', color: '#8D6E63' },
  'granola': { pricePerGram: 0.05, maxGrams: 35, emoji: '🥣', color: '#D7CCC8' },
  'fruity-pebbles': { pricePerGram: 0.04, maxGrams: 35, emoji: '🥣', color: '#9C27B0' },
};

const getToppingInfo = (id: string) => {
  const key = id.toLowerCase().replace(/\s+/g, '-');
  return TOPPING_PRICES[key] || { pricePerGram: 0.05, maxGrams: 30, emoji: '🍬', color: colors.accent.gold };
};

// Visual topping pieces for the bowl
const ToppingPiece: React.FC<{
  type: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}> = ({ type, x, y, size, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStyle = () => {
    const info = getToppingInfo(type);
    const normalized = type.toLowerCase().replace(/\s+/g, '-');

    switch (normalized) {
      case 'fresh-strawberries':
        return { width: size, height: size * 1.2, backgroundColor: '#E53935', borderRadius: size / 2 };
      case 'blueberries':
        return { width: size * 0.7, height: size * 0.7, backgroundColor: '#3949AB', borderRadius: size };
      case 'mango-chunks':
        return { width: size, height: size * 0.7, backgroundColor: '#FFB300', borderRadius: 4 };
      case 'banana-slices':
        return { width: size * 1.1, height: size * 0.4, backgroundColor: '#FFF59D', borderRadius: size, borderWidth: 1, borderColor: '#F9A825' };
      case 'm&ms':
        return { width: size * 0.6, height: size * 0.45, backgroundColor: ['#E53935', '#1E88E5', '#43A047', '#FB8C00'][Math.floor(Math.random() * 4)], borderRadius: size };
      case 'gummy-bears':
        return { width: size * 0.6, height: size * 0.8, backgroundColor: ['#E53935', '#FDD835', '#43A047'][Math.floor(Math.random() * 3)], borderRadius: 4 };
      case 'sprinkles':
        return { width: size * 0.2, height: size * 0.8, backgroundColor: ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50'][Math.floor(Math.random() * 4)], borderRadius: 2, transform: [{ rotate: `${Math.random() * 60 - 30}deg` }] };
      case 'walnuts':
      case 'almonds':
      case 'peanuts':
        return { width: size * 0.9, height: size * 0.5, backgroundColor: '#A1887F', borderRadius: 6 };
      case 'cookie-crumbs':
        return { width: size * 0.7, height: size * 0.5, backgroundColor: '#8D6E63', borderRadius: 3 };
      case 'granola':
      case 'fruity-pebbles':
        return { width: size * 0.5, height: size * 0.4, backgroundColor: normalized === 'fruity-pebbles' ? ['#E53935', '#1E88E5', '#43A047'][Math.floor(Math.random() * 3)] : '#D7CCC8', borderRadius: 2 };
      default:
        return { width: size * 0.6, height: size * 0.6, backgroundColor: info.color, borderRadius: size };
    }
  };

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y },
        getStyle(),
        { transform: [{ scale: scaleAnim }] },
      ]}
    />
  );
};

// Yogurt bowl showing selected flavor and toppings
const YogurtBowl: React.FC = () => {
  const { order } = useOrder();
  const [pieces, setPieces] = useState<Array<{ id: string; type: string; x: number; y: number; size: number }>>([]);

  const flavorColor = order.flavors[0]?.color || colors.flavors.vanilla;
  const secondaryColor = order.flavors[1]?.color || flavorColor;

  useEffect(() => {
    const newPieces: typeof pieces = [];
    const radius = BOWL_SIZE / 2 - 35;
    const cx = BOWL_SIZE / 2 - 20;
    const cy = BOWL_SIZE / 2 - 30;

    order.toppings.forEach((sel) => {
      const count = Math.max(2, Math.floor(sel.grams / 5));
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8;
        const dist = (0.25 + Math.random() * 0.55) * radius;
        newPieces.push({
          id: `${sel.topping.id}-${i}`,
          type: sel.topping.name,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist * 0.55,
          size: 14 + Math.random() * 6,
        });
      }
    });
    setPieces(newPieces);
  }, [order.toppings]);

  return (
    <View style={styles.bowlWrapper}>
      <View style={styles.bowlShadow} />
      <View style={styles.bowl}>
        <LinearGradient
          colors={[flavorColor, secondaryColor, `${flavorColor}DD`] as const}
          style={styles.yogurt}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.swirl, { borderColor: `${secondaryColor}40` }]} />
          <View style={[styles.swirlInner, { borderColor: `${flavorColor}30` }]} />
          <View style={styles.shine} />
        </LinearGradient>
        {pieces.map((p, i) => (
          <ToppingPiece key={p.id} type={p.type} x={p.x} y={p.y} size={p.size} delay={i * 20} />
        ))}
      </View>
      <LinearGradient
        colors={['#FAFAFA', '#E0E0E0', '#FAFAFA'] as const}
        style={styles.bowlRim}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      {order.flavors.length > 0 && (
        <View style={styles.flavorTag}>
          <Text style={styles.flavorTagText}>{order.flavors.map(f => f.name).join(' + ')}</Text>
        </View>
      )}
    </View>
  );
};

// Single topping container on the plate
const ToppingContainer: React.FC<{
  topping: Topping;
  selection?: ToppingSelection;
  onTap: () => void;
  onAdd: () => void;
  onRemove: () => void;
  index: number;
}> = ({ topping, selection, onTap, onAdd, onRemove, index }) => {
  const info = getToppingInfo(topping.id);
  const isSelected = !!selection;
  const grams = selection?.grams || 0;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 40,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSelected]);

  const price = (info.pricePerGram * grams).toFixed(2);

  // Generate visual pieces for the container
  const containerPieces = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        x: 10 + Math.random() * (PLATE_ITEM_SIZE - 50),
        y: 10 + Math.random() * 35,
        size: 10 + Math.random() * 6,
      });
    }
    return arr;
  }, []);

  return (
    <Animated.View style={[styles.plateItem, { opacity: scaleAnim, transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }]}>
      <TouchableOpacity
        style={[styles.plateItemInner, isSelected && styles.plateItemSelected]}
        onPress={onTap}
        activeOpacity={0.8}
      >
        {/* Visual topping container */}
        <View style={[styles.toppingBin, { backgroundColor: info.color + '20' }]}>
          {containerPieces.map((p, i) => (
            <View
              key={i}
              style={[
                styles.binPiece,
                {
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size * 0.7,
                  backgroundColor: info.color,
                  borderRadius: p.size / 3,
                },
              ]}
            />
          ))}
        </View>

        {/* Label */}
        <Text style={styles.plateItemEmoji}>{info.emoji}</Text>
        <Text style={styles.plateItemName} numberOfLines={1}>{topping.name}</Text>
        <Text style={styles.plateItemPrice}>${info.pricePerGram.toFixed(2)}/g</Text>

        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>{grams}g</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Quantity controls when selected */}
      {isSelected && (
        <View style={styles.quantityControls}>
          <TouchableOpacity style={styles.qtyBtn} onPress={onRemove}>
            <Ionicons name="remove" size={16} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{grams}g</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={onAdd}>
            <Ionicons name="add" size={16} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyPrice}>${price}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// Price summary
const PriceSummary: React.FC = () => {
  const { order } = useOrder();

  const total = useMemo(() => {
    return order.toppings.reduce((sum, sel) => {
      const info = getToppingInfo(sel.topping.id);
      return sum + info.pricePerGram * sel.grams;
    }, 0);
  }, [order.toppings]);

  const totalGrams = useMemo(() => {
    return order.toppings.reduce((sum, sel) => sum + sel.grams, 0);
  }, [order.toppings]);

  if (order.toppings.length === 0) return null;

  return (
    <View style={styles.summary}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryCount}>{order.toppings.length} topping{order.toppings.length > 1 ? 's' : ''}</Text>
        <Text style={styles.summaryGrams}>{totalGrams}g total</Text>
      </View>
      <Text style={styles.summaryPrice}>+${total.toFixed(2)}</Text>
    </View>
  );
};

const ToppingsStep: React.FC = () => {
  const { order, addTopping, updateToppingGrams, removeTopping } = useOrder();
  const { toppings: allToppings } = useApp();

  const sortedToppings = useMemo(() => {
    return allToppings
      .filter(t => t.category !== 'sauces')
      .sort((a, b) => {
        const infoA = getToppingInfo(a.id);
        const infoB = getToppingInfo(b.id);
        return infoB.pricePerGram - infoA.pricePerGram;
      });
  }, [allToppings]);

  const getSelection = (id: string) => order.toppings.find(t => t.topping.id === id);

  const handleTap = (topping: Topping) => {
    const sel = getSelection(topping.id);
    if (sel) {
      removeTopping(topping.id);
    } else {
      addTopping(topping, 10);
    }
  };

  const handleAdd = (topping: Topping) => {
    const sel = getSelection(topping.id);
    const info = getToppingInfo(topping.id);
    if (sel && sel.grams < info.maxGrams) {
      updateToppingGrams(topping.id, Math.min(sel.grams + 5, info.maxGrams));
    }
  };

  const handleRemove = (topping: Topping) => {
    const sel = getSelection(topping.id);
    if (sel) {
      if (sel.grams <= 5) {
        removeTopping(topping.id);
      } else {
        updateToppingGrams(topping.id, sel.grams - 5);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Yogurt bowl */}
      <View style={styles.bowlSection}>
        <YogurtBowl />
      </View>

      {/* Price summary */}
      <PriceSummary />

      {/* Hint */}
      <View style={styles.hint}>
        <Ionicons name="hand-left-outline" size={14} color={colors.accent.gold} />
        <Text style={styles.hintText}>Tap to add • Use +/- to adjust amount</Text>
      </View>

      {/* Toppings plate */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.plateContainer}>
          <Text style={styles.plateLabel}>🍽️ Toppings Bar</Text>
          <View style={styles.plate}>
            {sortedToppings.map((topping, index) => (
              <ToppingContainer
                key={topping.id}
                topping={topping}
                selection={getSelection(topping.id)}
                onTap={() => handleTap(topping)}
                onAdd={() => handleAdd(topping)}
                onRemove={() => handleRemove(topping)}
                index={index}
              />
            ))}
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bowlSection: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.main,
  },
  bowlWrapper: {
    width: BOWL_SIZE,
    height: BOWL_SIZE * 0.65,
    alignItems: 'center',
  },
  bowlShadow: {
    position: 'absolute',
    bottom: 0,
    width: BOWL_SIZE * 0.6,
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: BOWL_SIZE,
  },
  bowl: {
    width: BOWL_SIZE - 30,
    height: BOWL_SIZE * 0.5,
    borderRadius: BOWL_SIZE / 2,
    borderBottomLeftRadius: BOWL_SIZE / 3,
    borderBottomRightRadius: BOWL_SIZE / 3,
    overflow: 'hidden',
    ...shadows.medium,
  },
  yogurt: {
    flex: 1,
  },
  swirl: {
    position: 'absolute',
    width: '75%',
    height: '55%',
    borderWidth: 3,
    borderRadius: 80,
    top: '22%',
    left: '12%',
  },
  swirlInner: {
    position: 'absolute',
    width: '50%',
    height: '35%',
    borderWidth: 2,
    borderRadius: 60,
    top: '32%',
    left: '25%',
  },
  shine: {
    position: 'absolute',
    top: 12,
    left: 20,
    width: 30,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 15,
    transform: [{ rotate: '-20deg' }],
  },
  bowlRim: {
    position: 'absolute',
    top: BOWL_SIZE * 0.1,
    width: BOWL_SIZE - 15,
    height: 10,
    borderRadius: 5,
  },
  flavorTag: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    ...shadows.small,
  },
  flavorTagText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.gold + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryCount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  summaryGrams: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  summaryPrice: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent.gold + '10',
  },
  hintText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  plateContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.medium,
  },
  plateLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  plate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  plateItem: {
    width: PLATE_ITEM_SIZE,
  },
  plateItemInner: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  plateItemSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '10',
  },
  toppingBin: {
    width: '100%',
    height: 50,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  binPiece: {
    position: 'absolute',
  },
  plateItemEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  plateItemName: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  plateItemPrice: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.accent.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  qtyText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  qtyPrice: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.ui.success,
  },
});

export default ToppingsStep;
