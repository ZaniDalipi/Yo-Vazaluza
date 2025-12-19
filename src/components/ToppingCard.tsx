import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Topping } from '../types';

interface ToppingCardProps {
  topping: Topping;
  onPress?: () => void;
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

const ToppingCard: React.FC<ToppingCardProps> = ({ topping, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const categoryColor = getCategoryColor(topping.category);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }, { rotate }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
          <Ionicons
            name={getCategoryIcon(topping.category)}
            size={28}
            color={colors.text.light}
          />
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {topping.name}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {topping.category}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.round,
  },
  categoryText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'capitalize',
  },
});

export default ToppingCard;
