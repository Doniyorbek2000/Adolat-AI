import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const links = [
    { label: t('about.privacy'), icon: 'shield-checkmark-outline', url: 'https://adolat-ai.uz/privacy' },
    { label: t('about.terms'), icon: 'document-text-outline', url: 'https://adolat-ai.uz/terms' },
    { label: t('about.website'), icon: 'globe-outline', url: 'https://adolat-ai.uz' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.about')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
          <View style={styles.logoBox}><Ionicons name="sparkles" size={40} color={COLORS.accent} /></View>
          <Text style={styles.appName}>Adolat AI</Text>
          <Text style={styles.tagline}>{t('about.tagline')}</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </LinearGradient>
        <View style={[styles.aboutBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>{t('about.aboutUs')}</Text>
          <Text style={[{ color: colors.text, fontSize: 14, lineHeight: 22 }]}>{t('about.description')}</Text>
        </View>
        <View style={[styles.linksBox, { backgroundColor: colors.surface }]}>
          {links.map((l, i) => (
            <TouchableOpacity key={l.label} style={[styles.linkRow, i < links.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]} onPress={() => Linking.openURL(l.url).catch(() => {})}>
              <View style={[styles.linkIcon, { backgroundColor: COLORS.primary + '12' }]}><Ionicons name={l.icon as any} size={19} color={COLORS.primary} /></View>
              <Text style={[styles.linkLabel, { color: colors.text }]}>{l.label}</Text>
              <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[{ color: colors.textSecondary, textAlign: 'center', fontSize: 12, marginTop: 16 }]}>© 2025 Adolat AI · {t('about.allRightsReserved')}</Text>
        <Text style={[{ color: colors.textSecondary, textAlign: 'center', fontSize: 11, marginTop: 4 }]}>{t('about.poweredBy')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  hero: { padding: 32, borderRadius: 20, alignItems: 'center', marginBottom: 16 },
  logoBox: { width: 80, height: 80, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800' },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 6 },
  version: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginTop: 12 },
  aboutBox: { padding: 16, borderRadius: 14, marginBottom: 14 },
  aboutTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  linksBox: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  linkIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  linkLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
});
export default AboutScreen;
