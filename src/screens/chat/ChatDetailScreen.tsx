import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { RootState, AppDispatch } from '../../store';
import { createNewChat, addMessage, deleteMessage, sendAIMessage, Message } from '../../store/slices/chatSlice';
import { useTheme } from '../../constants/ThemeContext';
import { COLORS, SHADOWS } from '../../constants/theme';

const uuidv4 = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const ChatDetailScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { chatId: routeChatId, isNew, prefill } = route.params || {};

  const chats = useSelector((s: RootState) => s.chat.chats);
  const isTyping = useSelector((s: RootState) => s.chat.isTyping);
  const subscription = useSelector((s: RootState) => s.subscription.userSubscription);

  const [activeChatId, setActiveChatId] = useState<string>(routeChatId || '');
  const [showSidebar, setShowSidebar] = useState(Platform.OS === 'web');
  const [text, setText] = useState(prefill || '');
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const chat = chats.find((c) => c.id === activeChatId);
  const messages = chat?.messages || [];

  useEffect(() => {
    if (isNew || !routeChatId) {
      const id = `chat_${Date.now()}`;
      dispatch(createNewChat({ id, title: prefill?.slice(0, 30) || t('chat.newChat') }));
      setActiveChatId(id);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  const send = async (content: string, type: Message['type'] = 'text', extra?: Partial<Message>) => {
    if (!content.trim() && type === 'text') return;
    const cid = activeChatId;
    const userMsg: Message = { id: uuidv4(), chatId: cid, role: 'user', content, type, timestamp: new Date().toISOString(), ...extra };
    dispatch(addMessage(userMsg));
    setText('');
    setSending(true);
    try {
      const allMsgs = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      await dispatch(sendAIMessage({ chatId: cid, messages: allMsgs, language: i18n.language, tier: subscription.tier })).unwrap();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('errors.generic'));
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert(t('common.error'), t('chat.galleryPermission')); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets[0]) await send(t('chat.analyzeImage') || 'Rasmni tahlil qil', 'image', { imageUri: res.assets[0].uri });
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!res.canceled && res.assets[0]) await send(res.assets[0].name, 'file', { fileUri: res.assets[0].uri, fileName: res.assets[0].name });
  };

  const handleLongPress = (msg: Message) => {
    const opts = [
      { text: t('chat.copy'), onPress: () => Clipboard.setStringAsync(msg.content) },
      { text: t('chat.delete'), style: 'destructive' as const, onPress: () => dispatch(deleteMessage({ chatId: activeChatId, messageId: msg.id })) },
      { text: t('common.cancel'), style: 'cancel' as const },
    ];
    Alert.alert('', '', opts);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <TouchableOpacity onLongPress={() => handleLongPress(item)} activeOpacity={0.8}>
        <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
          {!isUser && (
            <View style={[styles.aiAvatar, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="sparkles" size={14} color={COLORS.accent} />
            </View>
          )}
          <View style={[styles.bubble, isUser ? [styles.userBubble, { backgroundColor: COLORS.primary }] : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }], SHADOWS.small]}>
            {item.type === 'image' && item.imageUri && (
              <View style={[styles.fileBadge, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="image" size={16} color={COLORS.primary} />
                <Text style={[styles.fileBadgeText, { color: COLORS.primary }]}>Rasm</Text>
              </View>
            )}
            {item.type === 'file' && (
              <View style={[styles.fileBadge, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="document" size={16} color={COLORS.primary} />
                <Text style={[styles.fileBadgeText, { color: COLORS.primary }]}>{item.fileName || 'Fayl'}</Text>
              </View>
            )}
            <Text style={[styles.msgText, { color: isUser ? '#fff' : colors.text }]}>{item.content}</Text>
            <Text style={[styles.msgTime, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.textSecondary }]}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => Platform.OS === 'web' ? setShowSidebar(!showSidebar) : nav.goBack()} style={styles.iconBtn}>
          <Ionicons name={Platform.OS === 'web' ? "menu" : "chevron-back"} size={26} color={colors.text} />
        </TouchableOpacity>
        {!Platform.OS || Platform.OS !== 'web' && (
          <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)} style={styles.iconBtn}>
            <Ionicons name="menu" size={26} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{chat?.title || t('chat.newChat')}</Text>
          <Text style={[styles.headerSub, { color: '#22C55E' }]}>● {t('chat.online')}</Text>
        </View>
        <TouchableOpacity onPress={() => {
            const id = `chat_${Date.now()}`;
            dispatch(createNewChat({ id, title: t('chat.newChat') }));
            setActiveChatId(id);
          }} style={styles.iconBtn}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Sidebar */}
        {showSidebar && (
          <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
            <TouchableOpacity style={[styles.newChatBtn, { backgroundColor: COLORS.primary }]} onPress={() => {
              const id = `chat_${Date.now()}`;
              dispatch(createNewChat({ id, title: t('chat.newChat') }));
              setActiveChatId(id);
              if (Platform.OS !== 'web') setShowSidebar(false);
            }}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.newChatText}>{t('chat.newChat')}</Text>
            </TouchableOpacity>
            <FlatList
              data={chats}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.sidebarItem, item.id === activeChatId && { backgroundColor: COLORS.primary + '20' }]}
                  onPress={() => { setActiveChatId(item.id); if (Platform.OS !== 'web') setShowSidebar(false); }}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={item.id === activeChatId ? COLORS.primary : colors.textSecondary} />
                  <Text style={[styles.sidebarItemText, { color: item.id === activeChatId ? COLORS.primary : colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        
        {/* Main Chat Area */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {messages.length === 0 ? (
          <View style={styles.welcome}>
            <View style={[styles.welcomeIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="sparkles" size={40} color={COLORS.primary} />
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>{t('chat.welcomeTitle')}</Text>
            <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>{t('chat.welcomeSub')}</Text>
            <View style={styles.sugs}>
              {[t('chat.sug1'), t('chat.sug2'), t('chat.sug3')].map((s, i) => (
                <TouchableOpacity key={i} style={[styles.sugBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => send(s)}>
                  <Text style={[styles.sugText, { color: colors.text }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={renderMessage}
            ListFooterComponent={isTyping ? (
              <View style={[styles.msgRow]}>
                <View style={[styles.aiAvatar, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name="sparkles" size={14} color={COLORS.accent} />
                </View>
                <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                  </View>
                </View>
              </View>
            ) : null}
          />
        )}

        {/* Input */}
        <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn} onPress={pickFile}>
            <Ionicons name="attach-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={text}
            onChangeText={setText}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: text.trim() ? COLORS.primary : colors.border }]}
            onPress={() => send(text)}
            disabled={!text.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 0.5 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 1 },
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  welcomeIcon: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  welcomeSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  sugs: { width: '100%' },
  sugBtn: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  sugText: { fontSize: 14 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  fileBadge: { flexDirection: 'row', alignItems: 'center', padding: 6, borderRadius: 8, marginBottom: 6 },
  fileBadgeText: { fontSize: 12, marginLeft: 6, fontWeight: '600' },
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  typingDots: { flexDirection: 'row', padding: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 3, opacity: 0.6 },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, borderTopWidth: 0.5 },
  attachBtn: { padding: 8 },
  textInput: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, fontSize: 15, maxHeight: 100, marginHorizontal: 4 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sidebar: { width: 280, borderRightWidth: 1, height: '100%' },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, margin: 12, borderRadius: 12, justifyContent: 'center' },
  newChatText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 4 },
  sidebarItemText: { fontSize: 14, marginLeft: 10, flex: 1 },
});

export default ChatDetailScreen;
