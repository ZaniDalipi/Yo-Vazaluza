import React, { useRef, useEffect, useMemo } from 'react';
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
import { Topping } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUP_WIDTH = Math.min(SCREEN_WIDTH * 0.4, 160);
const CUP_HEIGHT = CUP_WIDTH * 1.2;

// Get topping emoji from actual topping object (from admin data)
const getToppingEmoji = (topping: { emoji?: string }) => {
  return topping.emoji || '🍬';
};

// Sauce color and data
const getSauceData = (name: string): { color: string; darkColor: string; emoji: string } => {
  const lower = name.toLowerCase();
  if (lower.includes('chocolate') || lower.includes('fudge')) {
    return { color: '#5C4033', darkColor: '#3E2723', emoji: '🍫' };
  }
  if (lower.includes('caramel')) {
    return { color: '#D4A574', darkColor: '#B8860B', emoji: '🍯' };
  }
  if (lower.includes('strawberry')) {
    return { color: '#E53935', darkColor: '#C62828', emoji: '🍓' };
  }
  if (lower.includes('peanut')) {
    return { color: '#C19A6B', darkColor: '#8B7355', emoji: '🥜' };
  }
  return { color: '#5C4033', darkColor: '#3E2723', emoji: '🍫' };
};

// Mini sauce dispenser button
const SauceDispenser: React.FC<{
  sauce: Topping;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}> = ({ sauce, isSelected, onPress, index }) => {
  const data = getSauceData(sauce.name);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(1);
    }
  }, [isSelected]);

  return (
    <Animated.View style={[
      styles.dispenserBtn,
      { opacity: scaleAnim, transform: [{ scale: Animated.multiply(scaleAnim, bounceAnim) }] }
    ]}>
      <TouchableOpacity
        style={[
          styles.dispenserBtnInner,
          { backgroundColor: isSelected ? data.color : '#FFF' },
          isSelected && styles.dispenserBtnSelected
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.dispenserEmoji}>{data.emoji}</Text>
        <Text style={[styles.dispenserLabel, isSelected && { color: '#FFF' }]} numberOfLines={1}>
          {sauce.name.split(' ')[0]}
        </Text>
        {isSelected && (
          <View style={styles.dispenserCheck}>
            <Ionicons name="checkmark" size={10} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main sauce dispensing area with cup
const SauceStation: React.FC<{
  sauces: Topping[];
  selectedSauces: Topping[];
  onToggle: (sauce: Topping) => void;
}> = ({ sauces, selectedSauces, onToggle }) => {
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
    if (order.flavors.length === 0) return ['#FFB6C1', '#FFC0CB'];
    if (order.flavors.length === 1) return [order.flavors[0].color, order.flavors[0].color];
    return order.flavors.map(f => f.color);
  }, [order.flavors]);

  useEffect(() => {
    // Cup wobble when sauces change
    Animated.sequence([
      Animated.timing(wobbleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [selectedSauces.length]);

  const cupBottomWidth = CUP_WIDTH * 0.7;

  return (
    <View style={styles.stationContainer}>
      {/* Sauce dispensers row */}
      <View style={styles.dispensersRow}>
        {sauces.map((sauce, i) => (
          <SauceDispenser
            key={sauce.id}
            sauce={sauce}
            isSelected={selectedSauces.some(s => s.id === sauce.id)}
            onPress={() => onToggle(sauce)}
            index={i}
          />
        ))}
      </View>

      {/* Cup */}
      <Animated.View
        style={[
          styles.cupContainer,
          {
            transform: [
              {
                rotate: wobbleAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-2deg', '0deg', '2deg'],
                }),
              },
            ],
          },
        ]}
      >
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
              <View style={styles.cupBrand}>
                <Text style={styles.cupBrandText}>Yo-V</Text>
              </View>
              <View style={[styles.cupShine, { height: CUP_HEIGHT * 0.5 }]} />
            </LinearGradient>

            {/* Inner cup with yogurt, toppings, and drizzles */}
            <View style={styles.cupInner}>
              {/* Yogurt fill */}
              <View style={[styles.yogurtFill, { height: `${fillLevel * 85}%` }]}>
                <LinearGradient
                  colors={flavorColors.length > 1 ? flavorColors as [string, string, ...string[]] : [flavorColors[0], flavorColors[0]] as [string, string]}
                  locations={flavorColors.length > 1 ? flavorColors.map((_, i) => i / (flavorColors.length - 1)) as [number, number, ...number[]] : [0, 1] as [number, number]}
                  style={styles.yogurtGradient}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                />
              </View>

              {/* Toppings on surface */}
              <View style={styles.toppingsOnYogurt}>
                {order.toppings.slice(0, 4).map((sel, i) => {
                  const emoji = getToppingEmoji(sel.topping);
                  const positions = [
                    { left: 12, top: 4 },
                    { left: 40, top: 2 },
                    { left: 68, top: 5 },
                    { left: 96, top: 3 },
                  ];
                  const pos = positions[i];
                  return (
                    <Text key={sel.topping.id} style={[styles.toppingMini, { left: pos.left, top: pos.top }]}>
                      {emoji}
                    </Text>
                  );
                })}
              </View>

              {/* Sauce drizzles on top - wavy pattern style */}
              <View style={styles.sauceDrizzles}>
                {selectedSauces.slice(0, 3).map((sauce, i) => {
                  const data = getSauceData(sauce.name);
                  // Create wavy drizzle patterns for each sauce
                  const drizzlePatterns = [
                    // First sauce - zigzag across top
                    [
                      { left: 5, top: 8, width: 30, rotate: '15deg' },
                      { left: 25, top: 14, width: 35, rotate: '-10deg' },
                      { left: 55, top: 10, width: 28, rotate: '8deg' },
                      { left: 80, top: 16, width: 32, rotate: '-12deg' },
                    ],
                    // Second sauce - different pattern
                    [
                      { left: 10, top: 20, width: 25, rotate: '-8deg' },
                      { left: 35, top: 24, width: 40, rotate: '12deg' },
                      { left: 70, top: 22, width: 30, rotate: '-5deg' },
                    ],
                    // Third sauce - more drizzles
                    [
                      { left: 15, top: 30, width: 35, rotate: '10deg' },
                      { left: 50, top: 34, width: 28, rotate: '-15deg' },
                      { left: 85, top: 32, width: 22, rotate: '5deg' },
                    ],
                  ];
                  const patterns = drizzlePatterns[i] || drizzlePatterns[0];
                  return (
                    <React.Fragment key={sauce.id}>
                      {patterns.map((pattern, j) => (
                        <View
                          key={`${sauce.id}-drizzle-${j}`}
                          style={[
                            styles.sauceDrizzleLine,
                            {
                              left: pattern.left,
                              top: pattern.top,
                              width: pattern.width,
                              backgroundColor: data.color,
                              transform: [{ rotate: pattern.rotate }],
                            },
                          ]}
                        />
                      ))}
                      {/* Add sauce dots for pooling effect */}
                      <View
                        style={[
                          styles.sauceDot,
                          { left: 20 + i * 30, top: 12 + i * 8, backgroundColor: data.color },
                        ]}
                      />
                      <View
                        style={[
                          styles.sauceDot,
                          { left: 60 + i * 15, top: 18 + i * 6, backgroundColor: data.color, width: 6, height: 6 },
                        ]}
                      />
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Shadow */}
        <View style={[styles.cupShadow, { width: cupBottomWidth + 15 }]} />

        {/* Sauce count badge */}
        {selectedSauces.length > 0 && (
          <View style={styles.sauceBadge}>
            <Text style={styles.sauceBadgeText}>{selectedSauces.length}</Text>
          </View>
        )}
      </Animated.View>

      {/* Tap hint */}
      <View style={styles.tapHint}>
        <Ionicons name="hand-left-outline" size={14} color={colors.accent.gold} />
        <Text style={styles.tapHintText}>Tap a sauce to drizzle it on your cup!</Text>
      </View>
    </View>
  );
};

// Selected sauces preview chips
const SelectedSauces: React.FC = () => {
  const { order, removeSauce } = useOrder();

  if (order.sauces.length === 0) return null;

  return (
    <View style={styles.selectedContainer}>
      <View style={styles.selectedHeader}>
        <Text style={styles.selectedTitle}>Your Drizzles</Text>
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>{order.sauces.length}</Text>
        </View>
      </View>
      <View style={styles.selectedList}>
        {order.sauces.map((sauce) => {
          const data = getSauceData(sauce.name);
          return (
            <TouchableOpacity
              key={sauce.id}
              style={[styles.selectedChip, { borderColor: data.color }]}
              onPress={() => removeSauce(sauce.id)}
            >
              <Text style={styles.selectedChipEmoji}>{data.emoji}</Text>
              <Text style={[styles.selectedChipText, { color: data.color }]}>{sauce.name}</Text>
              <Ionicons name="close" size={14} color={data.color} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const SaucesStep: React.FC = () => {
  const { order, addSauce, removeSauce } = useOrder();
  const { toppings: allToppings } = useApp();

  // Filter only sauces
  const sauces = allToppings.filter(t => t.category === 'sauces');

  const handleToggle = (sauce: Topping) => {
    const isSelected = order.sauces.find(s => s.id === sauce.id);
    if (isSelected) {
      removeSauce(sauce.id);
    } else {
      addSauce(sauce);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main sauce station with cup and dispensers */}
      <SauceStation
        sauces={sauces}
        selectedSauces={order.sauces}
        onToggle={handleToggle}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected sauces */}
        <SelectedSauces />

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent.gold} />
          <Text style={styles.infoText}>Sauces are free and optional - add as many as you like!</Text>
        </View>

        {sauces.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍯</Text>
            <Text style={styles.emptyTitle}>No sauces available</Text>
            <Text style={styles.emptyText}>Check back soon for yummy drizzles!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stationContainer: {
    backgroundColor: colors.background.main,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    alignItems: 'center',
  },
  dispensersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  dispenserBtn: {
    alignItems: 'center',
  },
  dispenserBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  dispenserBtnSelected: {
    borderColor: 'transparent',
  },
  dispenserEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  dispenserLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  dispenserCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.ui.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cupContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
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
  cupBrand: {
    position: 'absolute',
    bottom: '20%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cupBrandText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 0.3,
  },
  cupShine: {
    position: 'absolute',
    top: 14,
    left: 10,
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
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
  toppingMini: {
    position: 'absolute',
    fontSize: 12,
  },
  sauceDrizzles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  sauceDrizzleLine: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  sauceDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  cupShadow: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  sauceBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.accent.gold,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  sauceBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tapHintText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  selectedContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  selectedCount: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    marginLeft: spacing.sm,
  },
  selectedCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    gap: spacing.xs,
  },
  selectedChipEmoji: {
    fontSize: 14,
  },
  selectedChipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500' as const,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent.gold + '15',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
});

export default SaucesStep;
