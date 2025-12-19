import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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

// Secret admin password - in a real app, this would be securely stored
const ADMIN_PASSWORD = 'dalipi2024';

const AdminLoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setAdminMode } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockIconAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const animateLockIcon = () => {
    Animated.sequence([
      Animated.timing(lockIconAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(lockIconAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    if (isLocked) {
      Alert.alert('Locked', 'Too many failed attempts. Please try again later.');
      return;
    }

    if (password === ADMIN_PASSWORD) {
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
      animateLockIcon();
      setAttempts((prev) => prev + 1);

      if (attempts >= 4) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
        }, 60000); // 1 minute lockout
        Alert.alert(
          'Too Many Attempts',
          'You have been locked out for 1 minute.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Incorrect Password',
          `Please try again. ${4 - attempts} attempts remaining.`,
          [{ text: 'OK' }]
        );
      }
      setPassword('');
    }
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
                  <Ionicons name="lock-closed" size={40} color={colors.accent.gold} />
                </View>
              </Animated.View>
              <Text style={styles.title}>Admin Access</Text>
              <Text style={styles.subtitle}>
                This area is restricted to authorized personnel only
              </Text>
            </View>

            {/* Login Form */}
            <Animated.View
              style={[
                styles.form,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <View style={styles.inputContainer}>
                <Ionicons
                  name="key"
                  size={20}
                  color={colors.text.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter admin password"
                  placeholderTextColor={colors.text.muted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLocked}
                />
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.text.muted}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                />
              </View>

              <AnimatedButton
                title={isLocked ? 'Locked' : 'Login'}
                onPress={handleLogin}
                variant="golden"
                size="large"
                disabled={isLocked || !password}
                style={styles.loginButton}
              />

              <AnimatedButton
                title="Back to App"
                onPress={() => navigation.goBack()}
                variant="outline"
                size="medium"
                style={styles.backButton}
              />
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <AnimatedLogo size={40} color={colors.text.muted} animated={false} />
              <Text style={styles.footerText}>Yo-Vazaluza Admin Portal</Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
  form: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.large,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginBottom: spacing.lg,
  },
  inputIcon: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
  },
  eyeIcon: {
    paddingRight: spacing.md,
  },
  loginButton: {
    width: '100%',
  },
  backButton: {
    width: '100%',
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
});

export default AdminLoginScreen;
