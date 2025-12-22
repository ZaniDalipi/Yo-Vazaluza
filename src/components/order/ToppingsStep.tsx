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
import { useResponsive } from '../../hooks/useResponsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.35, 140);
const CUP_HEIGHT = CUP_WIDTH * 1.15;
const TOPPING_CARD_HEIGHT = 200; // Fixed height for consistent snap scrolling
const TOPPING_ROW_HEIGHT = TOPPING_CARD_HEIGHT + spacing.md; // Card height + margin

// Helper function to generate a lighter version of a color for backgrounds
const getLightColor = (hexColor: string): string => {
  // Default fallback
  if (!hexColor || !hexColor.startsWith('#')) return '#FFE0B2';

  try {
    // Parse hex color
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Mix with white to create lighter version (70% white, 30% original)
    const lightR = Math.round(r * 0.3 + 255 * 0.7);
    const lightG = Math.round(g * 0.3 + 255 * 0.7);
    const lightB = Math.round(b * 0.3 + 255 * 0.7);

    return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
  } catch {
    return '#FFE0B2';
  }
};

// Get topping display data from the actual topping object (from admin)
const getToppingDisplayData = (topping: Topping) => {
  const color = topping.color || '#FF9800';
  return {
    color,
    lightColor: getLightColor(color),
    emoji: topping.emoji || '🍬',
    pricePerGram: topping.pricePerGram || 0.05,
    maxGrams: topping.maxGrams || 30,
  };
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
              {order.toppings.map((sel, i) => {
                const data = getToppingDisplayData(sel.topping);
                // Generate dynamic positions for unlimited toppings
                const positions = [
                  { left: '10%', top: 2 },
                  { left: '35%', top: 0 },
                  { left: '60%', top: 3 },
                  { left: '85%', top: 1 },
                  { left: '22%', top: 10 },
                  { left: '48%', top: 8 },
                  { left: '72%', top: 11 },
                  { left: '5%', top: 18 },
                  { left: '30%', top: 16 },
                  { left: '55%', top: 19 },
                  { left: '80%', top: 17 },
                  { left: '18%', top: 24 },
                  { left: '42%', top: 22 },
                  { left: '68%', top: 25 },
                ];
                const pos = positions[i % positions.length];
                const row = Math.floor(i / positions.length);
                return (
                  <Text
                    key={sel.topping.id}
                    style={[
                      styles.toppingMini,
                      {
                        left: pos.left,
                        top: pos.top + (row * 28),
                        fontSize: 10 - (row * 2),
                        opacity: 1 - (row * 0.2),
                      }
                    ]}
                  >
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
  cardWidth?: number;
}> = ({ topping, selection, onTap, onAdd, onRemove, index, cardWidth }) => {
  const data = getToppingDisplayData(topping);
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
        width: cardWidth,
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
      const data = getToppingDisplayData(sel.topping);
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
          const data = getToppingDisplayData(sel.topping);
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
  const { isTablet, width: screenWidth } = useResponsive();

  // Responsive values
  const columns = isTablet ? 4 : 2;
  const horizontalPadding = isTablet ? 32 : spacing.lg;
  const gap = isTablet ? 16 : spacing.md;
  const cardWidth = (screenWidth - horizontalPadding * 2 - gap * (columns - 1)) / columns;

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
    const data = getToppingDisplayData(topping);
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
        <Ionicons name="hand-left-outline" size={isTablet ? 18 : 14} color={colors.accent.gold} />
        <Text style={[styles.hintText, { fontSize: isTablet ? 16 : typography.fontSizes.xs }]}>Tap to add toppings to your cup!</Text>
      </View>

      {/* Topping cards */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        snapToInterval={TOPPING_ROW_HEIGHT}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        <View style={[styles.grid, { gap }]}>
          {sortedToppings.map((topping, index) => (
            <ToppingCard
              key={topping.id}
              topping={topping}
              selection={getSelection(topping.id)}
              onTap={() => handleTap(topping)}
              onAdd={() => handleAdd(topping)}
              onRemove={() => handleRemove(topping)}
              index={index}
              cardWidth={cardWidth}
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
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
    fontSize: 16,
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardContainer: {
    height: TOPPING_CARD_HEIGHT,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
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
    fontSize: 48,
  },
  miniEmoji: {
    position: 'absolute',
    fontSize: 18,
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
