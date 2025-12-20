import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ToppingCard, MagicalParticles } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Topping } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToppingCategory = 'all' | Topping['category'];

const categoryFilters: { key: ToppingCategory; label: string; icon: string; emoji: string }[] = [
  { key: 'all', label: 'All', icon: 'apps', emoji: '🍨' },
  { key: 'fruits', label: 'Fruits', icon: 'nutrition', emoji: '🍓' },
  { key: 'candy', label: 'Candy', icon: 'sparkles', emoji: '🍬' },
  { key: 'nuts', label: 'Nuts', icon: 'ellipse', emoji: '🥜' },
  { key: 'sauces', label: 'Sauces', icon: 'water', emoji: '🍫' },
  { key: 'cereals', label: 'Cereals', icon: 'grid', emoji: '🥣' },
];

const ToppingsScreen: React.FC = () => {
  const { toppings } = useApp();
  const [activeCategory, setActiveCategory] = useState<ToppingCategory>('all');
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set());

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;
  const counterBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for dispenser
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fill animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Animate counter when selection changes
  useEffect(() => {
    if (selectedToppings.size > 0) {
      Animated.parallel([
        Animated.spring(counterAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(counterBounce, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(counterBounce, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.timing(counterAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedToppings.size]);

  const filteredToppings =
    activeCategory === 'all'
      ? toppings
      : toppings.filter((t) => t.category === activeCategory);

  const handleCategoryPress = (categoryKey: ToppingCategory) => {
    setActiveCategory(categoryKey);
  };

  const handleToppingPress = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topping.id)) {
        newSet.delete(topping.id);
      } else {
        newSet.add(topping.id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedToppings(new Set());
  };

  const renderCategoryChip = (category: typeof categoryFilters[0], index: number) => {
    const isActive = activeCategory === category.key;
    const categoryCount = category.key === 'all'
      ? toppings.length
      : toppings.filter(t => t.category === category.key).length;

    return (
      <Animated.View
        key={category.key}
        style={{
          opacity: categoryAnim,
          transform: [
            {
              translateX: categoryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.categoryChip, isActive && styles.categoryChipActive]}
          onPress={() => handleCategoryPress(category.key)}
          activeOpacity={0.7}
        >
          {isActive ? (
            <LinearGradient
              colors={[colors.accent.gold, colors.accent.wood]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryChipGradient}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryChipTextActive}>
                {category.label}
              </Text>
              <View style={styles.categoryCount}>
                <Text style={styles.categoryCountText}>{categoryCount}</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.categoryChipInner}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryChipText}>
                {category.label}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    toppings.forEach((t) => {
      stats[t.category] = (stats[t.category] || 0) + 1;
    });
    return stats;
  };

  const stats = getCategoryStats();

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['60%', '80%'],
  });

  const counterScale = Animated.multiply(counterAnim, counterBounce);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.background.main, '#FAFAFA', colors.accent.cream + '20']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Particles */}
      <MagicalParticles
        count={15}
        colors={[
          colors.flavors.strawberry + '40',
          colors.flavors.mango + '40',
          colors.flavors.blueberry + '40',
          colors.flavors.pistachio + '40',
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <View style={styles.titleRow}>
                <View style={styles.titleIcon}>
                  <Ionicons name="color-fill" size={20} color={colors.accent.gold} />
                </View>
                <Text style={styles.title}>Toppings</Text>
              </View>
              <Text style={styles.subtitle}>
                Tap to select your favorites!
              </Text>
            </View>

            {/* Animated Topping Dispenser Icon */}
            <Animated.View style={[styles.dispenserIcon, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[colors.accent.wood, '#5D4E37']}
                style={styles.dispenserGradient}
              >
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.strawberry, height: fillHeight }]}
                  />
                </Animated.View>
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.mango, height: '70%' }]}
                  />
                </Animated.View>
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.pistachio, height: '85%' }]}
                  />
                </Animated.View>
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.blueberry, height: '65%' }]}
                  />
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categoryFilters.map(renderCategoryChip)}
          </ScrollView>
        </Animated.View>

        {/* Toppings Grid */}
        <Animated.View
          style={[
            styles.scrollWrapper,
            {
              opacity: contentAnim,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.toppingsContainer}
          >
            {/* Selection hint */}
            <View style={styles.selectionHint}>
              <Ionicons name="hand-left" size={16} color={colors.text.muted} />
              <Text style={styles.selectionHintText}>
                {selectedToppings.size === 0
                  ? 'Tap toppings to add them to your cup!'
                  : `${selectedToppings.size} topping${selectedToppings.size === 1 ? '' : 's'} selected`
                }
              </Text>
            </View>

            <View style={styles.toppingsGrid}>
              {filteredToppings.map((topping, index) => (
                <ToppingCard
                  key={topping.id}
                  topping={topping}
                  isSelected={selectedToppings.has(topping.id)}
                  onPress={() => handleToppingPress(topping)}
                  index={index}
                />
              ))}
            </View>

            {filteredToppings.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search" size={48} color={colors.accent.gold} />
                </View>
                <Text style={styles.emptyTitle}>No toppings found</Text>
                <Text style={styles.emptyText}>Try selecting a different category</Text>
              </View>
            )}

            {/* Info Banner */}
            <LinearGradient
              colors={[colors.accent.gold + '20', colors.accent.gold + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoBanner}
            >
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={24} color={colors.accent.gold} />
              </View>
              <Text style={styles.infoBannerText}>
                All toppings are included in our self-serve pricing. Load up your cup!
              </Text>
            </LinearGradient>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* Floating Selection Counter */}
      <Animated.View
        style={[
          styles.floatingCounter,
          {
            transform: [
              { scale: counterScale },
              {
                translateY: counterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: counterAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.accent.gold, colors.accent.wood]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingCounterGradient}
        >
          <View style={styles.counterLeft}>
            <View style={styles.counterBadge}>
              <Text style={styles.counterNumber}>{selectedToppings.size}</Text>
            </View>
            <View>
              <Text style={styles.counterLabel}>Toppings</Text>
              <Text style={styles.counterSubtext}>Selected</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSelection}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.accent.gold} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginLeft: spacing.xl + spacing.md,
  },
  dispenserIcon: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.accent.wood,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dispenserGradient: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  dispenserTube: {
    width: 14,
    height: 45,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  dispenserFill: {
    borderRadius: 5,
  },
  categoryScroll: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  categoryChipActive: {
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: colors.text.light,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  categoryCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    marginLeft: spacing.xs,
  },
  categoryCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  scrollWrapper: {
    flex: 1,
  },
  toppingsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  selectionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectionHintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
  toppingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 120,
  },
  floatingCounter: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  floatingCounterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  counterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNumber: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  counterLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.light,
  },
  counterSubtext: {
    fontSize: typography.fontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ToppingsScreen;
