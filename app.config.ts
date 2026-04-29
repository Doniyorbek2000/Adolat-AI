import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Adolat AI',
  slug: 'adolat-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A2540',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'uz.adolatai.app',
    buildNumber: '1',
    infoPlist: {
      NSMicrophoneUsageDescription: "Ovozli xabar yuborish uchun mikrofon kerak",
      NSCameraUsageDescription: "Hujjat rasmini olish uchun kamera kerak",
      NSPhotoLibraryUsageDescription: "Hujjat yuklash uchun galereya kerak",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0A2540',
    },
    package: 'uz.adolatai.app',
    versionCode: 1,
    permissions: ['RECORD_AUDIO', 'CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
  },
  plugins: [
    'expo-secure-store',
    ['expo-av', { microphonePermission: 'Ovozli xabar uchun mikrofon kerak' }],
    ['expo-image-picker', { photosPermission: 'Hujjat yuklash uchun galereya kerak' }],
  ],
  extra: {
    eas: { projectId: 'your-eas-project-id' },
    openaiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  },
};

export default config;
