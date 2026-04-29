import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { subscribeToTier } from '../../store/slices/subscriptionSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const fmt = (n: number) => n.toLocaleString('ru-RU');
const METHODS = [
  { id: 'click', name: 'Click', color: '#0090E7' },
  { id: 'payme', name: 'Payme', color: '#3CB553' },
  { id: 'uzcard', name: 'Uzcard', color: '#1F3F8C' },
  { id: 'humo', name: 'Humo', color: '#FF6B00' },
  { id: 'visa', name: 'Visa / Mastercard', color: '#1A1F71' },
];

const PaymentScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { tariffId, isYearly } = route.params || {};
  const tariffs = useSelector((s: RootState) => s.subscription.tariffs);
  const promoCodes = useSelector((s: RootState) => s.subscription.promoCodes);
  const loading = useSelector((s: RootState) => s.subscription.loading);
  const tariff = tariffs.find((t) => t.id === tariffId);
  const user = useSelector((s: RootState) => (s as any).auth?.user);
  const [method, setMethod] = useState('click');
  const [promo, setPromo] = useState('');
  const [applied, setApplied] = useState<{ code: string; pct: number } | null>(null);

  if (!tariff) return null;
  const base = isYearly ? tariff.yearlyPrice : tariff.monthlyPrice;
  const discount = applied ? Math.round(base * applied.pct / 100) : 0;
  const total = base - discount;

  const applyPromo = () => {
    const found = promoCodes.find((p) => p.code.toUpperCase() === promo.toUpperCase() && p.active);
    if (found) { setApplied({ code: found.code, pct: found.discountPercent }); Alert.alert(t('common.success'), t('subscription.promoApplied')); }
    else Alert.alert(t('common.error'), t('subscription.promoInvalid'));
  };

  const handlePay = async () => {
    const res = await dispatch(subscribeToTier({ tierId: tariffId, isYearly, paymentMethod: method, amount: total, promoCode: applied?.code, userId: user?.id || '1' }));
    if (subscribeToTier.fulfilled.match(res)) {
      const cardMethods = ['uzcard', 'humo', 'visa'];
      if (cardMethods.includes(method)) {
        const payload: any = res.payload;
        const details = payload?.bankDetails;
        Alert.alert(
          "To'lov ma'lumotlari",
          details
            ? `Karta raqami: ${details.cardNumber}\nEgasi: ${details.owner}\nSumma: ${details.amount} so'm\nIzoh: ${details.reference}`
            : "To'lov ma'lumotlari yuborildi. Operator siz bilan bog'lanadi.",
          [{ text: 'OK', onPress: () => nav.popToTop() }]
        );
      } else {
        Alert.alert(t('subscription.successTitle'), t('subscription.successMessage', { tier: tariff.name }), [{ text: t('common.ok'), onPress: () => nav.popToTop() }]);
      }
    } else if (subscribeToTier.rejected.match(res)) {
      Alert.alert(t('common.error'), (res.payload as string) || "To'lov tizimiga ulanishda xatolik yuz berdi.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('subscription.payment')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.orderCard}>
          <Text style={styles.orderLabel}>{t('subscription.yourPlan')}</Text>
          <Text style={styles.orderName}>{tariff.name}</Text>
          <Text style={styles.orderPeriod}>{isYearly ? t('subscription.yearly') : t('subscription.monthly')}</Text>
          <Text style={styles.orderPrice}>{fmt(base)} <Text style={{ fontSize: 14 }}>{t('subscription.uzs')}</Text></Text>
        </LinearGradient>

        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('subscription.promoCode')}</Text>
          {applied ? (
            <View style={styles.appliedRow}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={[{ flex: 1, marginLeft: 8, color: colors.text, fontWeight: '600' }]}>{applied.code} — -{applied.pct}%</Text>
              <TouchableOpacity onPress={() => setApplied(null)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoRow}>
              <TextInput style={[styles.promoInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} value={promo} onChangeText={setPromo} placeholder={t('subscription.enterPromo')} placeholderTextColor={colors.textSecondary} autoCapitalize="characters" />
              <TouchableOpacity style={[styles.promoBtn, { backgroundColor: COLORS.primary }]} onPress={applyPromo}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{t('subscription.apply')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('subscription.paymentMethod')}</Text>
          {METHODS.map((m) => (
            <TouchableOpacity key={m.id} style={[styles.methodRow, { backgroundColor: method === m.id ? m.color + '12' : 'transparent', borderColor: method === m.id ? m.color : colors.border }]} onPress={() => setMethod(m.id)}>
              <View style={[styles.methodDot, { backgroundColor: m.color }]} />
              <Text style={[styles.methodName, { color: colors.text }]}>{m.name}</Text>
              <View style={[styles.radio, { borderColor: method === m.id ? COLORS.primary : colors.border }]}>
                {method === m.id && <View style={[styles.radioDot, { backgroundColor: COLORS.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
          {[{ label: t('subscription.subtotal'), value: fmt(base) }, ...(discount > 0 ? [{ label: t('subscription.discount'), value: `-${fmt(discount)}` }] : [])].map((r) => (
            <View key={r.label} style={styles.summaryRow}>
              <Text style={[{ color: colors.textSecondary }]}>{r.label}</Text>
              <Text style={[{ color: colors.text }]}>{r.value} {t('subscription.uzs')}</Text>
            </View>
          ))}
          <View style={[styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t('subscription.total')}</Text>
            <Text style={[styles.totalValue, { color: COLORS.primary }]}>{fmt(total)} {t('subscription.uzs')}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.payBtn, { backgroundColor: COLORS.accent }]} onPress={handlePay} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.primary} /> : <>
            <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
            <Text style={styles.payBtnText}>{t('subscription.payNow')} · {fmt(total)} {t('subscription.uzs')}</Text>
          </>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  orderCard: { padding: 20, borderRadius: 16, marginBottom: 14 },
  orderLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  orderName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  orderPeriod: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  orderPrice: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 10 },
  section: { padding: 16, borderRadius: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  appliedRow: { flexDirection: 'row', alignItems: 'center' },
  promoRow: { flexDirection: 'row' },
  promoInput: { flex: 1, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginRight: 8 },
  promoBtn: { paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  methodRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  methodDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  methodName: { flex: 1, fontSize: 14, fontWeight: '600' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0', marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },
  payBtn: { flexDirection: 'row', paddingVertical: 16, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  payBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700', marginLeft: 8 },
});

export default PaymentScreen;
