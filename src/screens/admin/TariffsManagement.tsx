import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { updateTariff, addTariff, deleteTariff, Tariff } from '../../store/slices/subscriptionSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const fmt = (n: number) => n.toLocaleString('ru-RU');
const EMPTY: Tariff = { id: '', name: '', description: '', monthlyPrice: 0, yearlyPrice: 0, features: [], queryLimit: 0, docLimit: 0, voiceLimit: 0, active: true };

const TariffsManagement: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const tariffs = useSelector((s: RootState) => s.subscription.tariffs);
  const [editing, setEditing] = useState<Tariff | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Tariff>(EMPTY);

  const openEdit = (tariff: Tariff) => { setForm({ ...tariff }); setEditing(tariff); setCreating(false); };
  const openCreate = () => { setForm({ ...EMPTY, id: `t_${Date.now()}` }); setCreating(true); setEditing(null); };
  const close = () => { setEditing(null); setCreating(false); };

  const save = () => {
    if (!form.name.trim()) { Alert.alert(t('common.error'), t('admin.invalidData')); return; }
    if (creating) dispatch(addTariff(form));
    else dispatch(updateTariff(form));
    close();
  };

  const del = (id: string) => {
    Alert.alert(t('admin.deleteTariffTitle'), t('admin.deleteTariffConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => dispatch(deleteTariff(id)) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('admin.tariffs')}</Text>
        <TouchableOpacity onPress={openCreate} style={styles.iconBtn}>
          <Ionicons name="add" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {tariffs.map((tariff) => (
          <View key={tariff.id} style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.small]}>
            <View style={styles.cardTop}>
              <View style={[styles.tierDot, { backgroundColor: (COLORS.tier as any)[tariff.id] || COLORS.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.tariffName, { color: colors.text }]}>{tariff.name}</Text>
                <Text style={[{ color: colors.textSecondary, fontSize: 12 }]}>{tariff.description}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: tariff.active ? '#22C55E' : COLORS.danger }]} />
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={[{ color: colors.textSecondary, fontSize: 12, flex: 1 }]}>
                Oylik: <Text style={{ color: colors.text, fontWeight: '700' }}>{fmt(tariff.monthlyPrice)}</Text>
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: 12, flex: 1 }]}>
                Yillik: <Text style={{ color: colors.text, fontWeight: '700' }}>{fmt(tariff.yearlyPrice)}</Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
              {[
                { icon: 'chatbubble', v: tariff.queryLimit },
                { icon: 'document', v: tariff.docLimit },
                { icon: 'mic', v: tariff.voiceLimit },
              ].map((l, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={l.icon as any} size={13} color={colors.textSecondary} />
                  <Text style={{ color: colors.text, fontSize: 13, marginLeft: 4, fontWeight: '600' }}>
                    {l.v === 0 ? '∞' : l.v}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.actBtn, { backgroundColor: COLORS.primary }]} onPress={() => openEdit(tariff)}>
                <Ionicons name="create-outline" size={15} color="#fff" />
                <Text style={styles.actText}>{t('common.edit')}</Text>
              </TouchableOpacity>
              {tariff.id !== 'free' && (
                <TouchableOpacity style={[styles.actBtn, { backgroundColor: COLORS.danger + '15', borderColor: COLORS.danger, borderWidth: 1 }]} onPress={() => del(tariff.id)}>
                  <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                  <Text style={[styles.actText, { color: COLORS.danger }]}>{t('common.delete')}</Text>
                </TouchableOpacity>
              )}
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
                {creating ? t('admin.newTariff') : t('admin.editTariff')}
              </Text>
              <TouchableOpacity onPress={save} style={styles.iconBtn}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {([
              { l: t('admin.tariffName'), k: 'name' },
              { l: t('admin.description'), k: 'description' },
            ] as const).map((f) => (
              <View key={f.k} style={{ marginBottom: 14 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{f.l}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={(form as any)[f.k]}
                  onChangeText={(v) => setForm({ ...form, [f.k]: v })}
                />
              </View>
            ))}
            <View style={{ flexDirection: 'row' }}>
              {([{ l: t('admin.monthlyPrice'), k: 'monthlyPrice' }, { l: t('admin.yearlyPrice'), k: 'yearlyPrice' }] as const).map((f) => (
                <View key={f.k} style={{ flex: 1, marginHorizontal: 4, marginBottom: 14 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{f.l}</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={String((form as any)[f.k])} onChangeText={(v) => setForm({ ...form, [f.k]: Number(v) || 0 })} keyboardType="numeric" />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              {([{ l: t('admin.queryLimit'), k: 'queryLimit' }, { l: t('admin.docLimit'), k: 'docLimit' }, { l: t('admin.voiceLimit'), k: 'voiceLimit' }] as const).map((f) => (
                <View key={f.k} style={{ flex: 1, marginHorizontal: 4, marginBottom: 14 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>{f.l}</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={String((form as any)[f.k])} onChangeText={(v) => setForm({ ...form, [f.k]: Number(v) || 0 })} keyboardType="numeric" />
                </View>
              ))}
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 14, fontStyle: 'italic' }}>{t('admin.zeroForUnlimited')}</Text>
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{t('admin.features')}</Text>
                <TouchableOpacity onPress={() => setForm({ ...form, features: [...form.features, ''] })}>
                  <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              {form.features.map((feat, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={feat}
                    onChangeText={(v) => { const f = [...form.features]; f[i] = v; setForm({ ...form, features: f }); }}
                    placeholder={t('admin.featurePlaceholder')}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TouchableOpacity style={{ padding: 10 }} onPress={() => setForm({ ...form, features: form.features.filter((_, j) => j !== i) })}>
                    <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tierDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  tariffName: { fontSize: 16, fontWeight: '700' },
  actBtn: { flex: 1, flexDirection: 'row', paddingVertical: 9, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  actText: { color: '#fff', fontSize: 13, fontWeight: '600', marginLeft: 5 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: { paddingHorizontal: 12, paddingVertical: 11, borderRadius: 10, borderWidth: 1, fontSize: 14 },
});

export default TariffsManagement;
