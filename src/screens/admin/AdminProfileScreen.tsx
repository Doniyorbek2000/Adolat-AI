import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { logoutUser, updateProfile, changePassword } from '../../store/slices/authSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const AdminProfileScreen: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const initials = user?.fullName?.split(' ').map((n) => n[0]).slice(0,2).join('').toUpperCase() || 'A';

  const handleSave = async () => {
    setLoading(true);
    await dispatch(updateProfile({ fullName: name }));
    if (newPass.length >= 6) await dispatch(changePassword({ oldPassword: oldPass, newPassword: newPass }));
    setLoading(false);
    setEditing(false);
    Alert.alert(t('common.success'), t('profile.profileUpdated'));
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('admin.logoutConfirm'))) dispatch(logoutUser());
    } else {
      Alert.alert(t('admin.logoutTitle'), t('admin.logoutConfirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('admin.logout'), style: 'destructive', onPress: () => dispatch(logoutUser()) },
      ]);
    }
  };

  const stats = [
    { icon: 'people' as const, label: 'Foydalanuvchilar', value: '12,450' },
    { icon: 'cash' as const, label: 'Daromad', value: '458M' },
    { icon: 'flash' as const, label: 'Obunalar', value: '3,890' },
    { icon: 'chatbubbles' as const, label: 'So\'rovlar', value: '289K' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('admin.profile')}</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.iconBtn}>
          <Ionicons name={editing ? 'close' : 'create-outline'} size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.adminName}>{user?.fullName || 'Admin'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.accent} />
            <Text style={styles.roleText}>{t('admin.adminRole')}</Text>
          </View>
          <Text style={styles.adminEmail}>{user?.email || 'admin@adolat-ai.uz'}</Text>
        </LinearGradient>

        {/* Quick stats */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name={s.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Edit form */}
        {editing && (
          <View style={[styles.editBox, { backgroundColor: colors.surface }, SHADOWS.small]}>
            <Text style={[styles.editTitle, { color: colors.text }]}>Ma'lumotlarni tahrirlash</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.fullName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.oldPassword')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={oldPass}
              onChangeText={setOldPass}
              secureTextEntry
              placeholder="Eski parol"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.newPassword')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
              placeholder="Yangi parol (ixtiyoriy)"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('common.save')}</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Admin tools */}
        <View style={[styles.toolsBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tezkor harakatlar</Text>
          {[
            { icon: 'people-outline' as const, label: 'Foydalanuvchilarni boshqarish', onPress: () => navigation.navigate('Users') },
            { icon: 'pricetags-outline' as const, label: 'Tariflarni boshqarish', onPress: () => navigation.navigate('Tariffs') },
            { icon: 'gift-outline' as const, label: 'Promo-kodlar', onPress: () => navigation.navigate('PromoCodes') },
            { icon: 'bar-chart-outline' as const, label: 'Analitika', onPress: () => navigation.navigate('Analytics') },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={i}
              style={[styles.toolItem, i < arr.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}
              onPress={item.onPress}
            >
              <View style={[styles.toolIcon, { backgroundColor: COLORS.primary + '12' }]}>
                <Ionicons name={item.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={[styles.toolLabel, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surface }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={[styles.logoutText, { color: COLORS.danger }]}>{t('admin.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  profileCard: { padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 16 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  initials: { color: '#fff', fontSize: 28, fontWeight: '800' },
  adminName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(212,175,55,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginLeft: 5 },
  adminEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: '48%', padding: 14, borderRadius: 14, marginBottom: 10, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 3 },
  editBox: { padding: 16, borderRadius: 16, marginBottom: 16 },
  editTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, marginBottom: 14 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  toolsBox: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  toolItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  toolIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  toolLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
  logoutText: { fontSize: 15, fontWeight: '600', marginLeft: 8 },
});

export default AdminProfileScreen;
