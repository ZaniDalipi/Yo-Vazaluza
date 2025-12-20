import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder, CUP_SIZES } from '../../context/OrderContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { CupSize } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_MARGIN = spacing.md;

// Soft-serve swirl layers
const SoftServeSwirl: React.FC<{ color: string; size: number; isDispensing: boolean }> = ({
  color,
  size,
  isDispensing
}) => {
  const swirl1Anim = useRef(new Animated.Value(0)).current;
  const swirl2Anim = useRef(new Animated.Value(0)).current;
  const swirl3Anim = useRef(new Animated.Value(0)).current;
  const swirl4Anim = useRef(new Animated.Value(0)).current;
  const tipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDispensing) {
      // Sequential swirl animation like yogurt being dispensed
      Animated.stagger(150, [
        Animated.spring(swirl1Anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.spring(swirl2Anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.spring(swirl3Anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.spring(swirl4Anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.spring(tipAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
      ]).start();
    } else {
      swirl1Anim.setValue(0);
      swirl2Anim.setValue(0);
      swirl3Anim.setValue(0);
      swirl4Anim.setValue(0);
      tipAnim.setValue(0);
    }
  }, [isDispensing]);

  const baseWidth = size * 0.7;

  return (
    <View style={[styles.swirlContainer, { width: size, height: size * 1.4 }]}>
      {/* Bottom swirl layer */}
      <Animated.View style={[
        styles.swirlLayer,
        {
          width: baseWidth,
          height: size * 0.25,
          backgroundColor: color,
          bottom: 0,
          borderRadius: baseWidth / 2,
          transform: [{ scaleY: swirl1Anim }],
        }
      ]}>
        <View style={[styles.swirlHighlight, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
      </Animated.View>

      {/* Second layer */}
      <Animated.View style={[
        styles.swirlLayer,
        {
          width: baseWidth * 0.85,
          height: size * 0.22,
          backgroundColor: color,
          bottom: size * 0.18,
          left: size * 0.1,
          borderRadius: baseWidth / 2,
          transform: [{ scaleY: swirl2Anim }, { rotate: '-8deg' }],
        }
      ]}>
        <View style={[styles.swirlHighlight, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
      </Animated.View>

      {/* Third layer */}
      <Animated.View style={[
        styles.swirlLayer,
        {
          width: baseWidth * 0.7,
          height: size * 0.2,
          backgroundColor: color,
          bottom: size * 0.35,
          left: size * 0.05,
          borderRadius: baseWidth / 2,
          transform: [{ scaleY: swirl3Anim }, { rotate: '10deg' }],
        }
      ]}>
        <View style={[styles.swirlHighlight, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
      </Animated.View>

      {/* Fourth layer */}
      <Animated.View style={[
        styles.swirlLayer,
        {
          width: baseWidth * 0.55,
          height: size * 0.18,
          backgroundColor: color,
          bottom: size * 0.5,
          left: size * 0.15,
          borderRadius: baseWidth / 2,
          transform: [{ scaleY: swirl4Anim }, { rotate: '-5deg' }],
        }
      ]}>
        <View style={[styles.swirlHighlight, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
      </Animated.View>

      {/* Tip/peak */}
      <Animated.View style={[
        styles.swirlTip,
        {
          width: size * 0.2,
          height: size * 0.35,
          backgroundColor: color,
          bottom: size * 0.62,
          left: size * 0.25,
          transform: [
            { scaleY: tipAnim },
            { rotate: '15deg' },
          ],
        }
      ]}>
        <View style={styles.tipHighlight} />
      </Animated.View>
    </View>
  );
};

// Yogurt machine nozzle
const MachineNozzle: React.FC<{ isDispensing: boolean }> = ({ isDispensing }) => {
  const flowAnim = useRef(new Animated.Value(0)).current;
  const dripAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDispensing) {
      // Flow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flowAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(flowAnim, { toValue: 0.7, duration: 200, useNativeDriver: true }),
        ])
      ).start();

      // Drip animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(dripAnim, { toValue: 1, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(dripAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    } else {
      flowAnim.setValue(0);
      dripAnim.setValue(0);
    }
  }, [isDispensing]);

  return (
    <View style={styles.nozzleContainer}>
      {/* Machine body */}
      <LinearGradient
        colors={['#E0E0E0', '#BDBDBD', '#9E9E9E'] as const}
        style={styles.machineBody}
      >
        <View style={styles.machineLogo}>
          <Text style={styles.machineLogoText}>YO</Text>
        </View>
      </LinearGradient>

      {/* Nozzle */}
      <View style={styles.nozzle}>
        <LinearGradient
          colors={['#9E9E9E', '#757575'] as const}
          style={styles.nozzleInner}
        />
      </View>

      {/* Yogurt flow */}
      {isDispensing && (
        <Animated.View style={[
          styles.yogurtFlow,
          {
            opacity: flowAnim,
            transform: [{
              scaleY: flowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              })
            }],
          }
        ]}>
          <LinearGradient
            colors={[colors.flavors.strawberry, colors.flavors.vanilla] as const}
            style={styles.flowGradient}
          />
        </Animated.View>
      )}

      {/* Drip */}
      {isDispensing && (
        <Animated.View style={[
          styles.drip,
          {
            opacity: dripAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.8, 0],
            }),
            transform: [{
              translateY: dripAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 30],
              })
            }],
          }
        ]} />
      )}
    </View>
  );
};

// Frozen yogurt cup
const FroYoCup: React.FC<{ size: CupSize; isSelected: boolean }> = ({ size, isSelected }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  const cupHeight = size.size === 'small' ? 120 : size.size === 'medium' ? 150 : 180;
  const cupTopWidth = size.size === 'small' ? 100 : size.size === 'medium' ? 120 : 140;
  const cupBottomWidth = cupTopWidth * 0.7;
  const swirlSize = size.size === 'small' ? 80 : size.size === 'medium' ? 100 : 120;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      wobbleAnim.setValue(0);
    }
  }, [isSelected]);

  return (
    <Animated.View style={[
      styles.cupWrapper,
      {
        transform: [
          { scale: scaleAnim },
          {
            rotate: wobbleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['-2deg', '2deg'],
            })
          },
        ],
      }
    ]}>
      {/* Soft-serve swirl on top */}
      <View style={[styles.swirlPosition, { top: -swirlSize * 0.8 }]}>
        <SoftServeSwirl
          color={colors.flavors.strawberry}
          size={swirlSize}
          isDispensing={isSelected}
        />
      </View>

      {/* Cup body */}
      <View style={[styles.cupBody, { height: cupHeight }]}>
        {/* Cup gradient */}
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5', '#EEEEEE'] as const}
          style={[
            styles.cupShape,
            {
              width: cupTopWidth,
              height: cupHeight,
              borderBottomLeftRadius: cupBottomWidth / 2,
              borderBottomRightRadius: cupBottomWidth / 2,
            }
          ]}
        >
          {/* Cup rim */}
          <View style={[styles.cupRim, { width: cupTopWidth + 10 }]} />

          {/* Cup pattern */}
          <View style={styles.cupPattern}>
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.cupStripe,
                  { top: 30 + i * (cupHeight / 6) }
                ]}
              />
            ))}
          </View>

          {/* Yogurt inside cup (partial fill) */}
          <View style={[styles.yogurtInside, { height: cupHeight * 0.6, bottom: 10 }]}>
            <LinearGradient
              colors={[colors.flavors.strawberry, `${colors.flavors.strawberry}DD`] as const}
              style={styles.yogurtInsideGradient}
            />
          </View>

          {/* Brand logo on cup */}
          <View style={styles.brandLogo}>
            <Text style={styles.brandText}>Yo-V</Text>
          </View>

          {/* Shine effect */}
          <View style={styles.cupShineStrip} />
        </LinearGradient>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: cupBottomWidth + 20 }]} />
    </Animated.View>
  );
};

// Size card for carousel
const SizeCard: React.FC<{
  size: CupSize;
  isSelected: boolean;
  onSelect: () => void;
  scrollX: Animated.Value;
  index: number;
}> = ({ size, isSelected, onSelect, scrollX, index }) => {
  const inputRange = [
    (index - 1) * (CARD_WIDTH + CARD_MARGIN * 2),
    index * (CARD_WIDTH + CARD_MARGIN * 2),
    (index + 1) * (CARD_WIDTH + CARD_MARGIN * 2),
  ];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[
      styles.cardContainer,
      { transform: [{ scale }], opacity }
    ]}>
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={onSelect}
        activeOpacity={0.9}
      >
        {/* Best value badge */}
        {size.size === 'large' && (
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>BEST VALUE</Text>
          </View>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </View>
        )}

        {/* Machine nozzle */}
        <MachineNozzle isDispensing={isSelected} />

        {/* Cup illustration */}
        <FroYoCup size={size} isSelected={isSelected} />

        {/* Size info */}
        <View style={styles.sizeInfo}>
          <Text style={[styles.sizeName, isSelected && styles.sizeNameSelected]}>
            {size.name}
          </Text>
          <Text style={styles.sizeOz}>{size.ounces} oz</Text>
        </View>

        {/* Price */}
        <View style={[styles.priceContainer, isSelected && styles.priceContainerSelected]}>
          <Text style={[styles.price, isSelected && styles.priceSelected]}>
            ${size.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SizeStep: React.FC = () => {
  const { order, setCupSize } = useOrder();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(1); // Default to medium

  useEffect(() => {
    // Auto-select medium if nothing selected
    if (!order.cupSize) {
      setCupSize(CUP_SIZES[1]);
    }
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={CUP_SIZES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          initialScrollIndex={1}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + CARD_MARGIN * 2,
            offset: (CARD_WIDTH + CARD_MARGIN * 2) * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <SizeCard
              size={item}
              isSelected={order.cupSize?.id === item.id}
              onSelect={() => setCupSize(item)}
              scrollX={scrollX}
              index={index}
            />
          )}
        />
      </View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {CUP_SIZES.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_MARGIN * 2),
            index * (CARD_WIDTH + CARD_MARGIN * 2),
            (index + 1) * (CARD_WIDTH + CARD_MARGIN * 2),
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { width: dotWidth, opacity: dotOpacity },
              ]}
            />
          );
        })}
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="gift-outline" size={18} color={colors.accent.gold} />
        <Text style={styles.infoText}>All sizes include unlimited toppings!</Text>
      </View>

      {/* Swipe hint */}
      <View style={styles.swipeHint}>
        <Ionicons name="swap-horizontal" size={16} color={colors.text.muted} />
        <Text style={styles.swipeText}>Swipe to see all sizes</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 450,
    ...shadows.large,
  },
  cardSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: '#FFFDF5',
  },
  bestBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.ui.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    zIndex: 10,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  checkBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ui.success,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.medium,
  },
  nozzleContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  machineBody: {
    width: 80,
    height: 40,
    borderRadius: borderRadius.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineLogo: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  machineLogoText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
  },
  nozzle: {
    width: 24,
    height: 20,
    overflow: 'hidden',
  },
  nozzleInner: {
    flex: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  yogurtFlow: {
    position: 'absolute',
    bottom: -25,
    width: 12,
    height: 30,
    borderRadius: 6,
    overflow: 'hidden',
  },
  flowGradient: {
    flex: 1,
  },
  drip: {
    position: 'absolute',
    bottom: -35,
    width: 8,
    height: 12,
    backgroundColor: colors.flavors.strawberry,
    borderRadius: 4,
  },
  cupWrapper: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  swirlPosition: {
    position: 'absolute',
    zIndex: 10,
  },
  swirlContainer: {
    position: 'relative',
  },
  swirlLayer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  swirlHighlight: {
    position: 'absolute',
    top: 2,
    left: '10%',
    width: '30%',
    height: '40%',
    borderRadius: 20,
  },
  swirlTip: {
    position: 'absolute',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  tipHighlight: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 6,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  cupBody: {
    alignItems: 'center',
  },
  cupShape: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cupRim: {
    position: 'absolute',
    top: -3,
    left: -5,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  cupPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cupStripe: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  yogurtInside: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  yogurtInsideGradient: {
    flex: 1,
  },
  brandLogo: {
    position: 'absolute',
    bottom: '35%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  brandText: {
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
    letterSpacing: 1,
  },
  cupShineStrip: {
    position: 'absolute',
    top: 20,
    left: 12,
    width: 8,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
  },
  cupShadow: {
    height: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  sizeInfo: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  sizeName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  sizeNameSelected: {
    color: colors.accent.gold,
  },
  sizeOz: {
    fontSize: typography.fontSizes.md,
    color: colors.text.muted,
    marginTop: 4,
  },
  priceContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.round,
  },
  priceContainerSelected: {
    backgroundColor: colors.accent.gold,
  },
  price: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  priceSelected: {
    color: '#FFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.gold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent.gold + '15',
    borderRadius: borderRadius.lg,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  swipeText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
});

export default SizeStep;
