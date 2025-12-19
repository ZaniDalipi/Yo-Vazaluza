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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { AnimatedButton } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Flavor, Topping, Promotion, GalleryImage } from '../types';

type AdminSection = 'flavors' | 'toppings' | 'promotions' | 'gallery' | 'store' | 'settings';

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
      setFormData({ name: '', description: '', color: '#4A3728', isVegan: false, isNew: false });
    } else if (type === 'topping') {
      setFormData({ name: '', category: 'fruits' });
    } else if (type === 'promotion') {
      setFormData({ title: '', description: '', isActive: true });
    } else if (type === 'gallery') {
      setFormData({ title: '', description: '', uri: '' });
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

  const renderNavItem = (section: AdminSection, icon: string, label: string) => {
    const isActive = activeSection === section;
    return (
      <TouchableOpacity
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

  const renderFlavorItem = (flavor: Flavor) => (
    <View key={flavor.id} style={styles.listItem}>
      <View style={[styles.colorDot, { backgroundColor: flavor.color }]} />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{flavor.name}</Text>
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
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{topping.name}</Text>
        <Text style={styles.listItemSubtitle}>{topping.category}</Text>
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
      <View
        style={[
          styles.statusDot,
          { backgroundColor: promo.isActive ? colors.ui.success : colors.text.muted },
        ]}
      />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{promo.title}</Text>
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
      <View style={styles.galleryThumb}>
        <Ionicons name="image" size={20} color={colors.accent.gold} />
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{image.title}</Text>
        <Text style={styles.listItemSubtitle} numberOfLines={1}>
          {image.description || 'No description'}
        </Text>
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

          <ScrollView style={styles.modalBody}>
            {editType === 'flavor' && (
              <>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Flavor name"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Flavor description"
                  multiline
                />

                <Text style={styles.inputLabel}>Color (Hex)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.color}
                  onChangeText={(text) => setFormData({ ...formData, color: text })}
                  placeholder="#4A3728"
                />

                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Vegan</Text>
                  <Switch
                    value={formData.isVegan}
                    onValueChange={(val) => setFormData({ ...formData, isVegan: val })}
                    trackColor={{ false: colors.ui.border, true: colors.accent.gold }}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>New</Text>
                  <Switch
                    value={formData.isNew}
                    onValueChange={(val) => setFormData({ ...formData, isNew: val })}
                    trackColor={{ false: colors.ui.border, true: colors.accent.gold }}
                  />
                </View>
              </>
            )}

            {editType === 'topping' && (
              <>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Topping name"
                />

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
              </>
            )}

            {editType === 'promotion' && (
              <>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Promotion title"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Promotion description"
                  multiline
                />

                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Active</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                    trackColor={{ false: colors.ui.border, true: colors.ui.success }}
                  />
                </View>
              </>
            )}

            {editType === 'gallery' && (
              <>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Image title"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Image description"
                  multiline
                />

                <Text style={styles.inputLabel}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={formData.uri}
                  onChangeText={(text) => setFormData({ ...formData, uri: text })}
                  placeholder="https://example.com/image.jpg"
                />
              </>
            )}

            {editType === 'store' && (
              <>
                <Text style={styles.inputLabel}>Store Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Store name"
                />

                <Text style={styles.inputLabel}>Tagline</Text>
                <TextInput
                  style={styles.input}
                  value={formData.tagline}
                  onChangeText={(text) => setFormData({ ...formData, tagline: text })}
                  placeholder="Store tagline"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Store description"
                  multiline
                />

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Store address"
                />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Email address"
                  keyboardType="email-address"
                />

                <Text style={styles.inputLabel}>Weekday Hours</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hours?.weekdays}
                  onChangeText={(text) => setFormData({ ...formData, hours: { ...formData.hours, weekdays: text } })}
                  placeholder="e.g., 10:00 - 22:00"
                />

                <Text style={styles.inputLabel}>Weekend Hours</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hours?.weekends}
                  onChangeText={(text) => setFormData({ ...formData, hours: { ...formData.hours, weekends: text } })}
                  placeholder="e.g., 11:00 - 23:00"
                />

                <Text style={styles.inputLabel}>Instagram Handle</Text>
                <TextInput
                  style={styles.input}
                  value={formData.socialMedia?.instagram}
                  onChangeText={(text) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, instagram: text } })}
                  placeholder="@yourhandle"
                />

                <Text style={styles.inputLabel}>Facebook Page</Text>
                <TextInput
                  style={styles.input}
                  value={formData.socialMedia?.facebook}
                  onChangeText={(text) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, facebook: text } })}
                  placeholder="Your Facebook page"
                />

                <Text style={styles.inputLabel}>TikTok Handle</Text>
                <TextInput
                  style={styles.input}
                  value={formData.socialMedia?.tiktok}
                  onChangeText={(text) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, tiktok: text } })}
                  placeholder="@yourhandle"
                />
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <AnimatedButton
              title="Cancel"
              onPress={() => setEditModalVisible(false)}
              variant="outline"
              size="medium"
            />
            <AnimatedButton
              title="Save"
              onPress={handleSave}
              variant="golden"
              size="medium"
            />
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
                  <Text style={styles.addButtonText}>Add</Text>
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
                  <Text style={styles.addButtonText}>Add</Text>
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
                  <Text style={styles.addButtonText}>Add</Text>
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
                  <Text style={styles.addButtonText}>Add</Text>
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
                <Text style={styles.storeLabel}>Name</Text>
                <Text style={styles.storeValue}>{storeInfo.name}</Text>

                <Text style={styles.storeLabel}>Tagline</Text>
                <Text style={styles.storeValue}>{storeInfo.tagline}</Text>

                <Text style={styles.storeLabel}>Description</Text>
                <Text style={styles.storeValue} numberOfLines={3}>{storeInfo.description}</Text>

                <Text style={styles.storeLabel}>Address</Text>
                <Text style={styles.storeValue}>{storeInfo.address}</Text>

                <Text style={styles.storeLabel}>Phone</Text>
                <Text style={styles.storeValue}>{storeInfo.phone}</Text>

                <Text style={styles.storeLabel}>Email</Text>
                <Text style={styles.storeValue}>{storeInfo.email}</Text>

                <Text style={styles.storeLabel}>Weekday Hours</Text>
                <Text style={styles.storeValue}>{storeInfo.hours?.weekdays}</Text>

                <Text style={styles.storeLabel}>Weekend Hours</Text>
                <Text style={styles.storeValue}>{storeInfo.hours?.weekends}</Text>

                <Text style={styles.storeLabel}>Social Media</Text>
                <View style={styles.socialLinks}>
                  {storeInfo.socialMedia?.instagram && (
                    <Text style={styles.socialLink}>Instagram: {storeInfo.socialMedia.instagram}</Text>
                  )}
                  {storeInfo.socialMedia?.facebook && (
                    <Text style={styles.socialLink}>Facebook: {storeInfo.socialMedia.facebook}</Text>
                  )}
                  {storeInfo.socialMedia?.tiktok && (
                    <Text style={styles.socialLink}>TikTok: {storeInfo.socialMedia.tiktok}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {activeSection === 'settings' && (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <TouchableOpacity style={styles.settingsItem} onPress={handleReset}>
                <Ionicons name="refresh" size={24} color={colors.ui.warning} />
                <View style={styles.settingsItemContent}>
                  <Text style={styles.settingsItemTitle}>Reset to Defaults</Text>
                  <Text style={styles.settingsItemSubtitle}>
                    Restore all data to original state
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.appInfo}>
                <Text style={styles.appInfoTitle}>Yo-Vazaluza Admin</Text>
                <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {renderEditModal()}
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
    fontWeight: typography.fontWeights.bold,
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
    fontWeight: typography.fontWeights.semibold,
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
    fontWeight: typography.fontWeights.bold,
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
    fontWeight: typography.fontWeights.semibold,
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
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  galleryThumb: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  listItemSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  storeSection: {
    paddingBottom: spacing.xxl,
  },
  storeCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    ...shadows.small,
  },
  storeLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  storeValue: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  socialLinks: {
    marginTop: spacing.xs,
  },
  socialLink: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  settingsSection: {
    paddingBottom: spacing.xxl,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    ...shadows.small,
  },
  settingsItemContent: {
    marginLeft: spacing.md,
  },
  settingsItemTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
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
  },
  appInfoTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.muted,
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
    maxHeight: '80%',
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
    fontWeight: typography.fontWeights.bold,
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
  inputLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
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
    marginTop: spacing.md,
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
    fontWeight: typography.fontWeights.semibold,
  },
});

export default AdminScreen;
