import { Flavor, Topping, GalleryImage, StoreInfo, Promotion } from '../types';

export const defaultFlavors: Flavor[] = [
  {
    id: '1',
    name: 'Chocolate',
    description: 'Vegan, a rich masterpiece to indulge the senses',
    color: '#4A3728',
    imageUrl: 'chocolate',
    isVegan: true,
  },
  {
    id: '2',
    name: 'Vanilla Dream',
    description: 'Classic creamy vanilla, pure bliss in every bite',
    color: '#F5E6D3',
    imageUrl: 'vanilla',
    isVegan: false,
  },
  {
    id: '3',
    name: 'Caramel Swirl',
    description: 'Golden caramel perfection with hints of sea salt',
    color: '#C9A962',
    imageUrl: 'caramel',
    isVegan: false,
  },
  {
    id: '4',
    name: 'Cookies & Cream',
    description: 'Crushed cookies in smooth cream base',
    color: '#A0927D',
    imageUrl: 'cookies',
    isVegan: false,
  },
  {
    id: '5',
    name: 'Strawberry Bliss',
    description: 'Fresh strawberry burst, naturally sweet',
    color: '#E8A0A0',
    imageUrl: 'strawberry',
    isVegan: true,
    isNew: true,
  },
  {
    id: '6',
    name: 'Mango Tango',
    description: 'Tropical mango paradise, refreshingly exotic',
    color: '#FFB347',
    imageUrl: 'mango',
    isVegan: true,
  },
  {
    id: '7',
    name: 'Pistachio Dream',
    description: 'Premium pistachio, nutty and sophisticated',
    color: '#93C572',
    imageUrl: 'pistachio',
    isVegan: false,
    isNew: true,
  },
  {
    id: '8',
    name: 'Blueberry Burst',
    description: 'Wild blueberry explosion, antioxidant rich',
    color: '#7B9BC7',
    imageUrl: 'blueberry',
    isVegan: true,
  },
];

export const defaultToppings: Topping[] = [
  // Fruits
  { id: '1', name: 'Fresh Strawberries', category: 'fruits', imageUrl: 'strawberry', emoji: '🍓', color: '#E53935', pricePerGram: 0.08, maxGrams: 30 },
  { id: '2', name: 'Blueberries', category: 'fruits', imageUrl: 'blueberry', emoji: '🫐', color: '#3949AB', pricePerGram: 0.10, maxGrams: 25 },
  { id: '3', name: 'Mango Chunks', category: 'fruits', imageUrl: 'mango', emoji: '🥭', color: '#FF9800', pricePerGram: 0.08, maxGrams: 30 },
  { id: '4', name: 'Banana Slices', category: 'fruits', imageUrl: 'banana', emoji: '🍌', color: '#FDD835', pricePerGram: 0.06, maxGrams: 35 },
  { id: '17', name: 'Kiwi', category: 'fruits', imageUrl: 'kiwi', emoji: '🥝', color: '#8BC34A', pricePerGram: 0.09, maxGrams: 25 },
  { id: '18', name: 'Raspberries', category: 'fruits', imageUrl: 'raspberries', emoji: '🍒', color: '#E91E63', pricePerGram: 0.12, maxGrams: 25 },
  { id: '19', name: 'Pineapple', category: 'fruits', imageUrl: 'pineapple', emoji: '🍍', color: '#FFCA28', pricePerGram: 0.07, maxGrams: 30 },
  { id: '20', name: 'Cherries', category: 'fruits', imageUrl: 'cherries', emoji: '🍒', color: '#C62828', pricePerGram: 0.10, maxGrams: 20 },
  { id: '21', name: 'Coconut Flakes', category: 'fruits', imageUrl: 'coconut', emoji: '🥥', color: '#FAFAFA', pricePerGram: 0.06, maxGrams: 25 },
  { id: '22', name: 'Grapes', category: 'fruits', imageUrl: 'grapes', emoji: '🍇', color: '#7B1FA2', pricePerGram: 0.08, maxGrams: 30 },

  // Candy & Sweets
  { id: '5', name: 'M&Ms', category: 'candy', imageUrl: 'mms', emoji: '🍬', color: '#E91E63', pricePerGram: 0.08, maxGrams: 25 },
  { id: '6', name: 'Gummy Bears', category: 'candy', imageUrl: 'gummy', emoji: '🐻', color: '#FF5722', pricePerGram: 0.07, maxGrams: 30 },
  { id: '7', name: 'Sprinkles', category: 'candy', imageUrl: 'sprinkles', emoji: '✨', color: '#9C27B0', pricePerGram: 0.05, maxGrams: 20 },
  { id: '8', name: 'Cookie Crumbs', category: 'candy', imageUrl: 'cookie_crumbs', emoji: '🍪', color: '#795548', pricePerGram: 0.06, maxGrams: 30 },
  { id: '23', name: 'Oreo Pieces', category: 'candy', imageUrl: 'oreo', emoji: '🍪', color: '#424242', pricePerGram: 0.07, maxGrams: 25 },
  { id: '24', name: 'Chocolate Chips', category: 'candy', imageUrl: 'choco_chips', emoji: '🍫', color: '#5D4037', pricePerGram: 0.07, maxGrams: 25 },
  { id: '25', name: 'Mini Marshmallows', category: 'candy', imageUrl: 'marshmallows', emoji: '☁️', color: '#FAFAFA', pricePerGram: 0.05, maxGrams: 30 },
  { id: '26', name: 'Brownie Bites', category: 'candy', imageUrl: 'brownie', emoji: '🍫', color: '#4E342E', pricePerGram: 0.09, maxGrams: 25 },
  { id: '27', name: 'Wafer Pieces', category: 'candy', imageUrl: 'wafer', emoji: '🧇', color: '#D4A574', pricePerGram: 0.06, maxGrams: 25 },
  { id: '28', name: 'Candy Cane Bits', category: 'candy', imageUrl: 'candy_cane', emoji: '🍭', color: '#E53935', pricePerGram: 0.06, maxGrams: 20 },

  // Nuts
  { id: '9', name: 'Almonds', category: 'nuts', imageUrl: 'almonds', emoji: '🌰', color: '#A1887F', pricePerGram: 0.15, maxGrams: 20 },
  { id: '10', name: 'Walnuts', category: 'nuts', imageUrl: 'walnuts', emoji: '🥜', color: '#8D6E63', pricePerGram: 0.15, maxGrams: 20 },
  { id: '11', name: 'Peanuts', category: 'nuts', imageUrl: 'peanuts', emoji: '🥜', color: '#D4A574', pricePerGram: 0.12, maxGrams: 25 },
  { id: '29', name: 'Cashews', category: 'nuts', imageUrl: 'cashews', emoji: '🥜', color: '#FFCC80', pricePerGram: 0.18, maxGrams: 20 },
  { id: '30', name: 'Pecans', category: 'nuts', imageUrl: 'pecans', emoji: '🌰', color: '#6D4C41', pricePerGram: 0.16, maxGrams: 20 },
  { id: '31', name: 'Hazelnuts', category: 'nuts', imageUrl: 'hazelnuts', emoji: '🌰', color: '#795548', pricePerGram: 0.14, maxGrams: 20 },

  // Sauces
  { id: '12', name: 'Chocolate Sauce', category: 'sauces', imageUrl: 'chocolate_sauce', emoji: '🍫', color: '#5C4033', pricePerGram: 0.04, maxGrams: 40 },
  { id: '13', name: 'Caramel Drizzle', category: 'sauces', imageUrl: 'caramel_sauce', emoji: '🍯', color: '#D4A574', pricePerGram: 0.04, maxGrams: 40 },
  { id: '14', name: 'Strawberry Sauce', category: 'sauces', imageUrl: 'strawberry_sauce', emoji: '🍓', color: '#E53935', pricePerGram: 0.04, maxGrams: 40 },
  { id: '32', name: 'Peanut Butter', category: 'sauces', imageUrl: 'peanut_butter', emoji: '🥜', color: '#C19A6B', pricePerGram: 0.05, maxGrams: 35 },
  { id: '33', name: 'Maple Syrup', category: 'sauces', imageUrl: 'maple_syrup', emoji: '🍁', color: '#D4A574', pricePerGram: 0.05, maxGrams: 35 },
  { id: '34', name: 'Honey', category: 'sauces', imageUrl: 'honey', emoji: '🍯', color: '#FFB300', pricePerGram: 0.05, maxGrams: 35 },

  // Cereals
  { id: '15', name: 'Fruity Pebbles', category: 'cereals', imageUrl: 'fruity_pebbles', emoji: '🌈', color: '#9C27B0', pricePerGram: 0.04, maxGrams: 35 },
  { id: '16', name: 'Granola', category: 'cereals', imageUrl: 'granola', emoji: '🥣', color: '#C9B896', pricePerGram: 0.05, maxGrams: 35 },
  { id: '35', name: 'Corn Flakes', category: 'cereals', imageUrl: 'corn_flakes', emoji: '🌽', color: '#FFC107', pricePerGram: 0.03, maxGrams: 35 },
  { id: '36', name: 'Rice Krispies', category: 'cereals', imageUrl: 'rice_krispies', emoji: '🍚', color: '#FFF8E1', pricePerGram: 0.03, maxGrams: 35 },
  { id: '37', name: 'Cinnamon Cereal', category: 'cereals', imageUrl: 'cinnamon', emoji: '🔥', color: '#BF360C', pricePerGram: 0.04, maxGrams: 30 },
];

export const defaultGallery: GalleryImage[] = [
  { id: '1', title: 'Our Store Front', imageUrl: 'store_front', category: 'store' },
  { id: '2', title: 'Interior Design', imageUrl: 'interior', category: 'store' },
  { id: '3', title: 'Toppings Station', imageUrl: 'toppings_station', category: 'store' },
  { id: '4', title: 'Chocolate Delight', imageUrl: 'chocolate_product', category: 'products' },
  { id: '5', title: 'Vanilla Creation', imageUrl: 'vanilla_product', category: 'products' },
  { id: '6', title: 'Colorful Toppings', imageUrl: 'colorful_toppings', category: 'products' },
  { id: '7', title: 'Happy Customers', imageUrl: 'customers', category: 'moments' },
  { id: '8', title: 'Family Time', imageUrl: 'family', category: 'moments' },
];

export const defaultStoreInfo: StoreInfo = {
  name: 'Yo-Vazaluza',
  tagline: 'Treat Yourself! Delicious & Refreshing Fro-Yo!',
  description: 'Experience the finest frozen yogurt crafted with love and premium ingredients. Our self-serve concept lets you create your perfect treat with endless flavor and topping combinations.',
  address: 'Dalipi Family Store',
  phone: '+383 XX XXX XXX',
  email: 'info@yo-vazaluza.com',
  hours: {
    weekdays: '10:00 AM - 10:00 PM',
    weekends: '11:00 AM - 11:00 PM',
  },
  socialMedia: {
    instagram: '@yovazaluza',
    facebook: 'YoVazaluza',
    tiktok: '@yovazaluza',
  },
};

export const defaultPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Happy Hour',
    description: 'Get 20% off all flavors between 3-5 PM!',
    isActive: true,
    validUntil: '2024-12-31',
  },
  {
    id: '2',
    title: 'Family Deal',
    description: 'Buy 3 cups, get 1 FREE!',
    isActive: true,
  },
];
