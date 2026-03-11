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
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ToppingCard, MagicalParticles } from '../components';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Topping } from '../types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToppingCategory = 'all' | Topping['category'];
type SortOption = 'default' | 'name' | 'category';

const categoryFilters: { key: ToppingCategory; label: string; icon: string; emoji: string }[] = [
  { key: 'all', label: 'All', icon: 'apps', emoji: '🍨' },
  { key: 'fruits', label: 'Fruits', icon: 'nutrition', emoji: '🍓' },
  { key: 'candy', label: 'Candy', icon: 'sparkles', emoji: '🍬' },
  { key: 'nuts', label: 'Nuts', icon: 'ellipse', emoji: '🥜' },
  { key: 'sauces', label: 'Sauces', icon: 'water', emoji: '🍫' },
  { key: 'cereals', label: 'Cereals', icon: 'grid', emoji: '🥣' },
];

const sortOptions: { key: SortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'default', label: 'Default', icon: 'apps-outline' },
  { key: 'name', label: 'A-Z', icon: 'text-outline' },
  { key: 'category', label: 'Category', icon: 'layers-outline' },
];

// Popular toppings (would normally come from backend analytics)
const POPULAR_TOPPING_IDS = ['strawberries', 'chocolate-chips', 'oreo-crumbs', 'hot-fudge', 'gummy-bears'];

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string; startX: number }> = ({
  delay,
  color,
  startX,
}) => {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      fallAnim.setValue(0);
      swayAnim.setValue(0);
      rotateAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: 2500,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -1,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2500,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    };
    animate();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        {
          backgroundColor: color,
          left: startX,
          opacity: fallAnim.interpolate({
            inputRange: [0, 0.8, 1],
            outputRange: [1, 1, 0],
          }),
          transform: [
            {
              translateY: fallAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, SCREEN_WIDTH],
              }),
            },
            {
              translateX: swayAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: [-20, 20],
              }),
            },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '720deg'],
              }),
            },
          ],
        },
      ]}
    />
  );
};

const ToppingsScreen: React.FC = () => {
  const { toppings } = useApp();
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState<ToppingCategory>('all');
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const previousSelectionCount = useRef(0);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;
  const counterBounce = useRef(new Animated.Value(1)).current;
  const searchWidthAnim = useRef(new Animated.Value(0)).current;
  const sortMenuAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for dispenser
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

    // Fill animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Search focus animation
  useEffect(() => {
    Animated.spring(searchWidthAnim, {
      toValue: searchFocused ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: false,
    }).start();
  }, [searchFocused]);

  // Sort menu animation
  useEffect(() => {
    Animated.spring(sortMenuAnim, {
      toValue: showSortMenu ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [showSortMenu]);

  // Animate counter when selection changes
  useEffect(() => {
    const currentCount = selectedToppings.size;
    const prevCount = previousSelectionCount.current;

    if (currentCount > 0) {
      Animated.parallel([
        Animated.spring(counterAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(counterBounce, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(counterBounce, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Trigger confetti celebration at milestones (5, 10, 15...)
      if (currentCount >= 5 && currentCount > prevCount && currentCount % 5 === 0) {
        triggerCelebration();
      }
    } else {
      Animated.timing(counterAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    previousSelectionCount.current = currentCount;
  }, [selectedToppings.size]);

  const triggerCelebration = () => {
    setShowConfetti(true);
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConfetti(false);
    });
  };

  // Filter and sort toppings
  const processedToppings = useMemo(() => {
    let result = [...toppings];

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        // Keep original order
        break;
    }

    return result;
  }, [toppings, activeCategory, searchQuery, sortBy]);

  const handleCategoryPress = (categoryKey: ToppingCategory) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCategory(categoryKey);
  };

  const handleToppingPress = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topping.id)) {
        newSet.delete(topping.id);
      } else {
        newSet.add(topping.id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedToppings(new Set());
  };

  const handleSortPress = (option: SortOption) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSortBy(option);
    setShowSortMenu(false);
  };

  const isPopular = (toppingId: string) => POPULAR_TOPPING_IDS.includes(toppingId);

  const getSelectedToppingsData = () => {
    return toppings.filter((t) => selectedToppings.has(t.id));
  };

  const renderCategoryChip = (category: typeof categoryFilters[0], index: number) => {
    const isActive = activeCategory === category.key;
    const categoryCount =
      category.key === 'all'
        ? toppings.length
        : toppings.filter((t) => t.category === category.key).length;

    const selectedInCategory =
      category.key === 'all'
        ? selectedToppings.size
        : toppings.filter((t) => t.category === category.key && selectedToppings.has(t.id))
            .length;

    return (
      <Animated.View
        key={category.key}
        style={{
          opacity: categoryAnim,
          transform: [
            {
              translateX: categoryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.categoryChip, isActive && styles.categoryChipActive]}
          onPress={() => handleCategoryPress(category.key)}
          activeOpacity={0.7}
        >
          {isActive ? (
            <LinearGradient
              colors={[colors.accent.gold, colors.accent.wood]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryChipGradient}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryChipTextActive}>{category.label}</Text>
              <View style={styles.categoryCount}>
                <Text style={styles.categoryCountText}>{categoryCount}</Text>
              </View>
              {selectedInCategory > 0 && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>{selectedInCategory}</Text>
                </View>
              )}
            </LinearGradient>
          ) : (
            <View style={styles.categoryChipInner}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryChipText}>{category.label}</Text>
              {selectedInCategory > 0 && (
                <View style={styles.selectedBadgeInactive}>
                  <Text style={styles.selectedBadgeTextInactive}>{selectedInCategory}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['60%', '80%'],
  });

  const counterScale = Animated.multiply(counterAnim, counterBounce);

  const confettiColors = [
    colors.flavors.strawberry,
    colors.flavors.mango,
    colors.flavors.blueberry,
    colors.flavors.pistachio,
    colors.accent.gold,
    '#FF6B6B',
    '#4ECDC4',
    '#FFE66D',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.background.main, '#FAFAFA', colors.accent.cream + '20']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Particles */}
      <MagicalParticles
        count={15}
        colors={[
          colors.flavors.strawberry + '40',
          colors.flavors.mango + '40',
          colors.flavors.blueberry + '40',
          colors.flavors.pistachio + '40',
        ]}
      />

      {/* Confetti */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 50}
              color={confettiColors[i % confettiColors.length]}
              startX={Math.random() * SCREEN_WIDTH}
            />
          ))}
        </View>
      )}

      {/* Celebration Message */}
      <Animated.View
        style={[
          styles.celebrationMessage,
          {
            opacity: celebrationAnim,
            transform: [
              {
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1.1, 1],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[colors.accent.gold, colors.accent.wood]}
          style={styles.celebrationGradient}
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>
            {selectedToppings.size} Toppings Selected!
          </Text>
        </LinearGradient>
      </Animated.View>

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
          <View style={styles.headerTop}>
            <View>
              <View style={styles.titleRow}>
                <View style={styles.titleIcon}>
                  <Ionicons name="color-fill" size={20} color={colors.accent.gold} />
                </View>
                <Text style={styles.title}>Toppings</Text>
              </View>
              <Text style={styles.subtitle}>Build your perfect cup!</Text>
            </View>

            {/* Animated Topping Dispenser Icon */}
            <Animated.View style={[styles.dispenserIcon, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[colors.accent.wood, '#5D4E37']}
                style={styles.dispenserGradient}
              >
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.strawberry, height: fillHeight }]}
                  />
                </Animated.View>
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.mango, height: '70%' }]}
                  />
                </Animated.View>
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.pistachio, height: '85%' }]}
                  />
                </Animated.View>
                <Animated.View style={[styles.dispenserTube, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Animated.View
                    style={[styles.dispenserFill, { backgroundColor: colors.flavors.blueberry, height: '65%' }]}
                  />
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Search Bar */}
          <Animated.View
            style={[
              styles.searchContainer,
              {
                opacity: searchAnim,
                transform: [
                  {
                    translateY: searchAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.searchBar,
                {
                  borderColor: searchWidthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.background.card, colors.accent.gold],
                  }),
                  borderWidth: searchWidthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                },
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={searchFocused ? colors.accent.gold : colors.text.muted}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search toppings..."
                placeholderTextColor={colors.text.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Sort Button */}
            <TouchableOpacity
              style={[styles.sortButton, showSortMenu && styles.sortButtonActive]}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Ionicons
                name="funnel-outline"
                size={20}
                color={showSortMenu ? colors.accent.gold : colors.text.secondary}
              />
            </TouchableOpacity>

            {/* Sort Menu */}
            <Animated.View
              style={[
                styles.sortMenu,
                {
                  opacity: sortMenuAnim,
                  transform: [
                    {
                      scale: sortMenuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                    {
                      translateY: sortMenuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents={showSortMenu ? 'auto' : 'none'}
            >
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOption,
                    sortBy === option.key && styles.sortOptionActive,
                  ]}
                  onPress={() => handleSortPress(option.key)}
                >
                  <Ionicons
                    name={option.icon}
                    size={16}
                    color={sortBy === option.key ? colors.accent.gold : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.key && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.key && (
                    <Ionicons name="checkmark" size={14} color={colors.accent.gold} />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </Animated.View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categoryFilters.map(renderCategoryChip)}
          </ScrollView>
        </Animated.View>

        {/* Toppings Grid */}
        <Animated.View
          style={[
            styles.scrollWrapper,
            {
              opacity: contentAnim,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.toppingsContainer}
          >
            {/* Results count */}
            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>
                {processedToppings.length} topping{processedToppings.length !== 1 ? 's' : ''}
                {searchQuery ? ` for "${searchQuery}"` : ''}
              </Text>
              {selectedToppings.size > 0 && (
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={clearSelection}
                >
                  <Text style={styles.selectAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.toppingsGrid}>
              {processedToppings.map((topping, index) => (
                <ToppingCard
                  key={topping.id}
                  topping={topping}
                  isSelected={selectedToppings.has(topping.id)}
                  onPress={() => handleToppingPress(topping)}
                  index={index}
                  isPopular={isPopular(topping.id)}
                />
              ))}
            </View>

            {processedToppings.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search" size={48} color={colors.accent.gold} />
                </View>
                <Text style={styles.emptyTitle}>No toppings found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Try selecting a different category'}
                </Text>
                {searchQuery && (
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Info Banner */}
            <LinearGradient
              colors={[colors.accent.gold + '20', colors.accent.gold + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoBanner}
            >
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={24} color={colors.accent.gold} />
              </View>
              <Text style={styles.infoBannerText}>
                All toppings are included in our self-serve pricing. Load up your cup!
              </Text>
            </LinearGradient>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* Floating Selection Counter */}
      <Animated.View
        style={[
          styles.floatingCounter,
          {
            transform: [
              { scale: counterScale },
              {
                translateY: counterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [150, 0],
                }),
              },
            ],
            opacity: counterAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.accent.gold, colors.accent.wood]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingCounterGradient}
        >
          <View style={styles.counterContent}>
            {/* Selected Items Preview */}
            <View style={styles.selectedPreview}>
              {getSelectedToppingsData()
                .slice(0, 4)
                .map((topping, index) => (
                  <View
                    key={topping.id}
                    style={[
                      styles.previewDot,
                      {
                        backgroundColor: getCategoryColor(topping.category),
                        marginLeft: index > 0 ? -8 : 0,
                        zIndex: 4 - index,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(topping.category)}
                      size={12}
                      color="#FFF"
                    />
                  </View>
                ))}
              {selectedToppings.size > 4 && (
                <View style={[styles.previewDot, styles.previewMore]}>
                  <Text style={styles.previewMoreText}>+{selectedToppings.size - 4}</Text>
                </View>
              )}
            </View>

            <View style={styles.counterInfo}>
              <Text style={styles.counterNumber}>{selectedToppings.size}</Text>
              <Text style={styles.counterLabel}>
                Topping{selectedToppings.size !== 1 ? 's' : ''} Selected
              </Text>
            </View>
          </View>

          <View style={styles.counterActions}>
            <TouchableOpacity style={styles.viewButton} onPress={() => {
              navigation.navigate('BuildCup', { preSelectedToppings: getSelectedToppingsData() });
            }}>
              <Text style={styles.viewButtonText}>View Cup</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.accent.gold} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
              <Ionicons name="close" size={20} color={colors.accent.gold} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

// Helper functions (same as ToppingCard but for preview dots)
const getCategoryIcon = (category: Topping['category']): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case 'fruits':
      return 'nutrition';
    case 'candy':
      return 'sparkles';
    case 'nuts':
      return 'ellipse';
    case 'sauces':
      return 'water';
    case 'cereals':
      return 'grid';
    default:
      return 'ellipse';
  }
};

const getCategoryColor = (category: Topping['category']): string => {
  switch (category) {
    case 'fruits':
      return colors.flavors.strawberry;
    case 'candy':
      return colors.flavors.mango;
    case 'nuts':
      return colors.accent.wood;
    case 'sauces':
      return colors.flavors.chocolate;
    case 'cereals':
      return colors.flavors.pistachio;
    default:
      return colors.accent.gold;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  safeArea: {
    flex: 1,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  confettiParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  celebrationMessage: {
    position: 'absolute',
    top: '35%',
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 101,
    alignItems: 'center',
  },
  celebrationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
    ...shadows.large,
  },
  celebrationEmoji: {
    fontSize: 32,
  },
  celebrationText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent.gold + '20',
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
    marginTop: spacing.xs,
    marginLeft: spacing.xl + spacing.md,
  },
  dispenserIcon: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.accent.wood,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dispenserGradient: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  dispenserTube: {
    width: 14,
    height: 45,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  dispenserFill: {
    borderRadius: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
    position: 'relative',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  sortButtonActive: {
    backgroundColor: colors.accent.gold + '20',
  },
  sortMenu: {
    position: 'absolute',
    top: 52,
    right: 0,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    minWidth: 140,
    zIndex: 100,
    ...shadows.medium,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sortOptionActive: {
    backgroundColor: colors.accent.gold + '10',
  },
  sortOptionText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  sortOptionTextActive: {
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.semibold,
  },
  categoryScroll: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  categoryChipActive: {
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: colors.text.light,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  categoryCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    marginLeft: spacing.xs,
  },
  categoryCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  selectedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.ui.success,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
  },
  selectedBadgeInactive: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    marginLeft: spacing.xs,
  },
  selectedBadgeTextInactive: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: '#FFF',
  },
  scrollWrapper: {
    flex: 1,
  },
  toppingsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resultsText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
  selectAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  selectAllText: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.semibold,
  },
  toppingsGrid: {
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
    textAlign: 'center',
  },
  clearSearchButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent.gold + '20',
    borderRadius: borderRadius.round,
  },
  clearSearchText: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.semibold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 140,
  },
  floatingCounter: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  floatingCounterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  counterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  previewMore: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginLeft: -8,
  },
  previewMoreText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  counterInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  counterNumber: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  counterLabel: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  counterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  viewButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.accent.gold,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ToppingsScreen;
