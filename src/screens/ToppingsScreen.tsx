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

const categoryFilters: { key: ToppingCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'fruits', label: 'Fruits', icon: 'nutrition' },
  { key: 'candy', label: 'Candy', icon: 'sparkles' },
  { key: 'nuts', label: 'Nuts', icon: 'ellipse' },
  { key: 'sauces', label: 'Sauces', icon: 'water' },
  { key: 'cereals', label: 'Cereals', icon: 'grid' },
];

const ToppingsScreen: React.FC = () => {
  const { toppings } = useApp();
  const [activeCategory, setActiveCategory] = useState<ToppingCategory>('all');

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;

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

  const filteredToppings =
    activeCategory === 'all'
      ? toppings
      : toppings.filter((t) => t.category === activeCategory);

  const handleCategoryPress = (categoryKey: ToppingCategory) => {
    setActiveCategory(categoryKey);
  };

  const renderCategoryChip = (category: typeof categoryFilters[0], index: number) => {
    const isActive = activeCategory === category.key;
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
              <Ionicons
                name={category.icon as any}
                size={16}
                color={colors.text.light}
              />
              <Text style={styles.categoryChipTextActive}>
                {category.label}
              </Text>
            </LinearGradient>
          ) : (
            <>
              <Ionicons
                name={category.icon as any}
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.categoryChipText}>
                {category.label}
              </Text>
            </>
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
                <Ionicons name="color-fill" size={24} color={colors.accent.gold} />
                <Text style={styles.title}>Toppings</Text>
              </View>
              <Text style={styles.subtitle}>
                {toppings.length} delicious options to choose from
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

        {/* Stats Bar */}
        <Animated.View
          style={[
            styles.statsBar,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.background.card, '#FFFFFF']}
            style={styles.statsGradient}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScroll}
            >
              {Object.entries(stats).map(([category, count]) => (
                <View key={category} style={styles.statItem}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statCount}>{count}</Text>
                  </View>
                  <Text style={styles.statLabel}>{category}</Text>
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
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
            <View style={styles.toppingsGrid}>
              {filteredToppings.map((topping, index) => (
                <Animated.View
                  key={topping.id}
                  style={{
                    opacity: contentAnim,
                    transform: [
                      {
                        scale: contentAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <ToppingCard topping={topping} />
                </Animated.View>
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
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginLeft: spacing.xl + spacing.sm,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  categoryChipTextActive: {
    color: colors.text.light,
    fontWeight: typography.fontWeights.semibold,
  },
  statsBar: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  statsGradient: {
    borderRadius: borderRadius.lg,
  },
  statsScroll: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statBadge: {
    backgroundColor: colors.accent.gold + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginBottom: spacing.xs,
  },
  statCount: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  scrollWrapper: {
    flex: 1,
  },
  toppingsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
    height: 100,
  },
});

export default ToppingsScreen;
