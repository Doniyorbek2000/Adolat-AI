import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';
import { RootState, AppDispatch } from '../../store';
import { deleteAnalysis } from '../../store/slices/documentsSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const DocumentsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const analyses = useSelector((s: RootState) => s.documents.analyses);

  const handleUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*', 'text/*'] });
    if (!res.canceled && res.assets[0]) {
      nav.navigate('DocumentAnalysis', { file: res.assets[0] });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('documents.deleteTitle'), t('documents.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => dispatch(deleteAnalysis(id)) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('documents.title')}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity style={[styles.card, { backgroundColor: COLORS.primary }, SHADOWS.medium]} onPress={handleUpload}>
          <View style={styles.cardIcon}><Ionicons name="cloud-upload" size={28} color={COLORS.accent} /></View>
          <Text style={styles.cardTitle}>{t('documents.uploadAnalyze')}</Text>
          <Text style={styles.cardSub}>{t('documents.uploadHint')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: '#1565C0' }, SHADOWS.medium]} onPress={() => nav.navigate('GenerateDocument')}>
          <View style={styles.cardIcon}><Ionicons name="create" size={28} color="#fff" /></View>
          <Text style={styles.cardTitle}>{t('documents.generate')}</Text>
          <Text style={styles.cardSub}>{t('documents.generateHint')}</Text>
        </TouchableOpacity>

        {analyses.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('documents.recent')}</Text>
            {analyses.map((a) => (
              <TouchableOpacity key={a.id} style={[styles.analysisItem, { backgroundColor: colors.surface }, SHADOWS.small]} onLongPress={() => handleDelete(a.id)}>
                <View style={[styles.docIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <Ionicons name="document-text" size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: colors.text, fontWeight: '600', fontSize: 14 }]} numberOfLines={1}>{a.fileName}</Text>
                  <Text style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }]} numberOfLines={1}>{a.summary}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  card: { borderRadius: 16, padding: 20, marginBottom: 14 },
  cardIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 12 },
  analysisItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 10 },
  docIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
});

export default DocumentsScreen;
