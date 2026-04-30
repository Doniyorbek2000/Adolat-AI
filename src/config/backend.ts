import { Platform } from 'react-native';

// Central backend URL
// APK telefonda ishlashi uchun kompyuter IP-manzili ishlatiladi
const getBackendUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.77.246.56:3000';
    return 'http://localhost:3000';
  }
  return 'https://adolat-ai-backend.onrender.com';
};

export const BACKEND_URL = getBackendUrl();
