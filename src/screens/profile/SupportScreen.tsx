import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const SupportScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const contacts = [
    { icon: 'paper-plane', label: 'Telegram', value: '@AdolatAI_Support', color: '#0088CC', url: 'https://t.me/AdolatAI_Support' },
    { icon: 'mail', label: 'Email', value: 'support@adolat-ai.uz', color: '#D32F2F', url: 'mailto:support@adolat-ai.uz' },
    { icon: 'call', label: t('support.phone'), value: '+998 71 200 00 00', color: '#2E7D32', url: 'tel:+998712000000' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.helpSupport')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <View style={[styles.hero, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <View style={[styles.heroIcon, { backgroundColor: COLORS.primary + '15' }]}><Ionicons name="help-buoy" size={32} color={COLORS.primary} /></View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{t('support.heroTitle')}</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>{t('support.heroSub')}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('support.contactUs')}</Text>
        {contacts.map((c) => (
          <TouchableOpacity key={c.label} style={[styles.contactItem, { backgroundColor: colors.surface }, SHADOWS.small]} onPress={() => Linking.openURL(c.url).catch(() => {})}>
            <View style={[styles.contactIcon, { backgroundColor: c.color + '20' }]}><Ionicons name={c.icon as any} size={22} color={c.color} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }]}>{c.label}</Text>
              <Text style={[{ color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 }]}>{c.value}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('support.faq')}</Text>
        <View style={[styles.faqBox, { backgroundColor: colors.surface }]}>
          {(['q1','q2','q3','q4','q5'] as const).map((q, i) => (
            <View key={q} style={[i < 4 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
              <TouchableOpacity style={styles.faqHeader} onPress={() => setOpenFaq(openFaq === q ? null : q)}>
                <Text style={[styles.faqQ, { color: colors.text }]}>{t(`support.faqs.${q}.q`)}</Text>
                <Ionicons name={openFaq === q ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              {openFaq === q && <Text style={[styles.faqA, { color: colors.textSecondary }]}>{t(`support.faqs.${q}.a`)}</Text>}
            </View>
          ))}
        </View>
        <Text style={[{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 16 }]}>{t('support.workHours')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  hero: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 18 },
  heroIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  heroSub: { fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8 },
  contactIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  faqBox: { borderRadius: 14, overflow: 'hidden' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', marginRight: 12 },
  faqA: { fontSize: 13, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14 },
});

export default SupportScreen;
