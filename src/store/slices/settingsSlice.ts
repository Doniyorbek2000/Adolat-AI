import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  language: 'uz' | 'ru' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: { push: boolean; email: boolean; marketing: boolean };
  voiceSettings: { autoPlay: boolean; haptics: boolean };
  privacy: { saveChatHistory: boolean; analytics: boolean };
  onboardingCompleted: boolean;
}

const initialState: SettingsState = {
  language: 'uz',
  theme: 'system',
  notifications: { push: true, email: true, marketing: false },
  voiceSettings: { autoPlay: true, haptics: true },
  privacy: { saveChatHistory: true, analytics: true },
  onboardingCompleted: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (s, a: PayloadAction<'uz' | 'ru' | 'en'>) => { s.language = a.payload; },
    setTheme: (s, a: PayloadAction<'light' | 'dark' | 'system'>) => { s.theme = a.payload; },
    setNotifications: (s, a: PayloadAction<SettingsState['notifications']>) => { s.notifications = a.payload; },
    setVoiceSettings: (s, a: PayloadAction<SettingsState['voiceSettings']>) => { s.voiceSettings = a.payload; },
    setPrivacy: (s, a: PayloadAction<SettingsState['privacy']>) => { s.privacy = a.payload; },
    completeOnboarding: (s) => { s.onboardingCompleted = true; },
  },
});

export const { setLanguage, setTheme, setNotifications, setVoiceSettings, setPrivacy, completeOnboarding } = settingsSlice.actions;
export default settingsSlice.reducer;
