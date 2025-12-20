import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GalleryCard, MagicalParticles } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { GalleryImage } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Category = 'all' | 'store' | 'products' | 'moments';

const categories: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'store', label: 'Store', icon: 'storefront' },
  { key: 'products', label: 'Products', icon: 'ice-cream' },
  { key: 'moments', label: 'Moments', icon: 'heart' },
];

const GalleryScreen: React.FC = () => {
  const { gallery } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(categoryAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
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
  }, []);

  useEffect(() => {
    if (selectedImage) {
      Animated.spring(modalAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [selectedImage]);

  const filteredGallery =
    activeCategory === 'all'
      ? gallery
      : gallery.filter((img) => img.category === activeCategory);

  const handleImagePress = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const renderCategoryButton = (category: typeof categories[0], index: number) => {
    const isActive = activeCategory === category.key;
    return (
      <Animated.View
        key={category.key}
        style={{
          opacity: categoryAnim,
          transform: [
            {
              translateY: categoryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
          onPress={() => setActiveCategory(category.key)}
          activeOpacity={0.7}
        >
          {isActive ? (
            <LinearGradient
              colors={[colors.accent.gold, colors.accent.wood]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryButtonGradient}
            >
              <Ionicons
                name={category.icon as any}
                size={18}
                color={colors.text.light}
              />
              <Text style={styles.categoryButtonTextActive}>
                {category.label}
              </Text>
            </LinearGradient>
          ) : (
            <View style={styles.categoryButtonInner}>
              <Ionicons
                name={category.icon as any}
                size={18}
                color={colors.text.secondary}
              />
              <Text style={styles.categoryButtonText}>
                {category.label}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderImageModal = () => (
    <Modal
      visible={!!selectedImage}
      transparent
      animationType="fade"
      onRequestClose={() => setSelectedImage(null)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalClose}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={colors.text.light} />
          </View>
        </TouchableOpacity>

        {selectedImage && (
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={
                selectedImage.category === 'store'
                  ? colors.gradients.primary
                  : selectedImage.category === 'products'
                  ? colors.gradients.golden
                  : [colors.flavors.strawberry, colors.flavors.chocolate]
              }
              style={styles.modalImage}
            >
              <Animated.View style={{ transform: [{ translateY: floatTranslate }] }}>
                <Ionicons
                  name={
                    selectedImage.category === 'store'
                      ? 'storefront'
                      : selectedImage.category === 'products'
                      ? 'ice-cream'
                      : 'heart'
                  }
                  size={80}
                  color="rgba(255,255,255,0.9)"
                />
              </Animated.View>
            </LinearGradient>
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{selectedImage.title}</Text>
              <LinearGradient
                colors={[colors.accent.gold, colors.accent.wood]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalBadge}
              >
                <Text style={styles.modalBadgeText}>{selectedImage.category}</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.background.main, '#FAFAFA', colors.accent.cream + '15']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Particles */}
      <MagicalParticles
        count={10}
        colors={[colors.accent.gold + '40', colors.accent.cream + '40', colors.flavors.strawberry + '30']}
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
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Ionicons name="images" size={24} color={colors.accent.gold} />
            </View>
            <View>
              <Text style={styles.title}>Gallery</Text>
              <Text style={styles.subtitle}>Explore our world</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{gallery.length}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{categories.length - 1}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* Gallery Grid */}
        <Animated.View
          style={[
            styles.galleryWrapper,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            {/* Active filter indicator */}
            {activeCategory !== 'all' && (
              <View style={styles.filterIndicator}>
                <Ionicons name="filter" size={14} color={colors.accent.gold} />
                <Text style={styles.filterText}>
                  Showing {filteredGallery.length} {activeCategory} photos
                </Text>
              </View>
            )}

            <View style={styles.galleryGrid}>
              {filteredGallery.map((image, index) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  index={index}
                  onPress={() => handleImagePress(image)}
                />
              ))}
            </View>

            {filteredGallery.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="images-outline" size={48} color={colors.accent.gold} />
                </View>
                <Text style={styles.emptyTitle}>No images found</Text>
                <Text style={styles.emptyText}>No photos in this category yet</Text>
              </View>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        </Animated.View>

        {renderImageModal()}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
    ...shadows.small,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  statNumber: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent.gold,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.text.muted + '30',
  },
  categoryContainer: {
    paddingVertical: spacing.md,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryButton: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  categoryButtonActive: {
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    gap: spacing.xs,
  },
  categoryButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: colors.text.light,
    fontWeight: typography.fontWeights.semibold,
  },
  galleryWrapper: {
    flex: 1,
  },
  galleryContainer: {
    paddingHorizontal: spacing.lg,
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.accent.gold + '15',
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  filterText: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.medium,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    ...shadows.large,
  },
  modalImage: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInfo: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalBadge: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
  },
  modalBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.light,
    textTransform: 'capitalize',
  },
});

export default GalleryScreen;
