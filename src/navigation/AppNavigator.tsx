import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
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

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Load banner image for sidebar header
let sidebarHeaderImage: any = null;
try {
  sidebarHeaderImage = require('../../assets/image.png');
} catch (e) {}

// Menu items configuration
const menuItems = [
  { name: 'Home', icon: 'home', iconFocused: 'home' },
  { name: 'Flavors', icon: 'ice-cream-outline', iconFocused: 'ice-cream' },
  { name: 'Toppings', icon: 'color-fill-outline', iconFocused: 'color-fill' },
  { name: 'Gallery', icon: 'images-outline', iconFocused: 'images' },
  { name: 'About', icon: 'information-circle-outline', iconFocused: 'information-circle' },
];

// Custom Sidebar Component
const CustomDrawerContent: React.FC<any> = (props) => {
  const { navigation, state } = props;
  const { isAdmin, setIsAdmin } = useApp();
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

  const currentRoute = state?.routeNames?.[state?.index] || 'Home';

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
        {menuItems.map((item, index) => {
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

// Header component for screens
const ScreenHeader: React.FC<{ navigation: any; title: string }> = ({ navigation, title }) => {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity
        style={headerStyles.menuButton}
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={24} color={colors.text.primary} />
      </TouchableOpacity>
      <Text style={headerStyles.title}>{title}</Text>
      <View style={headerStyles.spacer} />
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.text.muted + '15',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
});

// Drawer Navigator
const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: SCREEN_WIDTH > 768 ? 'permanent' : 'front',
        drawerStyle: {
          width: SCREEN_WIDTH > 768 ? 280 : 300,
          backgroundColor: colors.background.main,
        },
        overlayColor: 'rgba(0,0,0,0.5)',
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Flavors" component={FlavorsScreen} />
      <Drawer.Screen name="Toppings" component={ToppingsScreen} />
      <Drawer.Screen name="Gallery" component={GalleryScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
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
        <Stack.Screen name="Main" component={DrawerNavigator} />
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
