import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../../store';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const CATEGORIES = [
  { key: 'family', icon: 'people', color: '#E53935' },
  { key: 'labor', icon: 'briefcase', color: '#1565C0' },
  { key: 'tax', icon: 'cash', color: '#D4AF37' },
  { key: 'property', icon: 'home', color: '#2E7D32' },
  { key: 'criminal', icon: 'shield', color: '#6A1B9A' },
  { key: 'business', icon: 'storefront', color: '#E65100' },
];

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const user = useSelector((s: RootState) => s.auth.user);
  const chats = useSelector((s: RootState) => s.chat.chats);
  const subscription = useSelector((s: RootState) => s.subscription.userSubscription);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('home.morning') : hour < 18 ? t('home.afternoon') : t('home.evening');

  const quickActions = [
    { icon: 'chatbubble-ellipses', label: t('home.askQuestion'), sub: t('home.askQuestionDesc'), color: COLORS.primary, onPress: () => nav.navigate('Chats', { screen: 'ChatDetail', params: { isNew: true } }) },
    { icon: 'document-text', label: t('home.analyzeDoc'), sub: t('home.analyzeDocDesc'), color: '#1565C0', onPress: () => nav.navigate('Docs', { screen: 'DocumentAnalysis' }) },
    { icon: 'create', label: t('home.writeDoc'), sub: t('home.writeDocDesc'), color: '#2E7D32', onPress: () => nav.navigate('Docs', { screen: 'GenerateDocument' }) },
    { icon: 'mic', label: t('home.voiceAdvisor'), sub: t('home.voiceAdvisorDesc'), color: '#6A1B9A', onPress: () => nav.navigate('Chats', { screen: 'VoiceAdvisor' }) },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.heroName}>{user?.fullName || t('home.guest')} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => nav.navigate('Profile', { screen: 'ProfileMain' })} style={styles.avatarBtn}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.fullName || 'U')[0].toUpperCase()}</Text></View>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TouchableOpacity style={styles.searchBox} onPress={() => nav.navigate('Chats', { screen: 'ChatDetail', params: { isNew: true } })}>
            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            <Text style={styles.searchPlaceholder}>{t('home.search')}</Text>
          </TouchableOpacity>

          {/* Subscription banner */}
          {subscription.tier === 'free' && (
            <TouchableOpacity style={styles.upgradeBanner} onPress={() => nav.navigate('Sub', { screen: 'SubscriptionMain' })}>
              <Ionicons name="diamond" size={16} color={COLORS.accent} />
              <Text style={styles.upgradeText}>{t('home.upgrade')} — {t('home.upgradeHint')}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Quick actions */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity key={i} style={[styles.actionCard, { backgroundColor: colors.surface }, SHADOWS.small]} onPress={a.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                  <Ionicons name={a.icon as any} size={24} color={a.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{a.label}</Text>
                <Text style={[styles.actionSub, { color: colors.textSecondary }]}>{a.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.popularCategories')}</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catCard, { backgroundColor: colors.surface }, SHADOWS.small]}
                onPress={() => nav.navigate('Chats', { screen: 'ChatDetail', params: { isNew: true, prefill: t(`home.categories.${cat.key}`) } })}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '18' }]}>
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                </View>
                <Text style={[styles.catLabel, { color: colors.text }]} numberOfLines={2}>{t(`home.categories.${cat.key}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent chats */}
        {chats.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.recentChats')}</Text>
              <TouchableOpacity onPress={() => nav.navigate('Chats')}>
                <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>{t('home.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            {chats.slice(0, 3).map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[styles.chatItem, { backgroundColor: colors.surface }, SHADOWS.small]}
                onPress={() => nav.navigate('Chats', { screen: 'ChatDetail', params: { chatId: chat.id } })}
              >
                <View style={[styles.chatIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>{chat.title}</Text>
                  <Text style={[styles.chatLast, { color: colors.textSecondary }]} numberOfLines={1}>{chat.lastMessage || t('home.empty')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>{t('disclaimer.short')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: { padding: 20, paddingTop: 16, paddingBottom: 24 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 2 },
  avatarBtn: {},
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  searchPlaceholder: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginLeft: 10 },
  upgradeBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.accent + '40' },
  upgradeText: { flex: 1, color: COLORS.accent, fontSize: 13, fontWeight: '600', marginHorizontal: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', padding: 14, borderRadius: 14, marginBottom: 12 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  actionSub: { fontSize: 12, lineHeight: 16 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catCard: { width: '31%', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  catIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
  chatIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chatTitle: { fontSize: 14, fontWeight: '600' },
  chatLast: { fontSize: 12, marginTop: 2 },
  disclaimer: { marginHorizontal: 16, marginTop: 16, flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 10, borderWidth: 1 },
  disclaimerText: { flex: 1, fontSize: 11, marginLeft: 8, lineHeight: 16 },
});

export default HomeScreen;
