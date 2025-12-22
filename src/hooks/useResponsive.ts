import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { BREAKPOINTS } from '../utils/responsive';

interface ResponsiveState {
  width: number;
  height: number;
  isTablet: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

const getResponsiveState = (window: ScaledSize): ResponsiveState => {
  const { width, height } = window;
  const isLandscape = width > height;

  return {
    width,
    height,
    isTablet: width >= BREAKPOINTS.tablet,
    isMobile: width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.desktop,
    isLandscape,
    deviceType:
      width >= BREAKPOINTS.desktop
        ? 'desktop'
        : width >= BREAKPOINTS.tablet
        ? 'tablet'
        : 'mobile',
  };
};

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() =>
    getResponsiveState(Dimensions.get('window'))
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setState(getResponsiveState(window));
    });

    return () => subscription?.remove();
  }, []);

  return state;
};

// Hook for responsive values that update on dimension changes
export const useResponsiveValue = <T>(mobile: T, tablet: T, desktop?: T): T => {
  const { deviceType } = useResponsive();

  if (deviceType === 'desktop' && desktop !== undefined) return desktop;
  if (deviceType === 'tablet') return tablet;
  return mobile;
};

// Hook for grid columns
export const useGridColumns = (minItemWidth: number = 160): number => {
  const { width, isTablet } = useResponsive();
  const padding = isTablet ? 48 : 32;
  const gap = isTablet ? 16 : 12;
  const availableWidth = width - padding;
  const columns = Math.floor((availableWidth + gap) / (minItemWidth + gap));
  return Math.max(2, Math.min(columns, 6));
};

export default useResponsive;
