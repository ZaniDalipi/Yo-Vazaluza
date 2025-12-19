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
  { id: '1', name: 'Fresh Strawberries', category: 'fruits', imageUrl: 'strawberry' },
  { id: '2', name: 'Blueberries', category: 'fruits', imageUrl: 'blueberry' },
  { id: '3', name: 'Mango Chunks', category: 'fruits', imageUrl: 'mango' },
  { id: '4', name: 'Banana Slices', category: 'fruits', imageUrl: 'banana' },
  { id: '5', name: 'M&Ms', category: 'candy', imageUrl: 'mms' },
  { id: '6', name: 'Gummy Bears', category: 'candy', imageUrl: 'gummy' },
  { id: '7', name: 'Sprinkles', category: 'candy', imageUrl: 'sprinkles' },
  { id: '8', name: 'Cookie Crumbs', category: 'candy', imageUrl: 'cookie_crumbs' },
  { id: '9', name: 'Almonds', category: 'nuts', imageUrl: 'almonds' },
  { id: '10', name: 'Walnuts', category: 'nuts', imageUrl: 'walnuts' },
  { id: '11', name: 'Peanuts', category: 'nuts', imageUrl: 'peanuts' },
  { id: '12', name: 'Chocolate Sauce', category: 'sauces', imageUrl: 'chocolate_sauce' },
  { id: '13', name: 'Caramel Drizzle', category: 'sauces', imageUrl: 'caramel_sauce' },
  { id: '14', name: 'Strawberry Sauce', category: 'sauces', imageUrl: 'strawberry_sauce' },
  { id: '15', name: 'Fruity Pebbles', category: 'cereals', imageUrl: 'fruity_pebbles' },
  { id: '16', name: 'Granola', category: 'cereals', imageUrl: 'granola' },
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
