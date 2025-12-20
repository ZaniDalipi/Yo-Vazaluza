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
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.45, 180);
const CUP_HEIGHT = CUP_WIDTH * 1.2;
const PLATE_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

// Topping data with icons and colors
const TOPPING_DATA: Record<string, { color: string; darkColor: string; emoji: string; pricePerGram: number; maxGrams: number }> = {
  'fresh-strawberries': { color: '#E53935', darkColor: '#C62828', emoji: '🍓', pricePerGram: 0.10, maxGrams: 30 },
  'blueberries': { color: '#3949AB', darkColor: '#283593', emoji: '🫐', pricePerGram: 0.10, maxGrams: 30 },
  'mango-chunks': { color: '#FFB300', darkColor: '#FF8F00', emoji: '🥭', pricePerGram: 0.08, maxGrams: 30 },
  'banana-slices': { color: '#FFF59D', darkColor: '#FBC02D', emoji: '🍌', pricePerGram: 0.06, maxGrams: 35 },
  'm&ms': { color: '#E91E63', darkColor: '#C2185B', emoji: '🍬', pricePerGram: 0.08, maxGrams: 25 },
  'gummy-bears': { color: '#FF7043', darkColor: '#E64A19', emoji: '🐻', pricePerGram: 0.07, maxGrams: 30 },
  'sprinkles': { color: '#EC407A', darkColor: '#D81B60', emoji: '✨', pricePerGram: 0.05, maxGrams: 20 },
  'cookie-crumbs': { color: '#8D6E63', darkColor: '#6D4C41', emoji: '🍪', pricePerGram: 0.06, maxGrams: 30 },
  'walnuts': { color: '#A1887F', darkColor: '#795548', emoji: '🥜', pricePerGram: 0.15, maxGrams: 20 },
  'almonds': { color: '#BCAAA4', darkColor: '#8D6E63', emoji: '🌰', pricePerGram: 0.15, maxGrams: 20 },
  'peanuts': { color: '#D7CCC8', darkColor: '#A1887F', emoji: '🥜', pricePerGram: 0.12, maxGrams: 25 },
  'granola': { color: '#D7CCC8', darkColor: '#BCAAA4', emoji: '🥣', pricePerGram: 0.05, maxGrams: 35 },
  'fruity-pebbles': { color: '#9C27B0', darkColor: '#7B1FA2', emoji: '🌈', pricePerGram: 0.04, maxGrams: 35 },
};

const getToppingData = (id: string) => {
  const key = id.toLowerCase().replace(/\s+/g, '-');
  return TOPPING_DATA[key] || { color: '#FFB74D', darkColor: '#F57C00', emoji: '🍬', pricePerGram: 0.05, maxGrams: 30 };
};

// Frozen yogurt cup with toppings
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

  // Generate topping positions
  const toppingPositions = useMemo(() => {
    const positions = [
      { top: 15, left: '15%' },
      { top: 8, left: '45%' },
      { top: 20, left: '70%' },
      { top: 35, left: '25%' },
      { top: 30, left: '55%' },
      { top: 45, left: '40%' },
    ];
    return positions;
  }, []);

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

        {/* Toppings on swirl with emojis */}
        {order.toppings.slice(0, 6).map((sel, i) => {
          const data = getToppingData(sel.topping.id);
          const pos = toppingPositions[i];
          return (
            <ToppingEmoji
              key={sel.topping.id}
              emoji={data.emoji}
              position={pos}
              delay={i * 100}
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

          {/* Yogurt fill with flavor colors */}
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

      {/* Topping count badge */}
      {order.toppings.length > 0 && (
        <View style={styles.toppingBadge}>
          <Text style={styles.toppingBadgeText}>{order.toppings.length} topping{order.toppings.length > 1 ? 's' : ''}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// Animated topping emoji
const ToppingEmoji: React.FC<{
  emoji: string;
  position: { top: number; left: string };
  delay: number;
}> = ({ emoji, position, delay }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.toppingEmoji,
        {
          top: position.top,
          left: position.left as any,
          opacity: bounceAnim,
          transform: [
            {
              scale: bounceAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1.3, 1],
              }),
            },
            {
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

// Topping plate with emoji icon
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

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTap = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0.5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    onTap();
  };

  // Generate pieces for the plate
  const pieces = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push({
        x: 10 + Math.random() * (PLATE_WIDTH - 70),
        y: 10 + Math.random() * 35,
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 45 - 22,
      });
    }
    return arr;
  }, []);

  const price = (data.pricePerGram * grams).toFixed(2);

  return (
    <Animated.View style={[
      styles.plateContainer,
      {
        opacity: scaleAnim,
        transform: [
          { scale: scaleAnim },
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
        {/* Plate surface with colored pieces */}
        <View style={styles.plateSurface}>
          <LinearGradient
            colors={[`${data.color}15`, `${data.color}25`] as const}
            style={styles.plateGradient}
          />

          {/* Topping pieces */}
          {pieces.map((p, i) => (
            <View
              key={i}
              style={[
                styles.platePiece,
                {
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size * 0.7,
                  backgroundColor: i % 3 === 0 ? data.darkColor : data.color,
                  borderRadius: p.size / 3,
                  transform: [{ rotate: `${p.rotation}deg` }],
                },
              ]}
            />
          ))}

          {/* Plate rim */}
          <View style={[styles.plateRim, { borderColor: `${data.color}40` }]} />
        </View>

        {/* Label with emoji */}
        <View style={styles.plateLabel}>
          <Text style={styles.plateEmoji}>{data.emoji}</Text>
          <Text style={styles.plateName} numberOfLines={1}>{topping.name}</Text>
          <Text style={styles.platePrice}>${data.pricePerGram.toFixed(2)}/g</Text>
        </View>

        {/* Selected badge */}
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: data.color }]}>
            <Text style={styles.selectedBadgeText}>{grams}g</Text>
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
    fontSize: 16,
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
  toppingBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  toppingBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.accent.gold,
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
  plateSurface: {
    height: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  plateGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  platePiece: {
    position: 'absolute',
  },
  plateRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: borderRadius.xl - 2,
  },
  plateLabel: {
    padding: spacing.sm,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  plateEmoji: {
    fontSize: 24,
  },
  plateName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginTop: 4,
  },
  platePrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  selectedBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
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
