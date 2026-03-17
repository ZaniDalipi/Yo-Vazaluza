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

// Derive sauce visual data from topping color (works with any sauce added from admin)
const getSauceData = (sauce: Topping): { color: string; darkColor: string; lightColor: string; emoji: string } => {
  const baseColor = sauce.color || '#5C4033';
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const darkColor = `#${Math.round(r * 0.7).toString(16).padStart(2, '0')}${Math.round(g * 0.7).toString(16).padStart(2, '0')}${Math.round(b * 0.7).toString(16).padStart(2, '0')}`;
  const lighten = (v: number) => Math.min(255, Math.round(v + (255 - v) * 0.4));
  const lightColor = `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`;
  return { color: baseColor, darkColor, lightColor, emoji: sauce.emoji || '🍫' };
};

// Multi-select sauce grid - always visible, tap to toggle
const SauceSelector: React.FC<{
  sauces: Topping[];
  selectedSauces: Topping[];
  onToggle: (sauce: Topping) => void;
}> = ({ sauces, selectedSauces, onToggle }) => {
  const selectedIds = new Set(selectedSauces.map(s => s.id));

  return (
    <View style={styles.selectorContainer}>
      <View style={styles.sauceGrid}>
        {sauces.map((sauce) => {
          const sData = getSauceData(sauce);
          const isSelected = selectedIds.has(sauce.id);
          return (
            <TouchableOpacity
              key={sauce.id}
              style={[
                styles.sauceOption,
                isSelected && { backgroundColor: sData.color + '20', borderColor: sData.color },
              ]}
              onPress={() => onToggle(sauce)}
              activeOpacity={0.7}
            >
              <Text style={styles.sauceOptionEmoji}>{sauce.emoji || sData.emoji}</Text>
              <Text style={[
                styles.sauceOptionName,
                isSelected && { color: sData.color, fontWeight: '700' as const },
              ]} numberOfLines={1}>
                {sauce.name}
              </Text>
              {isSelected && (
                <View style={[styles.sauceOptionCheck, { backgroundColor: sData.color }]}>
                  <Ionicons name="checkmark" size={10} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
  const drizzleAnim = useRef(new Animated.Value(0)).current;

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

  const sauceCount = selectedSauces.length;
  const sauceKey = selectedSauces.map(s => s.id).join(',');

  useEffect(() => {
    if (sauceCount > 0) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]),
        Animated.timing(drizzleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(drizzleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [sauceKey]);

  const cupBottomWidth = CUP_WIDTH * 0.7;

  return (
    <View style={styles.stationContainer}>
      {/* Selected sauces summary */}
      <View style={styles.selectedSummary}>
        {sauceCount > 0 ? (
          <View style={styles.selectedBadges}>
            {selectedSauces.map((sauce) => {
              const sData = getSauceData(sauce);
              return (
                <TouchableOpacity
                  key={sauce.id}
                  style={[styles.selectedBadge, { backgroundColor: sData.color }]}
                  onPress={() => onToggle(sauce)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectedBadgeEmoji}>{sauce.emoji || sData.emoji}</Text>
                  <Text style={styles.selectedBadgeText} numberOfLines={1}>{sauce.name}</Text>
                  <Ionicons name="close" size={14} color="#FFF" />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noSelectionText}>Tap a sauce below to add it</Text>
        )}
      </View>

      {/* Sauce selector */}
      <SauceSelector
        sauces={sauces}
        selectedSauces={selectedSauces}
        onToggle={onToggle}
      />

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

            {/* Inner cup with yogurt and drizzle layers */}
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

              {/* Sauce layers - one per selected sauce, stacked */}
              {selectedSauces.map((sauce, index) => {
                const sauceData = getSauceData(sauce);
                return (
                  <Animated.View
                    key={sauce.id}
                    style={[
                      styles.sauceLayer,
                      {
                        top: index * 6,
                        opacity: drizzleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.75 - index * 0.1],
                        }),
                        transform: [{
                          scaleX: drizzleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        sauceData.color + 'DD',
                        sauceData.color + 'AA',
                        sauceData.lightColor + '66',
                        'transparent',
                      ] as [string, string, ...string[]]}
                      locations={[0, 0.3, 0.7, 1]}
                      style={styles.sauceGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                    <View style={styles.sauceWaves}>
                      <View style={[styles.sauceWave, styles.sauceWave1, { backgroundColor: sauceData.color + '88' }]} />
                      <View style={[styles.sauceWave, styles.sauceWave2, { backgroundColor: sauceData.color + '66' }]} />
                      <View style={[styles.sauceWave, styles.sauceWave3, { backgroundColor: sauceData.color + '44' }]} />
                    </View>
                    <View style={styles.sauceShine} />
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Shadow */}
        <View style={[styles.cupShadow, { width: cupBottomWidth + 15 }]} />
      </Animated.View>

      {/* Tap hint */}
      <View style={styles.tapHint}>
        {sauceCount > 0 ? (
          <>
            <Text style={{ fontSize: 14 }}>{selectedSauces.map(s => s.emoji || getSauceData(s).emoji).join(' ')}</Text>
            <Text style={styles.tapHintText}>
              {sauceCount === 1
                ? `${selectedSauces[0].name} drizzled on your cup!`
                : `${sauceCount} sauces drizzled on your cup!`}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="hand-left-outline" size={14} color={colors.accent.gold} />
            <Text style={styles.tapHintText}>Choose drizzles for your cup!</Text>
          </>
        )}
      </View>
    </View>
  );
};

const SaucesStep: React.FC = () => {
  const { order, addSauce, removeSauce } = useOrder();
  const { toppings: allToppings } = useApp();

  // Filter only sauces
  const sauces = allToppings.filter(t => t.category === 'sauces');

  const selectedSauces = order.sauces;

  const handleToggle = (sauce: Topping) => {
    const isSelected = selectedSauces.some(s => s.id === sauce.id);
    if (isSelected) {
      removeSauce(sauce.id);
    } else {
      addSauce(sauce);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main sauce station with cup */}
      <SauceStation
        sauces={sauces}
        selectedSauces={selectedSauces}
        onToggle={handleToggle}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent.gold} />
          <Text style={styles.infoText}>
            Pick your favorite drizzles to top your frozen yogurt - they're free!
          </Text>
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

  // Selected sauces summary
  selectedSummary: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
    ...shadows.small,
  },
  selectedBadgeEmoji: {
    fontSize: 16,
  },
  selectedBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600' as const,
    color: '#FFF',
    maxWidth: 100,
  },
  noSelectionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },

  // Sauce selector styles
  selectorContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  sauceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  sauceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    gap: spacing.xs,
    minWidth: 140,
    ...shadows.small,
  },
  sauceOptionEmoji: {
    fontSize: 20,
  },
  sauceOptionName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500' as const,
    color: colors.text.primary,
    flex: 1,
  },
  sauceOptionCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cup styles
  cupContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
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

  // Liquid sauce layer styles
  sauceLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 35,
    overflow: 'visible',
  },
  sauceGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  sauceWaves: {
    position: 'absolute',
    top: 12,
    left: -4,
    right: -4,
    height: 24,
  },
  sauceWave: {
    position: 'absolute',
    borderRadius: 50,
  },
  sauceWave1: {
    left: 0,
    right: 0,
    top: 0,
    height: 14,
  },
  sauceWave2: {
    left: '10%',
    width: '50%',
    top: 5,
    height: 12,
  },
  sauceWave3: {
    right: '5%',
    width: '40%',
    top: 8,
    height: 10,
  },
  sauceShine: {
    position: 'absolute',
    top: 3,
    left: '15%',
    width: '40%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },

  cupShadow: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50,
    marginTop: spacing.xs,
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

  // Bottom content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
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
