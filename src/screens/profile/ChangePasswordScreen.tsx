import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '../../store';
import { changePassword } from '../../store/slices/authSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const ChangePasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [old, setOld] = useState('');
  const [nw, setNw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const save = async () => {
    if (!old || !nw || !confirm) { Alert.alert(t('common.error'), t('auth.fillAllFields')); return; }
    if (nw.length < 6) { Alert.alert(t('common.error'), t('auth.passwordTooShort')); return; }
    if (nw !== confirm) { Alert.alert(t('common.error'), t('auth.passwordsDontMatch')); return; }
    setLoading(true);
    await dispatch(changePassword({ oldPassword: old, newPassword: nw }));
    setLoading(false);
    Alert.alert(t('common.success'), t('profile.passwordChanged'), [{ text: t('common.ok'), onPress: () => nav.goBack() }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.changePassword')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {[{ label: t('auth.oldPassword'), value: old, set: setOld }, { label: t('auth.newPassword'), value: nw, set: setNw }, { label: t('auth.confirmPassword'), value: confirm, set: setConfirm }].map((f, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{f.label}</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput style={[styles.input, { color: colors.text }]} value={f.value} onChangeText={f.set} secureTextEntry={!show} placeholder="••••••" placeholderTextColor={colors.textSecondary} />
              {i === 0 && <TouchableOpacity onPress={() => setShow(!show)}><Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} /></TouchableOpacity>}
            </View>
          </View>
        ))}
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={save} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('common.save')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, paddingTop: 52, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ChangePasswordScreen;
