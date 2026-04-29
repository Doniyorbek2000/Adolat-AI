import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { RootState, AppDispatch } from '../../store';
import { addPromoCode, updatePromoCode, deletePromoCode, PromoCode } from '../../store/slices/subscriptionSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const genCode = () => {
  const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join('');
};

const EMPTY: PromoCode = { code: '', discountPercent: 10, description: '', active: true, maxUses: 0, timesUsed: 0, expiresAt: 0 };

const PromoCodesScreen: React.FC = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const promos = useSelector((s: RootState) => s.subscription.promoCodes);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PromoCode>(EMPTY);

  const openEdit = (p: PromoCode) => { setForm({ ...p }); setEditing(p); setCreating(false); };
  const openCreate = () => { setForm({ ...EMPTY, code: genCode() }); setCreating(true); setEditing(null); };
  const close = () => { setEditing(null); setCreating(false); };

  const save = () => {
    if (!form.code.trim()) { Alert.alert(t('common.error'), t('admin.invalidPromo')); return; }
    if (creating && promos.find((p) => p.code === form.code.toUpperCase())) {
      Alert.alert(t('common.error'), t('admin.promoExists')); return;
    }
    if (creating) dispatch(addPromoCode({ ...form, code: form.code.toUpperCase() }));
    else dispatch(updatePromoCode(form));
    close();
  };

  const del = (code: string) => {
    Alert.alert(t('admin.deletePromoTitle'), t('admin.deletePromoConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => dispatch(deletePromoCode(code)) },
    ]);
  };

  const copy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('', 'Nusxa olindi');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('admin.promoCodes')}</Text>
        <TouchableOpacity onPress={openCreate} style={styles.iconBtn}>
          <Ionicons name="add" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {promos.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="gift-outline" size={64} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16, fontSize: 16 }}>{t('admin.noPromoCodes')}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 6 }}>{t('admin.createFirst')}</Text>
          </View>
        )}
        {promos.map((p) => (
          <View key={p.code} style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.small]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity onPress={() => copy(p.code)}>
                <Text style={[styles.code, { color: colors.text }]}>{p.code}</Text>
              </TouchableOpacity>
              <View style={[styles.discBadge, { backgroundColor: COLORS.accent + '22' }]}>
                <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '800' }}>-{p.discountPercent}%</Text>
              </View>
            </View>
            {p.description ? <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 10 }}>{p.description}</Text> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={[styles.statusChip, { backgroundColor: p.active ? '#22C55E22' : COLORS.danger + '22' }]}>
                <View style={[styles.statusDot, { backgroundColor: p.active ? '#22C55E' : COLORS.danger }]} />
                <Text style={{ color: p.active ? '#22C55E' : COLORS.danger, fontSize: 11, fontWeight: '700' }}>
                  {p.active ? t('admin.active') : t('admin.inactive')}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 10 }}>
                {p.timesUsed}/{p.maxUses > 0 ? p.maxUses : '∞'} {t('admin.uses')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.actBtn, { backgroundColor: COLORS.primary }]} onPress={() => openEdit(p)}>
                <Ionicons name="create-outline" size={15} color="#fff" />
                <Text style={styles.actText}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actBtn, { backgroundColor: COLORS.danger + '15', borderColor: COLORS.danger, borderWidth: 1 }]} onPress={() => del(p.code)}>
                <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                <Text style={[styles.actText, { color: COLORS.danger }]}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!editing || creating} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={close} style={styles.iconBtn}>
                <Ionicons name="close" size={26} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {creating ? t('admin.newPromoCode') : t('admin.editPromoCode')}
              </Text>
              <TouchableOpacity onPress={save} style={styles.iconBtn}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('admin.code')}</Text>
            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 18, letterSpacing: 2 }]}
                value={form.code}
                onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
                autoCapitalize="characters"
                editable={creating}
              />
              {creating && (
                <TouchableOpacity style={[styles.genBtn, { backgroundColor: COLORS.primary }]} onPress={() => setForm({ ...form, code: genCode() })}>
                  <Ionicons name="refresh" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('admin.discount')} (%)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginBottom: 14 }]}
              value={String(form.discountPercent)}
              onChangeText={(v) => setForm({ ...form, discountPercent: Number(v) || 0 })}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('admin.description')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginBottom: 14, height: 70, textAlignVertical: 'top' }]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('admin.maxUses')} (0 = cheksiz)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginBottom: 14 }]}
              value={String(form.maxUses)}
              onChangeText={(v) => setForm({ ...form, maxUses: Number(v) || 0 })}
              keyboardType="numeric"
            />

            <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 }, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{t('admin.activeStatus')}</Text>
              <Switch value={form.active} onValueChange={(v) => setForm({ ...form, active: v })} trackColor={{ false: colors.border, true: COLORS.primary + '80' }} thumbColor={form.active ? COLORS.primary : '#fff'} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  card: { padding: 16, borderRadius: 16, marginBottom: 12 },
  code: { fontSize: 22, fontWeight: '800', letterSpacing: 1.5 },
  discBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  actBtn: { flex: 1, flexDirection: 'row', paddingVertical: 9, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  actText: { color: '#fff', fontSize: 13, fontWeight: '600', marginLeft: 5 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: { paddingHorizontal: 12, paddingVertical: 11, borderRadius: 10, borderWidth: 1, fontSize: 14 },
  genBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});

export default PromoCodesScreen;
