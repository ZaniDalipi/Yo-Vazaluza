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

// Yogurt Machine Nozzle Component
const YogurtNozzle: React.FC<{ isDispensing: boolean; fillLevel: number }> = ({ isDispensing, fillLevel }) => {
  const dripAnim = useRef(new Animated.Value(0)).current;
  const streamAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDispensing) {
      // Stream animation - yogurt flowing
      Animated.loop(
        Animated.sequence([
          Animated.timing(streamAnim, { toValue: 1, duration: 400, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(streamAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();

      // Drip animation at the tip
      Animated.loop(
        Animated.sequence([
          Animated.timing(dripAnim, { toValue: 1, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(dripAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    } else {
      streamAnim.setValue(0);
      dripAnim.setValue(0);
    }
  }, [isDispensing]);

  return (
    <View style={nozzleStyles.nozzleContainer}>
      {/* Machine body - simplified */}
      <View style={nozzleStyles.machineBody}>
        <LinearGradient
          colors={['#E8E8E8', '#D0D0D0', '#C0C0C0'] as const}
          style={nozzleStyles.machineGradient}
        >
          <View style={nozzleStyles.machineBrand}>
            <Text style={nozzleStyles.machineBrandText}>Yo-V</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Nozzle tip */}
      <View style={nozzleStyles.nozzleTip}>
        <LinearGradient
          colors={['#B8B8B8', '#A0A0A0', '#888'] as const}
          style={nozzleStyles.nozzleTipGradient}
        />
      </View>

      {/* Yogurt stream when dispensing */}
      {isDispensing && (
        <Animated.View
          style={[
            nozzleStyles.yogurtStream,
            {
              opacity: streamAnim.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [0.7, 1, 1, 0.7],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FAFAFA', '#F5F5F5'] as const}
            style={nozzleStyles.streamGradient}
          />
        </Animated.View>
      )}

      {/* Drip at nozzle tip */}
      {isDispensing && (
        <Animated.View
          style={[
            nozzleStyles.drip,
            {
              transform: [
                {
                  translateY: dripAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  }),
                },
                {
                  scale: dripAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 0.6],
                  }),
                },
              ],
              opacity: dripAnim.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [1, 0.8, 0],
              }),
            },
          ]}
        />
      )}

      {/* Fill level indicator */}
      {isDispensing && (
        <View style={nozzleStyles.fillIndicator}>
          <Text style={nozzleStyles.fillText}>{Math.round(fillLevel * 100)}%</Text>
        </View>
      )}
    </View>
  );
};

const nozzleStyles = StyleSheet.create({
  nozzleContainer: {
    alignItems: 'center',
    marginBottom: -10,
    zIndex: 10,
  },
  machineBody: {
    width: 80,
    height: 35,
    borderRadius: 6,
    overflow: 'hidden',
    ...shadows.small,
  },
  machineGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  machineBrand: {
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  machineBrandText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 0.5,
  },
  nozzleTip: {
    width: 20,
    height: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  nozzleTipGradient: {
    flex: 1,
  },
  yogurtStream: {
    position: 'absolute',
    top: 52,
    width: 8,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
  },
  streamGradient: {
    flex: 1,
  },
  drip: {
    position: 'absolute',
    top: 50,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    ...shadows.small,
  },
  fillIndicator: {
    position: 'absolute',
    top: 8,
    right: -35,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  fillText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.accent.gold,
  },
});

// Realistic frozen yogurt cup that fills based on size
const FroYoCup: React.FC<{ size: CupSize; isSelected: boolean }> = ({ size, isSelected }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  // Fill level based on size: small=50%, medium=75%, large=100%
  const fillLevel = size.size === 'small' ? 0.5 : size.size === 'medium' ? 0.75 : 1;

  // Cup dimensions based on size
  const cupHeight = size.size === 'small' ? 110 : size.size === 'medium' ? 140 : 170;
  const cupTopWidth = size.size === 'small' ? 100 : size.size === 'medium' ? 120 : 140;
  const cupBottomWidth = cupTopWidth * 0.7;

  useEffect(() => {
    if (isSelected) {
      // Fill animation
      Animated.timing(fillAnim, {
        toValue: fillLevel,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // Gentle wobble animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      fillAnim.setValue(0);
      wobbleAnim.setValue(0);
    }
  }, [isSelected, fillLevel]);

  return (
    <View style={styles.cupWrapper}>
      {/* Yogurt machine nozzle */}
      <YogurtNozzle isDispensing={isSelected} fillLevel={fillLevel} />

      <Animated.View style={[
        styles.cupAnimated,
        isSelected && {
          transform: [
            {
              rotate: wobbleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['-1deg', '1deg'],
              })
            },
          ],
        }
      ]}>
        {/* Cup body - tapered shape */}
        <View style={[styles.cupBody, { height: cupHeight, width: cupTopWidth }]}>
        {/* Cup outer shell */}
        <View style={[
          styles.cupOuter,
          {
            width: cupTopWidth,
            height: cupHeight,
            borderBottomLeftRadius: cupBottomWidth * 0.5,
            borderBottomRightRadius: cupBottomWidth * 0.5,
          }
        ]}>
          {/* Rim/lip at top */}
          <View style={[styles.cupRim, { width: cupTopWidth + 8 }]}>
            <View style={styles.rimInner} />
          </View>

          {/* Cup wall with gradient */}
          <LinearGradient
            colors={['#FAFAFA', '#F0F0F0', '#E8E8E8'] as const}
            style={styles.cupWall}
          >
            {/* Decorative stripes */}
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.cupStripe,
                  { top: 20 + i * (cupHeight * 0.25) }
                ]}
              />
            ))}

            {/* Brand logo */}
            <View style={styles.brandLogo}>
              <Text style={styles.brandText}>Yo-V</Text>
            </View>

            {/* Shine effect */}
            <View style={[styles.cupShine, { height: cupHeight * 0.6 }]} />
          </LinearGradient>

          {/* Inner cup - visible yogurt area */}
          <View style={styles.cupInner}>
            {/* Yogurt fill */}
            <Animated.View
              style={[
                styles.yogurtFill,
                {
                  height: fillAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '85%'],
                  }),
                }
              ]}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FAFAFA', '#F5F5F5'] as const}
                style={styles.yogurtGradient}
              >
                {/* Yogurt surface texture */}
                {isSelected && (
                  <View style={styles.yogurtSurface}>
                    <View style={[styles.yogurtSwirl, { left: '20%', top: 8 }]} />
                    <View style={[styles.yogurtSwirl, { right: '25%', top: 12 }]} />
                    <View style={[styles.yogurtSwirl, { left: '40%', top: 5 }]} />
                  </View>
                )}
              </LinearGradient>
            </Animated.View>

            {/* Empty state */}
            {!isSelected && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Empty</Text>
              </View>
            )}
          </View>
        </View>
      </View>

        {/* Shadow */}
        <View style={[styles.cupShadow, { width: cupBottomWidth + 20 }]} />
      </Animated.View>
    </View>
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
  const [activeIndex, setActiveIndex] = useState(1);

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
        <Ionicons name="information-circle-outline" size={18} color={colors.accent.gold} />
        <Text style={styles.infoText}>Cup starts empty - pick your flavors next!</Text>
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
    minHeight: 380,
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
    fontWeight: '700' as const,
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
  cupWrapper: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cupAnimated: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cupBody: {
    alignItems: 'center',
    position: 'relative',
  },
  cupOuter: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    ...shadows.medium,
  },
  cupRim: {
    position: 'absolute',
    top: -2,
    left: -4,
    height: 14,
    backgroundColor: '#E8E8E8',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    zIndex: 10,
  },
  rimInner: {
    position: 'absolute',
    top: 3,
    left: 4,
    right: 4,
    height: 6,
    backgroundColor: '#D8D8D8',
    borderRadius: 3,
  },
  cupWall: {
    flex: 1,
    position: 'relative',
  },
  cupStripe: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  brandLogo: {
    position: 'absolute',
    bottom: '25%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 0.5,
  },
  cupShine: {
    position: 'absolute',
    top: 16,
    left: 10,
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
  },
  cupInner: {
    position: 'absolute',
    top: 12,
    left: 6,
    right: 6,
    bottom: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  yogurtFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  yogurtGradient: {
    flex: 1,
  },
  yogurtSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  yogurtSwirl: {
    position: 'absolute',
    width: 12,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  cupShadow: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  sizeInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sizeName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '500' as const,
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
