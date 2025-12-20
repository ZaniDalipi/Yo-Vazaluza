import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Topping, ToppingSelection } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOWL_SIZE = Math.min(SCREEN_WIDTH * 0.85, 340);

// Topping pricing data - sorted by price (most expensive first)
const TOPPING_PRICES: Record<string, { pricePerGram: number; maxGrams: number; emoji: string }> = {
  // Premium toppings - $0.15/g
  'walnuts': { pricePerGram: 0.15, maxGrams: 20, emoji: '🥜' },
  'almonds': { pricePerGram: 0.15, maxGrams: 20, emoji: '🥜' },
  'peanuts': { pricePerGram: 0.12, maxGrams: 25, emoji: '🥜' },
  // Medium toppings - $0.08-0.10/g
  'blueberries': { pricePerGram: 0.10, maxGrams: 30, emoji: '🫐' },
  'fresh-strawberries': { pricePerGram: 0.10, maxGrams: 30, emoji: '🍓' },
  'mango-chunks': { pricePerGram: 0.08, maxGrams: 30, emoji: '🥭' },
  'banana-slices': { pricePerGram: 0.06, maxGrams: 35, emoji: '🍌' },
  // Candy - $0.08/g
  'm&ms': { pricePerGram: 0.08, maxGrams: 25, emoji: '🍬' },
  'gummy-bears': { pricePerGram: 0.07, maxGrams: 30, emoji: '🐻' },
  'sprinkles': { pricePerGram: 0.05, maxGrams: 20, emoji: '✨' },
  // Budget toppings - $0.04-0.06/g
  'cookie-crumbs': { pricePerGram: 0.06, maxGrams: 30, emoji: '🍪' },
  'granola': { pricePerGram: 0.05, maxGrams: 35, emoji: '🥣' },
  'fruity-pebbles': { pricePerGram: 0.04, maxGrams: 35, emoji: '🥣' },
};

// Get topping info with defaults
const getToppingInfo = (id: string) => {
  const key = id.toLowerCase().replace(/\s+/g, '-');
  return TOPPING_PRICES[key] || { pricePerGram: 0.05, maxGrams: 30, emoji: '🍬' };
};

// SVG-style topping shapes for the bowl
const ToppingShape: React.FC<{
  type: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}> = ({ type, x, y, size, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

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

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500 + Math.random() * 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getShapeStyle = () => {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
    switch (normalizedType) {
      case 'fresh-strawberries':
        return {
          width: size,
          height: size * 1.2,
          backgroundColor: '#E53935',
          borderRadius: size / 2,
          borderBottomLeftRadius: size / 4,
          borderBottomRightRadius: size / 4,
        };
      case 'blueberries':
        return {
          width: size * 0.8,
          height: size * 0.8,
          backgroundColor: '#3949AB',
          borderRadius: size,
        };
      case 'mango-chunks':
        return {
          width: size,
          height: size * 0.7,
          backgroundColor: '#FFB300',
          borderRadius: size / 4,
        };
      case 'banana-slices':
        return {
          width: size * 1.2,
          height: size * 0.5,
          backgroundColor: '#FFF59D',
          borderRadius: size,
          borderWidth: 1,
          borderColor: '#F9A825',
        };
      case 'm&ms':
        return {
          width: size * 0.7,
          height: size * 0.5,
          backgroundColor: ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA'][Math.floor(Math.random() * 5)],
          borderRadius: size,
        };
      case 'gummy-bears':
        return {
          width: size * 0.8,
          height: size,
          backgroundColor: ['#E53935', '#FDD835', '#43A047', '#FB8C00'][Math.floor(Math.random() * 4)],
          borderRadius: size / 3,
        };
      case 'sprinkles':
        return {
          width: size * 0.3,
          height: size,
          backgroundColor: ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B'][Math.floor(Math.random() * 5)],
          borderRadius: size / 6,
          transform: [{ rotate: `${Math.random() * 90 - 45}deg` }],
        };
      case 'cookie-crumbs':
        return {
          width: size * 0.9,
          height: size * 0.7,
          backgroundColor: '#8D6E63',
          borderRadius: size / 4,
        };
      case 'walnuts':
      case 'almonds':
      case 'peanuts':
        return {
          width: size,
          height: size * 0.6,
          backgroundColor: '#A1887F',
          borderRadius: size / 3,
        };
      case 'granola':
      case 'fruity-pebbles':
        return {
          width: size * 0.6,
          height: size * 0.5,
          backgroundColor: normalizedType === 'fruity-pebbles'
            ? ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA'][Math.floor(Math.random() * 5)]
            : '#D7CCC8',
          borderRadius: size / 4,
        };
      default:
        return {
          width: size * 0.8,
          height: size * 0.8,
          backgroundColor: colors.accent.gold,
          borderRadius: size,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.toppingShape,
        getShapeStyle(),
        {
          left: x,
          top: y,
          transform: [
            { scale: scaleAnim },
            {
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -3],
              }),
            },
          ],
        },
      ]}
    />
  );
};

// Visual yogurt bowl with toppings
const YogurtBowl: React.FC = () => {
  const { order } = useOrder();
  const [toppingPositions, setToppingPositions] = useState<Array<{ type: string; x: number; y: number; size: number; id: string }>>([]);

  // Get primary flavor color
  const flavorColor = order.flavors[0]?.color || colors.flavors.vanilla;
  const secondaryFlavorColor = order.flavors[1]?.color || flavorColor;

  // Generate topping positions when toppings change
  useEffect(() => {
    const positions: Array<{ type: string; x: number; y: number; size: number; id: string }> = [];
    const bowlRadius = BOWL_SIZE / 2 - 30;
    const centerX = BOWL_SIZE / 2;
    const centerY = BOWL_SIZE / 2;

    order.toppings.forEach((selection) => {
      // Number of pieces based on grams
      const pieces = Math.max(3, Math.floor(selection.grams / 4));

      for (let i = 0; i < pieces; i++) {
        // Distribute in bowl area (ellipse shape)
        const angle = (i / pieces) * Math.PI * 2 + Math.random() * 0.5;
        const distance = (0.3 + Math.random() * 0.5) * bowlRadius;
        const x = centerX + Math.cos(angle) * distance - 10;
        const y = centerY + Math.sin(angle) * distance * 0.6 - 20;

        positions.push({
          type: selection.topping.name,
          x,
          y,
          size: 12 + Math.random() * 8,
          id: `${selection.topping.id}-${i}`,
        });
      }
    });

    setToppingPositions(positions);
  }, [order.toppings]);

  return (
    <View style={styles.bowlContainer}>
      {/* Bowl shadow */}
      <View style={styles.bowlShadow} />

      {/* Main bowl */}
      <View style={styles.bowl}>
        {/* Yogurt base with gradient */}
        <LinearGradient
          colors={[flavorColor, secondaryFlavorColor, `${flavorColor}DD`]}
          style={styles.yogurtBase}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Swirl pattern */}
          <View style={[styles.swirl, { borderColor: `${secondaryFlavorColor}40` }]} />
          <View style={[styles.swirl, styles.swirlMedium, { borderColor: `${flavorColor}30` }]} />
          <View style={[styles.swirl, styles.swirlSmall, { borderColor: `${secondaryFlavorColor}50` }]} />

          {/* Shine effect */}
          <View style={styles.shine} />
        </LinearGradient>

        {/* Toppings on top */}
        {toppingPositions.map((pos, index) => (
          <ToppingShape
            key={pos.id}
            type={pos.type}
            x={pos.x}
            y={pos.y}
            size={pos.size}
            delay={index * 30}
          />
        ))}
      </View>

      {/* Bowl rim */}
      <View style={styles.bowlRim}>
        <LinearGradient
          colors={['#FAFAFA', '#E0E0E0', '#FAFAFA']}
          style={styles.rimGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      {/* Flavor label */}
      {order.flavors.length > 0 && (
        <View style={styles.flavorLabel}>
          <Text style={styles.flavorLabelText}>
            {order.flavors.map(f => f.name).join(' + ')}
          </Text>
        </View>
      )}
    </View>
  );
};

// Topping slider for weight selection
const ToppingSlider: React.FC<{
  topping: Topping;
  selection?: ToppingSelection;
  onAdd: (grams: number) => void;
  onUpdate: (grams: number) => void;
  onRemove: () => void;
  index: number;
}> = ({ topping, selection, onAdd, onUpdate, onRemove, index }) => {
  const info = getToppingInfo(topping.id);
  const isSelected = !!selection;
  const grams = selection?.grams || 0;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(grams)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    slideAnim.setValue(grams);
  }, [grams]);

  const handlePress = () => {
    if (!isSelected) {
      onAdd(10); // Start with 10g
    }
  };

  const handleSlide = (value: number) => {
    const newGrams = Math.round(value);
    if (newGrams <= 0) {
      onRemove();
    } else {
      onUpdate(newGrams);
    }
  };

  const price = (info.pricePerGram * grams).toFixed(2);

  return (
    <Animated.View
      style={[
        styles.sliderCard,
        isSelected && styles.sliderCardSelected,
        { opacity: scaleAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.sliderHeader}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Emoji and name */}
        <View style={styles.sliderInfo}>
          <Text style={styles.sliderEmoji}>{info.emoji}</Text>
          <View>
            <Text style={styles.sliderName}>{topping.name}</Text>
            <Text style={styles.sliderPrice}>
              ${info.pricePerGram.toFixed(2)}/g • Max {info.maxGrams}g
            </Text>
          </View>
        </View>

        {/* Add button or price */}
        {!isSelected ? (
          <View style={styles.addButton}>
            <Ionicons name="add" size={20} color="#FFF" />
          </View>
        ) : (
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>${price}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Slider when selected */}
      {isSelected && (
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderFill,
                { width: `${(grams / info.maxGrams) * 100}%` },
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: `${(grams / info.maxGrams) * 100}%` },
              ]}
            >
              <Text style={styles.thumbText}>{grams}g</Text>
            </View>
          </View>

          {/* Quick buttons */}
          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleSlide(Math.max(0, grams - 5))}
            >
              <Text style={styles.quickButtonText}>-5g</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => handleSlide(Math.min(info.maxGrams, grams + 5))}
            >
              <Text style={styles.quickButtonText}>+5g</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, styles.removeButton]}
              onPress={onRemove}
            >
              <Ionicons name="trash-outline" size={16} color={colors.ui.error} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

// Price summary bar
const PriceSummary: React.FC = () => {
  const { order } = useOrder();

  const toppingsTotal = useMemo(() => {
    return order.toppings.reduce((sum, sel) => {
      const info = getToppingInfo(sel.topping.id);
      return sum + (info.pricePerGram * sel.grams);
    }, 0);
  }, [order.toppings]);

  const totalGrams = useMemo(() => {
    return order.toppings.reduce((sum, sel) => sum + sel.grams, 0);
  }, [order.toppings]);

  if (order.toppings.length === 0) return null;

  return (
    <View style={styles.priceSummary}>
      <View style={styles.priceSummaryLeft}>
        <Text style={styles.priceSummaryLabel}>
          {order.toppings.length} topping{order.toppings.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.priceSummaryGrams}>{totalGrams}g total</Text>
      </View>
      <View style={styles.priceSummaryRight}>
        <Text style={styles.priceSummaryTotal}>+${toppingsTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const ToppingsStep: React.FC = () => {
  const { order, addTopping, updateToppingGrams, removeTopping } = useOrder();
  const { toppings: allToppings } = useApp();

  // Filter out sauces and sort by price (most expensive first)
  const sortedToppings = useMemo(() => {
    return allToppings
      .filter(t => t.category !== 'sauces')
      .sort((a, b) => {
        const infoA = getToppingInfo(a.id);
        const infoB = getToppingInfo(b.id);
        return infoB.pricePerGram - infoA.pricePerGram;
      });
  }, [allToppings]);

  const getSelection = (toppingId: string) => {
    return order.toppings.find(t => t.topping.id === toppingId);
  };

  return (
    <View style={styles.container}>
      {/* Yogurt bowl visualization */}
      <View style={styles.bowlSection}>
        <YogurtBowl />
      </View>

      {/* Price summary */}
      <PriceSummary />

      {/* Hint */}
      <View style={styles.hintBar}>
        <Ionicons name="information-circle" size={16} color={colors.accent.gold} />
        <Text style={styles.hintText}>
          Sorted by price • Tap to add, adjust weight with buttons
        </Text>
      </View>

      {/* Toppings list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sortedToppings.map((topping, index) => (
          <ToppingSlider
            key={topping.id}
            topping={topping}
            selection={getSelection(topping.id)}
            onAdd={(grams) => addTopping(topping, grams)}
            onUpdate={(grams) => updateToppingGrams(topping.id, grams)}
            onRemove={() => removeTopping(topping.id)}
            index={index}
          />
        ))}

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
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
    paddingVertical: spacing.md,
    backgroundColor: colors.background.main,
  },
  bowlContainer: {
    width: BOWL_SIZE,
    height: BOWL_SIZE * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bowlShadow: {
    position: 'absolute',
    bottom: 0,
    width: BOWL_SIZE * 0.7,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: BOWL_SIZE,
  },
  bowl: {
    width: BOWL_SIZE - 40,
    height: BOWL_SIZE * 0.55,
    borderRadius: BOWL_SIZE / 2,
    borderBottomLeftRadius: BOWL_SIZE / 3,
    borderBottomRightRadius: BOWL_SIZE / 3,
    overflow: 'hidden',
    ...shadows.medium,
  },
  yogurtBase: {
    flex: 1,
    position: 'relative',
  },
  swirl: {
    position: 'absolute',
    width: '80%',
    height: '60%',
    borderWidth: 3,
    borderRadius: 100,
    top: '20%',
    left: '10%',
  },
  swirlMedium: {
    width: '60%',
    height: '45%',
    top: '28%',
    left: '20%',
  },
  swirlSmall: {
    width: '40%',
    height: '30%',
    top: '35%',
    left: '30%',
  },
  shine: {
    position: 'absolute',
    top: 15,
    left: 25,
    width: 40,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    transform: [{ rotate: '-20deg' }],
  },
  toppingShape: {
    position: 'absolute',
    ...shadows.small,
  },
  bowlRim: {
    position: 'absolute',
    top: BOWL_SIZE * 0.12,
    width: BOWL_SIZE - 20,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  rimGradient: {
    flex: 1,
  },
  flavorLabel: {
    position: 'absolute',
    bottom: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    ...shadows.small,
  },
  flavorLabelText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  priceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent.gold + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  priceSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceSummaryLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  priceSummaryGrams: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
  priceSummaryRight: {},
  priceSummaryTotal: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.gold + '10',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  hintText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sliderCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  sliderCardSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '08',
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  sliderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sliderEmoji: {
    fontSize: 28,
  },
  sliderName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  sliderPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  priceTag: {
    backgroundColor: colors.ui.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  priceTagText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.ui.success,
  },
  sliderContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: colors.ui.border,
    borderRadius: 4,
    marginBottom: spacing.md,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.accent.gold,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -10,
    marginLeft: -20,
    width: 40,
    height: 28,
    backgroundColor: colors.accent.gold,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  thumbText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  quickButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  quickButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
  },
  removeButton: {
    borderColor: colors.ui.error + '50',
    backgroundColor: colors.ui.error + '10',
  },
});

export default ToppingsStep;
