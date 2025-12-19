import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AnimatedLogo, MagicalParticles, AnimatedButton, FlavorSlider } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { storeInfo, flavors, promotions } = useApp();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
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
      ]),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderPromoCard = (promo: typeof promotions[0], index: number) => (
    <Animated.View
      key={promo.id}
      style={[
        styles.promoCard,
        {
          opacity: fadeAnim,
          transform: [{ translateX: Animated.multiply(slideAnim, -1) }],
        },
      ]}
    >
      <LinearGradient
        colors={index % 2 === 0 ? colors.gradients.golden : colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promoGradient}
      >
        <Ionicons name="gift" size={24} color={colors.text.light} />
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>{promo.title}</Text>
          <Text style={styles.promoDescription}>{promo.description}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.primary.darkGray, colors.primary.gray, colors.background.main]}
        locations={[0, 0.3, 0.6]}
        style={styles.backgroundGradient}
      />

      {/* Magical Particles */}
      <MagicalParticles count={15} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <AnimatedLogo size={100} color={colors.accent.gold} animated />

            <Animated.Text
              style={[
                styles.brandName,
                {
                  opacity: titleAnim,
                  transform: [
                    {
                      scale: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {storeInfo.name}
            </Animated.Text>

            <Animated.Text
              style={[
                styles.tagline,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {storeInfo.tagline}
            </Animated.Text>

            {/* Quick Actions */}
            <Animated.View
              style={[
                styles.quickActions,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <AnimatedButton
                title="View Flavors"
                onPress={() => navigation.navigate('Flavors')}
                variant="golden"
                size="medium"
              />
              <AnimatedButton
                title="Our Story"
                onPress={() => navigation.navigate('About')}
                variant="outline"
                size="medium"
              />
            </Animated.View>
          </View>

          {/* Promotions Section */}
          {promotions.filter(p => p.isActive).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Offers</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promoScroll}
              >
                {promotions.filter(p => p.isActive).map(renderPromoCard)}
              </ScrollView>
            </View>
          )}

          {/* Featured Flavors Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Our Flavors</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Flavors')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.accent.gold} />
              </TouchableOpacity>
            </View>
            <FlavorSlider
              flavors={flavors.slice(0, 4)}
              onFlavorSelect={() => navigation.navigate('Flavors')}
            />
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Yo-Vazaluza?</Text>
            <View style={styles.featuresGrid}>
              {[
                { icon: 'leaf', title: 'Fresh', desc: 'Premium ingredients' },
                { icon: 'heart', title: 'Healthy', desc: 'Low-fat options' },
                { icon: 'sparkles', title: 'Unique', desc: 'Creative flavors' },
                { icon: 'people', title: 'Family', desc: 'Made with love' },
              ].map((feature, index) => (
                <Animated.View
                  key={feature.title}
                  style={[
                    styles.featureCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: Animated.multiply(
                            slideAnim,
                            new Animated.Value((index + 1) * 0.2)
                          ),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.featureIcon}>
                    <Ionicons
                      name={feature.icon as any}
                      size={24}
                      color={colors.accent.gold}
                    />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <LinearGradient
            colors={colors.gradients.golden}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaSection}
          >
            <Ionicons name="location" size={32} color={colors.text.light} />
            <Text style={styles.ctaTitle}>Visit Us Today!</Text>
            <Text style={styles.ctaText}>{storeInfo.address}</Text>
            <AnimatedButton
              title="Get Directions"
              onPress={() => navigation.navigate('About')}
              variant="secondary"
              size="medium"
              style={styles.ctaButton}
            />
          </LinearGradient>

          {/* Footer Spacing */}
          <View style={styles.footer} />
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
    height: SCREEN_HEIGHT * 0.5,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  brandName: {
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
    marginTop: spacing.md,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: typography.fontSizes.lg,
    color: colors.accent.cream,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: '80%',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  seeAllText: {
    fontSize: typography.fontSizes.md,
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.medium,
  },
  promoScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  promoCard: {
    width: SCREEN_WIDTH * 0.75,
    marginRight: spacing.md,
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  promoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  promoTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  promoDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.light,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  featuresSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.small,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  featureDesc: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  ctaSection: {
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
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  ctaButton: {
    backgroundColor: colors.background.card,
  },
  footer: {
    height: spacing.xxl,
  },
});

export default HomeScreen;
