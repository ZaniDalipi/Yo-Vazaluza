import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  image?: any;
  height?: number;
  overlay?: boolean;
  children?: React.ReactNode;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  image,
  height = 280,
  overlay = true,
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.1)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderContent = () => (
    <View style={styles.content}>
      {title && (
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {title}
        </Animated.Text>
      )}
      {subtitle && (
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {subtitle}
        </Animated.Text>
      )}
      {children}
    </View>
  );

  // If no image or image failed to load, show gradient fallback
  if (!image || imageError) {
    return (
      <View style={[styles.container, { height }]}>
        <LinearGradient
          colors={[colors.primary.darkGray, colors.primary.gray, colors.accent.wood]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {overlay && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFill}
          />
        )}
        {renderContent()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ImageBackground
          source={image}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImageError(true)}
        >
          {overlay && (
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
              style={StyleSheet.absoluteFill}
            />
          )}
        </ImageBackground>
      </Animated.View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSizes.title,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.light,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.light,
    marginTop: spacing.xs,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default HeroBanner;
