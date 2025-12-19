import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Image,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AnimatedLogo, MagicalParticles, AnimatedButton, FlavorSlider } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Load banner images from assets
let bannerHeroImage: any = null;
let bannerHeroOptionalImage: any = null;

try {
  bannerHeroImage = require('../../assets/images/banner_hero.jpg');
} catch (e) {}

try {
  bannerHeroOptionalImage = require('../../assets/images/banner_hero_optional.jpg');
} catch (e) {}

// Fallback online images if local images not found
const fallbackImages = [
  { uri: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800&q=80' },
  { uri: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&q=80' },
];

// Use local images if available, otherwise fallback to online
const heroBannerImages = [
  bannerHeroImage,
  bannerHeroOptionalImage,
].filter(Boolean).length > 0
  ? [bannerHeroImage, bannerHeroOptionalImage].filter(Boolean)
  : fallbackImages;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { storeInfo, flavors, promotions } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const bannerScaleAnim = useRef(new Animated.Value(1.15)).current;
  const bannerOpacityAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const bannerImages = heroBannerImages;

  useEffect(() => {
    // Main entrance animations
    Animated.parallel([
      // Banner fade in
      Animated.timing(bannerOpacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Banner zoom effect
      Animated.timing(bannerScaleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      // Content slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      // Title animation
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
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

    // Pulse animation for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-rotate banner images
    if (bannerImages.length > 1) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % bannerImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

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

  const renderHeroBanner = () => {
    const currentImage = bannerImages[activeSlide];

    return (
      <View style={styles.heroBanner}>
        {/* Background Image with Animations */}
        {currentImage ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: bannerOpacityAnim,
                transform: [{ scale: bannerScaleAnim }],
              },
            ]}
          >
            <ImageBackground
              source={currentImage}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            >
              {/* Gradient Overlays for depth */}
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
              />

              {/* Shimmer effect */}
              <Animated.View
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </ImageBackground>
          </Animated.View>
        ) : (
          <LinearGradient
            colors={[colors.primary.darkGray, colors.primary.gray, colors.accent.wood]}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Vignette effect */}
        <View style={styles.vignette} />

        {/* Magical Particles */}
        <MagicalParticles count={15} />

        {/* Hero Content */}
        <View style={styles.heroContent}>
          {/* Floating Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ translateY: floatAnim }],
              },
            ]}
          >
            <View style={styles.logoShadow}>
              <AnimatedLogo size={100} color={colors.accent.gold} animated />
            </View>
          </Animated.View>

          {/* Brand Name with Shadow */}
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

          {/* Byline */}
          <Animated.View style={[styles.byLineContainer, { opacity: titleAnim }]}>
            <View style={styles.byLineLine} />
            <Text style={styles.byLine}>DALIPI</Text>
            <View style={styles.byLineLine} />
          </Animated.View>

          {/* Tagline */}
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

          {/* Quick Actions with Pulse */}
          <Animated.View
            style={[
              styles.quickActions,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
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

        {/* Banner Dots */}
        {bannerImages.length > 1 && (
          <View style={styles.bannerDots}>
            {bannerImages.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveSlide(index)}
                style={[
                  styles.bannerDot,
                  index === activeSlide && styles.bannerDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Bottom Shadow Fade */}
        <LinearGradient
          colors={['transparent', colors.background.main]}
          style={styles.bottomFade}
        />
      </View>
    );
  };

  const renderGalleryPreview = () => {
    const galleryItems = [
      { image: heroBannerImages[0], icon: 'ice-cream', label: 'Our Yogurt' },
      { image: heroBannerImages[1] || heroBannerImages[0], icon: 'storefront', label: 'Our Store' },
    ];

    return (
      <View style={styles.galleryPreview}>
        <Text style={styles.gallerySectionTitle}>Our Creations</Text>
        <View style={styles.galleryRow}>
          {galleryItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.galleryThumb}
              onPress={() => navigation.navigate('Gallery')}
              activeOpacity={0.9}
            >
              <Animated.View style={[styles.galleryImageContainer, { opacity: fadeAnim }]}>
                <Image
                  source={item.image}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.galleryOverlay}
                >
                  <View style={styles.galleryLabelContainer}>
                    <Ionicons name={item.icon as any} size={16} color={colors.text.light} />
                    <Text style={styles.galleryLabel}>{item.label}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Hero Banner */}
        {renderHeroBanner()}

        {/* Store Gallery Preview */}
        {renderGalleryPreview()}

        {/* Promotions Section */}
        {promotions.filter((p) => p.isActive).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoScroll}
            >
              {promotions.filter((p) => p.isActive).map(renderPromoCard)}
            </ScrollView>
          </View>
        )}

        {/* Featured Flavors */}
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
                style={[styles.featureCard, { opacity: fadeAnim }]}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color={colors.accent.gold} />
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
          />
        </LinearGradient>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 80,
  },
  heroBanner: {
    height: SCREEN_HEIGHT * 0.6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 0.5,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 40,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 0,
  },
  heroContent: {
    alignItems: 'center',
    paddingBottom: spacing.xxl + 20,
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoShadow: {
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.text.light,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  byLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  byLineLine: {
    width: 30,
    height: 1,
    backgroundColor: colors.accent.gold,
  },
  byLine: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.accent.gold,
    letterSpacing: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: typography.fontSizes.md,
    color: colors.text.light,
    marginTop: spacing.md,
    textAlign: 'center',
    maxWidth: '85%',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  bannerDots: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  bannerDotActive: {
    backgroundColor: colors.accent.gold,
    width: 28,
    borderColor: colors.accent.gold,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  galleryPreview: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  gallerySectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  galleryThumb: {
    flex: 1,
    height: 140,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  galleryImageContainer: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  galleryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  galleryLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.light,
  },
  section: {
    marginTop: spacing.xl,
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
    ...shadows.medium,
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
  footer: {
    height: spacing.xxl,
  },
});

export default HomeScreen;
