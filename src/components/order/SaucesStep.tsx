import React, { useRef, useEffect, useMemo, useState } from 'react';
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
const getSauceData = (name: string): { color: string; darkColor: string; lightColor: string; emoji: string } => {
  const lower = name.toLowerCase();
  if (lower.includes('chocolate') || lower.includes('fudge')) {
    return { color: '#5C4033', darkColor: '#3E2723', lightColor: '#8B6F5E', emoji: '🍫' };
  }
  if (lower.includes('caramel')) {
    return { color: '#D4A574', darkColor: '#B8860B', lightColor: '#E8C9A0', emoji: '🍯' };
  }
  if (lower.includes('strawberry')) {
    return { color: '#E53935', darkColor: '#C62828', lightColor: '#FF8A80', emoji: '🍓' };
  }
  if (lower.includes('peanut')) {
    return { color: '#C19A6B', darkColor: '#8B7355', lightColor: '#D4B896', emoji: '🥜' };
  }
  if (lower.includes('maple')) {
    return { color: '#B8860B', darkColor: '#8B6914', lightColor: '#D4A853', emoji: '🍁' };
  }
  if (lower.includes('honey')) {
    return { color: '#FFB300', darkColor: '#FF8F00', lightColor: '#FFD54F', emoji: '🍯' };
  }
  return { color: '#5C4033', darkColor: '#3E2723', lightColor: '#8B6F5E', emoji: '🍫' };
};

// Single sauce selector - pick ONE drizzle
const SauceSelector: React.FC<{
  sauces: Topping[];
  selectedSauce: Topping | null;
  onSelect: (sauce: Topping) => void;
}> = ({ sauces, selectedSauce, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  useEffect(() => {
    if (!selectedSauce) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [selectedSauce]);

  const data = selectedSauce ? getSauceData(selectedSauce.name) : null;

  return (
    <View style={styles.selectorContainer}>
      {/* Main drizzle button - shows selected or prompt */}
      <Animated.View style={{ transform: [{ scale: selectedSauce ? 1 : pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.mainDrizzleBtn,
            selectedSauce && { backgroundColor: data!.color, borderColor: data!.darkColor },
          ]}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.mainDrizzleEmoji}>
            {selectedSauce ? (selectedSauce.emoji || data!.emoji) : '🍦'}
          </Text>
          <View style={styles.mainDrizzleLabelRow}>
            <Text style={[
              styles.mainDrizzleLabel,
              selectedSauce && { color: '#FFF' },
            ]}>
              {selectedSauce ? selectedSauce.name : 'Choose a Drizzle'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={selectedSauce ? '#FFF' : colors.text.muted}
            />
          </View>
          {selectedSauce && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Expandable sauce options */}
      <Animated.View style={[
        styles.sauceOptions,
        {
          maxHeight: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 400],
          }),
          opacity: expandAnim,
          marginTop: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 12],
          }),
        },
      ]}>
        <View style={styles.sauceGrid}>
          {sauces.map((sauce) => {
            const sData = getSauceData(sauce.name);
            const isSelected = selectedSauce?.id === sauce.id;
            return (
              <TouchableOpacity
                key={sauce.id}
                style={[
                  styles.sauceOption,
                  isSelected && { backgroundColor: sData.color + '20', borderColor: sData.color },
                ]}
                onPress={() => {
                  onSelect(sauce);
                  setExpanded(false);
                }}
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

          {/* No drizzle option */}
          {selectedSauce && (
            <TouchableOpacity
              style={[styles.sauceOption, { borderStyle: 'dashed' as any }]}
              onPress={() => {
                onSelect(selectedSauce); // Toggle off
                setExpanded(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={24} color={colors.text.muted} />
              <Text style={[styles.sauceOptionName, { color: colors.text.muted }]}>
                No Drizzle
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// Main sauce dispensing area with cup
const SauceStation: React.FC<{
  sauces: Topping[];
  selectedSauce: Topping | null;
  onSelect: (sauce: Topping) => void;
}> = ({ sauces, selectedSauce, onSelect }) => {
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

  useEffect(() => {
    // Cup wobble and drizzle animation when sauce changes
    if (selectedSauce) {
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
  }, [selectedSauce?.id]);

  const cupBottomWidth = CUP_WIDTH * 0.7;
  const sauceData = selectedSauce ? getSauceData(selectedSauce.name) : null;

  return (
    <View style={styles.stationContainer}>
      {/* Sauce selector */}
      <SauceSelector
        sauces={sauces}
        selectedSauce={selectedSauce}
        onSelect={onSelect}
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

            {/* Inner cup with yogurt and drizzle layer */}
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

              {/* Liquid sauce layer on top - wavy, creamy, liquidy */}
              {sauceData && (
                <Animated.View
                  style={[
                    styles.sauceLayer,
                    {
                      opacity: drizzleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.75],
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
                  {/* Main liquid layer */}
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
                  {/* Wavy bottom edge - multiple overlapping rounded shapes for liquidy look */}
                  <View style={styles.sauceWaves}>
                    <View style={[styles.sauceWave, styles.sauceWave1, { backgroundColor: sauceData.color + '88' }]} />
                    <View style={[styles.sauceWave, styles.sauceWave2, { backgroundColor: sauceData.color + '66' }]} />
                    <View style={[styles.sauceWave, styles.sauceWave3, { backgroundColor: sauceData.color + '44' }]} />
                    <View style={[styles.sauceWave, styles.sauceWave4, { backgroundColor: sauceData.lightColor + '55' }]} />
                    <View style={[styles.sauceWave, styles.sauceWave5, { backgroundColor: sauceData.color + '33' }]} />
                  </View>
                  {/* Shine/gloss on the sauce layer */}
                  <View style={styles.sauceShine} />
                  {/* Small pooling drips on the edges */}
                  <View style={[styles.sauceDrip, styles.sauceDrip1, { backgroundColor: sauceData.color + '99' }]} />
                  <View style={[styles.sauceDrip, styles.sauceDrip2, { backgroundColor: sauceData.color + '77' }]} />
                  <View style={[styles.sauceDrip, styles.sauceDrip3, { backgroundColor: sauceData.color + '88' }]} />
                </Animated.View>
              )}
            </View>
          </View>
        </View>

        {/* Shadow */}
        <View style={[styles.cupShadow, { width: cupBottomWidth + 15 }]} />
      </Animated.View>

      {/* Tap hint */}
      <View style={styles.tapHint}>
        {selectedSauce ? (
          <>
            <Text style={{ fontSize: 14 }}>{selectedSauce.emoji || sauceData?.emoji}</Text>
            <Text style={styles.tapHintText}>{selectedSauce.name} drizzled on your cup!</Text>
          </>
        ) : (
          <>
            <Ionicons name="hand-left-outline" size={14} color={colors.accent.gold} />
            <Text style={styles.tapHintText}>Choose a drizzle for your cup!</Text>
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

  // Only one sauce at a time
  const selectedSauce = order.sauces.length > 0 ? order.sauces[0] : null;

  const handleSelect = (sauce: Topping) => {
    // If same sauce is selected, remove it (toggle off)
    if (selectedSauce?.id === sauce.id) {
      removeSauce(sauce.id);
      return;
    }
    // Remove any existing sauce first, then add new one
    order.sauces.forEach(s => removeSauce(s.id));
    addSauce(sauce);
  };

  return (
    <View style={styles.container}>
      {/* Main sauce station with cup */}
      <SauceStation
        sauces={sauces}
        selectedSauce={selectedSauce}
        onSelect={handleSelect}
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
            Pick one drizzle to top your frozen yogurt - it's free!
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

  // Sauce selector styles
  selectorContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  mainDrizzleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.ui.border,
    gap: spacing.sm,
    minWidth: 200,
    ...shadows.medium,
  },
  mainDrizzleEmoji: {
    fontSize: 28,
  },
  mainDrizzleLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainDrizzleLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text.primary,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ui.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  sauceOptions: {
    width: '100%',
    overflow: 'hidden',
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
    top: 0,
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
  sauceWave4: {
    left: '20%',
    width: '35%',
    top: 11,
    height: 10,
  },
  sauceWave5: {
    right: '15%',
    width: '30%',
    top: 14,
    height: 8,
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
  sauceDrip: {
    position: 'absolute',
    borderRadius: 50,
  },
  sauceDrip1: {
    left: '15%',
    top: 18,
    width: 8,
    height: 12,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  sauceDrip2: {
    right: '20%',
    top: 16,
    width: 6,
    height: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  sauceDrip3: {
    left: '50%',
    top: 20,
    width: 10,
    height: 14,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
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
