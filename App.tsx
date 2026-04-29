import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import i18n from './src/locales/i18n';
import { ThemeProvider } from './src/constants/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <RootNavigator />
            </SafeAreaProvider>
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
