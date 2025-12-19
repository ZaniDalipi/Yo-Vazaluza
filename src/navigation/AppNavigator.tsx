import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
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
import { colors, spacing, typography, borderRadius } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom animated tab bar icon
const AnimatedTabIcon: React.FC<{
  name: string;
  focused: boolean;
  color: string;
}> = ({ name, focused, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Ionicons name={name as any} size={24} color={color} />
    </Animated.View>
  );
};

// Custom tab bar with blur effect
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

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="light" style={styles.blurView}>
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
                  <View style={[styles.centerTabInner, isFocused && styles.centerTabActive]}>
                    <Ionicons
                      name="ice-cream"
                      size={28}
                      color={isFocused ? colors.text.light : colors.accent.gold}
                    />
                  </View>
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
                  color={isFocused ? colors.accent.gold : colors.text.muted}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.accent.gold : colors.text.muted },
                  ]}
                >
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
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

const AppNavigator: React.FC = () => {
  const { isAdmin } = useApp();

  return (
    <NavigationContainer>
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
  },
  blurView: {
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
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
    fontWeight: typography.fontWeights.medium,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.lg,
  },
  centerTabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.accent.gold,
  },
  centerTabActive: {
    backgroundColor: colors.accent.gold,
  },
});

export default AppNavigator;
