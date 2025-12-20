import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Topping, ToppingSelection } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.35, 140);
const CUP_HEIGHT = CUP_WIDTH * 1.15;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

// Topping data with proper icons and colors for each type
const TOPPING_DATA: Record<string, { color: string; lightColor: string; emoji: string; pricePerGram: number; maxGrams: number }> = {
  'fresh-strawberries': { color: '#E53935', lightColor: '#FFCDD2', emoji: '🍓', pricePerGram: 0.10, maxGrams: 30 },
  'strawberries': { color: '#E53935', lightColor: '#FFCDD2', emoji: '🍓', pricePerGram: 0.10, maxGrams: 30 },
  'blueberries': { color: '#3949AB', lightColor: '#C5CAE9', emoji: '🫐', pricePerGram: 0.10, maxGrams: 30 },
  'mango-chunks': { color: '#FF9800', lightColor: '#FFE0B2', emoji: '🥭', pricePerGram: 0.08, maxGrams: 30 },
  'mango': { color: '#FF9800', lightColor: '#FFE0B2', emoji: '🥭', pricePerGram: 0.08, maxGrams: 30 },
  'banana-slices': { color: '#FDD835', lightColor: '#FFF9C4', emoji: '🍌', pricePerGram: 0.06, maxGrams: 35 },
  'banana': { color: '#FDD835', lightColor: '#FFF9C4', emoji: '🍌', pricePerGram: 0.06, maxGrams: 35 },
  'm&ms': { color: '#E91E63', lightColor: '#F8BBD9', emoji: '🍬', pricePerGram: 0.08, maxGrams: 25 },
  'gummy-bears': { color: '#FF5722', lightColor: '#FFCCBC', emoji: '🐻', pricePerGram: 0.07, maxGrams: 30 },
  'sprinkles': { color: '#9C27B0', lightColor: '#E1BEE7', emoji: '🎊', pricePerGram: 0.05, maxGrams: 20 },
  'cookie-crumbs': { color: '#795548', lightColor: '#D7CCC8', emoji: '🍪', pricePerGram: 0.06, maxGrams: 30 },
  'cookies': { color: '#795548', lightColor: '#D7CCC8', emoji: '🍪', pricePerGram: 0.06, maxGrams: 30 },
  'oreo': { color: '#424242', lightColor: '#E0E0E0', emoji: '🍪', pricePerGram: 0.06, maxGrams: 30 },
  'walnuts': { color: '#8D6E63', lightColor: '#D7CCC8', emoji: '🌰', pricePerGram: 0.15, maxGrams: 20 },
  'almonds': { color: '#A1887F', lightColor: '#D7CCC8', emoji: '🌰', pricePerGram: 0.15, maxGrams: 20 },
  'peanuts': { color: '#D4A574', lightColor: '#FFE0B2', emoji: '🥜', pricePerGram: 0.12, maxGrams: 25 },
  'granola': { color: '#C9B896', lightColor: '#F5F5DC', emoji: '🥣', pricePerGram: 0.05, maxGrams: 35 },
  'fruity-pebbles': { color: '#9C27B0', lightColor: '#E1BEE7', emoji: '🌈', pricePerGram: 0.04, maxGrams: 35 },
  'chocolate-chips': { color: '#5D4037', lightColor: '#D7CCC8', emoji: '🍫', pricePerGram: 0.07, maxGrams: 25 },
  'coconut': { color: '#FAFAFA', lightColor: '#FFFFFF', emoji: '🥥', pricePerGram: 0.06, maxGrams: 25 },
  'kiwi': { color: '#8BC34A', lightColor: '#DCEDC8', emoji: '🥝', pricePerGram: 0.09, maxGrams: 30 },
  'raspberries': { color: '#E91E63', lightColor: '#F8BBD9', emoji: '🫐', pricePerGram: 0.12, maxGrams: 25 },
  'cherries': { color: '#C62828', lightColor: '#FFCDD2', emoji: '🍒', pricePerGram: 0.10, maxGrams: 25 },
  'pineapple': { color: '#FFCA28', lightColor: '#FFF8E1', emoji: '🍍', pricePerGram: 0.08, maxGrams: 30 },
};

const getToppingData = (id: string) => {
  const key = id.toLowerCase().replace(/\s+/g, '-');
  if (TOPPING_DATA[key]) return TOPPING_DATA[key];
  for (const [k, v] of Object.entries(TOPPING_DATA)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { color: '#FF9800', lightColor: '#FFE0B2', emoji: '🍬', pricePerGram: 0.05, maxGrams: 30 };
};

// Cup preview showing toppings being added
const ToppingsCup: React.FC = () => {
  const { order } = useOrder();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const fillLevel = useMemo(() => {
    if (!order.cupSize) return 0.75;
    switch (order.cupSize.size) {
      case 'small': return 0.5;
      case 'medium': return 0.75;
      case 'large': return 1;
      default: return 0.75;
    }
  }, [order.cupSize]);

  const flavorColors = useMemo(() => {
    if (order.flavors.length === 0) return ['#FFB6C1', '#FFC0CB'];
    if (order.flavors.length === 1) return [order.flavors[0].color, order.flavors[0].color];
    return order.flavors.map(f => f.color);
  }, [order.flavors]);

  useEffect(() => {
    if (order.toppings.length > 0) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [order.toppings.length]);

  const cupBottomWidth = CUP_WIDTH * 0.7;

  return (
    <Animated.View style={[
      styles.cupContainer,
      {
        transform: [{
          scale: bounceAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          })
        }]
      }
    ]}>
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
          <View style={[styles.cupRim, { width: CUP_WIDTH + 6 }]} />

          <LinearGradient
            colors={['#FAFAFA', '#F0F0F0', '#E8E8E8'] as const}
            style={styles.cupWall}
          >
            <View style={styles.cupBrand}>
              <Text style={styles.cupBrandText}>Yo-V</Text>
            </View>
          </LinearGradient>

          <View style={styles.cupInner}>
            <View style={[styles.yogurtFill, { height: `${fillLevel * 85}%` }]}>
              <LinearGradient
                colors={flavorColors.length > 1 ? flavorColors as [string, string, ...string[]] : [flavorColors[0], flavorColors[0]] as [string, string]}
                locations={flavorColors.length > 1 ? flavorColors.map((_, i) => i / (flavorColors.length - 1)) as [number, number, ...number[]] : [0, 1] as [number, number]}
                style={styles.yogurtGradient}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
              />
            </View>

            {/* Toppings on yogurt */}
            <View style={styles.toppingsOnYogurt}>
              {order.toppings.slice(0, 5).map((sel, i) => {
                const data = getToppingData(sel.topping.id);
                const positions = [
                  { left: 10, top: 4 },
                  { left: 35, top: 2 },
                  { left: 60, top: 5 },
                  { left: 85, top: 3 },
                  { left: 22, top: 12 },
                ];
                const pos = positions[i];
                return (
                  <Text key={sel.topping.id} style={[styles.toppingMini, { left: pos.left, top: pos.top }]}>
                    {data.emoji}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.cupShadow, { width: cupBottomWidth + 10 }]} />

      {order.toppings.length > 0 && (
        <View style={styles.toppingBadge}>
          <Text style={styles.toppingBadgeText}>{order.toppings.length}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// Individual topping card with large emoji and clear selection state
const ToppingCard: React.FC<{
  topping: Topping;
  selection?: ToppingSelection;
  onTap: () => void;
  onAdd: () => void;
  onRemove: () => void;
  index: number;
}> = ({ topping, selection, onTap, onAdd, onRemove, index }) => {
  const data = getToppingData(topping.id);
  const isSelected = !!selection;
  const grams = selection?.grams || 0;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSelected]);

  const price = (data.pricePerGram * grams).toFixed(2);

  return (
    <Animated.View style={[
      styles.cardContainer,
      {
        opacity: scaleAnim,
        transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
      },
    ]}>
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          isSelected && { borderColor: data.color }
        ]}
        onPress={onTap}
        activeOpacity={0.8}
      >
        {/* Colored header with large emoji */}
        <View style={[styles.cardHeader, { backgroundColor: data.lightColor }]}>
          <Text style={styles.cardEmoji}>{data.emoji}</Text>

          {/* Decorative mini emojis */}
          <Text style={[styles.miniEmoji, styles.miniEmoji1]}>{data.emoji}</Text>
          <Text style={[styles.miniEmoji, styles.miniEmoji2]}>{data.emoji}</Text>
        </View>

        {/* Info section */}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, isSelected && { color: data.color }]} numberOfLines={1}>
            {topping.name}
          </Text>
          <Text style={styles.cardPrice}>${data.pricePerGram.toFixed(3)}/g</Text>
        </View>

        {/* Selection indicator */}
        {isSelected ? (
          <View style={[styles.selectedIndicator, { backgroundColor: data.color }]}>
            <Ionicons name="checkmark" size={16} color="#FFF" />
            <Text style={styles.selectedGrams}>{grams}g</Text>
          </View>
        ) : (
          <View style={styles.addIndicator}>
            <Ionicons name="add-circle-outline" size={24} color={colors.text.muted} />
          </View>
        )}
      </TouchableOpacity>

      {/* Quantity controls */}
      {isSelected && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, { borderColor: data.color }]}
            onPress={onRemove}
          >
            <Ionicons name="remove" size={20} color={data.color} />
          </TouchableOpacity>

          <View style={styles.controlCenter}>
            <Text style={[styles.controlGrams, { color: data.color }]}>{grams}g</Text>
            <Text style={styles.controlPrice}>${price}</Text>
          </View>

          <TouchableOpacity
            style={[styles.controlBtn, styles.controlBtnFilled, { backgroundColor: data.color, borderColor: data.color }]}
            onPress={onAdd}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

// Summary bar showing total
const SummaryBar: React.FC = () => {
  const { order } = useOrder();

  const { total, totalGrams } = useMemo(() => {
    let t = 0;
    let g = 0;
    order.toppings.forEach(sel => {
      const data = getToppingData(sel.topping.id);
      t += data.pricePerGram * sel.grams;
      g += sel.grams;
    });
    return { total: t, totalGrams: g };
  }, [order.toppings]);

  if (order.toppings.length === 0) return null;

  return (
    <View style={styles.summaryBar}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryTitle}>{order.toppings.length} topping{order.toppings.length > 1 ? 's' : ''}</Text>
        <Text style={styles.summaryGrams}>{totalGrams}g total</Text>
      </View>
      <View style={styles.summaryRight}>
        <Text style={styles.summaryPrice}>+${total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

// Selected toppings chips
const SelectedToppings: React.FC = () => {
  const { order, removeTopping } = useOrder();

  if (order.toppings.length === 0) return null;

  return (
    <View style={styles.selectedSection}>
      <Text style={styles.selectedLabel}>Added:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll}>
        {order.toppings.map((sel) => {
          const data = getToppingData(sel.topping.id);
          return (
            <TouchableOpacity
              key={sel.topping.id}
              style={[styles.selectedChip, { backgroundColor: data.lightColor, borderColor: data.color }]}
              onPress={() => removeTopping(sel.topping.id)}
            >
              <Text style={styles.chipEmoji}>{data.emoji}</Text>
              <Text style={[styles.chipText, { color: data.color }]}>{sel.grams}g</Text>
              <Ionicons name="close-circle" size={16} color={data.color} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const ToppingsStep: React.FC = () => {
  const { order, addTopping, updateToppingGrams, removeTopping } = useOrder();
  const { toppings: allToppings } = useApp();

  const sortedToppings = useMemo(() => {
    return allToppings.filter(t => t.category !== 'sauces');
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
    const data = getToppingData(topping.id);
    if (sel && sel.grams < data.maxGrams) {
      updateToppingGrams(topping.id, Math.min(sel.grams + 5, data.maxGrams));
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
      {/* Cup preview */}
      <View style={styles.cupSection}>
        <ToppingsCup />
        <SelectedToppings />
      </View>

      {/* Summary */}
      <SummaryBar />

      {/* Hint */}
      <View style={styles.hint}>
        <Ionicons name="hand-left-outline" size={14} color={colors.accent.gold} />
        <Text style={styles.hintText}>Tap to add toppings to your cup!</Text>
      </View>

      {/* Topping cards */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {sortedToppings.map((topping, index) => (
            <ToppingCard
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
        <View style={{ height: 100 }} />
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
    ...shadows.medium,
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
  toppingsOnYogurt: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    height: 22,
  },
  toppingMini: {
    position: 'absolute',
    fontSize: 12,
  },
  cupShadow: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 50,
    marginTop: 2,
  },
  toppingBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.accent.gold,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  toppingBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  selectedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  selectedLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginRight: spacing.xs,
  },
  selectedScroll: {
    flex: 1,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.xs,
    gap: 4,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.gold + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  summaryLeft: {},
  summaryTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  summaryGrams: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  summaryRight: {},
  summaryPrice: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.accent.gold,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.gold + '08',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    ...shadows.medium,
  },
  cardSelected: {
    borderWidth: 2,
  },
  cardHeader: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardEmoji: {
    fontSize: 40,
  },
  miniEmoji: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.6,
  },
  miniEmoji1: {
    top: 8,
    left: 12,
    transform: [{ rotate: '-15deg' }],
  },
  miniEmoji2: {
    bottom: 10,
    right: 15,
    transform: [{ rotate: '20deg' }],
  },
  cardInfo: {
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  cardName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.text.primary,
    textAlign: 'center',
  },
  cardPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  selectedGrams: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  addIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  controlBtnFilled: {},
  controlCenter: {
    alignItems: 'center',
  },
  controlGrams: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700' as const,
  },
  controlPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.ui.success,
    fontWeight: '600' as const,
  },
});

export default ToppingsStep;
