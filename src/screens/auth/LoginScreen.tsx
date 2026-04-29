import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../constants/ThemeContext';

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.auth);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!login.trim() || !password.trim()) { Alert.alert(t('common.error'), t('auth.fillAllFields')); return; }
    const res = await dispatch(loginUser({ login: login.trim(), password }));
    if (loginUser.rejected.match(res)) Alert.alert(t('common.error'), res.payload as string || t('auth.invalidCredentials'));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <Image source={require('../../../assets/logo.png')} style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 16 }} />
          <Text style={styles.appName}>Adolat AI</Text>
          <Text style={styles.headerSub}>{t('auth.loginSubtitle')}</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.email')} / {t('auth.phone')}</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <TextInput style={[styles.input, { color: colors.text }]} value={login} onChangeText={setLogin} placeholder="email@misol.uz" placeholderTextColor={colors.textLight} autoCapitalize="none" keyboardType="email-address" />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.password')}</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
            <TextInput style={[styles.input, { color: colors.text }]} value={password} onChangeText={setPassword} placeholder="••••••" placeholderTextColor={colors.textLight} secureTextEntry={!showPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgot} onPress={() => nav.navigate('ForgotPassword')}>
            <Text style={{ color: COLORS.primary, fontSize: 13 }}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: COLORS.primary }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>{t('auth.login')}</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={{ color: colors.textSecondary, marginHorizontal: 12, fontSize: 13 }}>{t('auth.or')}</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.registerRow}>
            <Text style={{ color: colors.textSecondary }}>{t('auth.noAccount')} </Text>
            <TouchableOpacity onPress={() => nav.navigate('Register')}>
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('auth.createAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6 },
  form: { flex: 1, padding: 24, paddingTop: 28 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 18 },
  input: { flex: 1, fontSize: 15, marginLeft: 10 },
  forgot: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  loginBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
});

export default LoginScreen;
