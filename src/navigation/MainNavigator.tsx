import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../constants/ThemeContext';
import { COLORS } from '../constants/theme';
import HomeScreen from '../screens/user/HomeScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import VoiceAdvisorScreen from '../screens/chat/VoiceAdvisorScreen';
import DocumentsScreen from '../screens/documents/DocumentsScreen';
import DocumentAnalysisScreen from '../screens/documents/DocumentAnalysisScreen';
import GenerateDocumentScreen from '../screens/documents/GenerateDocumentScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import PaymentScreen from '../screens/subscription/PaymentScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import LanguageScreen from '../screens/profile/LanguageScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import PaymentHistoryScreen from '../screens/profile/PaymentHistoryScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import AboutScreen from '../screens/profile/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatList" component={ChatScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    <Stack.Screen name="VoiceAdvisor" component={VoiceAdvisorScreen} />
  </Stack.Navigator>
);

const DocsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DocumentsList" component={DocumentsScreen} />
    <Stack.Screen name="DocumentAnalysis" component={DocumentAnalysisScreen} />
    <Stack.Screen name="GenerateDocument" component={GenerateDocumentScreen} />
  </Stack.Navigator>
);

const SubStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SubscriptionMain" component={SubscriptionScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Language" component={LanguageScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            Home: { active: 'home', inactive: 'home-outline' },
            Chats: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
            Docs: { active: 'document-text', inactive: 'document-text-outline' },
            Sub: { active: 'diamond', inactive: 'diamond-outline' },
            Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
          };
          const key = route.name;
          const icon = icons[key];
          return <Ionicons name={(focused ? icon?.active : icon?.inactive) as any || 'home'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: t('tabs.home') }} />
      <Tab.Screen name="Chats" component={ChatStack} options={{ tabBarLabel: t('tabs.chat') }} />
      <Tab.Screen name="Docs" component={DocsStack} options={{ tabBarLabel: t('tabs.documents') }} />
      <Tab.Screen name="Sub" component={SubStack} options={{ tabBarLabel: t('tabs.subscription') }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: t('tabs.profile') }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
