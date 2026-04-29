import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const fmt = (n: number) => n.toLocaleString('ru-RU');

const PaymentHistoryScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const payments = useSelector((s: RootState) => s.subscription.paymentHistory);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}><Ionicons name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.paymentHistory')}</Text>
        <View style={{ width: 44 }} />
      </View>
      {payments.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('profile.noPayments')}</Text>
          <Text style={[{ color: colors.textSecondary, fontSize: 13 }]}>{t('profile.noPaymentsHint')}</Text>
        </View>
      ) : (
        <FlatList data={payments} keyExtractor={(p) => p.id} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: colors.surface }, SHADOWS.small]}>
            <View style={styles.itemTop}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{item.tariffName}</Text>
              <Text style={[styles.itemAmount, { color: colors.text }]}>{fmt(item.amount)} {t('subscription.uzs')}</Text>
            </View>
            <View style={styles.itemBottom}>
              <Ionicons name={item.status === 'success' ? 'checkmark-circle' : 'close-circle'} size={14} color={item.status === 'success' ? '#22C55E' : COLORS.danger} />
              <Text style={[{ color: item.status === 'success' ? '#22C55E' : COLORS.danger, fontSize: 12, marginLeft: 4, fontWeight: '600' }]}>{t(`profile.paymentStatus.${item.status}`)}</Text>
              <Text style={[{ color: colors.textSecondary, fontSize: 12, marginLeft: 10 }]}>{new Date(item.createdAt).toLocaleDateString(i18n.language)}</Text>
            </View>
          </View>
        )} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  item: { padding: 14, borderRadius: 12, marginBottom: 10 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  itemAmount: { fontSize: 16, fontWeight: '700' },
  itemBottom: { flexDirection: 'row', alignItems: 'center' },
});

export default PaymentHistoryScreen;
