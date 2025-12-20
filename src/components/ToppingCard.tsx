import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Topping } from '../types';

interface ToppingCardProps {
  topping: Topping;
  isSelected?: boolean;
  onPress?: () => void;
  index?: number;
}

const getCategoryIcon = (category: Topping['category']): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case 'fruits':
      return 'nutrition';
    case 'candy':
      return 'sparkles';
    case 'nuts':
      return 'ellipse';
    case 'sauces':
      return 'water';
    case 'cereals':
      return 'grid';
    default:
      return 'ellipse';
  }
};

const getCategoryColor = (category: Topping['category']): string => {
  switch (category) {
    case 'fruits':
      return colors.flavors.strawberry;
    case 'candy':
      return colors.flavors.mango;
    case 'nuts':
      return colors.accent.wood;
    case 'sauces':
      return colors.flavors.chocolate;
    case 'cereals':
      return colors.flavors.pistachio;
    default:
      return colors.accent.gold;
  }
};

const ToppingCard: React.FC<ToppingCardProps> = ({ topping, isSelected = false, onPress, index = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const selectedAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const iconBounceAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation with staggered delay
    const entranceDelay = index * 50;

    setTimeout(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }, entranceDelay);

    // Continuous subtle icon bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounceAnim, {
          toValue: 1.1,
          duration: 1500 + (index * 100),
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconBounceAnim, {
          toValue: 1,
          duration: 1500 + (index * 100),
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);

  useEffect(() => {
    Animated.spring(selectedAnim, {
      toValue: isSelected ? 1 : 0,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();

    if (isSelected) {
      // Shine animation when selected
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    // Celebratory bounce on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3deg'],
  });

  const entranceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const selectedScale = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  const checkScale = selectedAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.3, 1],
  });

  const borderWidth = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const categoryColor = getCategoryColor(topping.category);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(Animated.multiply(scaleAnim, entranceScale), selectedScale) },
            { rotate },
          ],
          opacity: bounceAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.card,
            {
              borderWidth: borderWidth,
              borderColor: categoryColor,
            },
          ]}
        >
          {/* Selected checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                backgroundColor: categoryColor,
                transform: [{ scale: checkScale }],
                opacity: selectedAnim,
              },
            ]}
          >
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </Animated.View>

          {/* Icon with bounce animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              { backgroundColor: categoryColor },
              { transform: [{ scale: iconBounceAnim }] },
            ]}
          >
            <Ionicons
              name={getCategoryIcon(topping.category)}
              size={32}
              color={colors.text.light}
            />

            {/* Shine effect when selected */}
            {isSelected && (
              <Animated.View
                style={[
                  styles.shine,
                  {
                    opacity: shineAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.2, 0.6, 0.2],
                    }),
                  },
                ]}
              />
            )}
          </Animated.View>

          <Text style={styles.name} numberOfLines={2}>
            {topping.name}
          </Text>

          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {topping.category}
            </Text>
          </View>

          {/* Add indicator */}
          <View style={styles.addIndicator}>
            <Ionicons
              name={isSelected ? "remove-circle" : "add-circle"}
              size={24}
              color={isSelected ? colors.ui.error : categoryColor}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: spacing.md,
  },
  cardWrapper: {
    borderRadius: borderRadius.xl,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    position: 'relative',
    ...shadows.medium,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.small,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  shine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 35,
  },
  name: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  categoryText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'capitalize',
  },
  addIndicator: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});

export default ToppingCard;
