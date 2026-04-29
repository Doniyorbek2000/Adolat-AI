import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../constants/ThemeContext';
import { COLORS } from '../constants/theme';
import { RootState, AppDispatch } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import AdminDashboard from '../screens/admin/AdminDashboard';
import UsersManagement from '../screens/admin/UsersManagement';
import UserDetailsScreen from '../screens/admin/UserDetailsScreen';
import TariffsManagement from '../screens/admin/TariffsManagement';
import PromoCodesScreen from '../screens/admin/PromoCodesScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const UsersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="UsersList" component={UsersManagement} />
    <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
  </Stack.Navigator>
);

const CustomDrawerContent = (props: any) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);

  const handleLogout = () => {
    Alert.alert(t('admin.logoutTitle'), t('admin.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('admin.logout'), style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.background }}>
      <View style={[styles.drawerHeader, { backgroundColor: COLORS.primary }]}>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.accent} />
        </View>
        <Text style={styles.adminName}>{user?.fullName || 'Admin'}</Text>
        <Text style={styles.adminRole}>{t('admin.adminRole')}</Text>
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity style={[styles.logoutBtn, { borderTopColor: colors.border }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
        <Text style={[styles.logoutText, { color: COLORS.danger }]}>{t('admin.logout')}</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const AdminNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: {
          backgroundColor: colors.background,
          width: Platform.OS === 'web' ? 300 : 280,
        },
        drawerType: Platform.OS === 'web' ? 'permanent' : 'front',
        drawerLabelStyle: { fontWeight: '600', fontSize: 14 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboard} options={{ drawerLabel: t('admin.dashboard'), drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Users" component={UsersStack} options={{ drawerLabel: t('admin.users'), drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Tariffs" component={TariffsManagement} options={{ drawerLabel: t('admin.tariffs'), drawerIcon: ({ color }) => <Ionicons name="pricetags-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="PromoCodes" component={PromoCodesScreen} options={{ drawerLabel: t('admin.promoCodes'), drawerIcon: ({ color }) => <Ionicons name="gift-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} options={{ drawerLabel: t('admin.analytics'), drawerIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={22} color={color} /> }} />
      <Drawer.Screen name="AdminProfile" component={AdminProfileScreen} options={{ drawerLabel: t('admin.profile'), drawerIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} /> }} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: { padding: 20, paddingTop: 40, alignItems: 'center', marginBottom: 8 },
  adminBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  adminName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  adminRole: { color: COLORS.accent, fontSize: 12, marginTop: 4, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 8, borderTopWidth: 0.5 },
  logoutText: { fontSize: 15, fontWeight: '600', marginLeft: 12 },
});

export default AdminNavigator;
