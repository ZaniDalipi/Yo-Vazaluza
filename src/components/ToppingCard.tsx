import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Topping } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

interface ToppingCardProps {
  topping: Topping;
  isSelected?: boolean;
  onPress?: () => void;
  index?: number;
  isPopular?: boolean;
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

const getCategoryGradient = (category: Topping['category']): [string, string] => {
  switch (category) {
    case 'fruits':
      return [colors.flavors.strawberry, '#FF6B8A'];
    case 'candy':
      return [colors.flavors.mango, '#FFB347'];
    case 'nuts':
      return [colors.accent.wood, '#8B7355'];
    case 'sauces':
      return [colors.flavors.chocolate, '#8B4513'];
    case 'cereals':
      return [colors.flavors.pistachio, '#7CB342'];
    default:
      return [colors.accent.gold, colors.accent.wood];
  }
};

// Sparkle component for selected state
const Sparkle: React.FC<{ delay: number; size: number; position: { top: number; left: number } }> = ({
  delay,
  size,
  position,
}) => {
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ])
      ).start();
    };
    animate();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          top: position.top,
          left: position.left,
          width: size,
          height: size,
          opacity: sparkleAnim,
          transform: [
            {
              scale: sparkleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1.2, 0.3],
              }),
            },
            {
              rotate: sparkleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons name="sparkles" size={size} color="#FFD700" />
    </Animated.View>
  );
};

const ToppingCard: React.FC<ToppingCardProps> = ({
  topping,
  isSelected = false,
  onPress,
  index = 0,
  isPopular = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const selectedAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const iconBounceAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Entrance animation with staggered delay
    const entranceDelay = index * 80;

    setTimeout(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }, entranceDelay);

    // Continuous subtle icon bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounceAnim, {
          toValue: 1.08,
          duration: 2000 + index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconBounceAnim, {
          toValue: 1,
          duration: 2000 + index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);

  useEffect(() => {
    Animated.spring(selectedAnim, {
      toValue: isSelected ? 1 : 0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();

    if (isSelected) {
      // Glow animation when selected
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shine animation
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
    } else {
      glowAnim.setValue(0);
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.94,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(tiltX, {
        toValue: Math.random() > 0.5 ? 1 : -1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(tiltY, {
        toValue: Math.random() > 0.5 ? 1 : -1,
        friction: 6,
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
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(tiltX, {
        toValue: 0,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(tiltY, {
        toValue: 0,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    // Celebratory bounce on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.12,
        duration: 80,
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
    outputRange: ['0deg', '2deg'],
  });

  const entranceTranslateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const selectedScale = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const checkScale = selectedAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.4, 1],
  });

  const borderWidth = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const glowOpacity = Animated.multiply(glowAnim, selectedAnim);

  const categoryColor = getCategoryColor(topping.category);
  const categoryGradient = getCategoryGradient(topping.category);

  const sparklePositions = [
    { top: -5, left: 10 },
    { top: 20, left: -8 },
    { top: 60, left: CARD_WIDTH - 30 },
    { top: 80, left: 15 },
  ];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, selectedScale) },
            { rotate },
            { translateY: entranceTranslateY },
          ],
          opacity: bounceAnim,
        },
      ]}
    >
      {/* Glow effect behind card when selected */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            backgroundColor: categoryColor,
            opacity: glowOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            }),
          },
        ]}
      />

      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
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
          {/* Glassmorphism overlay */}
          <View style={styles.glassOverlay} />

          {/* Sparkles when selected */}
          {isSelected &&
            sparklePositions.map((pos, i) => (
              <Sparkle
                key={i}
                delay={i * 200}
                size={12 + Math.random() * 6}
                position={pos}
              />
            ))}

          {/* Popular badge */}
          {isPopular && (
            <View style={styles.popularBadge}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.popularGradient}
              >
                <Ionicons name="flame" size={10} color="#FFF" />
                <Text style={styles.popularText}>Popular</Text>
              </LinearGradient>
            </View>
          )}

          {/* Selected checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkScale }],
                opacity: selectedAnim,
              },
            ]}
          >
            <LinearGradient
              colors={categoryGradient}
              style={styles.checkmarkGradient}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </LinearGradient>
          </Animated.View>

          {/* Image or Emoji Icon */}
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ scale: iconBounceAnim }] },
            ]}
          >
            {topping.imageUrl && topping.imageUrl.startsWith('http') && !imageError ? (
              <Image
                source={{ uri: topping.imageUrl }}
                style={styles.toppingImage}
                onError={() => setImageError(true)}
                resizeMode="cover"
              />
            ) : topping.emoji ? (
              <LinearGradient
                colors={categoryGradient}
                style={styles.iconGradient}
              >
                <Text style={{ fontSize: 36 }}>{topping.emoji}</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={categoryGradient}
                style={styles.iconGradient}
              >
                <Ionicons
                  name={getCategoryIcon(topping.category)}
                  size={36}
                  color={colors.text.light}
                />
              </LinearGradient>
            )}

            {/* Shine effect when selected */}
            {isSelected && (
              <Animated.View
                style={[
                  styles.shine,
                  {
                    opacity: shineAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.1, 0.5, 0.1],
                    }),
                    transform: [
                      {
                        translateX: shineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 50],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </Animated.View>

          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {topping.name}
          </Text>

          {/* Price and Category Row */}
          <View style={styles.infoRow}>
            {topping.price !== undefined && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>+</Text>
                <Text style={styles.priceValue}>${topping.price.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          </View>

          {/* Category Badge */}
          <LinearGradient
            colors={[categoryColor + '25', categoryColor + '10']}
            style={styles.categoryBadge}
          >
            <Ionicons
              name={getCategoryIcon(topping.category)}
              size={12}
              color={categoryColor}
            />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {topping.category}
            </Text>
          </LinearGradient>

          {/* Add/Remove indicator */}
          <Animated.View
            style={[
              styles.addIndicator,
              {
                transform: [
                  {
                    scale: selectedAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={
                isSelected
                  ? ['#FF6B6B', '#FF8E53']
                  : [categoryColor, categoryGradient[1]]
              }
              style={styles.addIndicatorGradient}
            >
              <Ionicons
                name={isSelected ? 'remove' : 'add'}
                size={18}
                color="#FFF"
              />
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  glowContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: borderRadius.xl + 4,
    transform: [{ scale: 1.05 }],
  },
  cardWrapper: {
    borderRadius: borderRadius.xl,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    paddingTop: spacing.lg,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 180,
    ...shadows.medium,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    opacity: 0.3,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 15,
  },
  popularGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.round,
    gap: 3,
  },
  popularText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.small,
  },
  checkmarkGradient: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  toppingImage: {
    width: '100%',
    height: '100%',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    transform: [{ skewX: '-20deg' }],
    width: 30,
  },
  name: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    minHeight: 40,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginRight: 2,
  },
  priceValue: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
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
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.small,
  },
  addIndicatorGradient: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ToppingCard;
