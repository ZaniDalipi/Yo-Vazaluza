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
import { BlurView } from 'expo-blur';
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

// Custom Sidebar Component for Web
const WebSidebar: React.FC<{ navigation: any; currentRoute: string }> = ({ navigation, currentRoute }) => {
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
            <Ionicons name="ice-cream" size={32} color={colors.accent.gold} />
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
                  size={22}
                  color={isActive ? colors.accent.gold : colors.text.secondary}
                />
              </View>
              <Text style={[
                sidebarStyles.menuText,
                isActive && sidebarStyles.menuTextActive,
              ]}>
                {item.name}
              </Text>
              {isActive && (
                <View style={sidebarStyles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Divider */}
        <View style={sidebarStyles.divider} />

        {/* Admin Section */}
        {isAdmin && (
          <TouchableOpacity
            style={sidebarStyles.menuItem}
            onPress={() => navigation.navigate('AdminPanel')}
            activeOpacity={0.7}
          >
            <View style={[sidebarStyles.menuIconContainer, sidebarStyles.adminIconContainer]}>
              <Ionicons name="settings" size={22} color={colors.accent.gold} />
            </View>
            <Text style={[sidebarStyles.menuText, sidebarStyles.adminText]}>
              Admin Panel
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={sidebarStyles.footer}>
        <View style={sidebarStyles.footerDivider} />
        <View style={sidebarStyles.footerContent}>
          <Ionicons name="location" size={16} color={colors.text.muted} />
          <Text style={sidebarStyles.footerText}>Kosovo</Text>
        </View>
        <Text style={sidebarStyles.copyright}>© 2024 Yo-Vazaluza Dalipi</Text>
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
    height: 180,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.accent.gold,
  },
  brandName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent.gold,
    letterSpacing: 4,
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconContainerActive: {
    backgroundColor: colors.accent.gold + '20',
  },
  adminIconContainer: {
    backgroundColor: colors.accent.gold + '15',
  },
  menuText: {
    fontSize: typography.fontSizes.md,
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
    width: 4,
    height: 24,
    backgroundColor: colors.accent.gold,
    borderRadius: 2,
    position: 'absolute',
    right: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.text.muted + '20',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.text.muted + '20',
    marginBottom: spacing.md,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
  copyright: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    marginTop: spacing.sm,
  },
});

// Web Layout with Sidebar
const WebLayout: React.FC<{ children: React.ReactNode; navigation: any; currentRoute: string }> = ({
  children,
  navigation,
  currentRoute
}) => {
  return (
    <View style={webLayoutStyles.container}>
      <View style={webLayoutStyles.sidebar}>
        <WebSidebar navigation={navigation} currentRoute={currentRoute} />
      </View>
      <View style={webLayoutStyles.content}>
        {children}
      </View>
    </View>
  );
};

const webLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
  },
  content: {
    flex: 1,
  },
});

// Screen wrapper for web that adds sidebar
const withWebLayout = (ScreenComponent: React.FC<any>, screenName: string) => {
  return (props: any) => {
    const screenWidth = useScreenWidth();
    const isWeb = screenWidth > 768;

    if (isWeb) {
      return (
        <WebLayout navigation={props.navigation} currentRoute={screenName}>
          <ScreenComponent {...props} />
        </WebLayout>
      );
    }

    return <ScreenComponent {...props} />;
  };
};

// Bottom Tab Navigator for Mobile
const MobileTabNavigator: React.FC = () => {
  const { isAdmin } = useApp();
  const [adminTapCount, setAdminTapCount] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

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
        tabBarIcon: ({ focused, color, size }) => {
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

// Web Tab Navigator (uses same screens but wrapped with sidebar)
const WebTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={withWebLayout(HomeScreen, 'Home')} />
      <Tab.Screen name="Flavors" component={withWebLayout(FlavorsScreen, 'Flavors')} />
      <Tab.Screen name="Toppings" component={withWebLayout(ToppingsScreen, 'Toppings')} />
      <Tab.Screen name="Gallery" component={withWebLayout(GalleryScreen, 'Gallery')} />
      <Tab.Screen name="About" component={withWebLayout(AboutScreen, 'About')} />
    </Tab.Navigator>
  );
};

// Responsive Main Navigator
const MainNavigator: React.FC = () => {
  const screenWidth = useScreenWidth();
  const isWeb = screenWidth > 768;

  return isWeb ? <WebTabNavigator /> : <MobileTabNavigator />;
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
