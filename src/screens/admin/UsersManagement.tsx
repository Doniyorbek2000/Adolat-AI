import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { fetchUsers, blockUser, unblockUser } from '../../store/slices/adminSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const UsersManagement: React.FC = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((s: RootState) => s.admin);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchUsers()); }, []);

  const filtered = users.filter((u) => {
    const m = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search);
    if (!m) return false;
    if (filter === 'all') return true;
    if (filter === 'active') return !u.blocked;
    if (filter === 'blocked') return u.blocked;
    return u.tier === filter;
  });

  const toggleBlock = (id: string, blocked: boolean) => {
    Alert.alert(blocked ? t('admin.unblockTitle') : t('admin.blockTitle'), blocked ? t('admin.unblockConfirm') : t('admin.blockConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), style: 'destructive', onPress: () => dispatch(blocked ? unblockUser(id) : blockUser(id)) },
    ]);
  };

  const FILTERS = [{ k: 'all', l: t('admin.filterAll') }, { k: 'active', l: t('admin.filterActive') }, { k: 'blocked', l: t('admin.filterBlocked') }, { k: 'free', l: 'Free' }, { k: 'pro', l: 'Pro' }, { k: 'ultra', l: 'Ultra' }, { k: 'vip', l: 'VIP' }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}><Ionicons name="menu" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('admin.users')}</Text>
        <TouchableOpacity onPress={() => dispatch(fetchUsers())} style={styles.iconBtn}><Ionicons name="refresh" size={22} color={colors.text} /></TouchableOpacity>
      </View>
      <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput style={[styles.searchInput, { color: colors.text }]} value={search} onChangeText={setSearch} placeholder={t('admin.searchUser')} placeholderTextColor={colors.textSecondary} />
      </View>
      <FlatList data={FILTERS} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(f) => f.k} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        renderItem={({ item: f }) => (
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: filter === f.k ? COLORS.primary : colors.surface, borderColor: filter === f.k ? COLORS.primary : colors.border }]} onPress={() => setFilter(f.k)}>
            <Text style={[styles.filterText, { color: filter === f.k ? '#fff' : colors.text }]}>{f.l}</Text>
          </TouchableOpacity>
        )} />
      {loading && users.length === 0 ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(u) => u.id} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          ListEmptyComponent={<View style={styles.center}><Text style={{ color: colors.textSecondary }}>{t('admin.noUsers')}</Text></View>}
          renderItem={({ item: u }) => (
            <TouchableOpacity style={[styles.userItem, { backgroundColor: colors.surface }, SHADOWS.small]}
              onPress={() => navigation.navigate('UserDetails', { userId: u.id })}
              onLongPress={() => toggleBlock(u.id, u.blocked)}>
              <View style={[styles.avatar, { backgroundColor: COLORS.tier[u.tier] + '22' }]}>
                <Text style={[styles.initials, { color: COLORS.tier[u.tier] }]}>{u.fullName.split(' ').map((n) => n[0]).slice(0,2).join('')}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{u.fullName}</Text>
                  {u.blocked && <View style={[styles.blockedBadge, { backgroundColor: COLORS.danger }]}><Text style={styles.blockedText}>{t('admin.blocked')}</Text></View>}
                </View>
                <Text style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }]} numberOfLines={1}>{u.email}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <View style={[styles.tierBadge, { backgroundColor: COLORS.tier[u.tier] }]}><Text style={styles.tierText}>{u.tier.toUpperCase()}</Text></View>
                  <Text style={[{ color: colors.textSecondary, fontSize: 11, marginLeft: 8 }]}>{new Date(u.createdAt).toLocaleDateString(i18n.language)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, marginHorizontal: 4, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  userItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  initials: { fontSize: 14, fontWeight: '700' },
  name: { flex: 1, fontSize: 14, fontWeight: '600' },
  blockedBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, marginLeft: 6 },
  blockedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  tierText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});

export default UsersManagement;
