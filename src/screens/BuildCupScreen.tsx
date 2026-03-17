import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOrder, ORDER_STEPS, STEP_INFO } from '../context/OrderContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { submitOrder } from '../services/orderService';

// Step components
import SizeStep from '../components/order/SizeStep';
import FlavorsStep from '../components/order/FlavorsStep';
import ToppingsStep from '../components/order/ToppingsStep';
import SaucesStep from '../components/order/SaucesStep';
import ReviewStep from '../components/order/ReviewStep';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confetti for celebrations
const Confetti: React.FC<{ visible: boolean }> = ({ visible }) => {
  const particles = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 500,
      color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#DDA0DD', '#95E1D3'][Math.floor(Math.random() * 5)],
      size: 8 + Math.random() * 8,
    }))
  ).current;

  const fallAnims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      fallAnims.forEach((anim, i) => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          delay: particles[i].delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle, i) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.confettiPiece,
            {
              left: particle.x,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: fallAnims[i].interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [1, 1, 0],
              }),
              transform: [
                {
                  translateY: fallAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, SCREEN_HEIGHT],
                  }),
                },
                {
                  rotate: fallAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '720deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

// Progress indicator with step dots
const ProgressIndicator: React.FC = () => {
  const { stepIndex, isStepComplete, goToStep } = useOrder();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: stepIndex,
      friction: 8,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [stepIndex]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, ORDER_STEPS.length - 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressContainer}>
      {/* Progress bar background */}
      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
          <LinearGradient
            colors={['#FF6B6B', '#FFE66D', '#4ECDC4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Step dots */}
      <View style={styles.stepsContainer}>
        {ORDER_STEPS.map((step, index) => {
          const stepInfo = STEP_INFO[step];
          const isActive = index === stepIndex;
          const isComplete = index < stepIndex || isStepComplete(step);
          const canNavigate = index <= stepIndex || (index === stepIndex + 1 && isStepComplete(ORDER_STEPS[stepIndex]));

          return (
            <TouchableOpacity
              key={step}
              style={[
                styles.stepDot,
                isActive && styles.stepDotActive,
                isComplete && styles.stepDotComplete,
              ]}
              onPress={() => canNavigate && goToStep(step)}
              disabled={!canNavigate}
              activeOpacity={0.7}
            >
              {isComplete && !isActive ? (
                <Ionicons name="checkmark" size={14} color="#FFF" />
              ) : (
                <Text style={[styles.stepDotText, (isActive || isComplete) && styles.stepDotTextActive]}>
                  {stepInfo.emoji}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Step header with title and mascot reaction
const StepHeader: React.FC = () => {
  const { currentStep } = useOrder();
  const stepInfo = STEP_INFO[currentStep];
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    bounceAnim.setValue(0);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  return (
    <Animated.View
      style={[
        styles.stepHeader,
        {
          opacity: bounceAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Mascot/Emoji */}
      <View style={[styles.mascotContainer, { backgroundColor: stepInfo.color + '20' }]}>
        <Text style={styles.mascotEmoji}>{stepInfo.emoji}</Text>
      </View>

      <View style={styles.headerTextContainer}>
        <Text style={styles.stepTitle}>{stepInfo.title}</Text>
        <Text style={styles.stepSubtitle}>{stepInfo.subtitle}</Text>
      </View>
    </Animated.View>
  );
};

// Navigation buttons
const NavigationButtons: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentStep, stepIndex, nextStep, prevStep, canGoNext, canGoPrev, resetOrder, order, getTotalPrice } = useOrder();
  const [showCelebration, setShowCelebration] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleNext = async () => {
    if (currentStep === 'review') {
      // Submit order to server
      const result = await submitOrder({
        cupSize: order.cupSize!,
        flavors: order.flavors.map(f => ({ id: f.id, name: f.name, color: f.color })),
        toppings: order.toppings.map(t => ({
          topping: {
            id: t.topping.id,
            name: t.topping.name,
            emoji: t.topping.emoji,
            pricePerGram: t.topping.pricePerGram,
          },
          grams: t.grams,
        })),
        sauces: order.sauces.map(s => ({ id: s.id, name: s.name, emoji: s.emoji })),
        totalPrice: getTotalPrice(),
      });

      if (result.orderId) {
        setOrderNumber(result.orderId);
      }

      // Show celebration regardless (works offline too)
      setShowCelebration(true);
      setTimeout(() => {
        resetOrder();
        onClose();
      }, 3000);
    } else {
      nextStep();
    }
  };

  const isLastStep = currentStep === 'review';
  const stepInfo = STEP_INFO[currentStep];

  return (
    <>
      <Confetti visible={showCelebration} />

      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <Animated.View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Order Complete!</Text>
            {orderNumber ? (
              <Text style={styles.celebrationOrderNum}>{orderNumber}</Text>
            ) : null}
            <Text style={styles.celebrationSubtitle}>Your frozen yogurt is being prepared</Text>

            {/* Receipt Card */}
            <View style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptBrand}>Yo-Vazaluza</Text>
                <Text style={styles.receiptDate}>{new Date().toLocaleString()}</Text>
              </View>
              <View style={styles.receiptDivider} />
              {order.cupSize && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptItem}>{order.cupSize.emoji} {order.cupSize.name} ({order.cupSize.ounces}oz)</Text>
                  <Text style={styles.receiptPrice}>${order.cupSize.price.toFixed(2)}</Text>
                </View>
              )}
              {order.flavors.length > 0 && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptItem}>🍦 {order.flavors.map(f => f.name).join(', ')}</Text>
                </View>
              )}
              {order.toppings.map(t => (
                <View key={t.topping.id} style={styles.receiptRow}>
                  <Text style={styles.receiptItem}>{t.topping.emoji || '🍬'} {t.topping.name} ({t.grams}g)</Text>
                  <Text style={styles.receiptPrice}>${((t.topping.pricePerGram || 0.05) * t.grams).toFixed(2)}</Text>
                </View>
              ))}
              {order.sauces.map(sauce => (
                <View key={sauce.id} style={styles.receiptRow}>
                  <Text style={styles.receiptItem}>{sauce.emoji || '🍫'} {sauce.name}</Text>
                  <Text style={[styles.receiptPrice, { color: colors.ui.success }]}>FREE</Text>
                </View>
              ))}
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptTotal}>TOTAL</Text>
                <Text style={styles.receiptTotalPrice}>${getTotalPrice().toFixed(2)}</Text>
              </View>

              {/* Barcode-style visual */}
              <View style={styles.receiptBarcode}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.barcodeBar,
                      {
                        width: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
                        backgroundColor: i % 5 === 0 ? '#000' : '#333',
                      },
                    ]}
                  />
                ))}
              </View>
              {orderNumber ? (
                <Text style={styles.receiptOrderId}>{orderNumber}</Text>
              ) : null}
            </View>
          </Animated.View>
        </View>
      )}

      <View style={styles.navigationContainer}>
        {/* Back button */}
        <TouchableOpacity
          style={[styles.navButton, styles.backButton, !canGoPrev() && styles.navButtonDisabled]}
          onPress={prevStep}
          disabled={!canGoPrev()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={canGoPrev() ? colors.text.primary : colors.text.muted}
          />
        </TouchableOpacity>

        {/* Next/Complete button */}
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !canGoNext() && !isLastStep && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={!canGoNext() && !isLastStep}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canGoNext() || isLastStep ? [stepInfo.color, stepInfo.color + 'DD'] : ['#CCC', '#AAA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Place Order' : 'Continue'}
            </Text>
            <Ionicons
              name={isLastStep ? 'checkmark-circle' : 'chevron-forward'}
              size={22}
              color="#FFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
};

// Current step content renderer
const StepContent: React.FC = () => {
  const { currentStep } = useOrder();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'size':
        return <SizeStep />;
      case 'flavors':
        return <FlavorsStep />;
      case 'toppings':
        return <ToppingsStep />;
      case 'sauces':
        return <SaucesStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.stepContent,
        {
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      {renderStep()}
    </Animated.View>
  );
};

// Main BuildCupScreen
const BuildCupScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { resetOrder, prePopulateToppings, currentStep, order } = useOrder();
  const preSelectedToppings = route?.params?.preSelectedToppings;
  const toppingsAppliedRef = useRef(false);

  // Auto-apply pre-selected toppings once flavors are chosen
  useEffect(() => {
    if (
      preSelectedToppings?.length > 0 &&
      !toppingsAppliedRef.current &&
      currentStep === 'toppings' &&
      order.flavors.length > 0
    ) {
      toppingsAppliedRef.current = true;
      prePopulateToppings(preSelectedToppings);
    }
  }, [currentStep, preSelectedToppings, order.flavors.length]);

  const handleClose = () => {
    resetOrder();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[colors.background.main, '#FAFAFA', colors.accent.cream + '30']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top bar with close button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={colors.text.secondary} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>Build Your Cup</Text>
          </View>
          <View style={styles.closeButton} />
        </View>

        {/* Progress indicator */}
        <ProgressIndicator />

        {/* Step header */}
        <StepHeader />

        {/* Step content */}
        <StepContent />

        {/* Navigation buttons */}
        <NavigationButtons onClose={handleClose} />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.ui.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  stepDotActive: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '20',
    transform: [{ scale: 1.1 }],
  },
  stepDotComplete: {
    backgroundColor: colors.ui.success,
    borderColor: colors.ui.success,
  },
  stepDotText: {
    fontSize: 16,
  },
  stepDotTextActive: {
    fontSize: 18,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  mascotContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mascotEmoji: {
    fontSize: 32,
  },
  headerTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  stepContent: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  navButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  backButton: {
    width: 56,
    height: 56,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  nextButton: {
    flex: 1,
    height: 56,
    ...shadows.medium,
  },
  nextButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  nextButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  celebrationContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  celebrationTitle: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
    marginBottom: spacing.sm,
  },
  celebrationOrderNum: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
    marginBottom: spacing.sm,
    letterSpacing: 2,
  },
  celebrationSubtitle: {
    fontSize: typography.fontSizes.lg,
    color: 'rgba(255,255,255,0.8)',
  },
  receiptCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    width: Math.min(SCREEN_WIDTH * 0.85, 340),
    ...shadows.medium,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent.gold,
    letterSpacing: 1,
  },
  receiptDate: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    borderStyle: 'dashed' as any,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptItem: {
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },
  receiptPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 8,
  },
  receiptTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  receiptTotalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accent.gold,
  },
  receiptBarcode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    marginTop: 16,
    height: 40,
  },
  barcodeBar: {
    height: '100%',
    borderRadius: 1,
  },
  receiptOrderId: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    marginTop: 6,
    letterSpacing: 2,
  },
});

export default BuildCupScreen;
