import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedLogo, AnimatedButton, MagicalParticles } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { verifyAdminPin, getLockoutInfo, ensureAdminPinExists } from '../services/authService';

const PIN_LENGTH = 4;

const AdminLoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setAdminMode } = useApp();

  const [pin, setPin] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockIconAnim = useRef(new Animated.Value(1)).current;
  const dotAnims = useRef(Array.from({ length: PIN_LENGTH }, () => new Animated.Value(0))).current;

  useEffect(() => {
    ensureAdminPinExists();
    checkLockout();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkLockout = async () => {
    const lockout = await getLockoutInfo();
    if (lockout.isLocked) {
      setIsLocked(true);
      const mins = Math.ceil(lockout.remainingMs / 60000);
      setLockoutMessage(`Locked for ${mins} min`);
      setTimeout(checkLockout, 10000);
    } else {
      setIsLocked(false);
      setLockoutMessage('');
    }
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const animateDot = (index: number, filled: boolean) => {
    Animated.spring(dotAnims[index], {
      toValue: filled ? 1 : 0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePinInput = async (digit: string) => {
    if (isLocked || isVerifying || pin.length >= PIN_LENGTH) return;

    const newPin = [...pin, digit];
    setPin(newPin);
    setErrorMessage('');
    animateDot(newPin.length - 1, true);

    // Auto-submit when PIN is complete
    if (newPin.length === PIN_LENGTH) {
      setIsVerifying(true);
      const pinStr = newPin.join('');

      const result = await verifyAdminPin(pinStr);

      if (result.success) {
        // Success animation
        Animated.timing(lockIconAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setAdminMode(true);
          navigation.replace('AdminPanel');
        });
      } else {
        shakeInput();
        setErrorMessage(result.error || 'Incorrect PIN');
        // Reset dots
        setTimeout(() => {
          dotAnims.forEach((anim) => {
            Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
          });
          setPin([]);
          setIsVerifying(false);
          checkLockout();
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length === 0 || isVerifying) return;
    const newPin = pin.slice(0, -1);
    animateDot(pin.length - 1, false);
    setPin(newPin);
    setErrorMessage('');
  };

  const renderPinDots = () => (
    <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.pinDot,
            {
              transform: [
                {
                  scale: dotAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                },
              ],
              backgroundColor: dotAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [colors.ui.border, colors.accent.gold],
              }),
            },
          ]}
        />
      ))}
    </Animated.View>
  );

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'del'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => {
              if (key === '') {
                return <View key="empty" style={styles.keyEmpty} />;
              }
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key="del"
                    style={styles.keyButton}
                    onPress={handleDelete}
                    activeOpacity={0.6}
                    disabled={isLocked || isVerifying}
                  >
                    <Ionicons name="backspace-outline" size={24} color={colors.text.muted} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.keyButton}
                  onPress={() => handlePinInput(key)}
                  activeOpacity={0.6}
                  disabled={isLocked || isVerifying}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={colors.gradients.dark}
        style={StyleSheet.absoluteFill}
      />

      <MagicalParticles
        count={10}
        colors={[colors.accent.gold + '30', '#FFFFFF20']}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Animated.View style={{ transform: [{ scale: lockIconAnim }] }}>
                <View style={styles.lockIconContainer}>
                  <Ionicons
                    name={isLocked ? 'lock-closed' : 'keypad'}
                    size={40}
                    color={isLocked ? colors.ui.error : colors.accent.gold}
                  />
                </View>
              </Animated.View>
              <Text style={styles.title}>Admin Access</Text>
              <Text style={styles.subtitle}>
                {isLocked
                  ? lockoutMessage
                  : 'Enter your PIN to access the admin panel'}
              </Text>
            </View>

            {/* PIN Dots */}
            {renderPinDots()}

            {/* Error message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color={colors.ui.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Keypad */}
            {renderKeypad()}

            {/* Back button */}
            <AnimatedButton
              title="Back to App"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="medium"
              style={styles.backButton}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <AnimatedLogo size={40} color={colors.text.muted} animated={false} />
              <Text style={styles.footerText}>Yo-Vazaluza Admin Portal</Text>
              <Text style={styles.footerHint}>Default PIN: 1234</Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.light,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: '80%',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accent.gold + '50',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.ui.error + '20',
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.ui.error,
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.sm,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.light,
  },
  backButton: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 300,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  footerHint: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    opacity: 0.5,
  },
});

export default AdminLoginScreen;
