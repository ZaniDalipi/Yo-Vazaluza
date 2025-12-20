import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  HomeScreen,
  FlavorsScreen,
  GalleryScreen,
  ToppingsScreen,
  AboutScreen,
  AdminLoginScreen,
  AdminScreen,
} from '../screens';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Load banner image for sidebar header
let sidebarHeaderImage: any = null;
try {
  sidebarHeaderImage = require('../../assets/image.png');
} catch (e) {}

// Menu items configuration
const menuItems = [
  { name: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'Flavors', icon: 'ice-cream-outline', iconFocused: 'ice-cream' },
  { name: 'Toppings', icon: 'color-fill-outline', iconFocused: 'color-fill' },
  { name: 'Gallery', icon: 'images-outline', iconFocused: 'images' },
  { name: 'About', icon: 'information-circle-outline', iconFocused: 'information-circle' },
];

// Hook to detect screen width changes
const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  return screenWidth;
};

// Get layout type based on screen width
const getLayoutType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// ============================================
// TOP NAVIGATION BAR FOR DESKTOP
// ============================================
const TopNavBar: React.FC<{ navigation: any; currentRoute: string }> = ({ navigation, currentRoute }) => {
  const { isAdmin } = useApp();
  const [adminTapCount, setAdminTapCount] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLogoPress = () => {
    setAdminTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        navigation.navigate('AdminLogin');
        return 0;
      }
      return newCount;
    });

    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }
    tapTimeout.current = setTimeout(() => {
      setAdminTapCount(0);
    }, 2000);
  };

  return (
    <View style={topNavStyles.container}>
      <View style={topNavStyles.inner}>
        {/* Logo */}
        <TouchableOpacity onPress={handleLogoPress} style={topNavStyles.logoContainer}>
          <View style={topNavStyles.logoIcon}>
            <Ionicons name="ice-cream" size={24} color={colors.accent.gold} />
          </View>
          <Text style={topNavStyles.logoText}>Yo-Vazaluza</Text>
        </TouchableOpacity>

        {/* Navigation Links */}
        <View style={topNavStyles.navLinks}>
          {menuItems.map((item) => {
            const isActive = currentRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[topNavStyles.navLink, isActive && topNavStyles.navLinkActive]}
                onPress={() => navigation.navigate(item.name)}
              >
                <Ionicons
                  name={isActive ? item.iconFocused as any : item.icon as any}
                  size={18}
                  color={isActive ? colors.accent.gold : colors.text.secondary}
                  style={topNavStyles.navIcon}
                />
                <Text style={[topNavStyles.navLinkText, isActive && topNavStyles.navLinkTextActive]}>
                  {item.name}
                </Text>
                {isActive && <View style={topNavStyles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right side - Admin link if admin */}
        <View style={topNavStyles.rightSection}>
          {isAdmin && (
            <TouchableOpacity
              style={topNavStyles.adminButton}
              onPress={() => navigation.navigate('AdminPanel')}
            >
              <Ionicons name="settings" size={18} color={colors.accent.gold} />
              <Text style={topNavStyles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const topNavStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    ...shadows.small,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    position: 'relative',
  },
  navLinkActive: {
    backgroundColor: colors.accent.gold + '10',
  },
  navIcon: {
    marginRight: spacing.xs,
  },
  navLinkText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  navLinkTextActive: {
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    height: 2,
    backgroundColor: colors.accent.gold,
    borderRadius: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent.gold + '15',
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  adminButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    fontWeight: typography.fontWeights.semibold,
  },
});

// ============================================
// SIDEBAR FOR TABLET
// ============================================
const TabletSidebar: React.FC<{ navigation: any; currentRoute: string }> = ({ navigation, currentRoute }) => {
  const { isAdmin } = useApp();
  const [adminTapCount, setAdminTapCount] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLogoPress = () => {
    setAdminTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        navigation.navigate('AdminLogin');
        return 0;
      }
      return newCount;
    });

    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }
    tapTimeout.current = setTimeout(() => {
      setAdminTapCount(0);
    }, 2000);
  };

  return (
    <View style={sidebarStyles.container}>
      {/* Header with Image */}
      <TouchableOpacity
        onPress={handleLogoPress}
        activeOpacity={0.9}
        style={sidebarStyles.headerContainer}
      >
        {sidebarHeaderImage ? (
          <Image
            source={sidebarHeaderImage}
            style={sidebarStyles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={colors.gradients.golden}
            style={sidebarStyles.headerImage}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={sidebarStyles.headerOverlay}
        >
          <View style={sidebarStyles.logoContainer}>
            <Ionicons name="ice-cream" size={28} color={colors.accent.gold} />
          </View>
          <Text style={sidebarStyles.brandName}>Yo-Vazaluza</Text>
          <Text style={sidebarStyles.brandTagline}>DALIPI</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Navigation Menu */}
      <ScrollView style={sidebarStyles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                sidebarStyles.menuItem,
                isActive && sidebarStyles.menuItemActive,
              ]}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.7}
            >
              {isActive && (
                <LinearGradient
                  colors={[colors.accent.gold + '20', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={sidebarStyles.activeBackground}
                />
              )}
              <View style={[
                sidebarStyles.menuIconContainer,
                isActive && sidebarStyles.menuIconContainerActive,
              ]}>
                <Ionicons
                  name={isActive ? item.iconFocused as any : item.icon as any}
                  size={20}
                  color={isActive ? colors.accent.gold : colors.text.secondary}
                />
              </View>
              <Text style={[
                sidebarStyles.menuText,
                isActive && sidebarStyles.menuTextActive,
              ]}>
                {item.name}
              </Text>
              {isActive && <View style={sidebarStyles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <View style={sidebarStyles.divider} />
            <TouchableOpacity
              style={sidebarStyles.menuItem}
              onPress={() => navigation.navigate('AdminPanel')}
              activeOpacity={0.7}
            >
              <View style={[sidebarStyles.menuIconContainer, sidebarStyles.adminIconContainer]}>
                <Ionicons name="settings" size={20} color={colors.accent.gold} />
              </View>
              <Text style={[sidebarStyles.menuText, sidebarStyles.adminText]}>
                Admin Panel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={sidebarStyles.footer}>
        <Text style={sidebarStyles.copyright}>© 2024 Yo-Vazaluza</Text>
      </View>
    </View>
  );
};

const sidebarStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderRightWidth: 1,
    borderRightColor: colors.ui.border,
  },
  headerContainer: {
    height: 140,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.accent.gold,
  },
  brandName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
  },
  brandTagline: {
    fontSize: typography.fontSizes.xs,
    color: colors.accent.gold,
    letterSpacing: 3,
  },
  menuContainer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    marginVertical: 2,
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemActive: {
    backgroundColor: colors.accent.gold + '10',
  },
  activeBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuIconContainerActive: {
    backgroundColor: colors.accent.gold + '20',
  },
  adminIconContainer: {
    backgroundColor: colors.accent.gold + '15',
  },
  menuText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
    flex: 1,
  },
  menuTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  adminText: {
    color: colors.accent.gold,
  },
  activeIndicator: {
    width: 3,
    height: 20,
    backgroundColor: colors.accent.gold,
    borderRadius: 2,
    position: 'absolute',
    right: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.text.muted + '20',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
  },
  copyright: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
});

// ============================================
// LAYOUT WRAPPERS
// ============================================

// Desktop Layout with Top Nav
const DesktopLayout: React.FC<{ children: React.ReactNode; navigation: any; currentRoute: string }> = ({
  children,
  navigation,
  currentRoute
}) => {
  return (
    <View style={{ flex: 1 }}>
      <TopNavBar navigation={navigation} currentRoute={currentRoute} />
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

// Tablet Layout with Sidebar
const TabletLayout: React.FC<{ children: React.ReactNode; navigation: any; currentRoute: string }> = ({
  children,
  navigation,
  currentRoute
}) => {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ width: 220 }}>
        <TabletSidebar navigation={navigation} currentRoute={currentRoute} />
      </View>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
};

// Screen wrapper that applies the correct layout
const withResponsiveLayout = (ScreenComponent: React.FC<any>, screenName: string) => {
  return (props: any) => {
    const screenWidth = useScreenWidth();
    const layoutType = getLayoutType(screenWidth);

    if (layoutType === 'desktop') {
      return (
        <DesktopLayout navigation={props.navigation} currentRoute={screenName}>
          <ScreenComponent {...props} />
        </DesktopLayout>
      );
    }

    if (layoutType === 'tablet') {
      return (
        <TabletLayout navigation={props.navigation} currentRoute={screenName}>
          <ScreenComponent {...props} />
        </TabletLayout>
      );
    }

    // Mobile - no wrapper, uses bottom tabs
    return <ScreenComponent {...props} />;
  };
};

// ============================================
// NAVIGATORS
// ============================================

// Bottom Tab Navigator for Mobile
const MobileTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...shadows.medium,
        },
        tabBarActiveTintColor: colors.accent.gold,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          const item = menuItems.find(m => m.name === route.name);
          if (!item) return null;
          return (
            <Ionicons
              name={focused ? item.iconFocused as any : item.icon as any}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Flavors" component={FlavorsScreen} />
      <Tab.Screen name="Toppings" component={ToppingsScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
};

// Tab Navigator for Tablet/Desktop (tabs hidden, layout wrapper handles nav)
const ResponsiveTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={withResponsiveLayout(HomeScreen, 'Home')} />
      <Tab.Screen name="Flavors" component={withResponsiveLayout(FlavorsScreen, 'Flavors')} />
      <Tab.Screen name="Toppings" component={withResponsiveLayout(ToppingsScreen, 'Toppings')} />
      <Tab.Screen name="Gallery" component={withResponsiveLayout(GalleryScreen, 'Gallery')} />
      <Tab.Screen name="About" component={withResponsiveLayout(AboutScreen, 'About')} />
    </Tab.Navigator>
  );
};

// Main Navigator that switches based on screen size
const MainNavigator: React.FC = () => {
  const screenWidth = useScreenWidth();
  const layoutType = getLayoutType(screenWidth);

  // Mobile uses bottom tabs
  if (layoutType === 'mobile') {
    return <MobileTabNavigator />;
  }

  // Tablet and Desktop use responsive layout
  return <ResponsiveTabNavigator />;
};

// Web URL linking configuration
const linking = {
  prefixes: ['https://yo-vazaluza.com', 'yovazaluza://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: '',
          Flavors: 'flavors',
          Toppings: 'toppings',
          Gallery: 'gallery',
          About: 'about',
        },
      },
      AdminLogin: 'admin',
      AdminPanel: 'admin/panel',
    },
  },
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer linking={Platform.OS === 'web' ? linking : undefined}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      >
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />
        <Stack.Screen name="AdminPanel" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
