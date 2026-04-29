import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { deleteChat, createNewChat } from '../../store/slices/chatSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const chats = useSelector((s: RootState) => s.chat.chats);
  const [search, setSearch] = useState('');

  const filtered = chats.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  const startNewChat = () => {
    nav.navigate('ChatDetail', { isNew: true });
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(t('chat.deleteTitle'), t('chat.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => dispatch(deleteChat(id)) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('chat.title')}</Text>
        <TouchableOpacity style={[styles.newBtn, { backgroundColor: COLORS.primary }]} onPress={startNewChat}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t('chat.search')}
          placeholderTextColor={colors.textSecondary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chat.noChats')}</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>{t('chat.startFirst')}</Text>
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: COLORS.primary }]} onPress={startNewChat}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.startBtnText}>{t('chat.newChat')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chatItem, { backgroundColor: colors.surface }, SHADOWS.small]}
              onPress={() => nav.navigate('ChatDetail', { chatId: item.id })}
              onLongPress={() => handleDelete(item.id, item.title)}
            >
              <View style={[styles.chatAvatar, { backgroundColor: COLORS.primary + '18' }]}>
                <Ionicons name="sparkles" size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.chatLast, { color: colors.textSecondary }]} numberOfLines={1}>{item.lastMessage || t('chat.noChats')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.chatDate, { color: colors.textSecondary }]}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginTop: 4 }} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  newBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  startBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10 },
  chatAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  chatTitle: { fontSize: 15, fontWeight: '600' },
  chatLast: { fontSize: 13, marginTop: 3 },
  chatDate: { fontSize: 11 },
});

export default ChatScreen;
