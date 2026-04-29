import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { blockUser, unblockUser } from '../../store/slices/adminSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const UserDetailsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.admin.users.find((u) => u.id === route.params?.userId));
  if (!user) return null;
  const initials = user.fullName.split(' ').map((n) => n[0]).slice(0,2).join('');

  const toggleBlock = () => {
    Alert.alert(user.blocked ? t('admin.unblockTitle') : t('admin.blockTitle'), user.blocked ? t('admin.unblockConfirm') : t('admin.blockConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), style: 'destructive', onPress: () => dispatch(user.blocked ? unblockUser(user.id) : blockUser(user.id)) },
    ]);
  };

  const stats = [
    { icon: 'chatbubbles', label: t('admin.totalChats'), value: user.totalChats },
    { icon: 'document-text', label: t('admin.totalDocs'), value: user.totalDocs },
    { icon: 'cash', label: t('admin.totalSpent'), value: `${user.totalSpent.toLocaleString()} ${t('subscription.uzs')}` },
    { icon: 'time', label: t('admin.lastActive'), value: new Date(user.lastActive).toLocaleDateString(i18n.language) },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('admin.userDetails')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <View style={[styles.profile, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <View style={[styles.avatar, { backgroundColor: COLORS.tier[user.tier] + '22' }]}><Text style={[styles.initials, { color: COLORS.tier[user.tier] }]}>{initials}</Text></View>
          <Text style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>
          <Text style={[{ color: colors.textSecondary, fontSize: 13 }]}>{user.email}</Text>
          <View style={[styles.tierBadge, { backgroundColor: COLORS.tier[user.tier] }]}><Text style={styles.tierText}>{user.tier.toUpperCase()}</Text></View>
          {user.blocked && <View style={[styles.blockedBanner, { backgroundColor: COLORS.danger + '15' }]}><Ionicons name="ban" size={16} color={COLORS.danger} /><Text style={[{ color: COLORS.danger, marginLeft: 6, fontWeight: '700', fontSize: 13 }]}>{t('admin.userBlocked')}</Text></View>}
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}><Ionicons name={s.icon as any} size={20} color={COLORS.primary} /></View>
              <Text style={[{ color: colors.textSecondary, fontSize: 11, marginTop: 8 }]}>{s.label}</Text>
              <Text style={[{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 3 }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.surface }, SHADOWS.small]}>
          {[{ l: t('admin.userId'), v: user.id }, { l: t('admin.registered'), v: new Date(user.createdAt).toLocaleDateString(i18n.language) }, { l: t('admin.role'), v: user.role === 'admin' ? t('admin.adminRole') : 'User' }, { l: t('admin.status'), v: user.blocked ? t('admin.blocked') : t('admin.active') }].map((r, i, arr) => (
            <View key={i} style={[styles.infoRow, i < arr.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
              <Text style={[{ color: colors.textSecondary, fontSize: 13 }]}>{r.l}</Text>
              <Text style={[{ color: colors.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' }]} numberOfLines={1}>{r.v}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: user.blocked ? '#2E7D32' : COLORS.danger }]} onPress={toggleBlock}>
          <Ionicons name={user.blocked ? 'checkmark-circle' : 'ban'} size={20} color="#fff" />
          <Text style={styles.actionText}>{user.blocked ? t('admin.unblockUser') : t('admin.blockUser')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  profile: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  initials: { fontSize: 24, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  tierText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  blockedBanner: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, marginTop: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: '48%', padding: 14, borderRadius: 12, marginBottom: 10 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoBox: { borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  actionBtn: { flexDirection: 'row', paddingVertical: 14, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8 },
});

export default UserDetailsScreen;
