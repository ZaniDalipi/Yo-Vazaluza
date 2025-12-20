import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Topping } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sauce bottle illustration with drip animation
const SauceBottle: React.FC<{
  sauce: Topping;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}> = ({ sauce, isSelected, onSelect, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const dripAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    if (isSelected) {
      // Tilt animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(tiltAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(500),
          Animated.timing(tiltAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(1500),
        ])
      ).start();

      // Drip animation
      Animated.loop(
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(dripAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dripAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(1700),
        ])
      ).start();
    } else {
      tiltAnim.setValue(0);
      dripAnim.setValue(0);
    }
  }, [isSelected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onSelect();
  };

  const getSauceColor = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('chocolate') || lower.includes('fudge')) return '#5C4033';
    if (lower.includes('caramel')) return '#FFD700';
    if (lower.includes('strawberry')) return colors.flavors.strawberry;
    if (lower.includes('peanut')) return '#C19A6B';
    return colors.flavors.chocolate;
  };

  const sauceColor = getSauceColor(sauce.name);

  return (
    <Animated.View
      style={[
        styles.bottleContainer,
        {
          opacity: scaleAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, bounceAnim) },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.bottle, isSelected && styles.bottleSelected]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Selection checkmark */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
        )}

        {/* Bottle illustration */}
        <Animated.View
          style={[
            styles.bottleIllustration,
            {
              transform: [
                {
                  rotate: tiltAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-25deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Bottle cap */}
          <View style={[styles.bottleCap, { backgroundColor: sauceColor }]} />

          {/* Bottle neck */}
          <View style={[styles.bottleNeck, { backgroundColor: sauceColor + 'DD' }]} />

          {/* Bottle body */}
          <View style={[styles.bottleBody, { backgroundColor: sauceColor }]}>
            {/* Shine effect */}
            <View style={styles.bottleShine} />

            {/* Label */}
            <View style={styles.bottleLabel}>
              <Text style={styles.bottleLabelText}>{sauce.name.charAt(0)}</Text>
            </View>
          </View>

          {/* Drip animation */}
          {isSelected && (
            <Animated.View
              style={[
                styles.drip,
                {
                  backgroundColor: sauceColor,
                  opacity: dripAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: dripAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 40],
                      }),
                    },
                    {
                      scale: dripAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1, 0.3],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </Animated.View>

        {/* Sauce name */}
        <Text style={[styles.sauceName, isSelected && { color: sauceColor }]}>
          {sauce.name}
        </Text>

        {/* Add indicator */}
        <View style={[styles.addButton, isSelected && { backgroundColor: sauceColor }]}>
          <Ionicons
            name={isSelected ? 'remove' : 'add'}
            size={18}
            color={isSelected ? '#FFF' : colors.text.muted}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Selected sauces preview
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
        {order.sauces.map((sauce) => (
          <TouchableOpacity
            key={sauce.id}
            style={styles.selectedChip}
            onPress={() => removeSauce(sauce.id)}
          >
            <Text style={styles.selectedChipText}>{sauce.name}</Text>
            <Ionicons name="close" size={14} color={colors.accent.gold} />
          </TouchableOpacity>
        ))}
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Selected sauces */}
      <SelectedSauces />

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintEmoji}>🍫</Text>
        <Text style={styles.hintText}>
          Add some delicious drizzles to your cup!
        </Text>
      </View>

      {/* Optional skip hint */}
      <View style={styles.skipHint}>
        <Ionicons name="information-circle-outline" size={14} color={colors.text.muted} />
        <Text style={styles.skipHintText}>Sauces are optional</Text>
      </View>

      {/* Sauce bottles grid */}
      <View style={styles.grid}>
        {sauces.map((sauce, index) => (
          <SauceBottle
            key={sauce.id}
            sauce={sauce}
            isSelected={!!order.sauces.find(s => s.id === sauce.id)}
            onSelect={() => handleToggle(sauce)}
            index={index}
          />
        ))}
      </View>

      {sauces.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍯</Text>
          <Text style={styles.emptyTitle}>No sauces available</Text>
          <Text style={styles.emptyText}>Check back soon for yummy drizzles!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  selectedContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
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
    fontWeight: typography.fontWeights.bold,
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
    backgroundColor: colors.accent.gold + '15',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  selectedChipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.medium,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hintEmoji: {
    fontSize: 24,
  },
  hintText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  skipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  skipHintText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottleContainer: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  bottle: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.medium,
  },
  bottleSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '08',
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.ui.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  bottleIllustration: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bottleCap: {
    width: 20,
    height: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  bottleNeck: {
    width: 16,
    height: 15,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  bottleBody: {
    width: 50,
    height: 60,
    borderRadius: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bottleShine: {
    position: 'absolute',
    top: 5,
    left: 8,
    width: 8,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    transform: [{ rotate: '10deg' }],
  },
  bottleLabel: {
    width: 30,
    height: 20,
    backgroundColor: '#FFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleLabelText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.secondary,
  },
  drip: {
    position: 'absolute',
    bottom: -15,
    width: 8,
    height: 12,
    borderRadius: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  sauceName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
});

export default SaucesStep;
