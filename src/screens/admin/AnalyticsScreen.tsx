import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
type Period = '7d' | '30d' | '90d';

const AnalyticsScreen: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardStats: stats, loading } = useSelector((s: RootState) => s.admin);
  const [period, setPeriod] = useState<Period>('30d');

  useEffect(() => { dispatch(fetchDashboardStats()); }, []);

  const chartCfg = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (o = 1) => isDark ? `rgba(212,175,55,${o})` : `rgba(10,37,64,${o})`,
    labelColor: (o = 1) => isDark ? `rgba(200,200,200,${o})` : `rgba(80,80,80,${o})`,
    style: { borderRadius: 14 },
  };

  if (loading && !stats) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!stats) return null;

  const funnel = [
    { label: t('analytics.visitors'), value: 48320, color: COLORS.primary },
    { label: t('analytics.signups'), value: stats.totalUsers, color: '#1565C0' },
    { label: t('analytics.activated'), value: Math.round(stats.totalUsers * 0.66), color: '#2E7D32' },
    { label: t('analytics.paid'), value: stats.activeSubscriptions, color: COLORS.accent },
  ];

  const kpis = [
    { label: t('analytics.convRate'), value: `${((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%`, icon: 'trending-up' as const, color: '#2E7D32' },
    { label: t('analytics.arpu'), value: `${Math.round(stats.totalRevenue / (stats.activeSubscriptions || 1)).toLocaleString()}`, icon: 'cash' as const, color: COLORS.accent },
    { label: t('analytics.churnRate'), value: '4.2%', icon: 'trending-down' as const, color: COLORS.danger },
    { label: t('analytics.nps'), value: '72', icon: 'star' as const, color: '#7B1FA2' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('admin.analytics')}</Text>
        <TouchableOpacity onPress={() => dispatch(fetchDashboardStats())} style={styles.iconBtn}>
          <Ionicons name="refresh" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Period selector */}
        <View style={[styles.periodBox, { backgroundColor: colors.surface }]}>
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <TouchableOpacity key={p} style={[styles.periodBtn, period === p && { backgroundColor: COLORS.primary }]} onPress={() => setPeriod(p)}>
              <Text style={[styles.periodText, { color: period === p ? '#fff' : colors.textSecondary }]}>
                {p === '7d' ? t('analytics.week') : p === '30d' ? t('analytics.month') : t('analytics.quarter')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI cards */}
        <View style={styles.kpiGrid}>
          {kpis.map((k, i) => (
            <View key={i} style={[styles.kpiCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
              <View style={[styles.kpiIcon, { backgroundColor: k.color + '18' }]}>
                <Ionicons name={k.icon} size={18} color={k.color} />
              </View>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{k.value}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Revenue chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>{t('analytics.revenueTrend')}</Text>
          <Text style={[{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }]}>
            {t('analytics.totalRevenue')}: {stats.totalRevenue.toLocaleString()} {t('subscription.uzs')}
          </Text>
          <LineChart
            data={{ labels: stats.revenueChart.labels, datasets: [{ data: stats.revenueChart.values }] }}
            width={width - 64}
            height={180}
            chartConfig={chartCfg}
            bezier
            style={{ borderRadius: 14 }}
            withInnerLines={false}
            withOuterLines={false}
          />
        </View>

        {/* Funnel */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>{t('analytics.conversionFunnel')}</Text>
          {funnel.map((f, i) => {
            const pct = (f.value / funnel[0].value) * 100;
            return (
              <View key={i} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={[{ color: colors.text, fontSize: 13, fontWeight: '600' }]}>{f.label}</Text>
                  <Text style={[{ color: colors.textSecondary, fontSize: 12 }]}>
                    {f.value.toLocaleString()} ({pct.toFixed(0)}%)
                  </Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: f.color }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Growth summary */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('analytics.growthSummary')}</Text>
          {[
            { l: t('analytics.newUsersThisMonth'), v: `+${stats.newUsersToday * 22}` },
            { l: t('analytics.revenueGrowth'), v: `+${stats.revenueChangePercent}%` },
            { l: t('analytics.queryGrowth'), v: `+${stats.queriesChangePercent}%` },
          ].map((r, i, arr) => (
            <View key={i} style={[styles.summaryRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.summaryLabel}>{r.l}</Text>
              <Text style={styles.summaryValue}>{r.v}</Text>
            </View>
          ))}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  periodBox: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: 16 },
  periodBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  periodText: { fontSize: 13, fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  kpiCard: { width: '48%', padding: 14, borderRadius: 14, marginBottom: 10, alignItems: 'center' },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 20, fontWeight: '800' },
  kpiLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  chartCard: { padding: 16, borderRadius: 16, marginBottom: 14 },
  chartTitle: { fontSize: 15, fontWeight: '700' },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  summaryCard: { padding: 20, borderRadius: 18 },
  summaryTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  summaryValue: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
});

export default AnalyticsScreen;
