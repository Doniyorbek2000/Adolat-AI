import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { RootState, AppDispatch } from '../../store';
import { generateDocument, clearGenerated } from '../../store/slices/documentsSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const DOC_TYPES = [
  { key: 'ariza', icon: 'document-text', color: COLORS.primary },
  { key: 'shikoyat', icon: 'alert-circle', color: '#E53935' },
  { key: 'davo', icon: 'hammer', color: '#6A1B9A' },
  { key: 'tushuntirish', icon: 'chatbox', color: '#F57F17' },
  { key: 'contract', icon: 'ribbon', color: '#2E7D32' },
];

const GenerateDocumentScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { isGenerating, generatedText } = useSelector((s: RootState) => s.documents);
  const [type, setType] = useState('ariza');
  const [details, setDetails] = useState('');

  const handleGenerate = async () => {
    if (!details.trim()) { Alert.alert(t('common.error'), t('documents.fillDetails')); return; }
    dispatch(clearGenerated());
    dispatch(generateDocument({ type, details, language: i18n.language }));
  };

  const copyText = async () => {
    await Clipboard.setStringAsync(generatedText);
    Alert.alert('', t('chat.copied'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('documents.generate')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('documents.chooseType')}</Text>
        <View style={styles.typesGrid}>
          {DOC_TYPES.map((dt) => (
            <TouchableOpacity key={dt.key} style={[styles.typeCard, { backgroundColor: type === dt.key ? dt.color : colors.surface, borderColor: type === dt.key ? dt.color : colors.border }, SHADOWS.small]} onPress={() => setType(dt.key)}>
              <Ionicons name={dt.icon as any} size={24} color={type === dt.key ? '#fff' : dt.color} />
              <Text style={[styles.typeLabel, { color: type === dt.key ? '#fff' : colors.text }]}>{t(`documents.${dt.key}`)}</Text>
              <Text style={[styles.typeSub, { color: type === dt.key ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>{t(`documents.${dt.key}Desc`)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('documents.detailsTitle')}</Text>
        <TextInput
          style={[styles.detailsInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={details}
          onChangeText={setDetails}
          placeholder={t('documents.detailsHint')}
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />

        <TouchableOpacity style={[styles.generateBtn, { backgroundColor: COLORS.primary }]} onPress={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <ActivityIndicator color="#fff" /> : <>
            <Ionicons name="sparkles" size={18} color={COLORS.accent} />
            <Text style={styles.generateBtnText}>{t('documents.generateNow')}</Text>
          </>}
        </TouchableOpacity>

        {generatedText ? (
          <View style={[styles.resultBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultTitle, { color: colors.text }]}>{t('documents.generated')}</Text>
              <TouchableOpacity onPress={copyText} style={[styles.copyBtn, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                <Text style={[{ color: COLORS.primary, fontSize: 12, marginLeft: 4, fontWeight: '600' }]}>{t('common.copy')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.resultText, { color: colors.text }]}>{generatedText}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 4 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  typeCard: { width: '48%', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  typeLabel: { fontSize: 14, fontWeight: '700', marginTop: 8, marginBottom: 2 },
  typeSub: { fontSize: 11 },
  detailsInput: { borderRadius: 12, borderWidth: 1, padding: 14, height: 140, fontSize: 14, marginBottom: 16 },
  generateBtn: { flexDirection: 'row', paddingVertical: 16, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  resultBox: { borderRadius: 14, borderWidth: 1, padding: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 15, fontWeight: '700' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8 },
  resultText: { fontSize: 14, lineHeight: 22 },
});

export default GenerateDocumentScreen;
