import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const fmt = (n: number) => n.toLocaleString('ru-RU');

const SubscriptionScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const tariffs = useSelector((s: RootState) => s.subscription.tariffs);
  const sub = useSelector((s: RootState) => s.subscription.userSubscription);
  const [yearly, setYearly] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('subscription.title')}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: COLORS.accent + '22' }]}>
            <Ionicons name="diamond" size={32} color={COLORS.accent} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>{t('subscription.heroTitle')}</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>{t('subscription.heroSub')}</Text>
        </View>

        <View style={[styles.toggle, { backgroundColor: colors.surface }]}>
          {['monthly', 'yearly'].map((p) => (
            <TouchableOpacity key={p} style={[styles.toggleBtn, (p === 'yearly') === yearly && { backgroundColor: COLORS.primary }]} onPress={() => setYearly(p === 'yearly')}>
              <Text style={[styles.toggleText, { color: (p === 'yearly') === yearly ? '#fff' : colors.text }]}>{t(`subscription.${p}`)}</Text>
              {p === 'yearly' && <View style={[styles.saveBadge, { backgroundColor: COLORS.accent }]}><Text style={{ color: COLORS.primary, fontSize: 9, fontWeight: '800' }}>-17%</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        {tariffs.filter(t => t.active).map((tariff) => {
          const isCurrent = tariff.id === sub.tier;
          const price = yearly ? tariff.yearlyPrice : tariff.monthlyPrice;
          return (
            <View key={tariff.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: tariff.popular ? COLORS.primary : colors.border }, SHADOWS.small]}>
              {tariff.popular && <View style={[styles.popularBadge, { backgroundColor: COLORS.primary }]}><Text style={styles.popularText}>{t('subscription.popular')}</Text></View>}
              <View style={styles.cardHeader}>
                <View style={[styles.tierDot, { backgroundColor: COLORS.tier[tariff.id as keyof typeof COLORS.tier] || COLORS.primary }]} />
                <Text style={[styles.tierName, { color: colors.text }]}>{tariff.name}</Text>
                {isCurrent && <View style={[styles.currentBadge, { backgroundColor: '#22C55E22' }]}><Text style={{ color: '#22C55E', fontSize: 10, fontWeight: '700' }}>{t('subscription.current')}</Text></View>}
              </View>
              <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tariff.description}</Text>
              <Text style={[styles.price, { color: colors.text }]}>{price === 0 ? t('subscription.free') : fmt(price)}<Text style={{ fontSize: 14, fontWeight: '400' }}> {price > 0 ? t('subscription.uzs') : ''}</Text></Text>
              {tariff.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                  <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
                </View>
              ))}
              {!isCurrent && tariff.id !== 'free' && (
                <TouchableOpacity style={[styles.chooseBtn, { backgroundColor: COLORS.primary }]} onPress={() => nav.navigate('Payment', { tariffId: tariff.id, isYearly: yearly })}>
                  <Text style={styles.chooseBtnText}>{t('subscription.choose')}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {['note1', 'note2', 'note3'].map((n) => (
          <View key={n} style={styles.noteRow}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>{t(`subscription.${n}`)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  hero: { alignItems: 'center', marginBottom: 20 },
  heroIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  heroSub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  toggle: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  toggleText: { fontSize: 14, fontWeight: '600' },
  saveBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 14, overflow: 'hidden' },
  popularBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  popularText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tierDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  tierName: { fontSize: 18, fontWeight: '700', flex: 1 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tierDesc: { fontSize: 13, marginBottom: 10 },
  price: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  featureText: { fontSize: 13, marginLeft: 8 },
  chooseBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  chooseBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  noteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  noteText: { fontSize: 13, marginLeft: 8 },
});

export default SubscriptionScreen;
