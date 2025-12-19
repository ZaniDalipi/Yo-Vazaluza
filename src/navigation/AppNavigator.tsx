import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Platform,
  ImageBackground,
  Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
import { colors, spacing, typography, borderRadius } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Try to load store image for tab bar background
let storeInteriorImage: any = null;
try {
  storeInteriorImage = require('../../assets/images/store-interior.jpg');
} catch (e) {
  // Image not found
}

// Custom animated tab bar icon
const AnimatedTabIcon: React.FC<{
  name: string;
  focused: boolean;
  color: string;
}> = ({ name, focused, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.2 : 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={iconStyles.container}>
      {focused && (
        <Animated.View
          style={[
            iconStyles.glow,
            {
              opacity: glowAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      )}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons name={name as any} size={24} color={color} />
      </Animated.View>
    </View>
  );
};

const iconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.gold + '30',
  },
});

// Custom tab bar with blur effect and store image background
const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  // Secret admin access - tap 5 times on the logo area
  const [tapCount, setTapCount] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSecretTap = () => {
    setTapCount((prev) => {
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
      setTapCount(0);
    }, 2000);
  };

  const renderTabBarContent = () => (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = getIconName(route.name, isFocused);

        // Center tab (logo) with secret admin access
        if (index === 2) {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.centerTab}
              onPress={() => {
                handleSecretTap();
                onPress();
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  isFocused
                    ? [colors.accent.gold, colors.accent.wood]
                    : [colors.background.card, colors.background.card]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.centerTabInner, isFocused && styles.centerTabActive]}
              >
                <Ionicons
                  name="ice-cream"
                  size={28}
                  color={isFocused ? colors.text.light : colors.accent.gold}
                />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <AnimatedTabIcon
              name={iconName}
              focused={isFocused}
              color={isFocused ? colors.accent.gold : colors.text.light}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? colors.accent.gold : colors.text.light,
                  fontWeight: isFocused ? '600' : '400',
                },
              ]}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render with store image background
  if (storeInteriorImage && Platform.OS !== 'web') {
    return (
      <View style={styles.tabBarContainer}>
        <ImageBackground
          source={storeInteriorImage}
          style={styles.tabBarBackground}
          resizeMode="cover"
        >
          <BlurView intensity={90} tint="dark" style={styles.blurOverlay}>
            <LinearGradient
              colors={['rgba(44,44,44,0.85)', 'rgba(74,74,74,0.95)']}
              style={styles.gradientOverlay}
            >
              {renderTabBarContent()}
            </LinearGradient>
          </BlurView>
        </ImageBackground>
      </View>
    );
  }

  // Web fallback or no image
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={[colors.primary.darkGray, colors.primary.gray]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.webTabBarBackground}
      >
        {renderTabBarContent()}
      </LinearGradient>
    </View>
  );
};

const getIconName = (routeName: string, focused: boolean): string => {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Flavors':
      return focused ? 'color-palette' : 'color-palette-outline';
    case 'Toppings':
      return focused ? 'nutrition' : 'nutrition-outline';
    case 'Gallery':
      return focused ? 'images' : 'images-outline';
    case 'About':
      return focused ? 'information-circle' : 'information-circle-outline';
    default:
      return 'ellipse';
  }
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Flavors" component={FlavorsScreen} />
      <Tab.Screen name="Toppings" component={ToppingsScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
};

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
  const { isAdmin } = useApp();

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
        <Stack.Screen name="Main" component={MainTabs} />
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

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  tabBarBackground: {
    width: '100%',
  },
  blurOverlay: {
    width: '100%',
  },
  gradientOverlay: {
    width: '100%',
  },
  webTabBarBackground: {
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 169, 98, 0.3)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  tabLabel: {
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.xl,
  },
  centerTabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
    borderColor: colors.accent.gold,
  },
  centerTabActive: {
    borderColor: colors.accent.wood,
  },
});

export default AppNavigator;
