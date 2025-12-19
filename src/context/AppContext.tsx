import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Flavor, Topping, GalleryImage, StoreInfo, Promotion, AppData } from '../types';
import {
  defaultFlavors,
  defaultToppings,
  defaultGallery,
  defaultStoreInfo,
  defaultPromotions,
} from '../data/defaultData';

interface AppContextType {
  flavors: Flavor[];
  toppings: Topping[];
  gallery: GalleryImage[];
  storeInfo: StoreInfo;
  promotions: Promotion[];
  isAdmin: boolean;
  isLoading: boolean;

  // Admin actions
  setAdminMode: (isAdmin: boolean) => void;
  updateFlavor: (flavor: Flavor) => void;
  addFlavor: (flavor: Flavor) => void;
  deleteFlavor: (id: string) => void;
  updateTopping: (topping: Topping) => void;
  addTopping: (topping: Topping) => void;
  deleteTopping: (id: string) => void;
  updateGalleryImage: (image: GalleryImage) => void;
  addGalleryImage: (image: GalleryImage) => void;
  deleteGalleryImage: (id: string) => void;
  updateStoreInfo: (info: StoreInfo) => void;
  updatePromotion: (promo: Promotion) => void;
  addPromotion: (promo: Promotion) => void;
  deletePromotion: (id: string) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = '@yo_vazaluza_data';
const ADMIN_KEY = '@yo_vazaluza_admin';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flavors, setFlavors] = useState<Flavor[]>(defaultFlavors);
  const [toppings, setToppings] = useState<Topping[]>(defaultToppings);
  const [gallery, setGallery] = useState<GalleryImage[]>(defaultGallery);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultStoreInfo);
  const [promotions, setPromotions] = useState<Promotion[]>(defaultPromotions);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [flavors, toppings, gallery, storeInfo, promotions]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const data: AppData = JSON.parse(storedData);
        setFlavors(data.flavors || defaultFlavors);
        setToppings(data.toppings || defaultToppings);
        setGallery(data.gallery || defaultGallery);
        setStoreInfo(data.storeInfo || defaultStoreInfo);
        setPromotions(data.promotions || defaultPromotions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    try {
      const data: AppData = { flavors, toppings, gallery, storeInfo, promotions };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const setAdminMode = async (admin: boolean) => {
    setIsAdmin(admin);
    await AsyncStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  };

  // Flavor operations
  const updateFlavor = (flavor: Flavor) => {
    setFlavors(prev => prev.map(f => (f.id === flavor.id ? flavor : f)));
  };

  const addFlavor = (flavor: Flavor) => {
    setFlavors(prev => [...prev, { ...flavor, id: Date.now().toString() }]);
  };

  const deleteFlavor = (id: string) => {
    setFlavors(prev => prev.filter(f => f.id !== id));
  };

  // Topping operations
  const updateTopping = (topping: Topping) => {
    setToppings(prev => prev.map(t => (t.id === topping.id ? topping : t)));
  };

  const addTopping = (topping: Topping) => {
    setToppings(prev => [...prev, { ...topping, id: Date.now().toString() }]);
  };

  const deleteTopping = (id: string) => {
    setToppings(prev => prev.filter(t => t.id !== id));
  };

  // Gallery operations
  const updateGalleryImage = (image: GalleryImage) => {
    setGallery(prev => prev.map(g => (g.id === image.id ? image : g)));
  };

  const addGalleryImage = (image: GalleryImage) => {
    setGallery(prev => [...prev, { ...image, id: Date.now().toString() }]);
  };

  const deleteGalleryImage = (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
  };

  // Store info operations
  const updateStoreInfo = (info: StoreInfo) => {
    setStoreInfo(info);
  };

  // Promotion operations
  const updatePromotion = (promo: Promotion) => {
    setPromotions(prev => prev.map(p => (p.id === promo.id ? promo : p)));
  };

  const addPromotion = (promo: Promotion) => {
    setPromotions(prev => [...prev, { ...promo, id: Date.now().toString() }]);
  };

  const deletePromotion = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    setFlavors(defaultFlavors);
    setToppings(defaultToppings);
    setGallery(defaultGallery);
    setStoreInfo(defaultStoreInfo);
    setPromotions(defaultPromotions);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        flavors,
        toppings,
        gallery,
        storeInfo,
        promotions,
        isAdmin,
        isLoading,
        setAdminMode,
        updateFlavor,
        addFlavor,
        deleteFlavor,
        updateTopping,
        addTopping,
        deleteTopping,
        updateGalleryImage,
        addGalleryImage,
        deleteGalleryImage,
        updateStoreInfo,
        updatePromotion,
        addPromotion,
        deletePromotion,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
