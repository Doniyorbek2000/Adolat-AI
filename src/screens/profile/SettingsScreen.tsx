import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { setNotifications, setPrivacy } from '../../store/slices/settingsSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, themeMode, setThemeMode } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((s: RootState) => s.settings);

  const THEMES = [
    { id: 'light' as const, label: t('settings.lightTheme'), icon: 'sunny-outline' as const },
    { id: 'dark' as const, label: t('settings.darkTheme'), icon: 'moon-outline' as const },
    { id: 'system' as const, label: t('settings.systemTheme'), icon: 'phone-portrait-outline' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.settings')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.appearance').toUpperCase()}</Text>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          {THEMES.map((th, i) => (
            <TouchableOpacity
              key={th.id}
              style={[styles.row, i < THEMES.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: 0.5 } : {}]}
              onPress={() => setThemeMode(th.id)}
            >
              <View style={[styles.icon, { backgroundColor: COLORS.primary + '12' }]}>
                <Ionicons name={th.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{th.label}</Text>
              {themeMode === th.id && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.notifications').toUpperCase()}</Text>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
            <View style={[styles.icon, { backgroundColor: COLORS.primary + '12' }]}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.pushNotif')}</Text>
            <Switch
              value={settings.notifications.push}
              onValueChange={(v) => { dispatch(setNotifications({ ...settings.notifications, push: v })); }}
              thumbColor={settings.notifications.push ? COLORS.primary : '#ffffff'}
            />
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
            <View style={[styles.icon, { backgroundColor: COLORS.primary + '12' }]}>
              <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.emailNotif')}</Text>
            <Switch
              value={settings.notifications.email}
              onValueChange={(v) => { dispatch(setNotifications({ ...settings.notifications, email: v })); }}
              thumbColor={settings.notifications.email ? COLORS.primary : '#ffffff'}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: COLORS.primary + '12' }]}>
              <Ionicons name="megaphone-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.marketing')}</Text>
            <Switch
              value={settings.notifications.marketing}
              onValueChange={(v) => { dispatch(setNotifications({ ...settings.notifications, marketing: v })); }}
              thumbColor={settings.notifications.marketing ? COLORS.primary : '#ffffff'}
            />
          </View>
        </View>

        {/* Privacy */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.privacy').toUpperCase()}</Text>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
            <View style={[styles.icon, { backgroundColor: COLORS.primary + '12' }]}>
              <Ionicons name="save-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.saveHistory')}</Text>
            <Switch
              value={settings.privacy.saveChatHistory}
              onValueChange={(v) => { dispatch(setPrivacy({ ...settings.privacy, saveChatHistory: v })); }}
              thumbColor={settings.privacy.saveChatHistory ? COLORS.primary : '#ffffff'}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: COLORS.primary + '12' }]}>
              <Ionicons name="analytics-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('settings.analytics')}</Text>
            <Switch
              value={settings.privacy.analytics}
              onValueChange={(v) => { dispatch(setPrivacy({ ...settings.privacy, analytics: v })); }}
              thumbColor={settings.privacy.analytics ? COLORS.primary : '#ffffff'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '600', marginHorizontal: 16, marginTop: 20, marginBottom: 8, letterSpacing: 1 },
  box: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
});

export default SettingsScreen;
