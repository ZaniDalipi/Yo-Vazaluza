import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { GalleryImage } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - spacing.lg * 3) / 2;

interface GalleryCardProps {
  image: GalleryImage;
  onPress?: () => void;
  index: number;
}

const getCategoryIcon = (category: GalleryImage['category']): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case 'store':
      return 'storefront';
    case 'products':
      return 'ice-cream';
    case 'moments':
      return 'heart';
    default:
      return 'image';
  }
};

const getPlaceholderColors = (category: GalleryImage['category']): [string, string] => {
  switch (category) {
    case 'store':
      return [colors.primary.gray, colors.primary.darkGray];
    case 'products':
      return [colors.accent.gold, colors.accent.wood];
    case 'moments':
      return [colors.flavors.strawberry, colors.flavors.chocolate];
    default:
      return [colors.primary.lightGray, colors.primary.gray];
  }
};

const GalleryCard: React.FC<GalleryCardProps> = ({ image, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
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
        <LinearGradient
          colors={getPlaceholderColors(image.category)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imagePlaceholder}
        >
          <Ionicons
            name={getCategoryIcon(image.category)}
            size={48}
            color="rgba(255,255,255,0.8)"
          />
        </LinearGradient>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <Text style={styles.title} numberOfLines={2}>
            {image.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={getCategoryIcon(image.category)}
              size={12}
              color={colors.text.light}
            />
            <Text style={styles.categoryText}>{image.category}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.light,
    opacity: 0.9,
    textTransform: 'capitalize',
  },
});

export default GalleryCard;
