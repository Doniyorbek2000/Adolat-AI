import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AdminNavigator from './AdminNavigator';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';

const Stack = createStackNavigator();

const WebNotSupported = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{t('app.webNotSupported', 'This app is designed for mobile devices. Please download our Android or iOS app.')}</Text>
    </View>
  );
};

const AdminWebOnly = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{t('app.adminWebOnly', 'The Admin Panel is only accessible from a web browser.')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: COLORS.text }
});

const RootNavigator: React.FC = () => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  // We ignore onboardingCompleted for now as it's not strictly needed for the split.

  const isAdmin = user?.role === 'admin';
  const isWeb = Platform.OS === 'web';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isAdmin ? (
          isWeb ? (
            <Stack.Screen name="Admin" component={AdminNavigator} />
          ) : (
            <Stack.Screen name="AdminMobileError" component={AdminWebOnly} />
          )
        ) : (
          isWeb ? (
            <Stack.Screen name="WebError" component={WebNotSupported} />
          ) : (
            <Stack.Screen name="Main" component={MainNavigator} />
          )
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
