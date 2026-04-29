import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../constants/ThemeContext';

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.auth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) { Alert.alert(t('common.error'), t('auth.fillAllFields')); return; }
    if (password.length < 6) { Alert.alert(t('common.error'), t('auth.passwordTooShort')); return; }
    if (password !== confirm) { Alert.alert(t('common.error'), t('auth.passwordsDontMatch')); return; }
    if (!agreed) { Alert.alert(t('common.error'), t('auth.termsRequired')); return; }
    const res = await dispatch(registerUser({ fullName, email, phone, password }));
    if (registerUser.rejected.match(res)) Alert.alert(t('common.error'), res.payload as string);
  };

  const fields = [
    { label: t('auth.fullName'), value: fullName, set: setFullName, icon: 'person-outline', placeholder: t('auth.fullNamePlaceholder'), kb: 'default' as const },
    { label: t('auth.email'), value: email, set: setEmail, icon: 'mail-outline', placeholder: 'email@example.com', kb: 'email-address' as const },
    { label: t('auth.phone'), value: phone, set: setPhone, icon: 'call-outline', placeholder: '+998 90 123 45 67', kb: 'phone-pad' as const },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Image source={require('../../../assets/logo.png')} style={{ width: 32, height: 32, borderRadius: 8, marginRight: 8 }} />
        <Text style={styles.headerTitle}>{t('auth.register')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {fields.map((f, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{f.label}</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name={f.icon as any} size={20} color={colors.textSecondary} />
              <TextInput style={[styles.input, { color: colors.text }]} value={f.value} onChangeText={f.set} placeholder={f.placeholder} placeholderTextColor={colors.textLight} keyboardType={f.kb} autoCapitalize={f.kb === 'default' ? 'words' : 'none'} />
            </View>
          </View>
        ))}

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.password')}</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 16 }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
          <TextInput style={[styles.input, { color: colors.text }]} value={password} onChangeText={setPassword} placeholder="••••••" placeholderTextColor={colors.textLight} secureTextEntry={!showPass} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.confirmPassword')}</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 20 }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
          <TextInput style={[styles.input, { color: colors.text }]} value={confirm} onChangeText={setConfirm} placeholder="••••••" placeholderTextColor={colors.textLight} secureTextEntry={!showPass} />
        </View>

        <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, { borderColor: agreed ? COLORS.primary : colors.border, backgroundColor: agreed ? COLORS.primary : 'transparent' }]}>
            {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>{t('auth.agreeTerms')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('auth.register')}</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={{ color: colors.textSecondary }}>{t('auth.haveAccount')} </Text>
          <TouchableOpacity onPress={() => nav.navigate('Login')}>
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 8 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, marginLeft: 10 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  termsText: { flex: 1, fontSize: 13, lineHeight: 18 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
});

export default RegisterScreen;
