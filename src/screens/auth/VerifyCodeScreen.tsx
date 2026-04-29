import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

const VerifyCodeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const refs = Array.from({ length: 6 }, () => useRef<TextInput>(null));

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val: string, idx: number) => {
    const next = [...code]; next[idx] = val;
    setCode(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
    if (!val && idx > 0) refs[idx - 1].current?.focus();
    if (next.join('').length === 6) {
      // Demo: any 6-digit code works
      Alert.alert(t('common.success'), 'Tasdiqlandi!', [{ text: 'OK', onPress: () => nav.navigate('Login') }]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </TouchableOpacity>
      <View style={{ padding: 24, paddingTop: 16 }}>
        <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '15' }]}>
          <Ionicons name="phone-portrait-outline" size={40} color={COLORS.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{t('auth.verifyTitle')}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('auth.verifySubtitle')}</Text>
        <View style={styles.codeRow}>
          {code.map((c, i) => (
            <TextInput
              key={i}
              ref={refs[i]}
              style={[styles.codeInput, { backgroundColor: colors.surface, borderColor: c ? COLORS.primary : colors.border, color: colors.text }]}
              value={c}
              onChangeText={(v) => handleChange(v.slice(-1), i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>
        {timer > 0 ? (
          <Text style={[styles.timerText, { color: colors.textSecondary }]}>{t('auth.resendIn', { seconds: timer })}</Text>
        ) : (
          <TouchableOpacity onPress={() => setTimer(60)}>
            <Text style={[styles.resendText, { color: COLORS.primary }]}>{t('auth.resendCode')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginTop: 52, marginLeft: 8 },
  iconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 22, marginBottom: 32 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  codeInput: { width: 48, height: 56, borderRadius: 12, borderWidth: 2, fontSize: 22, fontWeight: '700' },
  timerText: { textAlign: 'center', fontSize: 14 },
  resendText: { textAlign: 'center', fontSize: 14, fontWeight: '700' },
});

export default VerifyCodeScreen;
