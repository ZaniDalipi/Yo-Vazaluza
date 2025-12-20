import React, { useRef, useEffect, useState, useMemo } from 'react';
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
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.32, 130);
const CUP_HEIGHT = CUP_WIDTH * 1.1;
const PLATE_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

// Topping data with proper icons and colors for each type
const TOPPING_DATA: Record<string, { color: string; darkColor: string; emoji: string; pricePerGram: number; maxGrams: number }> = {
  'fresh-strawberries': { color: '#E53935', darkColor: '#C62828', emoji: '🍓', pricePerGram: 0.10, maxGrams: 30 },
  'strawberries': { color: '#E53935', darkColor: '#C62828', emoji: '🍓', pricePerGram: 0.10, maxGrams: 30 },
  'blueberries': { color: '#3949AB', darkColor: '#283593', emoji: '🫐', pricePerGram: 0.10, maxGrams: 30 },
  'mango-chunks': { color: '#FFB300', darkColor: '#FF8F00', emoji: '🥭', pricePerGram: 0.08, maxGrams: 30 },
  'mango': { color: '#FFB300', darkColor: '#FF8F00', emoji: '🥭', pricePerGram: 0.08, maxGrams: 30 },
  'banana-slices': { color: '#FFE082', darkColor: '#FFC107', emoji: '🍌', pricePerGram: 0.06, maxGrams: 35 },
  'banana': { color: '#FFE082', darkColor: '#FFC107', emoji: '🍌', pricePerGram: 0.06, maxGrams: 35 },
  'm&ms': { color: '#E91E63', darkColor: '#C2185B', emoji: '🟤', pricePerGram: 0.08, maxGrams: 25 },
  'gummy-bears': { color: '#FF7043', darkColor: '#E64A19', emoji: '🧸', pricePerGram: 0.07, maxGrams: 30 },
  'sprinkles': { color: '#EC407A', darkColor: '#D81B60', emoji: '🎊', pricePerGram: 0.05, maxGrams: 20 },
  'cookie-crumbs': { color: '#8D6E63', darkColor: '#6D4C41', emoji: '🍪', pricePerGram: 0.06, maxGrams: 30 },
  'cookies': { color: '#8D6E63', darkColor: '#6D4C41', emoji: '🍪', pricePerGram: 0.06, maxGrams: 30 },
  'oreo': { color: '#3E3E3E', darkColor: '#1A1A1A', emoji: '🍪', pricePerGram: 0.06, maxGrams: 30 },
  'walnuts': { color: '#A1887F', darkColor: '#795548', emoji: '🌰', pricePerGram: 0.15, maxGrams: 20 },
  'almonds': { color: '#BCAAA4', darkColor: '#8D6E63', emoji: '🌰', pricePerGram: 0.15, maxGrams: 20 },
  'peanuts': { color: '#D4A574', darkColor: '#A1887F', emoji: '🥜', pricePerGram: 0.12, maxGrams: 25 },
  'granola': { color: '#C9B896', darkColor: '#A89068', emoji: '🥣', pricePerGram: 0.05, maxGrams: 35 },
  'fruity-pebbles': { color: '#9C27B0', darkColor: '#7B1FA2', emoji: '🌈', pricePerGram: 0.04, maxGrams: 35 },
  'chocolate-chips': { color: '#5D4037', darkColor: '#3E2723', emoji: '🍫', pricePerGram: 0.07, maxGrams: 25 },
  'coconut': { color: '#F5F5F5', darkColor: '#E0E0E0', emoji: '🥥', pricePerGram: 0.06, maxGrams: 25 },
  'kiwi': { color: '#8BC34A', darkColor: '#689F38', emoji: '🥝', pricePerGram: 0.09, maxGrams: 30 },
  'raspberries': { color: '#D81B60', darkColor: '#AD1457', emoji: '🫐', pricePerGram: 0.12, maxGrams: 25 },
  'cherries': { color: '#C62828', darkColor: '#B71C1C', emoji: '🍒', pricePerGram: 0.10, maxGrams: 25 },
  'pineapple': { color: '#FFD54F', darkColor: '#FFCA28', emoji: '🍍', pricePerGram: 0.08, maxGrams: 30 },
};

const getToppingData = (id: string) => {
  const key = id.toLowerCase().replace(/\s+/g, '-');
  // Try exact match first
  if (TOPPING_DATA[key]) return TOPPING_DATA[key];
  // Try partial match
  for (const [k, v] of Object.entries(TOPPING_DATA)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { color: '#FFB74D', darkColor: '#F57C00', emoji: '•', pricePerGram: 0.05, maxGrams: 30 };
};

// Compact froyo cup with toppings on yogurt surface
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

          {/* Inner cup with yogurt and toppings */}
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

            {/* Toppings on yogurt surface */}
            <View style={styles.toppingsOnYogurt}>
              {order.toppings.slice(0, 4).map((sel, i) => {
                const data = getToppingData(sel.topping.id);
                const positions = [
                  { left: 4, top: 2 },
                  { left: 22, top: 6 },
                  { left: 40, top: 3 },
                  { left: 58, top: 5 },
                ];
                const pos = positions[i];
                return (
                  <View
                    key={sel.topping.id}
                    style={[
                      styles.toppingDot,
                      {
                        left: pos.left,
                        top: pos.top,
                        backgroundColor: data.color,
                      }
                    ]}
                  >
                    <Text style={styles.toppingMiniEmoji}>{data.emoji}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: cupBottomWidth + 10 }]} />

      {/* Topping count badge */}
      {order.toppings.length > 0 && (
        <View style={styles.toppingBadge}>
          <Text style={styles.toppingBadgeText}>{order.toppings.length}</Text>
        </View>
      )}
    </View>
  );
};


// Topping card with bowl/container visual
const ToppingPlate: React.FC<{
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
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(1);
    }
  }, [isSelected]);

  const handleTap = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0.5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    onTap();
  };

  const price = (data.pricePerGram * grams).toFixed(2);

  return (
    <Animated.View style={[
      styles.plateContainer,
      {
        opacity: scaleAnim,
        transform: [
          { scale: Animated.multiply(scaleAnim, bounceAnim) },
          {
            rotate: shakeAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['-3deg', '0deg', '3deg'],
            }),
          },
        ],
      },
    ]}>
      <TouchableOpacity
        style={[styles.plate, isSelected && styles.plateSelected]}
        onPress={handleTap}
        activeOpacity={0.8}
      >
        {/* Bowl/container with topping */}
        <View style={styles.bowlContainer}>
          {/* Bowl background */}
          <LinearGradient
            colors={[data.color + '30', data.color + '50'] as [string, string]}
            style={styles.bowlGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Bowl shape */}
          <View style={[styles.bowl, { borderColor: data.color + '60' }]}>
            {/* Bowl inner with topping fill */}
            <View style={[styles.bowlInner, { backgroundColor: data.color + '20' }]}>
              {/* Main large emoji */}
              <Text style={styles.mainEmoji}>{data.emoji}</Text>
            </View>

            {/* Bowl rim highlight */}
            <View style={[styles.bowlRim, { backgroundColor: data.color + '40' }]} />
          </View>

          {/* Floating small emojis around */}
          <Text style={[styles.floatEmoji, styles.floatEmoji1]}>{data.emoji}</Text>
          <Text style={[styles.floatEmoji, styles.floatEmoji2]}>{data.emoji}</Text>
          <Text style={[styles.floatEmoji, styles.floatEmoji3]}>{data.emoji}</Text>
        </View>

        {/* Info section */}
        <View style={styles.plateInfo}>
          <Text style={[styles.plateName, isSelected && { color: data.color }]} numberOfLines={1}>
            {topping.name}
          </Text>
          <Text style={styles.platePrice}>${data.pricePerGram.toFixed(2)}/g</Text>
        </View>

        {/* Selected badge */}
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: data.color }]}>
            <Ionicons name="checkmark" size={12} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>

      {/* Controls when selected */}
      {isSelected && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, { borderColor: data.color }]}
            onPress={onRemove}
          >
            <Ionicons name="remove" size={18} color={data.color} />
          </TouchableOpacity>
          <View style={styles.controlInfo}>
            <Text style={[styles.controlGrams, { color: data.color }]}>{grams}g</Text>
            <Text style={styles.controlPrice}>${price}</Text>
          </View>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: data.color, borderColor: data.color }]}
            onPress={onAdd}
          >
            <Ionicons name="add" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

// Summary bar
const Summary: React.FC = () => {
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
    <View style={styles.summary}>
      <View>
        <Text style={styles.summaryTitle}>{order.toppings.length} topping{order.toppings.length > 1 ? 's' : ''}</Text>
        <Text style={styles.summaryGrams}>{totalGrams}g total weight</Text>
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
        const dataA = getToppingData(a.id);
        const dataB = getToppingData(b.id);
        return dataB.pricePerGram - dataA.pricePerGram;
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
      {/* Frozen yogurt cup */}
      <View style={styles.cupSection}>
        <FroYoCup />
      </View>

      {/* Summary */}
      <Summary />

      {/* Hint */}
      <View style={styles.hint}>
        <Ionicons name="hand-left-outline" size={14} color={colors.accent.gold} />
        <Text style={styles.hintText}>Tap to add toppings to your cup!</Text>
      </View>

      {/* Topping plates */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Choose Your Toppings</Text>
        <View style={styles.platesGrid}>
          {sortedToppings.map((topping, index) => (
            <ToppingPlate
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
    height: 20,
  },
  toppingDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toppingMiniEmoji: {
    fontSize: 10,
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
    right: -4,
    backgroundColor: colors.accent.gold,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toppingBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent.gold + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  summaryGrams: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
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
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  platesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  plateContainer: {
    width: PLATE_WIDTH,
  },
  plate: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.medium,
  },
  plateSelected: {
    borderColor: colors.accent.gold,
  },
  bowlContainer: {
    height: 90,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bowlGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: borderRadius.xl - 2,
    borderTopRightRadius: borderRadius.xl - 2,
  },
  bowl: {
    width: 70,
    height: 55,
    borderRadius: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    overflow: 'hidden',
    ...shadows.small,
  },
  bowlInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  bowlRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  mainEmoji: {
    fontSize: 32,
  },
  floatEmoji: {
    position: 'absolute',
    fontSize: 14,
  },
  floatEmoji1: {
    top: 10,
    left: 15,
    transform: [{ rotate: '-15deg' }],
  },
  floatEmoji2: {
    top: 8,
    right: 18,
    transform: [{ rotate: '20deg' }],
  },
  floatEmoji3: {
    bottom: 8,
    right: 25,
    fontSize: 12,
    transform: [{ rotate: '-10deg' }],
  },
  plateInfo: {
    padding: spacing.sm,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  plateName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.text.primary,
    textAlign: 'center',
  },
  platePrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  controlInfo: {
    alignItems: 'center',
  },
  controlGrams: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700' as const,
  },
  controlPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.ui.success,
    fontWeight: '600' as const,
  },
});

export default ToppingsStep;
