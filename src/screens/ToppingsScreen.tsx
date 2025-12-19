import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ToppingCard, MagicalParticles } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Topping } from '../types';

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
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredToppings =
    activeCategory === 'all'
      ? toppings
      : toppings.filter((t) => t.category === activeCategory);

  const renderCategoryChip = (category: typeof categoryFilters[0]) => {
    const isActive = activeCategory === category.key;
    return (
      <TouchableOpacity
        key={category.key}
        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
        onPress={() => setActiveCategory(category.key)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={category.icon as any}
          size={16}
          color={isActive ? colors.text.light : colors.text.secondary}
        />
        <Text
          style={[
            styles.categoryChipText,
            isActive && styles.categoryChipTextActive,
          ]}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Particles */}
      <MagicalParticles
        count={12}
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
              <Text style={styles.title}>Toppings</Text>
              <Text style={styles.subtitle}>
                {toppings.length} delicious options
              </Text>
            </View>

            {/* Topping Dispenser Icon */}
            <View style={styles.dispenserIcon}>
              <View style={styles.dispenserTube}>
                <View
                  style={[styles.dispenserFill, { backgroundColor: colors.flavors.strawberry }]}
                />
              </View>
              <View style={styles.dispenserTube}>
                <View
                  style={[styles.dispenserFill, { backgroundColor: colors.flavors.mango }]}
                />
              </View>
              <View style={styles.dispenserTube}>
                <View
                  style={[styles.dispenserFill, { backgroundColor: colors.flavors.pistachio }]}
                />
              </View>
              <View style={styles.dispenserTube}>
                <View
                  style={[styles.dispenserFill, { backgroundColor: colors.flavors.blueberry }]}
                />
              </View>
            </View>
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
        <View style={styles.statsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScroll}
          >
            {Object.entries(stats).map(([category, count]) => (
              <View key={category} style={styles.statItem}>
                <Text style={styles.statCount}>{count}</Text>
                <Text style={styles.statLabel}>{category}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Toppings Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.toppingsContainer}
        >
          <View style={styles.toppingsGrid}>
            {filteredToppings.map((topping) => (
              <ToppingCard key={topping.id} topping={topping} />
            ))}
          </View>

          {filteredToppings.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color={colors.text.muted} />
              <Text style={styles.emptyText}>No toppings found</Text>
            </View>
          )}

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color={colors.accent.gold} />
            <Text style={styles.infoBannerText}>
              All toppings are included in our self-serve pricing. Load up your cup!
            </Text>
          </View>
        </ScrollView>
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
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dispenserIcon: {
    flexDirection: 'row',
    backgroundColor: colors.accent.wood,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  dispenserTube: {
    width: 12,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  dispenserFill: {
    height: '70%',
    borderRadius: 4,
  },
  categoryScroll: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.card,
    marginRight: spacing.sm,
    ...shadows.small,
  },
  categoryChipActive: {
    backgroundColor: colors.accent.gold,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  categoryChipTextActive: {
    color: colors.text.light,
  },
  statsBar: {
    backgroundColor: colors.background.card,
    ...shadows.small,
  },
  statsScroll: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statCount: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  toppingsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
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
  emptyText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.gold + '15',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default ToppingsScreen;
