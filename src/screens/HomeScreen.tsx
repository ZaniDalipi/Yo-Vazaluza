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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AnimatedLogo, MagicalParticles, AnimatedButton, FlavorSlider } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Try to load store images
let storeInteriorImage: any = null;
let storeFrontImage: any = null;

try {
  storeInteriorImage = require('../../assets/images/store-interior.jpg');
} catch (e) {
  // Image not found, will use fallback
}

try {
  storeFrontImage = require('../../assets/images/store-front.jpg');
} catch (e) {
  // Image not found, will use fallback
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { storeInfo, flavors, promotions } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const bannerScaleAnim = useRef(new Animated.Value(1.1)).current;

  const bannerImages = [storeInteriorImage, storeFrontImage].filter(Boolean);

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
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bannerScaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-rotate banner images
    if (bannerImages.length > 1) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % bannerImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
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

  const renderHeroBanner = () => {
    const currentImage = bannerImages[activeSlide];

    return (
      <View style={styles.heroBanner}>
        {currentImage ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ scale: bannerScaleAnim }] },
            ]}
          >
            <ImageBackground
              source={currentImage}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
          </Animated.View>
        ) : (
          <LinearGradient
            colors={[colors.primary.darkGray, colors.primary.gray, colors.accent.wood]}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Magical Particles */}
        <MagicalParticles count={12} />

        {/* Hero Content */}
        <View style={styles.heroContent}>
          <AnimatedLogo size={90} color={colors.accent.gold} animated />

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

          <Animated.Text style={[styles.byLine, { opacity: titleAnim }]}>
            DALIPI
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

        {/* Banner Dots */}
        {bannerImages.length > 1 && (
          <View style={styles.bannerDots}>
            {bannerImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.bannerDot,
                  index === activeSlide && styles.bannerDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Hero Banner with Store Image */}
        {renderHeroBanner()}

        {/* Store Gallery Preview */}
        {(storeInteriorImage || storeFrontImage) && (
          <View style={styles.galleryPreview}>
            <View style={styles.galleryRow}>
              {storeInteriorImage && (
                <TouchableOpacity
                  style={styles.galleryThumb}
                  onPress={() => navigation.navigate('Gallery')}
                >
                  <Image
                    source={storeInteriorImage}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.galleryOverlay}
                  >
                    <Text style={styles.galleryLabel}>Interior</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {storeFrontImage && (
                <TouchableOpacity
                  style={styles.galleryThumb}
                  onPress={() => navigation.navigate('Gallery')}
                >
                  <Image
                    source={storeFrontImage}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.galleryOverlay}
                  >
                    <Text style={styles.galleryLabel}>Store Front</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

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
    height: SCREEN_HEIGHT * 0.55,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  brandName: {
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
    marginTop: spacing.md,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  byLine: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.accent.gold,
    letterSpacing: 6,
    marginTop: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSizes.md,
    color: colors.text.light,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: '85%',
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  bannerDots: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bannerDotActive: {
    backgroundColor: colors.accent.gold,
    width: 24,
  },
  galleryPreview: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  galleryThumb: {
    flex: 1,
    height: 120,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  galleryLabel: {
    fontSize: typography.fontSizes.sm,
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
