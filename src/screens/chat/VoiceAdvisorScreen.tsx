import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';
import { RootState, AppDispatch } from '../../store';
import { sendAIMessage, transcribeAudio } from '../../store/slices/chatSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS } from '../../constants/theme';

type State = 'idle' | 'listening' | 'thinking' | 'speaking';

const VoiceAdvisorScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const subscription = useSelector((s: RootState) => s.subscription.userSubscription);
  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startPulse = () => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
  };
  const stopPulse = () => { pulseAnim.stopAnimation(); pulseAnim.setValue(1); };

  const handlePress = async () => {
    if (state === 'idle') {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert(t('common.error'), t('chat.micPermission')); return; }
      setState('listening');
      startPulse();
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        recordingRef.current = recording;
      } catch (e) { setState('idle'); stopPulse(); }
    } else if (state === 'listening') {
      stopPulse();
      setState('thinking');
      try {
        await recordingRef.current?.stopAndUnloadAsync();
        const uri = recordingRef.current?.getURI() || '';
        recordingRef.current = null;
        const result = await dispatch(transcribeAudio({ uri, language: i18n.language })).unwrap();
        const text = result?.text || '';
        setTranscript(text || 'Demo: ovozli savol');
        const aiRes = await dispatch(sendAIMessage({ chatId: 'voice_chat', messages: [{ role: 'user', content: text || 'Salom' }], language: i18n.language, tier: subscription.tier })).unwrap();
        setState('speaking');
        setResponse(aiRes.content || '');
      } catch (e: any) {
        setState('idle');
        Alert.alert(t('common.error'), e.message);
      }
    } else {
      setState('idle');
      setTranscript('');
      setResponse('');
    }
  };

  const iconMap: Record<State, string> = { idle: 'mic', listening: 'stop', thinking: 'hourglass', speaking: 'volume-high' };
  const labelMap: Record<State, string> = { idle: t('voice.tapToStart'), listening: t('voice.listening'), thinking: t('voice.thinking'), speaking: t('voice.speaking') };
  const colorMap: Record<State, [string, string]> = { idle: [COLORS.primary, COLORS.primaryDark], listening: ['#D32F2F', '#B71C1C'], thinking: ['#F57F17', '#E65100'], speaking: ['#2E7D32', '#1B5E20'] };

  return (
    <LinearGradient colors={colorMap[state]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('voice.title')}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          {transcript ? (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>{t('voice.you')}:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          ) : null}

          <Animated.View style={[styles.micOuter, { transform: [{ scale: pulseAnim }], backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <TouchableOpacity style={[styles.micBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]} onPress={handlePress}>
              <Ionicons name={iconMap[state] as any} size={52} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.stateLabel}>{labelMap[state]}</Text>

          {response ? (
            <View style={styles.responseBox}>
              <Ionicons name="sparkles" size={18} color={COLORS.accent} />
              <Text style={styles.responseText}>{response}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  transcriptBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, marginBottom: 32, width: '100%' },
  transcriptLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  transcriptText: { color: '#fff', fontSize: 16, lineHeight: 24 },
  micOuter: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  micBtn: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  stateLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: '600', marginBottom: 32 },
  responseBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, width: '100%', flexDirection: 'row' },
  responseText: { color: '#fff', fontSize: 15, lineHeight: 22, flex: 1, marginLeft: 10 },
});

export default VoiceAdvisorScreen;
