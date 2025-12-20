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
import { Flavor } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

// Flavor selection indicator (shows up to 3 slots)
const FlavorSlots: React.FC = () => {
  const { order, removeFlavor } = useOrder();
  const slots = [0, 1, 2];

  return (
    <View style={styles.slotsContainer}>
      <Text style={styles.slotsTitle}>Your Flavors (max 3)</Text>
      <View style={styles.slots}>
        {slots.map((index) => {
          const flavor = order.flavors[index];
          const isActive = !!flavor;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.slot, isActive && { backgroundColor: flavor?.color + '30' }]}
              onPress={() => flavor && removeFlavor(flavor.id)}
              disabled={!flavor}
            >
              {flavor ? (
                <>
                  <View style={[styles.slotColor, { backgroundColor: flavor.color }]} />
                  <Text style={styles.slotName} numberOfLines={1}>{flavor.name}</Text>
                  <View style={styles.slotRemove}>
                    <Ionicons name="close" size={12} color={colors.text.muted} />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.slotEmpty}>
                    <Ionicons name="add" size={20} color={colors.text.muted} />
                  </View>
                  <Text style={styles.slotEmptyText}>Empty</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Animated flavor card
const FlavorCard: React.FC<{
  flavor: Flavor;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  disabled: boolean;
}> = ({ flavor, isSelected, onSelect, index, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    if (isSelected) {
      // Shine animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(shineAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      shineAnim.setValue(0);
    }
  }, [isSelected]);

  const handlePress = () => {
    if (disabled && !isSelected) return;

    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    onSelect();
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: scaleAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, bounceAnim) },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          disabled && !isSelected && styles.cardDisabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Color splash background */}
        <View style={[styles.colorSplash, { backgroundColor: flavor.color + '20' }]} />

        {/* Selected checkmark */}
        {isSelected && (
          <Animated.View style={[styles.checkmark, { opacity: shineAnim }]}>
            <LinearGradient
              colors={[flavor.color, flavor.color + 'DD']}
              style={styles.checkmarkGradient}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </LinearGradient>
          </Animated.View>
        )}

        {/* Yogurt swirl illustration */}
        <View style={styles.swirlContainer}>
          <View style={[styles.swirlBase, { backgroundColor: flavor.color }]}>
            <View style={[styles.swirlLayer1, { backgroundColor: flavor.color + 'CC' }]} />
            <View style={[styles.swirlLayer2, { backgroundColor: flavor.color + '99' }]} />
            <View style={styles.swirlHighlight} />
          </View>

          {/* Sparkles when selected */}
          {isSelected && (
            <>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    top: 5,
                    left: 10,
                    opacity: shineAnim,
                  },
                ]}
              >
                <Ionicons name="sparkles" size={12} color={flavor.color} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sparkle,
                  {
                    bottom: 10,
                    right: 5,
                    opacity: shineAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5],
                    }),
                  },
                ]}
              >
                <Ionicons name="sparkles" size={10} color={flavor.color} />
              </Animated.View>
            </>
          )}
        </View>

        {/* Flavor name */}
        <Text style={[styles.flavorName, isSelected && { color: flavor.color }]}>
          {flavor.name}
        </Text>

        {/* Description */}
        <Text style={styles.flavorDesc} numberOfLines={2}>
          {flavor.description}
        </Text>

        {/* Badges */}
        <View style={styles.badges}>
          {flavor.isVegan && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Vegan</Text>
            </View>
          )}
          {flavor.isNew && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={[styles.badgeText, styles.newBadgeText]}>NEW</Text>
            </View>
          )}
        </View>

        {/* Add/Remove indicator */}
        <View style={[styles.indicator, isSelected && { backgroundColor: flavor.color }]}>
          <Ionicons
            name={isSelected ? 'remove' : 'add'}
            size={16}
            color={isSelected ? '#FFF' : colors.text.muted}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FlavorsStep: React.FC = () => {
  const { order, addFlavor, removeFlavor } = useOrder();
  const { flavors } = useApp();

  const handleFlavorPress = (flavor: Flavor) => {
    const isSelected = order.flavors.find(f => f.id === flavor.id);
    if (isSelected) {
      removeFlavor(flavor.id);
    } else {
      addFlavor(flavor);
    }
  };

  const isMaxSelected = order.flavors.length >= 3;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Selected flavors slots */}
      <FlavorSlots />

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Ionicons name="bulb" size={18} color={colors.accent.gold} />
        <Text style={styles.hintText}>
          {isMaxSelected
            ? 'Maximum flavors selected! Tap to swap'
            : `Pick ${3 - order.flavors.length} more flavor${3 - order.flavors.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Flavor grid */}
      <View style={styles.grid}>
        {flavors.map((flavor, index) => {
          const isSelected = !!order.flavors.find(f => f.id === flavor.id);
          return (
            <FlavorCard
              key={flavor.id}
              flavor={flavor}
              isSelected={isSelected}
              onSelect={() => handleFlavorPress(flavor)}
              index={index}
              disabled={isMaxSelected}
            />
          );
        })}
      </View>
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
  slotsContainer: {
    marginBottom: spacing.lg,
  },
  slotsTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  slots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ui.border,
    gap: spacing.xs,
  },
  slotColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  slotName: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  slotRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmptyText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent.gold + '10',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  hintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardSelected: {
    borderColor: colors.accent.gold,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  colorSplash: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },
  checkmarkGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  swirlContainer: {
    width: 70,
    height: 70,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  swirlBase: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swirlLayer1: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: 5,
    left: 15,
  },
  swirlLayer2: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    bottom: 10,
    right: 10,
  },
  swirlHighlight: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    top: 10,
    left: 12,
  },
  sparkle: {
    position: 'absolute',
  },
  flavorName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  flavorDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    minHeight: 30,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.ui.success + '20',
    borderRadius: borderRadius.round,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: colors.ui.success,
  },
  newBadge: {
    backgroundColor: colors.accent.gold + '20',
  },
  newBadgeText: {
    color: colors.accent.gold,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});

export default FlavorsStep;
