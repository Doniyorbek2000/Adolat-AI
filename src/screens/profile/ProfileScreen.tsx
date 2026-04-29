import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const sub = useSelector((s: RootState) => s.subscription.userSubscription);

  const initials = user?.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  const sections = [
    { title: t('profile.account'), items: [
      { icon: 'person-outline', label: t('profile.editProfile'), screen: 'EditProfile' },
      { icon: 'lock-closed-outline', label: t('profile.changePassword'), screen: 'ChangePassword' },
      { icon: 'card-outline', label: t('profile.paymentHistory'), screen: 'PaymentHistory' },
    ]},
    { title: t('profile.preferences'), items: [
      { icon: 'language-outline', label: t('profile.language'), screen: 'Language' },
      { icon: 'settings-outline', label: t('profile.settings'), screen: 'Settings' },
    ]},
    { title: t('profile.support'), items: [
      { icon: 'help-circle-outline', label: t('profile.helpSupport'), screen: 'Support' },
      { icon: 'information-circle-outline', label: t('profile.about'), screen: 'About' },
    ]},
  ];

  const handleLogout = () => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <View style={{ paddingTop: 52, alignItems: 'center', paddingBottom: 24 }}>
            {user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : (
              <View style={[styles.avatar, { backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}
            <Text style={styles.userName}>{user?.fullName || t('profile.user')}</Text>
            <Text style={styles.userEmail}>{user?.email || user?.phone || ''}</Text>
            <View style={[styles.tierBadge, { backgroundColor: COLORS.tier[sub.tier] }]}>
              <Ionicons name={sub.tier === 'vip' ? 'diamond' : sub.tier === 'free' ? 'leaf' : 'flash'} size={12} color="#fff" />
              <Text style={styles.tierText}>{sub.tier.toUpperCase()}</Text>
            </View>
            {sub.tier !== 'vip' && (
              <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: COLORS.accent }]} onPress={() => nav.navigate('Subscription')}>
                <Ionicons name="rocket" size={14} color={COLORS.primary} />
                <Text style={[styles.upgradeText, { color: COLORS.primary }]}>{t('profile.upgradeNow')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {sections.map((section, si) => (
          <View key={si} style={{ marginTop: 18 }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{section.title.toUpperCase()}</Text>
            <View style={[styles.menuBox, { backgroundColor: colors.surface }]}>
              {section.items.map((item, ii) => (
                <TouchableOpacity key={ii} style={[styles.menuItem, ii < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]} onPress={() => nav.navigate(item.screen)}>
                  <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '12' }]}>
                    <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surface }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={[styles.logoutText, { color: COLORS.danger }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: colors.textSecondary }]}>Adolat AI v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {},
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  initials: { fontSize: 30, fontWeight: '700', color: COLORS.primary },
  userName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginTop: 10 },
  tierText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 5 },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 10 },
  upgradeText: { fontSize: 13, fontWeight: '700', marginLeft: 5 },
  sectionLabel: { fontSize: 11, fontWeight: '600', marginHorizontal: 20, marginBottom: 8, letterSpacing: 1 },
  menuBox: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 14 },
  logoutText: { fontSize: 15, fontWeight: '600', marginLeft: 8 },
  version: { textAlign: 'center', marginTop: 14, fontSize: 12 },
});

export default ProfileScreen;
