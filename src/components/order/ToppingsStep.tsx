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
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.5, 200);
const CUP_HEIGHT = CUP_WIDTH * 1.3;
const PLATE_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

// Topping data with actual colors
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
  'almonds': { color: '#BCAAA4', darkColor: '#8D6E63', emoji: '🥜', pricePerGram: 0.15, maxGrams: 20 },
  'peanuts': { color: '#D7CCC8', darkColor: '#A1887F', emoji: '🥜', pricePerGram: 0.12, maxGrams: 25 },
  'granola': { color: '#D7CCC8', darkColor: '#BCAAA4', emoji: '🥣', pricePerGram: 0.05, maxGrams: 35 },
  'fruity-pebbles': { color: '#9C27B0', darkColor: '#7B1FA2', emoji: '🥣', pricePerGram: 0.04, maxGrams: 35 },
};

const getToppingData = (id: string) => {
  const key = id.toLowerCase().replace(/\s+/g, '-');
  return TOPPING_DATA[key] || { color: '#FFB74D', darkColor: '#F57C00', emoji: '🍬', pricePerGram: 0.05, maxGrams: 30 };
};

// Animated topping piece that falls onto the cup
const FallingTopping: React.FC<{
  type: string;
  startX: number;
  endX: number;
  endY: number;
  delay: number;
  size: number;
}> = ({ type, startX, endX, endY, delay, size }) => {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const data = getToppingData(type);
  const normalized = type.toLowerCase().replace(/\s+/g, '-');

  const getShape = () => {
    switch (normalized) {
      case 'fresh-strawberries':
        return { width: size, height: size * 1.2, borderRadius: size / 2 };
      case 'blueberries':
        return { width: size * 0.8, height: size * 0.8, borderRadius: size };
      case 'mango-chunks':
        return { width: size, height: size * 0.7, borderRadius: 4 };
      case 'banana-slices':
        return { width: size * 1.2, height: size * 0.4, borderRadius: size };
      case 'm&ms':
      case 'gummy-bears':
        return { width: size * 0.7, height: size * 0.5, borderRadius: size / 2 };
      case 'sprinkles':
        return { width: size * 0.2, height: size, borderRadius: 2 };
      case 'cookie-crumbs':
      case 'walnuts':
      case 'almonds':
      case 'peanuts':
        return { width: size * 0.8, height: size * 0.5, borderRadius: 4 };
      default:
        return { width: size * 0.6, height: size * 0.6, borderRadius: size / 2 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.fallingTopping,
        getShape(),
        {
          backgroundColor: data.color,
          left: startX,
          transform: [
            {
              translateX: fallAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, endX - startX],
              }),
            },
            {
              translateY: fallAnim.interpolate({
                inputRange: [0, 0.6, 1],
                outputRange: [-50, endY + 10, endY],
              }),
            },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${Math.random() * 360}deg`],
              }),
            },
            {
              scale: fallAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1.2, 1],
              }),
            },
          ],
        },
      ]}
    />
  );
};

// Frozen yogurt cup with swirl
const FroYoCup: React.FC = () => {
  const { order } = useOrder();
  const [toppingPieces, setToppingPieces] = useState<Array<{
    id: string;
    type: string;
    startX: number;
    endX: number;
    endY: number;
    size: number;
  }>>([]);

  // Get flavor colors - default to white/cream when no flavors selected
  const flavorColors = order.flavors.length > 0
    ? order.flavors.map(f => f.color)
    : ['#FFFFFF', '#F5F5F5'];

  const primaryColor = flavorColors[0];
  const secondaryColor = flavorColors[1] || flavorColors[0];

  // Generate topping pieces when toppings change
  useEffect(() => {
    const pieces: typeof toppingPieces = [];
    let pieceIndex = 0;

    order.toppings.forEach((sel) => {
      const count = Math.max(3, Math.floor(sel.grams / 5));
      for (let i = 0; i < count; i++) {
        pieces.push({
          id: `${sel.topping.id}-${pieceIndex++}`,
          type: sel.topping.name,
          startX: CUP_WIDTH / 2 - 10 + Math.random() * 20,
          endX: 20 + Math.random() * (CUP_WIDTH - 60),
          endY: 30 + Math.random() * 60,
          size: 10 + Math.random() * 8,
        });
      }
    });

    setToppingPieces(pieces);
  }, [order.toppings]);

  return (
    <View style={styles.cupContainer}>
      {/* Soft-serve swirl */}
      <View style={styles.swirlContainer}>
        {/* Base swirl layers */}
        <View style={[styles.swirlLayer, styles.swirlLayer1, { backgroundColor: primaryColor }]} />
        <View style={[styles.swirlLayer, styles.swirlLayer2, { backgroundColor: secondaryColor }]} />
        <View style={[styles.swirlLayer, styles.swirlLayer3, { backgroundColor: primaryColor }]} />
        <View style={[styles.swirlLayer, styles.swirlLayer4, { backgroundColor: secondaryColor }]} />
        {/* Tip */}
        <View style={[styles.swirlTip, { backgroundColor: primaryColor }]} />
        {/* Highlights */}
        <View style={styles.swirlHighlight1} />
        <View style={styles.swirlHighlight2} />
      </View>

      {/* Cup */}
      <View style={styles.cup}>
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5', '#EEEEEE'] as const}
          style={styles.cupGradient}
        >
          {/* Cup rim */}
          <View style={styles.cupRim} />

          {/* Yogurt fill inside */}
          <View style={styles.yogurtFill}>
            <LinearGradient
              colors={[primaryColor, secondaryColor] as const}
              style={styles.yogurtGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          {/* Cup pattern */}
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.cupStripe, { top: 35 + i * 25 }]} />
          ))}

          {/* Brand */}
          <View style={styles.cupBrand}>
            <Text style={styles.cupBrandText}>Yo-V</Text>
          </View>

          {/* Shine */}
          <View style={styles.cupShine} />

          {/* Toppings on yogurt */}
          {toppingPieces.map((piece, i) => (
            <FallingTopping
              key={piece.id}
              type={piece.type}
              startX={piece.startX}
              endX={piece.endX}
              endY={piece.endY}
              delay={i * 50}
              size={piece.size}
            />
          ))}
        </LinearGradient>
      </View>

      {/* Shadow */}
      <View style={styles.cupShadow} />

      {/* Flavor label */}
      {order.flavors.length > 0 && (
        <View style={styles.flavorLabel}>
          <Text style={styles.flavorLabelText} numberOfLines={1}>
            {order.flavors.map(f => f.name).join(' + ')}
          </Text>
        </View>
      )}
    </View>
  );
};

// Topping plate with actual colored pieces
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
    // Shake animation
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
    for (let i = 0; i < 12; i++) {
      arr.push({
        x: 8 + Math.random() * (PLATE_WIDTH - 60),
        y: 8 + Math.random() * 45,
        size: 8 + Math.random() * 10,
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
          {/* Plate base gradient */}
          <LinearGradient
            colors={[`${data.color}15`, `${data.color}25`] as const}
            style={styles.plateGradient}
          />

          {/* Topping pieces with actual colors */}
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

        {/* Label */}
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
        <Text style={styles.hintText}>Tap to add • Toppings animate onto cup!</Text>
      </View>

      {/* Topping plates */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>🍽️ Choose Your Toppings</Text>
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
        <View style={{ height: 120 }} />
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
  },
  cupContainer: {
    width: CUP_WIDTH,
    alignItems: 'center',
  },
  swirlContainer: {
    width: CUP_WIDTH * 0.7,
    height: 80,
    position: 'relative',
    marginBottom: -15,
    zIndex: 10,
  },
  swirlLayer: {
    position: 'absolute',
    borderRadius: 50,
  },
  swirlLayer1: {
    width: '100%',
    height: 28,
    bottom: 0,
  },
  swirlLayer2: {
    width: '85%',
    height: 24,
    bottom: 18,
    left: '7%',
    transform: [{ rotate: '-5deg' }],
  },
  swirlLayer3: {
    width: '70%',
    height: 22,
    bottom: 35,
    left: '5%',
    transform: [{ rotate: '8deg' }],
  },
  swirlLayer4: {
    width: '55%',
    height: 20,
    bottom: 50,
    left: '15%',
    transform: [{ rotate: '-3deg' }],
  },
  swirlTip: {
    position: 'absolute',
    width: 20,
    height: 30,
    bottom: 62,
    left: '35%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    transform: [{ rotate: '15deg' }],
  },
  swirlHighlight1: {
    position: 'absolute',
    width: 15,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    bottom: 55,
    left: '20%',
    transform: [{ rotate: '-10deg' }],
  },
  swirlHighlight2: {
    position: 'absolute',
    width: 10,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    bottom: 25,
    left: '60%',
  },
  cup: {
    width: CUP_WIDTH,
    height: CUP_HEIGHT,
    overflow: 'hidden',
  },
  cupGradient: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: CUP_WIDTH * 0.35,
    borderBottomRightRadius: CUP_WIDTH * 0.35,
    position: 'relative',
  },
  cupRim: {
    position: 'absolute',
    top: -4,
    left: -6,
    right: -6,
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  yogurtFill: {
    position: 'absolute',
    top: 20,
    left: 12,
    right: 12,
    height: CUP_HEIGHT * 0.5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  yogurtGradient: {
    flex: 1,
  },
  cupStripe: {
    position: 'absolute',
    left: 15,
    right: 15,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  cupBrand: {
    position: 'absolute',
    bottom: '30%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cupBrandText: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
    letterSpacing: 1,
  },
  cupShine: {
    position: 'absolute',
    top: 25,
    left: 18,
    width: 10,
    height: CUP_HEIGHT * 0.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 5,
  },
  fallingTopping: {
    position: 'absolute',
    zIndex: 20,
  },
  cupShadow: {
    width: CUP_WIDTH * 0.6,
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  flavorLabel: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    maxWidth: CUP_WIDTH + 40,
    ...shadows.small,
  },
  flavorLabelText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
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
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  summaryGrams: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  summaryPrice: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
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
    fontWeight: typography.fontWeights.bold,
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
    height: 70,
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
    fontSize: 22,
  },
  plateName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginTop: 2,
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
    fontWeight: typography.fontWeights.bold,
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
    fontWeight: typography.fontWeights.bold,
  },
  controlPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.ui.success,
    fontWeight: typography.fontWeights.semibold,
  },
});

export default ToppingsStep;
