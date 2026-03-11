export interface Flavor {
  id: string;
  name: string;
  description: string;
  color: string;
  imageUrl: string;
  isVegan?: boolean;
  isNew?: boolean;
  calories?: number;
}

export interface Topping {
  id: string;
  name: string;
  category: 'fruits' | 'candy' | 'nuts' | 'sauces' | 'cereals';
  imageUrl: string;
  price?: number;
  pricePerGram?: number; // Price per gram for weight-based pricing
  maxGrams?: number; // Maximum grams allowed (default 30)
  emoji?: string; // Emoji representation
  color?: string; // Display color
}

// Topping with selected quantity
export interface ToppingSelection {
  topping: Topping;
  grams: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  category: 'store' | 'products' | 'moments';
}

export interface StoreInfo {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    weekends: string;
  };
  socialMedia: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export interface AppData {
  flavors: Flavor[];
  toppings: Topping[];
  gallery: GalleryImage[];
  storeInfo: StoreInfo;
  promotions: Promotion[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  validUntil?: string;
  isActive: boolean;
}

// Order Flow Types
export interface CupSize {
  id: string;
  name: string;
  size: 'small' | 'medium' | 'large';
  price: number;
  ounces: number;
  emoji: string;
}

export interface OrderState {
  cupSize: CupSize | null;
  flavors: Flavor[];
  toppings: ToppingSelection[];
  sauces: Topping[];
}

export type OrderStep = 'size' | 'flavors' | 'toppings' | 'sauces' | 'review';
