import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch } from '../../store';
import { completeOnboarding } from '../../store/slices/settingsSlice';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  { id: '1', icon: 'sparkles', title: "Adolat AI ga xush kelibsiz", sub: "O'zbekiston qonunlari bo'yicha shaxsiy maslahatchingiz", gradient: ['#0A2540', '#1E3A5F'] as [string,string] },
  { id: '2', icon: 'document-text', title: "Hujjatlarni tahlil qiling", sub: "Shartnoma, ariza yoki sud qarorini bir soniyada tushuning", gradient: ['#1565C0', '#0D47A1'] as [string,string] },
  { id: '3', icon: 'create', title: "Hujjat yarating", sub: "Ariza, shikoyat, tushuntirish hatlarini AI yozadi", gradient: ['#2E7D32', '#1B5E20'] as [string,string] },
  { id: '4', icon: 'mic', title: "Ovozli maslahat", sub: "Savolingizni gapiring — javobni eshiting", gradient: ['#6A1B9A', '#4A148C'] as [string,string] },
];

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigation<any>();
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  const finish = () => {
    dispatch(completeOnboarding());
    nav.replace('Login');
  };

  const next = () => {
    if (current < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else finish();
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            <TouchableOpacity style={styles.skipBtn} onPress={finish}>
              <Text style={styles.skipText}>O'tkazib yuborish</Text>
            </TouchableOpacity>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon as any} size={64} color={COLORS.accent} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </LinearGradient>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, current === i && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.accent }]} onPress={next}>
          <Text style={[styles.btnText, { color: COLORS.primary }]}>
            {current === slides.length - 1 ? 'Boshlash' : 'Keyingi'}
          </Text>
          <Ionicons name={current === slides.length - 1 ? 'checkmark' : 'arrow-forward'} size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: { width, height, alignItems: 'center', justifyContent: 'center', padding: 32 },
  skipBtn: { position: 'absolute', top: 56, right: 24, padding: 8 },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  iconBox: { width: 120, height: 120, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 14 },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 32, paddingBottom: 48 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  dotActive: { width: 24, backgroundColor: COLORS.accent },
  btn: { flexDirection: 'row', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', marginRight: 8 },
});

export default OnboardingScreen;
