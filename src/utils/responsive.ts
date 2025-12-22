import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

// Device type detection
export const isTablet = SCREEN_WIDTH >= BREAKPOINTS.tablet;
export const isMobile = SCREEN_WIDTH < BREAKPOINTS.tablet;
export const isDesktop = SCREEN_WIDTH >= BREAKPOINTS.desktop;

// Get device type string
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (SCREEN_WIDTH >= BREAKPOINTS.desktop) return 'desktop';
  if (SCREEN_WIDTH >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
};

// Responsive scaling based on screen width
// Base width is 375 (iPhone X)
const BASE_WIDTH = 375;
const BASE_TABLET_WIDTH = 768;

// Scale value based on screen width (for mobile-first scaling)
export const scale = (size: number): number => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scaleRatio;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Moderate scale - less aggressive scaling for text
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Responsive value based on device type
export const responsive = <T>(mobile: T, tablet: T, desktop?: T): T => {
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet) return tablet;
  return mobile;
};

// Get number of columns for grid layouts
export const getGridColumns = (minItemWidth: number = 160): number => {
  const padding = isTablet ? 48 : 32;
  const gap = isTablet ? 16 : 12;
  const availableWidth = SCREEN_WIDTH - padding;
  const columns = Math.floor((availableWidth + gap) / (minItemWidth + gap));
  return Math.max(2, Math.min(columns, 6));
};

// Calculate card width based on columns
export const getCardWidth = (columns: number, gap: number = 12, padding: number = 16): number => {
  const totalGaps = (columns - 1) * gap;
  const totalPadding = padding * 2;
  return (SCREEN_WIDTH - totalGaps - totalPadding) / columns;
};

// Responsive font sizes
export const fontSizes = {
  xs: responsive(11, 12, 13),
  sm: responsive(13, 14, 15),
  md: responsive(15, 16, 17),
  lg: responsive(17, 19, 21),
  xl: responsive(20, 24, 28),
  xxl: responsive(24, 32, 40),
  hero: responsive(32, 48, 56),
};

// Responsive spacing
export const responsiveSpacing = {
  xs: responsive(4, 6, 8),
  sm: responsive(8, 12, 14),
  md: responsive(12, 16, 20),
  lg: responsive(16, 24, 28),
  xl: responsive(24, 32, 40),
  xxl: responsive(32, 48, 56),
};

// Responsive component sizes
export const componentSizes = {
  // Cup sizes
  cupWidth: responsive(140, 200, 240),
  cupHeight: responsive(160, 230, 280),

  // Card sizes
  cardMinWidth: responsive(150, 180, 200),
  cardMaxWidth: responsive(180, 220, 260),

  // Button sizes
  buttonHeight: responsive(48, 56, 60),
  iconButtonSize: responsive(44, 52, 56),

  // Modal sizes
  modalMaxWidth: responsive(SCREEN_WIDTH, 600, 700),
  modalMaxHeight: responsive('90%', '85%', '80%'),

  // Header sizes
  headerHeight: responsive(60, 72, 80),

  // Bottom nav
  bottomNavHeight: responsive(60, 72, 80),

  // Touch targets (minimum 44pt for accessibility)
  touchTarget: responsive(44, 48, 52),
};

// Layout helpers
export const layout = {
  // Content max width for tablet/desktop
  contentMaxWidth: responsive(SCREEN_WIDTH, 900, 1200),

  // Sidebar width for tablet admin
  sidebarWidth: responsive(0, 280, 320),

  // Number of columns for different layouts
  toppingColumns: responsive(2, 3, 4),
  flavorColumns: responsive(2, 3, 4),
  galleryColumns: responsive(2, 3, 4),
};

// Screen dimensions export
export { SCREEN_WIDTH, SCREEN_HEIGHT };

// Re-export for convenience
export default {
  isTablet,
  isMobile,
  isDesktop,
  getDeviceType,
  scale,
  moderateScale,
  responsive,
  getGridColumns,
  getCardWidth,
  fontSizes,
  responsiveSpacing,
  componentSizes,
  layout,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  BREAKPOINTS,
};
