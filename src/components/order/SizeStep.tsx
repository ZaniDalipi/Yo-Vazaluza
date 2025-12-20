import React, { useRef, useEffect } from 'react';
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
import { useOrder, CUP_SIZES } from '../../context/OrderContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { CupSize } from '../../types';

// Animated cup illustration
const CupIllustration: React.FC<{ size: CupSize; isSelected: boolean; index: number }> = ({
  size,
  isSelected,
  index,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [index]);

  useEffect(() => {
    if (isSelected) {
      // Wiggle celebration
      Animated.sequence([
        Animated.timing(wiggleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: -0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();

      // Fill animation
      Animated.spring(fillAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(fillAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isSelected]);

  const cupHeight = size.size === 'small' ? 80 : size.size === 'medium' ? 100 : 120;
  const cupWidth = size.size === 'small' ? 60 : size.size === 'medium' ? 70 : 80;

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '75%'],
  });

  return (
    <Animated.View
      style={[
        styles.cupContainer,
        {
          transform: [
            { scale: scaleAnim },
            {
              rotate: wiggleAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: ['-10deg', '0deg', '10deg'],
              }),
            },
          ],
        },
      ]}
    >
      {/* Cup shape */}
      <View
        style={[
          styles.cup,
          {
            width: cupWidth,
            height: cupHeight,
            borderColor: isSelected ? colors.accent.gold : colors.ui.border,
          },
        ]}
      >
        {/* Yogurt fill */}
        <Animated.View
          style={[
            styles.yogurtFill,
            {
              height: fillHeight,
              backgroundColor: colors.flavors.strawberry,
            },
          ]}
        >
          {/* Swirl effect */}
          <View style={[styles.swirl, { backgroundColor: colors.flavors.vanilla + '60' }]} />
          <View style={[styles.swirl, styles.swirl2, { backgroundColor: colors.flavors.mango + '40' }]} />
        </Animated.View>

        {/* Cup shine */}
        <View style={styles.cupShine} />
      </View>

      {/* Steam animation when selected */}
      {isSelected && (
        <View style={styles.steamContainer}>
          <SteamParticle delay={0} />
          <SteamParticle delay={200} />
          <SteamParticle delay={400} />
        </View>
      )}
    </Animated.View>
  );
};

// Steam particle for selected cup
const SteamParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.steam,
        {
          opacity: anim.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 0.6, 0],
          }),
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -30],
              }),
            },
            {
              translateX: anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 5, -5],
              }),
            },
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.5],
              }),
            },
          ],
        },
      ]}
    />
  );
};

// Size option card
const SizeCard: React.FC<{
  size: CupSize;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}> = ({ size, isSelected, onSelect, index }) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
      <TouchableOpacity
        style={[styles.sizeCard, isSelected && styles.sizeCardSelected]}
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={16} color="#FFF" />
          </View>
        )}

        <CupIllustration size={size} isSelected={isSelected} index={index} />

        <Text style={[styles.sizeName, isSelected && styles.sizeNameSelected]}>
          {size.name}
        </Text>

        <Text style={styles.sizeOunces}>{size.ounces} oz</Text>

        <View style={[styles.priceTag, isSelected && styles.priceTagSelected]}>
          <Text style={[styles.priceText, isSelected && styles.priceTextSelected]}>
            ${size.price.toFixed(2)}
          </Text>
        </View>

        {/* Best value badge for large */}
        {size.size === 'large' && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const SizeStep: React.FC = () => {
  const { order, setCupSize } = useOrder();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hint text */}
      <View style={styles.hintContainer}>
        <Ionicons name="hand-left" size={20} color={colors.text.muted} />
        <Text style={styles.hintText}>Tap to select your cup size</Text>
      </View>

      {/* Size options */}
      <View style={styles.sizesContainer}>
        {CUP_SIZES.map((size, index) => (
          <SizeCard
            key={size.id}
            size={size}
            isSelected={order.cupSize?.id === size.id}
            onSelect={() => setCupSize(size)}
            index={index}
          />
        ))}
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={colors.accent.gold} />
        <Text style={styles.infoText}>
          All sizes include unlimited toppings!
        </Text>
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
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  hintText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.muted,
  },
  sizesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sizeCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...shadows.medium,
  },
  sizeCardSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '10',
  },
  selectedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ui.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  cupContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cup: {
    borderRadius: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 3,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    position: 'relative',
  },
  yogurtFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  swirl: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    top: 5,
    left: 5,
  },
  swirl2: {
    top: 15,
    left: 20,
    width: 20,
    height: 20,
  },
  cupShine: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 10,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 5,
    transform: [{ rotate: '15deg' }],
  },
  steamContainer: {
    position: 'absolute',
    top: -15,
    flexDirection: 'row',
    gap: 8,
  },
  steam: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted + '60',
  },
  sizeName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sizeNameSelected: {
    color: colors.accent.gold,
  },
  sizeOunces: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  priceTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.round,
  },
  priceTagSelected: {
    backgroundColor: colors.accent.gold,
  },
  priceText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  priceTextSelected: {
    color: '#FFF',
  },
  bestValueBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.ui.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  bestValueText: {
    fontSize: 8,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent.gold + '15',
    borderRadius: borderRadius.lg,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
});

export default SizeStep;
