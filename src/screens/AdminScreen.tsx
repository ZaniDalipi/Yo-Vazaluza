import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  Switch,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { AnimatedButton } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Flavor, Topping, Promotion, GalleryImage } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AdminSection = 'flavors' | 'toppings' | 'promotions' | 'gallery' | 'store' | 'settings';

// Predefined color palette for quick selection
const COLOR_PALETTE = [
  '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB',
  '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047',
  '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00',
  '#F4511E', '#6D4C41', '#757575', '#546E7A', '#FF9800',
];

// Emoji palette for toppings
const EMOJI_PALETTE = [
  '🍓', '🫐', '🥭', '🍌', '🍒', '🍇', '🥝', '🍍', '🍑', '🍊',
  '🍬', '🍫', '🍪', '🥜', '🌰', '🥥', '🍯', '🎊', '🐻', '🌈',
  '🥣', '🍩', '🧁', '🍰', '🍦', '⭐', '💎', '🔥', '✨', '🌟',
];

const AdminScreen: React.FC = () => {
  const {
    flavors,
    toppings,
    promotions,
    gallery,
    storeInfo,
    isAdmin,
    setAdminMode,
    updateFlavor,
    addFlavor,
    deleteFlavor,
    updateTopping,
    addTopping,
    deleteTopping,
    updatePromotion,
    addPromotion,
    deletePromotion,
    updateGalleryImage,
    addGalleryImage,
    deleteGalleryImage,
    updateStoreInfo,
    resetToDefaults,
  } = useApp();

  const [activeSection, setActiveSection] = useState<AdminSection>('flavors');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'flavor' | 'topping' | 'promotion' | 'gallery' | 'store' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [colorPickerField, setColorPickerField] = useState<string>('color');

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to exit admin mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => setAdminMode(false), style: 'destructive' },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Data',
      'This will reset all data to defaults. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: resetToDefaults, style: 'destructive' },
      ]
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, imageUrl: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, imageUrl: result.assets[0].uri });
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Enter URL', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openEditModal = (item: any, type: 'flavor' | 'topping' | 'promotion' | 'gallery' | 'store') => {
    setEditingItem(item);
    setEditType(type);
    setFormData({ ...item });
    setEditModalVisible(true);
  };

  const openAddModal = (type: 'flavor' | 'topping' | 'promotion' | 'gallery') => {
    setEditingItem(null);
    setEditType(type);
    if (type === 'flavor') {
      setFormData({
        name: '',
        description: '',
        color: '#FFB6C1',
        imageUrl: '',
        isVegan: false,
        isNew: true,
        calories: 150,
      });
    } else if (type === 'topping') {
      setFormData({
        name: '',
        category: 'fruits',
        imageUrl: '',
        emoji: '🍓',
        color: '#E53935',
        pricePerGram: 0.08,
        maxGrams: 30,
      });
    } else if (type === 'promotion') {
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        isActive: true,
        validUntil: '',
      });
    } else if (type === 'gallery') {
      setFormData({
        title: '',
        category: 'products',
        imageUrl: '',
      });
    }
    setEditModalVisible(true);
  };

  const openStoreEditModal = () => {
    setEditingItem(storeInfo);
    setEditType('store');
    setFormData({ ...storeInfo });
    setEditModalVisible(true);
  };

  const handleSave = () => {
    if (!editType) return;

    // Validation
    if (editType === 'flavor' && !formData.name) {
      Alert.alert('Error', 'Please enter a flavor name');
      return;
    }
    if (editType === 'topping' && !formData.name) {
      Alert.alert('Error', 'Please enter a topping name');
      return;
    }

    if (editType === 'flavor') {
      if (editingItem) {
        updateFlavor({ ...editingItem, ...formData });
      } else {
        addFlavor(formData as Flavor);
      }
    } else if (editType === 'topping') {
      if (editingItem) {
        updateTopping({ ...editingItem, ...formData });
      } else {
        addTopping(formData as Topping);
      }
    } else if (editType === 'promotion') {
      if (editingItem) {
        updatePromotion({ ...editingItem, ...formData });
      } else {
        addPromotion(formData as Promotion);
      }
    } else if (editType === 'gallery') {
      if (editingItem) {
        updateGalleryImage({ ...editingItem, ...formData });
      } else {
        addGalleryImage(formData as GalleryImage);
      }
    } else if (editType === 'store') {
      updateStoreInfo(formData);
    }

    setEditModalVisible(false);
    setEditingItem(null);
    setFormData({});
    Alert.alert('Success', `${editType} ${editingItem ? 'updated' : 'added'} successfully!`);
  };

  const handleDelete = (id: string, type: 'flavor' | 'topping' | 'promotion' | 'gallery') => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (type === 'flavor') deleteFlavor(id);
            else if (type === 'topping') deleteTopping(id);
            else if (type === 'promotion') deletePromotion(id);
            else if (type === 'gallery') deleteGalleryImage(id);
          },
        },
      ]
    );
  };

  const selectColor = (color: string) => {
    setFormData({ ...formData, [colorPickerField]: color });
    setShowColorPicker(false);
  };

  const selectEmoji = (emoji: string) => {
    setFormData({ ...formData, emoji });
    setShowEmojiPicker(false);
  };

  const renderNavItem = (section: AdminSection, icon: string, label: string) => {
    const isActive = activeSection === section;
    return (
      <TouchableOpacity
        key={section}
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => setActiveSection(section)}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={isActive ? colors.accent.gold : colors.text.secondary}
        />
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderImagePreview = () => {
    if (!formData.imageUrl) {
      return (
        <TouchableOpacity style={styles.imagePlaceholder} onPress={showImageOptions}>
          <Ionicons name="camera" size={40} color={colors.text.muted} />
          <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: formData.imageUrl }} style={styles.imagePreview} />
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.imageActionBtn} onPress={showImageOptions}>
            <Ionicons name="pencil" size={16} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.imageActionBtn, styles.imageDeleteBtn]}
            onPress={() => setFormData({ ...formData, imageUrl: '' })}
          >
            <Ionicons name="trash" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderColorPicker = () => (
    <Modal
      visible={showColorPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowColorPicker(false)}
    >
      <TouchableOpacity
        style={styles.pickerOverlay}
        activeOpacity={1}
        onPress={() => setShowColorPicker(false)}
      >
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>Select Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  formData[colorPickerField] === color && styles.colorOptionSelected,
                ]}
                onPress={() => selectColor(color)}
              />
            ))}
          </View>
          <View style={styles.customColorRow}>
            <Text style={styles.customColorLabel}>Custom:</Text>
            <TextInput
              style={styles.customColorInput}
              value={formData[colorPickerField] || ''}
              onChangeText={(text) => setFormData({ ...formData, [colorPickerField]: text })}
              placeholder="#FFFFFF"
              placeholderTextColor={colors.text.muted}
            />
            <View style={[styles.colorPreviewSmall, { backgroundColor: formData[colorPickerField] || '#FFF' }]} />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderEmojiPicker = () => (
    <Modal
      visible={showEmojiPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowEmojiPicker(false)}
    >
      <TouchableOpacity
        style={styles.pickerOverlay}
        activeOpacity={1}
        onPress={() => setShowEmojiPicker(false)}
      >
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>Select Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_PALETTE.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiOption,
                  formData.emoji === emoji && styles.emojiOptionSelected,
                ]}
                onPress={() => selectEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customEmojiRow}>
            <Text style={styles.customColorLabel}>Custom:</Text>
            <TextInput
              style={styles.customEmojiInput}
              value={formData.emoji || ''}
              onChangeText={(text) => setFormData({ ...formData, emoji: text })}
              placeholder="🍓"
              placeholderTextColor={colors.text.muted}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderFlavorItem = (flavor: Flavor) => (
    <View key={flavor.id} style={styles.listItem}>
      {flavor.imageUrl ? (
        <Image source={{ uri: flavor.imageUrl }} style={styles.listItemImage} />
      ) : (
        <View style={[styles.colorDot, { backgroundColor: flavor.color }]} />
      )}
      <View style={styles.listItemContent}>
        <View style={styles.listItemHeader}>
          <Text style={styles.listItemTitle}>{flavor.name}</Text>
          {flavor.isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
          {flavor.isVegan && <View style={styles.veganBadge}><Text style={styles.veganBadgeText}>V</Text></View>}
        </View>
        <Text style={styles.listItemSubtitle} numberOfLines={1}>
          {flavor.description}
        </Text>
      </View>
      <View style={styles.listItemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(flavor, 'flavor')}
        >
          <Ionicons name="pencil" size={18} color={colors.accent.gold} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(flavor.id, 'flavor')}
        >
          <Ionicons name="trash" size={18} color={colors.ui.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderToppingItem = (topping: Topping) => (
    <View key={topping.id} style={styles.listItem}>
      <View style={styles.toppingPreview}>
        <Text style={styles.toppingEmoji}>{topping.emoji || '🍬'}</Text>
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{topping.name}</Text>
        <View style={styles.toppingMeta}>
          <Text style={styles.listItemSubtitle}>{topping.category}</Text>
          {topping.pricePerGram && (
            <Text style={styles.toppingPrice}>${topping.pricePerGram.toFixed(2)}/g</Text>
          )}
        </View>
      </View>
      <View style={styles.listItemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(topping, 'topping')}
        >
          <Ionicons name="pencil" size={18} color={colors.accent.gold} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(topping.id, 'topping')}
        >
          <Ionicons name="trash" size={18} color={colors.ui.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPromotionItem = (promo: Promotion) => (
    <View key={promo.id} style={styles.listItem}>
      {promo.imageUrl ? (
        <Image source={{ uri: promo.imageUrl }} style={styles.listItemImage} />
      ) : (
        <View style={styles.promoIcon}>
          <Ionicons name="gift" size={20} color={colors.accent.gold} />
        </View>
      )}
      <View style={styles.listItemContent}>
        <View style={styles.listItemHeader}>
          <Text style={styles.listItemTitle}>{promo.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: promo.isActive ? colors.ui.success : colors.text.muted }]}>
            <Text style={styles.statusBadgeText}>{promo.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={styles.listItemSubtitle} numberOfLines={1}>
          {promo.description}
        </Text>
      </View>
      <View style={styles.listItemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(promo, 'promotion')}
        >
          <Ionicons name="pencil" size={18} color={colors.accent.gold} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(promo.id, 'promotion')}
        >
          <Ionicons name="trash" size={18} color={colors.ui.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGalleryItem = (image: GalleryImage) => (
    <View key={image.id} style={styles.listItem}>
      {image.imageUrl ? (
        <Image source={{ uri: image.imageUrl }} style={styles.listItemImage} />
      ) : (
        <View style={styles.galleryThumb}>
          <Ionicons name="image" size={20} color={colors.accent.gold} />
        </View>
      )}
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{image.title}</Text>
        <Text style={styles.listItemSubtitle}>{image.category}</Text>
      </View>
      <View style={styles.listItemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(image, 'gallery')}
        >
          <Ionicons name="pencil" size={18} color={colors.accent.gold} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(image.id, 'gallery')}
        >
          <Ionicons name="trash" size={18} color={colors.ui.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit' : 'Add'} {editType}
            </Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Flavor Form */}
            {editType === 'flavor' && (
              <>
                <Text style={styles.inputLabel}>Image</Text>
                {renderImagePreview()}

                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g., Strawberry Bliss"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Describe this delicious flavor..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                />

                <Text style={styles.inputLabel}>Color</Text>
                <TouchableOpacity
                  style={styles.colorSelector}
                  onPress={() => { setColorPickerField('color'); setShowColorPicker(true); }}
                >
                  <View style={[styles.colorPreview, { backgroundColor: formData.color || '#FFB6C1' }]} />
                  <Text style={styles.colorValue}>{formData.color || '#FFB6C1'}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={formData.calories?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, calories: parseInt(text) || 0 })}
                  placeholder="150"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                />

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Vegan</Text>
                  <Switch
                    value={formData.isVegan}
                    onValueChange={(val) => setFormData({ ...formData, isVegan: val })}
                    trackColor={{ false: colors.ui.border, true: colors.ui.success }}
                    thumbColor="#FFF"
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Mark as New</Text>
                  <Switch
                    value={formData.isNew}
                    onValueChange={(val) => setFormData({ ...formData, isNew: val })}
                    trackColor={{ false: colors.ui.border, true: colors.accent.gold }}
                    thumbColor="#FFF"
                  />
                </View>
              </>
            )}

            {/* Topping Form */}
            {editType === 'topping' && (
              <>
                <Text style={styles.inputLabel}>Image (Optional)</Text>
                {renderImagePreview()}

                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g., Fresh Strawberries"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Emoji Icon</Text>
                <TouchableOpacity
                  style={styles.emojiSelector}
                  onPress={() => setShowEmojiPicker(true)}
                >
                  <Text style={styles.emojiPreview}>{formData.emoji || '🍓'}</Text>
                  <Text style={styles.emojiSelectorText}>Tap to change</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Color</Text>
                <TouchableOpacity
                  style={styles.colorSelector}
                  onPress={() => { setColorPickerField('color'); setShowColorPicker(true); }}
                >
                  <View style={[styles.colorPreview, { backgroundColor: formData.color || '#E53935' }]} />
                  <Text style={styles.colorValue}>{formData.color || '#E53935'}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryPicker}>
                  {['fruits', 'candy', 'nuts', 'sauces', 'cereals'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        formData.category === cat && styles.categoryOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === cat && styles.categoryOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Price per Gram ($)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pricePerGram?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, pricePerGram: parseFloat(text) || 0 })}
                  placeholder="0.08"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.inputLabel}>Max Grams</Text>
                <TextInput
                  style={styles.input}
                  value={formData.maxGrams?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, maxGrams: parseInt(text) || 30 })}
                  placeholder="30"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                />

                <View style={styles.priceSummary}>
                  <Ionicons name="information-circle" size={16} color={colors.accent.gold} />
                  <Text style={styles.priceSummaryText}>
                    Max price: ${((formData.pricePerGram || 0) * (formData.maxGrams || 30)).toFixed(2)}
                  </Text>
                </View>
              </>
            )}

            {/* Promotion Form */}
            {editType === 'promotion' && (
              <>
                <Text style={styles.inputLabel}>Banner Image</Text>
                {renderImagePreview()}

                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="e.g., Summer Special!"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Describe your promotion..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                />

                <Text style={styles.inputLabel}>Valid Until</Text>
                <TextInput
                  style={styles.input}
                  value={formData.validUntil || ''}
                  onChangeText={(text) => setFormData({ ...formData, validUntil: text })}
                  placeholder="e.g., December 31, 2024"
                  placeholderTextColor={colors.text.muted}
                />

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                    trackColor={{ false: colors.ui.border, true: colors.ui.success }}
                    thumbColor="#FFF"
                  />
                </View>
              </>
            )}

            {/* Gallery Form */}
            {editType === 'gallery' && (
              <>
                <Text style={styles.inputLabel}>Image *</Text>
                {renderImagePreview()}

                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="e.g., Our Signature Sundae"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryPicker}>
                  {['store', 'products', 'moments'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        formData.category === cat && styles.categoryOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category: cat })}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === cat && styles.categoryOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Store Form */}
            {editType === 'store' && (
              <>
                <Text style={styles.inputLabel}>Store Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Store name"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Tagline</Text>
                <TextInput
                  style={styles.input}
                  value={formData.tagline}
                  onChangeText={(text) => setFormData({ ...formData, tagline: text })}
                  placeholder="Store tagline"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Store description"
                  placeholderTextColor={colors.text.muted}
                  multiline
                />

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Store address"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Phone number"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Email address"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="email-address"
                />

                <Text style={styles.sectionDivider}>Business Hours</Text>

                <Text style={styles.inputLabel}>Weekdays</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hours?.weekdays}
                  onChangeText={(text) => setFormData({ ...formData, hours: { ...formData.hours, weekdays: text } })}
                  placeholder="e.g., 10:00 AM - 10:00 PM"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Weekends</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hours?.weekends}
                  onChangeText={(text) => setFormData({ ...formData, hours: { ...formData.hours, weekends: text } })}
                  placeholder="e.g., 11:00 AM - 11:00 PM"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.sectionDivider}>Social Media</Text>

                <Text style={styles.inputLabel}>Instagram</Text>
                <TextInput
                  style={styles.input}
                  value={formData.socialMedia?.instagram}
                  onChangeText={(text) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, instagram: text } })}
                  placeholder="@yourhandle"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>Facebook</Text>
                <TextInput
                  style={styles.input}
                  value={formData.socialMedia?.facebook}
                  onChangeText={(text) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, facebook: text } })}
                  placeholder="Your Facebook page"
                  placeholderTextColor={colors.text.muted}
                />

                <Text style={styles.inputLabel}>TikTok</Text>
                <TextInput
                  style={styles.input}
                  value={formData.socialMedia?.tiktok}
                  onChangeText={(text) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, tiktok: text } })}
                  placeholder="@yourhandle"
                  placeholderTextColor={colors.text.muted}
                />
              </>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
            >
              <LinearGradient
                colors={[colors.accent.gold, '#D4A84B']}
                style={styles.saveBtnGradient}
              >
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={colors.gradients.dark}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSubtitle}>Manage your app content</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color={colors.text.light} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navContainer}
        contentContainerStyle={styles.navContent}
      >
        {renderNavItem('flavors', 'ice-cream', 'Flavors')}
        {renderNavItem('toppings', 'nutrition', 'Toppings')}
        {renderNavItem('promotions', 'gift', 'Promos')}
        {renderNavItem('gallery', 'images', 'Gallery')}
        {renderNavItem('store', 'storefront', 'Store')}
        {renderNavItem('settings', 'settings', 'Settings')}
      </ScrollView>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{flavors.length}</Text>
          <Text style={styles.statLabel}>Flavors</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{toppings.length}</Text>
          <Text style={styles.statLabel}>Toppings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{promotions.filter(p => p.isActive).length}</Text>
          <Text style={styles.statLabel}>Active Promos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{gallery.length}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {activeSection === 'flavors' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Flavors ({flavors.length})</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openAddModal('flavor')}
                >
                  <Ionicons name="add" size={20} color={colors.text.light} />
                  <Text style={styles.addButtonText}>Add Flavor</Text>
                </TouchableOpacity>
              </View>
              {flavors.map(renderFlavorItem)}
            </>
          )}

          {activeSection === 'toppings' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Toppings ({toppings.length})</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openAddModal('topping')}
                >
                  <Ionicons name="add" size={20} color={colors.text.light} />
                  <Text style={styles.addButtonText}>Add Topping</Text>
                </TouchableOpacity>
              </View>
              {toppings.map(renderToppingItem)}
            </>
          )}

          {activeSection === 'promotions' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Promotions ({promotions.length})</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openAddModal('promotion')}
                >
                  <Ionicons name="add" size={20} color={colors.text.light} />
                  <Text style={styles.addButtonText}>Add Promo</Text>
                </TouchableOpacity>
              </View>
              {promotions.map(renderPromotionItem)}
            </>
          )}

          {activeSection === 'gallery' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Gallery ({gallery.length})</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openAddModal('gallery')}
                >
                  <Ionicons name="add" size={20} color={colors.text.light} />
                  <Text style={styles.addButtonText}>Add Photo</Text>
                </TouchableOpacity>
              </View>
              {gallery.map(renderGalleryItem)}
            </>
          )}

          {activeSection === 'store' && (
            <View style={styles.storeSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Store Information</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={openStoreEditModal}
                >
                  <Ionicons name="pencil" size={18} color={colors.text.light} />
                  <Text style={styles.addButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.storeCard}>
                <View style={styles.storeRow}>
                  <Ionicons name="business" size={20} color={colors.accent.gold} />
                  <View style={styles.storeRowContent}>
                    <Text style={styles.storeLabel}>Name</Text>
                    <Text style={styles.storeValue}>{storeInfo.name}</Text>
                  </View>
                </View>

                <View style={styles.storeRow}>
                  <Ionicons name="text" size={20} color={colors.accent.gold} />
                  <View style={styles.storeRowContent}>
                    <Text style={styles.storeLabel}>Tagline</Text>
                    <Text style={styles.storeValue}>{storeInfo.tagline}</Text>
                  </View>
                </View>

                <View style={styles.storeRow}>
                  <Ionicons name="location" size={20} color={colors.accent.gold} />
                  <View style={styles.storeRowContent}>
                    <Text style={styles.storeLabel}>Address</Text>
                    <Text style={styles.storeValue}>{storeInfo.address}</Text>
                  </View>
                </View>

                <View style={styles.storeRow}>
                  <Ionicons name="call" size={20} color={colors.accent.gold} />
                  <View style={styles.storeRowContent}>
                    <Text style={styles.storeLabel}>Phone</Text>
                    <Text style={styles.storeValue}>{storeInfo.phone}</Text>
                  </View>
                </View>

                <View style={styles.storeRow}>
                  <Ionicons name="mail" size={20} color={colors.accent.gold} />
                  <View style={styles.storeRowContent}>
                    <Text style={styles.storeLabel}>Email</Text>
                    <Text style={styles.storeValue}>{storeInfo.email}</Text>
                  </View>
                </View>

                <View style={styles.storeRow}>
                  <Ionicons name="time" size={20} color={colors.accent.gold} />
                  <View style={styles.storeRowContent}>
                    <Text style={styles.storeLabel}>Hours</Text>
                    <Text style={styles.storeValue}>Weekdays: {storeInfo.hours?.weekdays}</Text>
                    <Text style={styles.storeValue}>Weekends: {storeInfo.hours?.weekends}</Text>
                  </View>
                </View>

                <View style={styles.socialSection}>
                  <Text style={styles.socialTitle}>Social Media</Text>
                  <View style={styles.socialIcons}>
                    {storeInfo.socialMedia?.instagram && (
                      <View style={styles.socialBadge}>
                        <Ionicons name="logo-instagram" size={16} color="#E1306C" />
                        <Text style={styles.socialHandle}>{storeInfo.socialMedia.instagram}</Text>
                      </View>
                    )}
                    {storeInfo.socialMedia?.facebook && (
                      <View style={styles.socialBadge}>
                        <Ionicons name="logo-facebook" size={16} color="#4267B2" />
                        <Text style={styles.socialHandle}>{storeInfo.socialMedia.facebook}</Text>
                      </View>
                    )}
                    {storeInfo.socialMedia?.tiktok && (
                      <View style={styles.socialBadge}>
                        <Ionicons name="logo-tiktok" size={16} color="#000" />
                        <Text style={styles.socialHandle}>{storeInfo.socialMedia.tiktok}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeSection === 'settings' && (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <TouchableOpacity style={styles.settingsItem} onPress={handleReset}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.ui.warning + '20' }]}>
                  <Ionicons name="refresh" size={24} color={colors.ui.warning} />
                </View>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>Reset to Defaults</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    Restore all data to original state
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={[styles.settingsIcon, { backgroundColor: colors.accent.gold + '20' }]}>
                  <Ionicons name="cloud-upload" size={24} color={colors.accent.gold} />
                </View>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>Export Data</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    Backup your app data
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingsItem}>
                <View style={[styles.settingsIcon, { backgroundColor: '#3949AB20' }]}>
                  <Ionicons name="cloud-download" size={24} color="#3949AB" />
                </View>
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>Import Data</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    Restore from backup
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>

              <View style={styles.appInfo}>
                <View style={styles.appLogo}>
                  <Text style={styles.appLogoText}>YV</Text>
                </View>
                <Text style={styles.appInfoTitle}>Yo-Vazaluza Admin</Text>
                <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {renderEditModal()}
      {renderColorPicker()}
      {renderEmojiPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  headerGradient: {
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: '700',
    color: colors.text.light,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.light,
    opacity: 0.8,
    marginTop: 2,
  },
  logoutButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.round,
  },
  navContainer: {
    backgroundColor: colors.background.card,
    ...shadows.small,
  },
  navContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.round,
  },
  navItemActive: {
    backgroundColor: colors.accent.gold + '20',
  },
  navLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  navLabelActive: {
    color: colors.accent.gold,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    color: colors.accent.gold,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.ui.divider,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.gold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  addButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    color: colors.text.light,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  listItemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  colorDot: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  toppingPreview: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  toppingEmoji: {
    fontSize: 28,
  },
  promoIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  galleryThumb: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  listItemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  listItemSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  veganBadge: {
    backgroundColor: colors.ui.success,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  veganBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  toppingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  toppingPrice: {
    fontSize: typography.fontSizes.xs,
    color: colors.ui.success,
    fontWeight: '600',
  },
  listItemActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.sm,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
  },
  storeSection: {
    paddingBottom: spacing.xxl,
  },
  storeCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
    ...shadows.medium,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  storeRowContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  storeLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
  storeValue: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    marginTop: 2,
  },
  socialSection: {
    paddingTop: spacing.md,
  },
  socialTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  socialIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  socialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  socialHandle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  settingsSection: {
    paddingBottom: spacing.xxl,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    ...shadows.small,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingsItemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingsItemSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  appLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  appInfoTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  appInfoVersion: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  modalTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: '700',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  modalBody: {
    padding: spacing.lg,
    maxHeight: SCREEN_WIDTH * 1.2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  cancelBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  cancelBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  saveBtn: {
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  saveBtnText: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: '#FFF',
  },
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.main,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  categoryOptionActive: {
    backgroundColor: colors.accent.gold,
    borderColor: colors.accent.gold,
  },
  categoryOptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  categoryOptionTextActive: {
    color: colors.text.light,
    fontWeight: '600',
  },
  sectionDivider: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: colors.accent.gold,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageActions: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  imageActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageDeleteBtn: {
    backgroundColor: colors.ui.error,
  },
  colorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: '#FFF',
    ...shadows.small,
  },
  colorValue: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
  },
  emojiSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  emojiPreview: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  emojiSelectorText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.muted,
  },
  priceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.gold + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  priceSummaryText: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerContent: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 350,
  },
  pickerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text.primary,
    borderWidth: 3,
  },
  customColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
    gap: spacing.sm,
  },
  customColorLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  customColorInput: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  colorPreviewSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '20',
  },
  emojiText: {
    fontSize: 24,
  },
  customEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
    gap: spacing.sm,
  },
  customEmojiInput: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
});

export default AdminScreen;
