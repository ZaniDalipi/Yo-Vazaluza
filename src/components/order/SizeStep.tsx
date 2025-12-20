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

// Yogurt machine nozzle with dispensing animation
const MachineNozzle: React.FC<{ isDispensing: boolean }> = ({ isDispensing }) => {
  const flowAnim = useRef(new Animated.Value(0)).current;
  const dripAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDispensing) {
      // Flow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(flowAnim, { toValue: 0.7, duration: 300, useNativeDriver: true }),
        ])
      ).start();

      // Drip animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(dripAnim, { toValue: 1, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
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

      {/* Yogurt flow - white color */}
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
            colors={['#FFFFFF', '#F5F5F5'] as const}
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
                outputRange: [0, 40],
              })
            }],
          }
        ]} />
      )}
    </View>
  );
};

// Empty frozen yogurt cup that fills based on size
const FroYoCup: React.FC<{ size: CupSize; isSelected: boolean }> = ({ size, isSelected }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const swirlAnim = useRef(new Animated.Value(0)).current;

  // Fill level based on size: small=50%, medium=75%, large=100%
  const fillLevel = size.size === 'small' ? 0.5 : size.size === 'medium' ? 0.75 : 1;

  const cupHeight = size.size === 'small' ? 100 : size.size === 'medium' ? 130 : 160;
  const cupTopWidth = size.size === 'small' ? 90 : size.size === 'medium' ? 110 : 130;
  const swirlSize = size.size === 'small' ? 60 : size.size === 'medium' ? 80 : 100;

  useEffect(() => {
    if (isSelected) {
      // Fill animation
      Animated.timing(fillAnim, {
        toValue: fillLevel,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // Wobble animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(wobbleAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();

      // Swirl build animation
      Animated.stagger(100, [
        Animated.spring(swirlAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]).start();
    } else {
      fillAnim.setValue(0);
      wobbleAnim.setValue(0);
      swirlAnim.setValue(0);
    }
  }, [isSelected, fillLevel]);

  return (
    <Animated.View style={[
      styles.cupWrapper,
      isSelected && {
        transform: [
          {
            rotate: wobbleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['-2deg', '2deg'],
            })
          },
        ],
      }
    ]}>
      {/* Soft-serve swirl on top - only when selected */}
      {isSelected && (
        <Animated.View style={[
          styles.swirlPosition,
          {
            top: -swirlSize * 0.7,
            opacity: swirlAnim,
            transform: [{ scale: swirlAnim }],
          }
        ]}>
          <View style={[styles.swirlContainer, { width: swirlSize, height: swirlSize * 1.2 }]}>
            {/* Swirl layers - white color (no flavor yet) */}
            <View style={[styles.swirlLayer, { width: swirlSize * 0.65, height: swirlSize * 0.22, bottom: 0, backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.swirlLayer, { width: swirlSize * 0.55, height: swirlSize * 0.2, bottom: swirlSize * 0.15, left: swirlSize * 0.08, backgroundColor: '#F8F8F8', transform: [{ rotate: '-5deg' }] }]} />
            <View style={[styles.swirlLayer, { width: swirlSize * 0.45, height: swirlSize * 0.18, bottom: swirlSize * 0.28, left: swirlSize * 0.05, backgroundColor: '#FFFFFF', transform: [{ rotate: '8deg' }] }]} />
            <View style={[styles.swirlLayer, { width: swirlSize * 0.35, height: swirlSize * 0.16, bottom: swirlSize * 0.4, left: swirlSize * 0.15, backgroundColor: '#F8F8F8', transform: [{ rotate: '-3deg' }] }]} />
            {/* Tip */}
            <View style={[styles.swirlTip, { width: swirlSize * 0.15, height: swirlSize * 0.25, bottom: swirlSize * 0.5, left: swirlSize * 0.28, backgroundColor: '#FFFFFF' }]} />
            {/* Highlights */}
            <View style={[styles.swirlHighlight, { width: 10, height: 6, bottom: swirlSize * 0.45, left: '20%' }]} />
            <View style={[styles.swirlHighlight, { width: 6, height: 4, bottom: swirlSize * 0.2, right: '25%' }]} />
          </View>
        </Animated.View>
      )}

      {/* Cup body */}
      <View style={[styles.cupBody, { height: cupHeight }]}>
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5', '#EEEEEE'] as const}
          style={[
            styles.cupShape,
            {
              width: cupTopWidth,
              height: cupHeight,
              borderBottomLeftRadius: cupTopWidth * 0.35,
              borderBottomRightRadius: cupTopWidth * 0.35,
            }
          ]}
        >
          {/* Cup rim */}
          <View style={[styles.cupRim, { width: cupTopWidth + 10 }]} />

          {/* Yogurt inside cup - animated fill */}
          <Animated.View style={[
            styles.yogurtInside,
            {
              height: fillAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, cupHeight * 0.7],
              }),
              bottom: 10,
            }
          ]}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F8F8'] as const}
              style={styles.yogurtInsideGradient}
            />
          </Animated.View>

          {/* Empty indicator when not selected */}
          {!isSelected && (
            <View style={styles.emptyIndicator}>
              <Text style={styles.emptyText}>Empty</Text>
            </View>
          )}

          {/* Cup pattern */}
          <View style={styles.cupPattern}>
            {[...Array(4)].map((_, i) => (
              <View
                key={i}
                style={[styles.cupStripe, { top: 25 + i * (cupHeight / 5) }]}
              />
            ))}
          </View>

          {/* Brand logo on cup */}
          <View style={styles.brandLogo}>
            <Text style={styles.brandText}>Yo-V</Text>
          </View>

          {/* Shine effect */}
          <View style={[styles.cupShineStrip, { height: cupHeight * 0.5 }]} />
        </LinearGradient>
      </View>

      {/* Shadow */}
      <View style={[styles.cupShadow, { width: cupTopWidth * 0.5 + 10 }]} />

      {/* Fill percentage label */}
      {isSelected && (
        <View style={styles.fillLabel}>
          <Text style={styles.fillLabelText}>{Math.round(fillLevel * 100)}% fill</Text>
        </View>
      )}
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
    minHeight: 420,
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
    fontWeight: '700' as const,
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
    bottom: -30,
    width: 12,
    height: 35,
    borderRadius: 6,
    overflow: 'hidden',
  },
  flowGradient: {
    flex: 1,
  },
  drip: {
    position: 'absolute',
    bottom: -40,
    width: 8,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  swirlTip: {
    position: 'absolute',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '12deg' }],
  },
  swirlHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    transform: [{ rotate: '-10deg' }],
  },
  cupBody: {
    alignItems: 'center',
  },
  cupShape: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    ...shadows.medium,
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
  emptyIndicator: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.muted,
    fontStyle: 'italic',
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
  brandLogo: {
    position: 'absolute',
    bottom: '30%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.accent.gold,
    letterSpacing: 1,
  },
  cupShineStrip: {
    position: 'absolute',
    top: 18,
    left: 12,
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
  },
  cupShadow: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 50,
    marginTop: spacing.xs,
  },
  fillLabel: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  fillLabelText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.accent.gold,
  },
  sizeInfo: {
    alignItems: 'center',
    marginTop: spacing.lg,
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
