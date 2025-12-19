# Yo-Vazaluza - Frozen Yogurt App

A beautiful, interactive mobile application for Yo-Vazaluza Dalipi frozen yogurt business built with React Native and Expo.

## Features

- **Interactive Flavor Slider**: Swipe through our delicious frozen yogurt flavors with beautiful animated cards
- **Toppings Showcase**: Browse all available toppings organized by category
- **Gallery**: View photos of our store, products, and happy moments
- **About Section**: Learn about our story, find our location, and connect on social media
- **Magical Animations**: Floating particles, animated logo, smooth transitions throughout
- **Secret Admin Panel**: Hidden admin access (tap the center tab 5 times) to manage app content

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Expo Linear Gradient** for beautiful gradients
- **Expo Blur** for glassmorphism effects
- **AsyncStorage** for persistent data storage

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan QR code with Expo Go app on your device

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnimatedLogo.tsx
│   ├── AnimatedButton.tsx
│   ├── FlavorCard.tsx
│   ├── FlavorSlider.tsx
│   ├── ToppingCard.tsx
│   ├── GalleryCard.tsx
│   └── MagicalParticles.tsx
├── screens/             # App screens
│   ├── HomeScreen.tsx
│   ├── FlavorsScreen.tsx
│   ├── ToppingsScreen.tsx
│   ├── GalleryScreen.tsx
│   ├── AboutScreen.tsx
│   ├── AdminLoginScreen.tsx
│   └── AdminScreen.tsx
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx
├── context/             # State management
│   └── AppContext.tsx
├── theme/               # Design tokens
│   ├── colors.ts
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
└── data/                # Default data
    └── defaultData.ts
```

## Admin Panel

Access the secret admin panel by tapping the center ice cream icon on the tab bar 5 times.

Default password: `dalipi2024`

Features:
- Manage flavors (add, edit, delete)
- Manage toppings
- Manage promotions
- View store information
- Reset to defaults

## Color Palette

The app uses colors inspired by the Yo-Vazaluza store:

- **Primary Gray**: `#6B6B6B`
- **Dark Gray**: `#4A4A4A`
- **Gold Accent**: `#C9A962`
- **Cream**: `#F5E6D3`
- **Wood/Tan**: `#8B7355`

## License

Proprietary - Yo-Vazaluza Dalipi Family Business
