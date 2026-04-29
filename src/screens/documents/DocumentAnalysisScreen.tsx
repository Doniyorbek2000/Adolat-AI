import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { analyzeDocument } from '../../store/slices/documentsSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const DocumentAnalysisScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const isAnalyzing = useSelector((s: RootState) => s.documents.isAnalyzing);
  const analyses = useSelector((s: RootState) => s.documents.analyses);
  const { file } = route.params || {};
  const latest = analyses[0];

  useEffect(() => {
    if (file) {
      dispatch(analyzeDocument({ fileName: file.name, fileContent: '', language: i18n.language }));
    }
  }, []);

  if (isAnalyzing) return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('documents.analyzing')}</Text>
      <Text style={[{ color: colors.textSecondary, fontSize: 12 }]}>{t('documents.analyzingHint')}</Text>
    </View>
  );

  if (!latest) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.loading}>
        <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
        <Text style={[{ color: colors.textSecondary, marginTop: 16 }]}>{t('documents.uploadFirst')}</Text>
      </View>
    </SafeAreaView>
  );

  const sections = [
    { key: 'summary', title: t('documents.summary'), icon: 'document-text', color: COLORS.primary, content: [latest.summary] },
    { key: 'keyPoints', title: t('documents.keyPoints'), icon: 'checkmark-circle', color: '#2E7D32', content: latest.result?.keyPoints || [] },
    { key: 'risks', title: t('documents.risks'), icon: 'warning', color: '#E53935', content: latest.result?.risks || [] },
    { key: 'recommendations', title: t('documents.recommendations'), icon: 'bulb', color: '#F57F17', content: latest.result?.recommendations || [] },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{latest.fileName}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {sections.map((s) => (
          <View key={s.key} style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{s.title}</Text>
            </View>
            {s.content.filter(Boolean).map((item, i) => (
              <View key={i} style={styles.contentRow}>
                <Text style={[styles.bullet, { color: s.color }]}>•</Text>
                <Text style={[styles.contentText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginTop: 52 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  section: { borderRadius: 14, padding: 16, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  contentRow: { flexDirection: 'row', marginBottom: 8 },
  bullet: { fontSize: 18, marginRight: 8, lineHeight: 22 },
  contentText: { flex: 1, fontSize: 14, lineHeight: 22 },
});

export default DocumentAnalysisScreen;
