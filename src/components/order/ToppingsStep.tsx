import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Topping } from '../../types';

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '🍨' },
  { key: 'fruits', label: 'Fruits', emoji: '🍓' },
  { key: 'candy', label: 'Candy', emoji: '🍬' },
  { key: 'nuts', label: 'Nuts', emoji: '🥜' },
  { key: 'cereals', label: 'Cereals', emoji: '🥣' },
];

// Animated topping chip
const ToppingChip: React.FC<{
  topping: Topping;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}> = ({ topping, isSelected, onToggle, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 30,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    // Shake when selecting
    if (!isSelected) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    onToggle();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'fruits': return colors.flavors.strawberry;
      case 'candy': return colors.flavors.mango;
      case 'nuts': return colors.accent.wood;
      case 'cereals': return colors.flavors.pistachio;
      default: return colors.accent.gold;
    }
  };

  const color = getCategoryColor(topping.category);

  return (
    <Animated.View
      style={[
        styles.chipContainer,
        {
          opacity: scaleAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, bounceAnim) },
            {
              translateX: shakeAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-5, 0, 5],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.chip,
          isSelected && { backgroundColor: color + '20', borderColor: color },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Selected indicator */}
        {isSelected && (
          <View style={[styles.chipCheck, { backgroundColor: color }]}>
            <Ionicons name="checkmark" size={10} color="#FFF" />
          </View>
        )}

        <Text style={[styles.chipText, isSelected && { color: color }]}>
          {topping.name}
        </Text>

        {/* Toggle icon */}
        <View style={[styles.chipToggle, isSelected && { backgroundColor: color }]}>
          <Ionicons
            name={isSelected ? 'remove' : 'add'}
            size={12}
            color={isSelected ? '#FFF' : colors.text.muted}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Selected toppings preview
const SelectedPreview: React.FC = () => {
  const { order, removeTopping } = useOrder();

  if (order.toppings.length === 0) return null;

  return (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>
        Selected ({order.toppings.length})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.previewScroll}
      >
        {order.toppings.map((topping) => (
          <TouchableOpacity
            key={topping.id}
            style={styles.previewChip}
            onPress={() => removeTopping(topping.id)}
          >
            <Text style={styles.previewChipText}>{topping.name}</Text>
            <Ionicons name="close-circle" size={14} color={colors.text.muted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const ToppingsStep: React.FC = () => {
  const { order, addTopping, removeTopping } = useOrder();
  const { toppings: allToppings } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter out sauces - they go in the next step
  const toppings = allToppings.filter(t => t.category !== 'sauces');

  const filteredToppings = activeCategory === 'all'
    ? toppings
    : toppings.filter(t => t.category === activeCategory);

  const handleToggle = (topping: Topping) => {
    const isSelected = order.toppings.find(t => t.id === topping.id);
    if (isSelected) {
      removeTopping(topping.id);
    } else {
      addTopping(topping);
    }
  };

  return (
    <View style={styles.container}>
      {/* Selected preview */}
      <SelectedPreview />

      {/* Category tabs */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const count = cat.key === 'all'
              ? toppings.length
              : toppings.filter(t => t.category === cat.key).length;

            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat.key)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
                <View style={[styles.categoryCount, isActive && styles.categoryCountActive]}>
                  <Text style={[styles.categoryCountText, isActive && styles.categoryCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Optional hint */}
      <View style={styles.hintBar}>
        <Ionicons name="information-circle" size={16} color={colors.accent.gold} />
        <Text style={styles.hintText}>Toppings are optional - skip if you want!</Text>
      </View>

      {/* Toppings list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chipGrid}>
          {filteredToppings.map((topping, index) => (
            <ToppingChip
              key={topping.id}
              topping={topping}
              isSelected={!!order.toppings.find(t => t.id === topping.id)}
              onToggle={() => handleToggle(topping)}
              index={index}
            />
          ))}
        </View>

        {filteredToppings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No toppings in this category</Text>
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
  previewContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  previewTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  previewScroll: {
    gap: spacing.sm,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.gold + '20',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  previewChipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.medium,
  },
  categoriesWrapper: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  categories: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
    ...shadows.small,
  },
  categoryTabActive: {
    backgroundColor: colors.accent.gold,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  categoryLabelActive: {
    color: '#FFF',
  },
  categoryCount: {
    backgroundColor: colors.background.main,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  categoryCountActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryCountText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.muted,
  },
  categoryCountTextActive: {
    color: '#FFF',
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.gold + '10',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
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
    paddingBottom: spacing.xl,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipContainer: {},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.sm,
    ...shadows.small,
  },
  chipCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  chipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  chipToggle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.muted,
  },
});

export default ToppingsStep;
