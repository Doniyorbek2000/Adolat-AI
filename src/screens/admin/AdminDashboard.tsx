import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState, AppDispatch } from '../../store';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n);

const AdminDashboard: React.FC = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardStats: stats, loading } = useSelector((s: RootState) => s.admin);

  useEffect(() => { dispatch(fetchDashboardStats()); }, []);

  const chartCfg = { backgroundGradientFrom: colors.surface, backgroundGradientTo: colors.surface, decimalPlaces: 0, color: (o=1) => isDark ? `rgba(212,175,55,${o})` : `rgba(10,37,64,${o})`, labelColor: (o=1) => isDark ? `rgba(200,200,200,${o})` : `rgba(80,80,80,${o})`, style: { borderRadius: 14 } };

  if (loading && !stats) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!stats) return null;

  const statCards = [
    { icon: 'people', label: t('admin.totalUsers'), value: fmt(stats.totalUsers), grad: ['#0A2540','#1a3a5c'] as [string,string] },
    { icon: 'cash', label: t('admin.revenue'), value: fmt(stats.totalRevenue), grad: ['#2E7D32','#1B5E20'] as [string,string] },
    { icon: 'flash', label: t('admin.activeSubscriptions'), value: fmt(stats.activeSubscriptions), grad: ['#D4AF37','#B8941E'] as [string,string] },
    { icon: 'chatbubbles', label: t('admin.aiQueries'), value: fmt(stats.totalQueries), grad: ['#7B1FA2','#4A148C'] as [string,string] },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}><Ionicons name="menu" size={26} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('admin.dashboard')}</Text>
        <TouchableOpacity onPress={() => dispatch(fetchDashboardStats())} style={styles.iconBtn}><Ionicons name="refresh" size={22} color={colors.text} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>{t('admin.welcomeBack')}</Text>
        <Text style={[{ color: colors.textSecondary, fontSize: 13, marginBottom: 18 }]}>{new Date().toLocaleDateString(i18n.language, { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</Text>

        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={[styles.statCard, SHADOWS.small]}>
              <LinearGradient colors={s.grad} style={styles.statGrad}>
                <Ionicons name={s.icon as any} size={22} color="#fff" />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>{t('admin.revenueOverTime')}</Text>
          <LineChart data={{ labels: stats.revenueChart.labels, datasets: [{ data: stats.revenueChart.values }] }} width={width-64} height={180} chartConfig={chartCfg} bezier style={{ marginTop: 8, borderRadius: 14 }} withInnerLines={false} withOuterLines={false} />
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>{t('admin.userGrowth')}</Text>
          <BarChart data={{ labels: stats.userGrowth.labels, datasets: [{ data: stats.userGrowth.values }] }} width={width-64} height={180} yAxisLabel="" yAxisSuffix="" chartConfig={chartCfg} style={{ marginTop: 8, borderRadius: 14 }} fromZero withInnerLines={false} showBarTops={false} />
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>{t('admin.tierDistribution')}</Text>
          {Object.entries(stats.tierDistribution).map(([tier, count]) => {
            const pct = (Number(count) / stats.totalUsers) * 100;
            return (
              <View key={tier} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[{ color: colors.text, fontSize: 13, fontWeight: '600' }]}>{tier.toUpperCase()}</Text>
                  <Text style={[{ color: colors.textSecondary, fontSize: 12 }]}>{fmt(Number(count))} ({pct.toFixed(1)}%)</Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: COLORS.tier[tier as keyof typeof COLORS.tier] || COLORS.primary }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.primary }]} onPress={() => navigation.navigate('Users')}>
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.quickText}>{t('admin.manageUsers')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, { backgroundColor: COLORS.accent }]} onPress={() => navigation.navigate('Tariffs')}>
            <Ionicons name="pricetags" size={18} color={COLORS.primary} />
            <Text style={[styles.quickText, { color: COLORS.primary }]}>{t('admin.manageTariffs')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  welcomeText: { fontSize: 20, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  statCard: { width: '48%', borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  statGrad: { padding: 14, minHeight: 100 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 10 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  chartCard: { padding: 16, borderRadius: 16, marginTop: 12 },
  chartTitle: { fontSize: 15, fontWeight: '700' },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  quickRow: { flexDirection: 'row', marginTop: 14, justifyContent: 'space-between' },
  quickBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  quickText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },
});

export default AdminDashboard;
