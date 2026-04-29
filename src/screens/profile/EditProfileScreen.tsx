import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const EditProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!fullName.trim()) { Alert.alert(t('common.error'), t('auth.nameRequired')); return; }
    setLoading(true);
    await dispatch(updateProfile({ fullName, phone }));
    setLoading(false);
    Alert.alert(t('common.success'), t('profile.profileUpdated'));
    nav.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.editProfile')}</Text>
        <TouchableOpacity onPress={save} style={styles.iconBtn}>{loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('common.save')}</Text>}</TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.avatarBox}>
          <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}><Text style={styles.initials}>{fullName[0]?.toUpperCase() || 'U'}</Text></View>
        </View>
        {[{ label: t('auth.fullName'), value: fullName, set: setFullName, kb: 'default' as const }, { label: t('auth.phone'), value: phone, set: setPhone, kb: 'phone-pad' as const }].map((f, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{f.label}</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={f.value} onChangeText={f.set} keyboardType={f.kb} autoCapitalize={f.kb === 'default' ? 'words' : 'none'} />
          </View>
        ))}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.email')}</Text>
          <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.6 }]}><Text style={{ color: colors.text, fontSize: 15 }}>{user?.email || t('profile.noEmail')}</Text></View>
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>{t('profile.emailHint')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, paddingTop: 52, borderBottomWidth: 0.5 },
  iconBtn: { minWidth: 44, height: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  avatarBox: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
  initials: { color: '#fff', fontSize: 32, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, justifyContent: 'center' },
});

export default EditProfileScreen;
