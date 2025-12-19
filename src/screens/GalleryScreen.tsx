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

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(categoryAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const filteredGallery =
    activeCategory === 'all'
      ? gallery
      : gallery.filter((img) => img.category === activeCategory);

  const handleImagePress = (image: GalleryImage) => {
    setSelectedImage(image);
  };

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
          <Ionicons
            name={category.icon as any}
            size={18}
            color={isActive ? colors.text.light : colors.text.secondary}
          />
          <Text
            style={[
              styles.categoryButtonText,
              isActive && styles.categoryButtonTextActive,
            ]}
          >
            {category.label}
          </Text>
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
          <Ionicons name="close-circle" size={36} color={colors.text.light} />
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.modalContent}>
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
              <Ionicons
                name={
                  selectedImage.category === 'store'
                    ? 'storefront'
                    : selectedImage.category === 'products'
                    ? 'ice-cream'
                    : 'heart'
                }
                size={80}
                color="rgba(255,255,255,0.8)"
              />
            </LinearGradient>
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{selectedImage.title}</Text>
              <View style={styles.modalBadge}>
                <Text style={styles.modalBadgeText}>{selectedImage.category}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Particles */}
      <MagicalParticles
        count={8}
        colors={[colors.accent.gold + '30', colors.accent.cream + '30']}
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
          <Text style={styles.title}>Gallery</Text>
          <Text style={styles.subtitle}>Explore our world</Text>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.galleryContainer}
        >
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
              <Ionicons name="images-outline" size={64} color={colors.text.muted} />
              <Text style={styles.emptyText}>No images in this category</Text>
            </View>
          )}
        </ScrollView>

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
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  categoryContainer: {
    paddingVertical: spacing.md,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.card,
    marginRight: spacing.sm,
    ...shadows.small,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent.gold,
  },
  categoryButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  categoryButtonTextActive: {
    color: colors.text.light,
  },
  galleryContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
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
  emptyText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
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
    backgroundColor: colors.accent.gold,
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
