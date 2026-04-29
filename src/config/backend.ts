import { Platform } from 'react-native';

// Central backend URL
// Android Emulator uchun 10.0.2.2, qolganlar uchun localhost
const getBackendUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
    return 'http://localhost:3000';
  }
  return 'https://api.adolat-ai.uz'; // Production URL
};

export const BACKEND_URL = getBackendUrl();
