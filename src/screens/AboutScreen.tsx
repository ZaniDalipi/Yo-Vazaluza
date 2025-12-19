import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedLogo, MagicalParticles, AnimatedButton } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { storeInfo } = useApp();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSocialPress = (platform: string) => {
    // In a real app, these would open actual social media URLs
    console.log(`Opening ${platform}`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${storeInfo.phone.replace(/\s/g, '')}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${storeInfo.email}`);
  };

  const renderInfoCard = (
    icon: string,
    title: string,
    content: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.infoCard}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon as any} size={24} color={colors.accent.gold} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{content}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.primary.darkGray, colors.primary.gray, colors.background.main]}
        locations={[0, 0.25, 0.5]}
        style={styles.backgroundGradient}
      />

      {/* Magical Particles */}
      <MagicalParticles count={12} />

      <SafeAreaView style={styles.safeArea}>
        {/* Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AnimatedLogo size={100} color={colors.accent.gold} animated />
            <Text style={styles.brandName}>{storeInfo.name}</Text>
            <Text style={styles.byLine}>DALIPI</Text>
          </Animated.View>

          {/* Description */}
          <Animated.View
            style={[
              styles.descriptionCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.descriptionTitle}>Our Story</Text>
            <Text style={styles.descriptionText}>{storeInfo.description}</Text>
          </Animated.View>

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>

            {renderInfoCard('location', 'Address', storeInfo.address)}
            {renderInfoCard('call', 'Phone', storeInfo.phone, handleCall)}
            {renderInfoCard('mail', 'Email', storeInfo.email, handleEmail)}
          </View>

          {/* Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>

            <View style={styles.hoursCard}>
              <View style={styles.hoursRow}>
                <View style={styles.hoursDay}>
                  <Ionicons name="briefcase" size={18} color={colors.accent.gold} />
                  <Text style={styles.hoursDayText}>Weekdays</Text>
                </View>
                <Text style={styles.hoursTime}>{storeInfo.hours.weekdays}</Text>
              </View>

              <View style={styles.hoursDivider} />

              <View style={styles.hoursRow}>
                <View style={styles.hoursDay}>
                  <Ionicons name="sunny" size={18} color={colors.accent.gold} />
                  <Text style={styles.hoursDayText}>Weekends</Text>
                </View>
                <Text style={styles.hoursTime}>{storeInfo.hours.weekends}</Text>
              </View>
            </View>
          </View>

          {/* Social Media */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Us</Text>

            <View style={styles.socialContainer}>
              {storeInfo.socialMedia.instagram && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialPress('instagram')}
                >
                  <LinearGradient
                    colors={['#F56040', '#C13584', '#833AB4']}
                    style={styles.socialGradient}
                  >
                    <Ionicons name="logo-instagram" size={28} color={colors.text.light} />
                  </LinearGradient>
                  <Text style={styles.socialHandle}>{storeInfo.socialMedia.instagram}</Text>
                </TouchableOpacity>
              )}

              {storeInfo.socialMedia.facebook && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialPress('facebook')}
                >
                  <View style={[styles.socialGradient, { backgroundColor: '#1877F2' }]}>
                    <Ionicons name="logo-facebook" size={28} color={colors.text.light} />
                  </View>
                  <Text style={styles.socialHandle}>{storeInfo.socialMedia.facebook}</Text>
                </TouchableOpacity>
              )}

              {storeInfo.socialMedia.tiktok && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialPress('tiktok')}
                >
                  <View style={[styles.socialGradient, { backgroundColor: '#000000' }]}>
                    <Ionicons name="logo-tiktok" size={28} color={colors.text.light} />
                  </View>
                  <Text style={styles.socialHandle}>{storeInfo.socialMedia.tiktok}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* CTA */}
          <LinearGradient
            colors={colors.gradients.golden}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <Ionicons name="ice-cream" size={40} color={colors.text.light} />
            <Text style={styles.ctaTitle}>Ready for a treat?</Text>
            <Text style={styles.ctaText}>
              Visit us today and create your perfect frozen yogurt!
            </Text>
          </LinearGradient>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with love by the Dalipi Family
            </Text>
            <View style={styles.footerBrand}>
              <AnimatedLogo size={30} color={colors.text.muted} animated={false} />
              <Text style={styles.footerBrandText}>{storeInfo.name}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
  },
  safeArea: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    ...shadows.small,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  brandName: {
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
    marginTop: spacing.md,
    letterSpacing: 2,
  },
  byLine: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.accent.gold,
    letterSpacing: 4,
    marginTop: spacing.xs,
  },
  descriptionCard: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.medium,
  },
  descriptionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
  infoText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginTop: 2,
  },
  hoursCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hoursDayText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  hoursTime: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
  },
  hoursDivider: {
    height: 1,
    backgroundColor: colors.ui.divider,
    marginVertical: spacing.md,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  socialButton: {
    alignItems: 'center',
  },
  socialGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  socialHandle: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  ctaCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.large,
  },
  ctaTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
    marginTop: spacing.md,
  },
  ctaText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.light,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  footerBrandText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.muted,
  },
});

export default AboutScreen;
