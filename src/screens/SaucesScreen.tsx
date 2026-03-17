import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MagicalParticles } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Topping } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

// Derive sauce colors from topping color
const getSauceColors = (sauce: Topping) => {
  const baseColor = sauce.color || '#5C4033';
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const darkColor = `#${Math.round(r * 0.7).toString(16).padStart(2, '0')}${Math.round(g * 0.7).toString(16).padStart(2, '0')}${Math.round(b * 0.7).toString(16).padStart(2, '0')}`;
  const lighten = (v: number) => Math.min(255, Math.round(v + (255 - v) * 0.4));
  const lightColor = `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`;
  return { color: baseColor, darkColor, lightColor };
};

// Sauce Cup - shows drizzle on a branded cup
const SauceCup: React.FC<{ sauce: Topping | null; isActive: boolean }> = ({ sauce, isActive }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const drizzleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -6,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  useEffect(() => {
    if (sauce) {
      Animated.timing(drizzleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(drizzleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [sauce?.id]);

  const sauceColors = sauce ? getSauceColors(sauce) : null;

  return (
    <Animated.View
      style={[
        styles.cupContainer,
        { transform: [{ translateY: floatAnim }] },
      ]}
    >
      {/* Drizzle on top of cup */}
      {sauceColors && (
        <Animated.View style={[styles.drizzleWrapper, {
          opacity: drizzleAnim,
          transform: [{
            scaleY: drizzleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          }],
        }]}>
          {/* Drizzle streams */}
          <View style={[styles.drizzleStream1, { backgroundColor: sauceColors.color }]} />
          <View style={[styles.drizzleStream2, { backgroundColor: sauceColors.color }]} />
          <View style={[styles.drizzleStream3, { backgroundColor: sauceColors.lightColor }]} />
          {/* Drizzle pool */}
          <View style={[styles.drizzlePool, { backgroundColor: sauceColors.color + 'CC' }]}>
            <Animated.View
              style={[
                styles.drizzleShine,
                {
                  opacity: shineAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.2, 0.6, 0.2],
                  }),
                },
              ]}
            />
          </View>
          <View style={[styles.drizzleDrip1, { backgroundColor: sauceColors.color + 'BB' }]} />
          <View style={[styles.drizzleDrip2, { backgroundColor: sauceColors.color + '99' }]} />
        </Animated.View>
      )}

      {/* Cup */}
      <View style={styles.cup}>
        <View style={styles.cupRimOuter}>
          <View style={styles.cupRim} />
        </View>
        <View style={styles.cupBody}>
          <View style={styles.cupPattern}>
            <View style={[styles.cupStripe, { backgroundColor: (sauceColors?.color || colors.accent.gold) + '20' }]} />
            <View style={[styles.cupStripe, { backgroundColor: (sauceColors?.color || colors.accent.gold) + '15' }]} />
            <View style={[styles.cupStripe, { backgroundColor: (sauceColors?.color || colors.accent.gold) + '10' }]} />
          </View>
          <View style={styles.brandContainer}>
            <Text style={styles.cupBrand}>YO-VAZALUZA</Text>
            <Text style={styles.cupSubBrand}>DALIPI</Text>
          </View>
          <View style={styles.cupShine} />
        </View>
      </View>

      {/* Shadow */}
      <View style={styles.cupShadow} />
    </Animated.View>
  );
};

// Sauce Card component
const SauceCard: React.FC<{
  sauce: Topping;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}> = ({ sauce, isSelected, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const sauceColors = getSauceColors(sauce);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [isSelected]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.sauceCard,
          isSelected && { borderColor: sauceColors.color, borderWidth: 2.5 },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected
            ? [sauceColors.color + '15', sauceColors.lightColor + '25']
            : ['#FFFFFF', '#FAFAFA']
          }
          style={styles.sauceCardGradient}
        >
          {/* Sauce emoji */}
          <View style={[
            styles.sauceEmojiContainer,
            { backgroundColor: sauceColors.color + '20' },
          ]}>
            <Text style={styles.sauceEmoji}>{sauce.emoji || '🍫'}</Text>
          </View>

          {/* Sauce name */}
          <Text style={[
            styles.sauceName,
            isSelected && { color: sauceColors.color },
          ]} numberOfLines={2}>
            {sauce.name}
          </Text>

          {/* Price info */}
          <View style={styles.saucePriceRow}>
            <Text style={styles.sauceFreeLabel}>FREE</Text>
          </View>

          {/* Selected indicator */}
          {isSelected && (
            <View style={[styles.selectedBadge, { backgroundColor: sauceColors.color }]}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SaucesScreen: React.FC = () => {
  const { toppings: allToppings } = useApp();
  const sauces = useMemo(() => allToppings.filter(t => t.category === 'sauces'), [allToppings]);
  const [selectedSauces, setSelectedSauces] = useState<Set<string>>(new Set());

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const handleToggle = (sauce: Topping) => {
    setSelectedSauces(prev => {
      const next = new Set(prev);
      if (next.has(sauce.id)) {
        next.delete(sauce.id);
      } else {
        next.add(sauce.id);
      }
      return next;
    });
  };

  // Get the most recently selected sauce for the cup preview
  const activeSauce = useMemo(() => {
    const selected = sauces.filter(s => selectedSauces.has(s.id));
    return selected.length > 0 ? selected[selected.length - 1] : null;
  }, [sauces, selectedSauces]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background decorations */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <MagicalParticles
        count={12}
        colors={[
          colors.accent.gold + '50',
          colors.accent.cream + '50',
          colors.flavors.chocolate + '40',
          colors.flavors.strawberry + '40',
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="water" size={28} color={colors.accent.gold} />
          </View>

          <Text style={styles.title}>OUR SAUCES</Text>

          {/* Decorative line */}
          <View style={styles.titleDecor}>
            <View style={styles.decorLine} />
            <View style={styles.decorDot} />
            <View style={styles.decorLine} />
          </View>

          {/* Animated Arrow */}
          <Animated.View
            style={[
              styles.arrowContainer,
              {
                transform: [{ translateY: arrowTranslate }],
                opacity: arrowAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1, 0.5],
                }),
              },
            ]}
          >
            <Ionicons name="chevron-down" size={28} color={colors.accent.gold} />
          </Animated.View>
        </Animated.View>

        {/* Cup Preview */}
        <View style={styles.cupPreviewSection}>
          <View style={styles.cupCard}>
            <LinearGradient
              colors={['#FFFFFF', (activeSauce?.color || colors.accent.gold) + '08', (activeSauce?.color || colors.accent.gold) + '15']}
              locations={[0, 0.6, 1]}
              style={styles.cupCardGradient}
            >
              <View style={[styles.bgCircle, { backgroundColor: (activeSauce?.color || colors.accent.gold) + '15' }]} />
              <View style={[styles.bgCircle2, { backgroundColor: (activeSauce?.color || colors.accent.gold) + '10' }]} />

              <SauceCup sauce={activeSauce} isActive={true} />

              {/* Selected sauces info */}
              <View style={styles.cupInfoSection}>
                {selectedSauces.size > 0 ? (
                  <>
                    <View style={styles.selectedSaucesRow}>
                      {sauces.filter(s => selectedSauces.has(s.id)).map(s => (
                        <TouchableOpacity
                          key={s.id}
                          style={[styles.selectedPill, { backgroundColor: getSauceColors(s).color }]}
                          onPress={() => handleToggle(s)}
                        >
                          <Text style={styles.selectedPillEmoji}>{s.emoji || '🍫'}</Text>
                          <Text style={styles.selectedPillText} numberOfLines={1}>{s.name}</Text>
                          <Ionicons name="close" size={12} color="#FFF" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.cupHintText}>Tap a sauce to preview it on the cup!</Text>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Sauces Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sauceGrid}>
            {sauces.map((sauce, index) => (
              <SauceCard
                key={sauce.id}
                sauce={sauce}
                isSelected={selectedSauces.has(sauce.id)}
                onPress={() => handleToggle(sauce)}
                index={index}
              />
            ))}
          </View>

          {sauces.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🍯</Text>
              <Text style={styles.emptyTitle}>No sauces available</Text>
              <Text style={styles.emptyText}>Check back soon for yummy drizzles!</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.accent.gold, colors.accent.wood]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.countBadge}
          >
            <Text style={styles.countText}>{sauces.length}</Text>
          </LinearGradient>
          <Text style={styles.footerLabel}>Free Drizzles</Text>
          <Text style={styles.footerSubtext}> · Tap to select</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  safeArea: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accent.gold + '10',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.flavors.chocolate + '15',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    letterSpacing: 4,
  },
  titleDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  decorLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.accent.gold,
    borderRadius: 1,
  },
  decorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.gold,
  },
  arrowContainer: {
    marginTop: spacing.sm,
  },

  // Cup Preview
  cupPreviewSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cupCard: {
    borderRadius: borderRadius.xl + 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...shadows.large,
  },
  cupCardGradient: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  bgCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  cupInfoSection: {
    width: '100%',
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  selectedSaucesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  selectedPillEmoji: {
    fontSize: 14,
  },
  selectedPillText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600' as const,
    color: '#FFF',
    maxWidth: 80,
  },
  cupHintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },

  // Cup
  cupContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: spacing.md,
  },
  drizzleWrapper: {
    alignItems: 'center',
    marginBottom: -8,
    zIndex: 2,
  },
  drizzleStream1: {
    width: 6,
    height: 30,
    borderRadius: 3,
    transform: [{ rotate: '-15deg' }],
    marginBottom: -8,
  },
  drizzleStream2: {
    width: 5,
    height: 25,
    borderRadius: 3,
    transform: [{ rotate: '10deg' }],
    marginTop: -15,
    marginLeft: 20,
    marginBottom: -6,
  },
  drizzleStream3: {
    width: 4,
    height: 20,
    borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
    marginTop: -12,
    marginRight: 15,
    marginBottom: -4,
  },
  drizzlePool: {
    width: 120,
    height: 20,
    borderRadius: 60,
    overflow: 'hidden',
  },
  drizzleShine: {
    position: 'absolute',
    top: 3,
    left: '15%',
    width: '40%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  },
  drizzleDrip1: {
    width: 8,
    height: 14,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: -2,
    marginLeft: -30,
  },
  drizzleDrip2: {
    width: 6,
    height: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginTop: -8,
    marginLeft: 40,
  },
  cup: {
    alignItems: 'center',
    width: 200,
  },
  cupRimOuter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cupRim: {
    width: 180,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    zIndex: 1,
  },
  cupBody: {
    width: 165,
    height: 85,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginTop: -3,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cupPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cupStripe: {
    width: 3,
    height: '100%',
  },
  brandContainer: {
    alignItems: 'center',
  },
  cupBrand: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  cupSubBrand: {
    fontSize: 7,
    fontWeight: '600',
    color: colors.accent.gold,
    letterSpacing: 3,
    marginTop: 1,
  },
  cupShine: {
    position: 'absolute',
    top: 8,
    left: 15,
    width: 10,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
    transform: [{ rotate: '8deg' }],
  },
  cupShadow: {
    width: 90,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 45,
    marginTop: spacing.xs,
  },

  // Sauces grid
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sauceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },

  // Sauce Card
  sauceCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    ...shadows.medium,
  },
  sauceCardGradient: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sauceEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sauceEmoji: {
    fontSize: 28,
  },
  sauceName: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  saucePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sauceFreeLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '700' as const,
    color: colors.ui.success,
    letterSpacing: 1,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  footerLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  footerSubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.text.muted,
  },
});

export default SaucesScreen;
