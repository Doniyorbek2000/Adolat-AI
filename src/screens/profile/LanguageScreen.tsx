import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState, AppDispatch } from '../../store';
import { setLanguage } from '../../store/slices/settingsSlice';
import { changeLanguage } from '../../locales/i18n';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const LANGS = [{ code: 'uz', name: "O'zbekcha", flag: '🇺🇿' }, { code: 'ru', name: 'Русский', flag: '🇷🇺' }, { code: 'en', name: 'English', flag: '🇬🇧' }] as const;

const LanguageScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const lang = useSelector((s: RootState) => s.settings.language);

  const select = (code: 'uz' | 'ru' | 'en') => { changeLanguage(code); dispatch(setLanguage(code)); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.language')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={{ padding: 16 }}>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          {LANGS.map((l, i) => (
            <TouchableOpacity key={l.code} style={[styles.row, i < LANGS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]} onPress={() => select(l.code)}>
              <Text style={styles.flag}>{l.flag}</Text>
              <Text style={[styles.name, { color: colors.text }]}>{l.name}</Text>
              {lang === l.code && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  box: { borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  flag: { fontSize: 28, marginRight: 14 },
  name: { flex: 1, fontSize: 16, fontWeight: '600' },
});

export default LanguageScreen;
