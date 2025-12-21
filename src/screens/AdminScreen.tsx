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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
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

// Extended emoji palette for toppings - organized by category
const EMOJI_PALETTE = [
  // === FRUITS & BERRIES ===
  '🍓', '🫐', '🍒', '🍇', '🍎', '🍏', '🍐', '🍑', '🍊', '🍋',
  '🍋‍🟩', '🍌', '🍉', '🍈', '🍍', '🥭', '🥝', '🥥', '🫒', '🍅',
  '🍆', '🥑', '🫛', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅',
  '🥕', '🌽', '🥔', '🍠', '🫚', '🫛',

  // === CANDY & SWEETS ===
  '🍬', '🍭', '🍫', '🍩', '🍪', '🧁', '🍰', '🎂', '🥧', '🍮',
  '🍡', '🍧', '🍨', '🍦', '🥮', '🍿', '🧇', '🥞', '🧈', '🍯',
  '🥐', '🥖', '🥨', '🧀', '🥚', '🍳', '🥓', '🥩', '🍗', '🍖',

  // === NUTS & SEEDS ===
  '🥜', '🌰', '🫘', '🌻', '🫛', '🥥',

  // === CHOCOLATE & COFFEE ===
  '🍫', '☕', '🧋', '🥛', '🍼', '🫖', '🍵', '🥤', '🧃', '🍶',

  // === CEREALS & GRAINS ===
  '🥣', '🥗', '🍚', '🍙', '🍘', '🍥', '🥠', '🥡', '🍱', '🍛',

  // === SAUCES & TOPPINGS ===
  '🧂', '🍶', '🫙', '🍾', '🧊', '🥢',

  // === ICE CREAM & FROZEN ===
  '🍦', '🍧', '🍨', '🧊', '❄️', '🥶',

  // === DECORATIONS & SPARKLES ===
  '⭐', '🌟', '✨', '💫', '💎', '🔮', '🎀', '🎊', '🎉', '🎁',
  '🏆', '👑', '💝', '💖', '💗', '💓', '💕', '💞', '💘', '❤️',
  '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥',

  // === NATURE & FLOWERS ===
  '🌸', '🌺', '🌻', '🌹', '🌷', '🥀', '💐', '🌼', '🌱', '🌲',
  '🌳', '🌴', '🌵', '🍀', '☘️', '🍃', '🍂', '🍁', '🌾', '🌿',

  // === WEATHER & ELEMENTS ===
  '🔥', '💧', '🌊', '⚡', '☀️', '🌙', '⭐', '🌈', '☁️', '❄️',
  '🌪️', '💨', '🌀',

  // === ANIMALS & CUTE ===
  '🐻', '🧸', '🐰', '🐼', '🦊', '🐸', '🐷', '🐮', '🦁', '🐯',
  '🐨', '🐵', '🙈', '🙉', '🙊', '🐶', '🐱', '🐭', '🐹', '🐰',
  '🦄', '🐴', '🐲', '🦋', '🐝', '🐞', '🦀', '🐙', '🦑', '🐠',
  '🐟', '🐬', '🐳', '🦈', '🐊', '🦎', '🐢', '🐍', '🦖', '🦕',

  // === FOOD FACES & FUN ===
  '😋', '🤤', '😍', '🥰', '😊', '😁', '🤩', '😎', '🥳', '🎃',
  '👻', '💀', '👽', '🤖', '🎅', '🧚', '🧜', '🧞', '🧛', '🧟',

  // === SHAPES & SYMBOLS ===
  '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥',
  '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️',
  '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔲', '🔳',
];

// Navigation items
const NAV_ITEMS: { key: AdminSection; icon: string; label: string }[] = [
  { key: 'flavors', icon: 'ice-cream', label: 'Flavors' },
  { key: 'toppings', icon: 'nutrition', label: 'Toppings' },
  { key: 'promotions', icon: 'gift', label: 'Promos' },
  { key: 'gallery', icon: 'images', label: 'Gallery' },
  { key: 'store', icon: 'storefront', label: 'Store' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
];

const AdminScreen: React.FC = () => {
  const {
    flavors,
    toppings,
    promotions,
    gallery,
    storeInfo,
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
  const [formData, setFormData] = useState<any>({});

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
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
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
      Alert.alert('Permission Required', 'Please allow camera access.');
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

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  const showImageOptions = () => {
    Alert.alert('Add Image', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Enter URL', onPress: () => { setTempImageUrl(formData.imageUrl || ''); setShowUrlInput(true); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUrlSubmit = () => {
    if (tempImageUrl.trim()) {
      setFormData({ ...formData, imageUrl: tempImageUrl.trim() });
    }
    setShowUrlInput(false);
    setTempImageUrl('');
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
    const defaults: Record<string, any> = {
      flavor: { name: '', description: '', color: '#FFB6C1', imageUrl: '', isVegan: false, isNew: true, calories: 150 },
      topping: { name: '', category: 'fruits', imageUrl: '', emoji: '🍓', color: '#E53935', pricePerGram: 0.08, maxGrams: 30 },
      promotion: { title: '', description: '', imageUrl: '', isActive: true, validUntil: '' },
      gallery: { title: '', category: 'products', imageUrl: '' },
    };
    setFormData(defaults[type] || {});
    setEditModalVisible(true);
  };

  const handleSave = () => {
    if (!editType) return;
    if ((editType === 'flavor' || editType === 'topping') && !formData.name) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    // Clean up temporary fields before saving
    const cleanedData = { ...formData };
    delete cleanedData.pricePerGramStr;

    const actions: Record<string, () => void> = {
      flavor: () => editingItem ? updateFlavor({ ...editingItem, ...cleanedData }) : addFlavor(cleanedData),
      topping: () => editingItem ? updateTopping({ ...editingItem, ...cleanedData }) : addTopping(cleanedData),
      promotion: () => editingItem ? updatePromotion({ ...editingItem, ...cleanedData }) : addPromotion(cleanedData),
      gallery: () => editingItem ? updateGalleryImage({ ...editingItem, ...cleanedData }) : addGalleryImage(cleanedData),
      store: () => updateStoreInfo(cleanedData),
    };

    actions[editType]?.();
    setEditModalVisible(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = (id: string, type: 'flavor' | 'topping' | 'promotion' | 'gallery') => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const actions: Record<string, () => void> = {
            flavor: () => deleteFlavor(id),
            topping: () => deleteTopping(id),
            promotion: () => deletePromotion(id),
            gallery: () => deleteGalleryImage(id),
          };
          actions[type]?.();
        },
      },
    ]);
  };

  // Render navigation tab
  const renderNavTab = (item: typeof NAV_ITEMS[0]) => {
    const isActive = activeSection === item.key;
    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.navTab, isActive && styles.navTabActive]}
        onPress={() => setActiveSection(item.key)}
      >
        <Ionicons
          name={item.icon as any}
          size={20}
          color={isActive ? colors.accent.gold : colors.text.secondary}
        />
        <Text style={[styles.navTabText, isActive && styles.navTabTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render list item
  const renderListItem = (item: any, type: 'flavor' | 'topping' | 'promotion' | 'gallery') => {
    const getItemDisplay = () => {
      switch (type) {
        case 'flavor':
          return {
            preview: item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemColorDot, { backgroundColor: item.color }]} />
            ),
            title: item.name,
            subtitle: item.description,
            badges: (
              <>
                {item.isNew && <View style={styles.badgeNew}><Text style={styles.badgeText}>NEW</Text></View>}
                {item.isVegan && <View style={styles.badgeVegan}><Text style={styles.badgeText}>V</Text></View>}
              </>
            ),
          };
        case 'topping':
          return {
            preview: (
              <View style={[styles.toppingListEmoji, { backgroundColor: (item.color || '#E53935') + '25' }]}>
                <Text style={styles.toppingListEmojiText}>{item.emoji || '🍬'}</Text>
                <View style={[styles.toppingListColorDot, { backgroundColor: item.color || '#E53935' }]} />
              </View>
            ),
            title: item.name,
            subtitle: `${item.category} • $${(item.pricePerGram || 0).toFixed(3)}/g`,
            badges: null,
          };
        case 'promotion':
          return {
            preview: item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={styles.iconPreview}><Ionicons name="gift" size={24} color={colors.accent.gold} /></View>
            ),
            title: item.title,
            subtitle: item.description,
            badges: (
              <View style={[styles.statusBadge, { backgroundColor: item.isActive ? colors.ui.success : colors.text.muted }]}>
                <Text style={styles.statusBadgeText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
              </View>
            ),
          };
        case 'gallery':
          return {
            preview: item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={styles.iconPreview}><Ionicons name="image" size={24} color={colors.accent.gold} /></View>
            ),
            title: item.title,
            subtitle: item.category,
            badges: null,
          };
        default:
          return { preview: null, title: '', subtitle: '', badges: null };
      }
    };

    const display = getItemDisplay();

    return (
      <View key={item.id} style={styles.listItem}>
        {display.preview}
        <View style={styles.listItemContent}>
          <View style={styles.listItemHeader}>
            <Text style={styles.listItemTitle} numberOfLines={1}>{display.title}</Text>
            {display.badges}
          </View>
          <Text style={styles.listItemSubtitle} numberOfLines={1}>{display.subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item, type)}>
          <Ionicons name="pencil" size={18} color={colors.accent.gold} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, type)}>
          <Ionicons name="trash" size={18} color={colors.ui.error} />
        </TouchableOpacity>
      </View>
    );
  };

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'flavors':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Flavors ({flavors.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('flavor')}>
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addBtnText}>Add Flavor</Text>
              </TouchableOpacity>
            </View>
            {flavors.map(item => renderListItem(item, 'flavor'))}
          </>
        );
      case 'toppings':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Toppings ({toppings.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('topping')}>
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addBtnText}>Add Topping</Text>
              </TouchableOpacity>
            </View>
            {toppings.map(item => renderListItem(item, 'topping'))}
          </>
        );
      case 'promotions':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Promotions ({promotions.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('promotion')}>
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addBtnText}>Add Promo</Text>
              </TouchableOpacity>
            </View>
            {promotions.map(item => renderListItem(item, 'promotion'))}
          </>
        );
      case 'gallery':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gallery ({gallery.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('gallery')}>
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addBtnText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
            {gallery.map(item => renderListItem(item, 'gallery'))}
          </>
        );
      case 'store':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Store Information</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setEditType('store'); setFormData({ ...storeInfo }); setEditModalVisible(true); }}>
                <Ionicons name="pencil" size={18} color="#FFF" />
                <Text style={styles.addBtnText}>Edit</Text>
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
            </View>
          </>
        );
      case 'settings':
        return (
          <>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingsItem} onPress={handleReset}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.ui.warning + '20' }]}>
                <Ionicons name="refresh" size={24} color={colors.ui.warning} />
              </View>
              <View style={styles.settingsContent}>
                <Text style={styles.settingsTitle}>Reset to Defaults</Text>
                <Text style={styles.settingsSubtitle}>Restore all data to original state</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={styles.appInfo}>
              <View style={styles.appLogo}><Text style={styles.appLogoText}>YV</Text></View>
              <Text style={styles.appInfoTitle}>Yo-Vazaluza Admin</Text>
              <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  // Render edit modal
  const renderEditModal = () => (
    <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Add'} {editType}</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Image picker for all types except store */}
            {editType !== 'store' && (
              <>
                <Text style={styles.inputLabel}>Image</Text>
                {formData.imageUrl ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: formData.imageUrl }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.imageRemoveBtn} onPress={() => setFormData({ ...formData, imageUrl: '' })}>
                      <Ionicons name="close" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imageOptionsContainer}>
                    <TouchableOpacity style={styles.imageOptionBtn} onPress={pickImage}>
                      <Ionicons name="images" size={28} color={colors.accent.gold} />
                      <Text style={styles.imageOptionText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageOptionBtn} onPress={takePhoto}>
                      <Ionicons name="camera" size={28} color={colors.accent.gold} />
                      <Text style={styles.imageOptionText}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageOptionBtn} onPress={() => { setTempImageUrl(formData.imageUrl || ''); setShowUrlInput(true); }}>
                      <Ionicons name="link" size={28} color={colors.accent.gold} />
                      <Text style={styles.imageOptionText}>URL</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Flavor form */}
            {editType === 'flavor' && (
              <>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} placeholder="Flavor name" placeholderTextColor={colors.text.muted} />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} placeholder="Description" placeholderTextColor={colors.text.muted} multiline />

                <Text style={styles.inputLabel}>Color</Text>
                <TouchableOpacity style={styles.colorSelector} onPress={() => { setColorPickerField('color'); setShowColorPicker(true); }}>
                  <View style={[styles.colorDot, { backgroundColor: formData.color || '#FFB6C1' }]} />
                  <Text style={styles.colorValue}>{formData.color || '#FFB6C1'}</Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput style={styles.input} value={formData.calories?.toString()} onChangeText={t => setFormData({ ...formData, calories: parseInt(t) || 0 })} placeholder="150" placeholderTextColor={colors.text.muted} keyboardType="numeric" />

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Vegan</Text>
                  <Switch value={formData.isVegan} onValueChange={v => setFormData({ ...formData, isVegan: v })} trackColor={{ false: colors.ui.border, true: colors.ui.success }} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Mark as New</Text>
                  <Switch value={formData.isNew} onValueChange={v => setFormData({ ...formData, isNew: v })} trackColor={{ false: colors.ui.border, true: colors.accent.gold }} />
                </View>
              </>
            )}

            {/* Topping form */}
            {editType === 'topping' && (
              <>
                {/* Live Preview Card */}
                <View style={styles.toppingPreviewCard}>
                  <View style={[styles.toppingPreviewEmoji, { backgroundColor: (formData.color || '#E53935') + '20' }]}>
                    <Text style={styles.toppingPreviewEmojiText}>{formData.emoji || '🍓'}</Text>
                  </View>
                  <View style={styles.toppingPreviewInfo}>
                    <Text style={styles.toppingPreviewName}>{formData.name || 'Topping Name'}</Text>
                    <Text style={styles.toppingPreviewCategory}>{formData.category || 'fruits'}</Text>
                    <View style={[styles.toppingPreviewPrice, { backgroundColor: formData.color || '#E53935' }]}>
                      <Text style={styles.toppingPreviewPriceText}>
                        ${(formData.pricePerGram || 0).toFixed(3)}/g
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} placeholder="Topping name" placeholderTextColor={colors.text.muted} />

                {/* Emoji & Color Row */}
                <View style={styles.emojiColorRow}>
                  <View style={styles.emojiColorItem}>
                    <Text style={styles.inputLabel}>Emoji</Text>
                    <TouchableOpacity style={styles.toppingEmojiBtn} onPress={() => setShowEmojiPicker(true)}>
                      <View style={[styles.toppingEmojiBg, { backgroundColor: (formData.color || '#E53935') + '30' }]}>
                        <Text style={styles.toppingEmojiLarge}>{formData.emoji || '🍓'}</Text>
                      </View>
                      <Text style={styles.toppingEmojiHint}>Tap to change</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.emojiColorItem}>
                    <Text style={styles.inputLabel}>Color</Text>
                    <TouchableOpacity style={styles.toppingColorBtn} onPress={() => { setColorPickerField('color'); setShowColorPicker(true); }}>
                      <View style={[styles.toppingColorPreview, { backgroundColor: formData.color || '#E53935' }]}>
                        <Ionicons name="color-palette" size={24} color="#FFF" />
                      </View>
                      <Text style={styles.toppingColorHex}>{formData.color || '#E53935'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryPicker}>
                  {['fruits', 'candy', 'nuts', 'sauces', 'cereals'].map(cat => (
                    <TouchableOpacity key={cat} style={[styles.categoryOption, formData.category === cat && styles.categoryOptionActive]} onPress={() => setFormData({ ...formData, category: cat })}>
                      <Text style={[styles.categoryText, formData.category === cat && styles.categoryTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Price per Gram ($)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pricePerGramStr !== undefined ? formData.pricePerGramStr : (formData.pricePerGram?.toString() || '')}
                  onChangeText={t => {
                    // Allow typing decimals naturally - only validate on blur/save
                    const cleaned = t.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, pricePerGramStr: cleaned, pricePerGram: parseFloat(cleaned) || 0 });
                  }}
                  placeholder="0.015"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.priceHint}>Supports up to 3 decimal places (e.g., 0.015)</Text>

                <Text style={styles.inputLabel}>Max Grams</Text>
                <TextInput style={styles.input} value={formData.maxGrams?.toString()} onChangeText={t => setFormData({ ...formData, maxGrams: parseInt(t) || 30 })} placeholder="30" placeholderTextColor={colors.text.muted} keyboardType="numeric" />
              </>
            )}

            {/* Promotion form */}
            {editType === 'promotion' && (
              <>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput style={styles.input} value={formData.title} onChangeText={t => setFormData({ ...formData, title: t })} placeholder="Promotion title" placeholderTextColor={colors.text.muted} />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} placeholder="Description" placeholderTextColor={colors.text.muted} multiline />

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Active</Text>
                  <Switch value={formData.isActive} onValueChange={v => setFormData({ ...formData, isActive: v })} trackColor={{ false: colors.ui.border, true: colors.ui.success }} />
                </View>
              </>
            )}

            {/* Gallery form */}
            {editType === 'gallery' && (
              <>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput style={styles.input} value={formData.title} onChangeText={t => setFormData({ ...formData, title: t })} placeholder="Image title" placeholderTextColor={colors.text.muted} />

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryPicker}>
                  {['store', 'products', 'moments'].map(cat => (
                    <TouchableOpacity key={cat} style={[styles.categoryOption, formData.category === cat && styles.categoryOptionActive]} onPress={() => setFormData({ ...formData, category: cat })}>
                      <Text style={[styles.categoryText, formData.category === cat && styles.categoryTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Store form */}
            {editType === 'store' && (
              <>
                <Text style={styles.inputLabel}>Store Name</Text>
                <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} placeholder="Store name" placeholderTextColor={colors.text.muted} />

                <Text style={styles.inputLabel}>Tagline</Text>
                <TextInput style={styles.input} value={formData.tagline} onChangeText={t => setFormData({ ...formData, tagline: t })} placeholder="Tagline" placeholderTextColor={colors.text.muted} />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} placeholder="Description" placeholderTextColor={colors.text.muted} multiline />

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput style={styles.input} value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} placeholder="Address" placeholderTextColor={colors.text.muted} />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} placeholder="Phone" placeholderTextColor={colors.text.muted} keyboardType="phone-pad" />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput style={styles.input} value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} placeholder="Email" placeholderTextColor={colors.text.muted} keyboardType="email-address" />

                <Text style={styles.inputLabel}>Weekday Hours</Text>
                <TextInput style={styles.input} value={formData.hours?.weekdays} onChangeText={t => setFormData({ ...formData, hours: { ...formData.hours, weekdays: t } })} placeholder="e.g., 10:00 AM - 10:00 PM" placeholderTextColor={colors.text.muted} />

                <Text style={styles.inputLabel}>Weekend Hours</Text>
                <TextInput style={styles.input} value={formData.hours?.weekends} onChangeText={t => setFormData({ ...formData, hours: { ...formData.hours, weekends: t } })} placeholder="e.g., 11:00 AM - 11:00 PM" placeholderTextColor={colors.text.muted} />
              </>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render color picker modal
  const renderColorPicker = () => (
    <Modal visible={showColorPicker} transparent animationType="fade" onRequestClose={() => setShowColorPicker(false)}>
      <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowColorPicker(false)}>
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>Select Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_PALETTE.map(color => (
              <TouchableOpacity key={color} style={[styles.colorGridItem, { backgroundColor: color }, formData[colorPickerField] === color && styles.colorGridItemSelected]} onPress={() => { setFormData({ ...formData, [colorPickerField]: color }); setShowColorPicker(false); }} />
            ))}
          </View>
          <TextInput style={styles.customColorInput} value={formData[colorPickerField] || ''} onChangeText={t => setFormData({ ...formData, [colorPickerField]: t })} placeholder="#FFFFFF" placeholderTextColor={colors.text.muted} />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render emoji picker modal with scrollable grid
  const renderEmojiPicker = () => (
    <Modal visible={showEmojiPicker} transparent animationType="fade" onRequestClose={() => setShowEmojiPicker(false)}>
      <View style={styles.emojiPickerOverlay}>
        <View style={styles.emojiPickerBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowEmojiPicker(false)} />
        </View>
        <View style={styles.emojiPickerContent} pointerEvents="auto">
          <View style={styles.emojiPickerHeader}>
            <Text style={styles.pickerTitle}>Select Emoji</Text>
            <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.emojiScrollView}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.emojiScrollContent}
          >
            <View style={styles.emojiGrid}>
              {EMOJI_PALETTE.map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.emojiGridItem, formData.emoji === emoji && styles.emojiGridItemSelected]}
                  onPress={() => { setFormData({ ...formData, emoji }); setShowEmojiPicker(false); }}
                >
                  <Text style={styles.emojiGridText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render URL input modal
  const renderUrlInputModal = () => (
    <Modal visible={showUrlInput} transparent animationType="fade" onRequestClose={() => { setShowUrlInput(false); setTempImageUrl(''); }}>
      <View style={styles.urlModalOverlay}>
        <View style={styles.urlModalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => { setShowUrlInput(false); setTempImageUrl(''); }} />
        </View>
        <View style={styles.urlInputContent} pointerEvents="auto">
          <View style={styles.urlInputHeader}>
            <Text style={styles.urlInputTitle}>Add Image from URL</Text>
            <TouchableOpacity onPress={() => { setShowUrlInput(false); setTempImageUrl(''); }}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.urlInputLabel}>Paste your image URL below:</Text>
          <TextInput
            style={styles.urlInput}
            value={tempImageUrl}
            onChangeText={setTempImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            selectTextOnFocus
          />
          {tempImageUrl.length > 0 && (
            <View style={styles.urlPreviewContainer}>
              <Text style={styles.urlPreviewLabel}>Preview:</Text>
              <Image
                source={{ uri: tempImageUrl }}
                style={styles.urlPreviewImage}
                onError={() => {}}
              />
            </View>
          )}
          <View style={styles.urlInputButtons}>
            <TouchableOpacity style={styles.urlCancelBtn} onPress={() => { setShowUrlInput(false); setTempImageUrl(''); }}>
              <Text style={styles.urlCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.urlSubmitBtn, !tempImageUrl.trim() && styles.urlSubmitBtnDisabled]}
              onPress={handleUrlSubmit}
              disabled={!tempImageUrl.trim()}
            >
              <Text style={styles.urlSubmitBtnText}>Add Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Manage your app content</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navBarContent}>
          {NAV_ITEMS.map(renderNavTab)}
        </ScrollView>
      </View>

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
      <View style={styles.content}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {renderSectionContent()}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {renderEditModal()}
      {renderColorPicker()}
      {renderEmojiPicker()}
      {renderUrlInputModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.dark,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  navBarContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: 'transparent',
  },
  navTabActive: {
    backgroundColor: colors.accent.gold + '20',
  },
  navTabText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  navTabTextActive: {
    color: colors.accent.gold,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent.gold,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.ui.border,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 150,
    minHeight: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.gold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
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
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  itemColorDot: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  emojiPreview: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emojiText: {
    fontSize: 24,
  },
  toppingListEmoji: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  toppingListEmojiText: {
    fontSize: 30,
  },
  toppingListColorDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  iconPreview: {
    width: 48,
    height: 48,
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
    flexWrap: 'wrap',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  badgeNew: {
    backgroundColor: colors.accent.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeVegan: {
    backgroundColor: colors.ui.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
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
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  storeCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
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
    fontSize: 12,
    color: colors.text.muted,
  },
  storeValue: {
    fontSize: 15,
    color: colors.text.primary,
    marginTop: 2,
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
  settingsContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingsSubtitle: {
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  appInfoVersion: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  modalBody: {
    padding: spacing.lg,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  saveBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.round,
    backgroundColor: colors.accent.gold,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text.primary,
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
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  colorValue: {
    fontSize: 16,
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
  emojiSelectorText: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  emojiSelectorHint: {
    fontSize: 14,
    color: colors.text.muted,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  categoryText: {
    fontSize: 14,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.ui.border,
    borderStyle: 'dashed',
    padding: spacing.lg,
  },
  imageOptionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    minWidth: 80,
  },
  imageOptionText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    height: 120,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ui.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Picker modals
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerContent: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  pickerTitle: {
    fontSize: 18,
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
  colorGridItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorGridItemSelected: {
    borderColor: colors.text.primary,
    borderWidth: 3,
  },
  customColorInput: {
    marginTop: spacing.md,
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.ui.border,
    textAlign: 'center',
  },
  // New styles for enhanced features
  priceHint: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  // Topping preview styles
  toppingPreviewCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  toppingPreviewEmoji: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  toppingPreviewEmojiText: {
    fontSize: 42,
  },
  toppingPreviewInfo: {
    flex: 1,
  },
  toppingPreviewName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  toppingPreviewCategory: {
    fontSize: 13,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  toppingPreviewPrice: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  toppingPreviewPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  emojiColorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  emojiColorItem: {
    flex: 1,
  },
  toppingEmojiBtn: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  toppingEmojiBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  toppingEmojiLarge: {
    fontSize: 42,
  },
  toppingEmojiHint: {
    fontSize: 12,
    color: colors.text.muted,
  },
  toppingColorBtn: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  toppingColorPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  toppingColorHex: {
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emojiPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  emojiPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  emojiPickerContent: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    zIndex: 10,
    elevation: 10,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  emojiScrollView: {
    flex: 1,
  },
  emojiScrollContent: {
    paddingBottom: spacing.lg,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emojiGridItem: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiGridItemSelected: {
    borderColor: colors.accent.gold,
    backgroundColor: colors.accent.gold + '20',
  },
  emojiGridText: {
    fontSize: 28,
  },
  urlModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  urlModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  urlInputContent: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    zIndex: 10,
    elevation: 10,
  },
  urlInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  urlInputTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  urlInputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  urlInput: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  urlInputButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  urlCancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  urlCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  urlSubmitBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.gold,
  },
  urlSubmitBtnDisabled: {
    backgroundColor: colors.text.muted,
    opacity: 0.5,
  },
  urlSubmitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  urlPreviewContainer: {
    marginTop: spacing.md,
  },
  urlPreviewLabel: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  urlPreviewImage: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.main,
    resizeMode: 'cover',
  },
});

export default AdminScreen;
