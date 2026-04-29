import React, { useState } from 'react';
import { BACKEND_URL } from '../../config/backend';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) { Alert.alert(t('common.error'), t('auth.emailRequired')); return; }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Xatolik yuz berdi');
      setSent(true);
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || 'Serverga ulanib bo\'lmadi');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={[styles.successIcon, { backgroundColor: '#22C55E22' }]}>
          <Ionicons name="mail-open" size={48} color="#22C55E" />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>{t('auth.resetLinkSent')}</Text>
        <Text style={[styles.successSub, { color: colors.textSecondary }]}>{t('auth.resetInstructions')}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={() => nav.navigate('Login')}>
          <Text style={styles.btnText}>{t('auth.backToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('auth.forgotTitle')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={{ padding: 24 }}>
        <Text style={[{ color: colors.textSecondary, marginBottom: 24, lineHeight: 22 }]}>{t('auth.forgotSubtitle')}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth.email')}</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
          <TextInput style={[styles.input, { color: colors.text }]} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor={colors.textLight} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={handleSend} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('auth.sendResetLink')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 8 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  input: { flex: 1, fontSize: 15, marginLeft: 10 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});

export default ForgotPasswordScreen;
