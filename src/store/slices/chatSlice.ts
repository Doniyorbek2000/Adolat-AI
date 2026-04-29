import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BACKEND_URL } from '../../config/backend';
import uuid from 'react-native-uuid';
const uuidv4 = () => uuid.v4() as string;

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'voice' | 'image' | 'file';
  audioUri?: string;
  audioDuration?: number;
  imageUri?: string;
  fileUri?: string;
  fileName?: string;
  timestamp: string;
  error?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isTyping: boolean;
  isRecording: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  isTyping: false,
  isRecording: false,
  error: null,
};

export const sendAIMessage = createAsyncThunk(
  'chat/sendAI',
  async (
    data: { chatId: string; messages: Array<{ role: string; content: string }>; language: string; tier: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: data.messages,
          language: data.language,
          tier: data.tier
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI xatosi');
      }
      const json = await response.json();
      return { chatId: data.chatId, content: json.content };
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const transcribeAudio = createAsyncThunk(
  'chat/transcribe',
  async (data: { uri: string; language?: string }, { rejectWithValue }) => {
    try {
      const Constants = require('expo-constants').default;
      const apiKey: string = Constants.expoConfig?.extra?.openaiKey || '';
      if (!apiKey) return { text: 'Demo: ovozni matn sifatida qabul qildim' };

      const formData = new FormData();
      (formData as any).append('file', { uri: data.uri, type: 'audio/m4a', name: 'audio.m4a' });
      formData.append('model', 'whisper-1');
      formData.append('language', data.language === 'uz' ? 'uz' : data.language === 'ru' ? 'ru' : 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });
      const json = await response.json();
      return { text: json.text || '' };
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createNewChat: (s, a: PayloadAction<{ id?: string; title?: string }>) => {
      const id = a.payload.id || (uuidv4() as string);
      s.chats.unshift({ id, title: a.payload.title || 'Yangi suhbat', messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      s.activeChatId = id;
    },
    setActiveChat: (s, a: PayloadAction<string>) => { s.activeChatId = a.payload; },
    deleteChat: (s, a: PayloadAction<string>) => {
      s.chats = s.chats.filter((c) => c.id !== a.payload);
      if (s.activeChatId === a.payload) s.activeChatId = null;
    },
    addMessage: (s, a: PayloadAction<Message>) => {
      const chat = s.chats.find((c) => c.id === a.payload.chatId);
      if (chat) {
        chat.messages.push(a.payload);
        chat.lastMessage = a.payload.content.slice(0, 60);
        chat.updatedAt = new Date().toISOString();
        if (chat.messages.length === 1) chat.title = a.payload.content.slice(0, 35) || 'Yangi suhbat';
      }
    },
    deleteMessage: (s, a: PayloadAction<{ chatId: string; messageId: string }>) => {
      const chat = s.chats.find((c) => c.id === a.payload.chatId);
      if (chat) chat.messages = chat.messages.filter((m) => m.id !== a.payload.messageId);
    },
    setTyping: (s, a: PayloadAction<boolean>) => { s.isTyping = a.payload; },
    setRecording: (s, a: PayloadAction<boolean>) => { s.isRecording = a.payload; },
    clearAllChats: (s) => { s.chats = []; s.activeChatId = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAIMessage.pending, (s) => { s.isTyping = true; s.error = null; })
      .addCase(sendAIMessage.fulfilled, (s, a) => {
        s.isTyping = false;
        const chat = s.chats.find((c) => c.id === a.payload.chatId);
        if (chat) {
          const msg: Message = { id: uuidv4() as string, chatId: a.payload.chatId, role: 'assistant', content: a.payload.content, type: 'text', timestamp: new Date().toISOString() };
          chat.messages.push(msg);
          chat.lastMessage = msg.content.slice(0, 60);
          chat.updatedAt = new Date().toISOString();
        }
      })
      .addCase(sendAIMessage.rejected, (s, a) => { s.isTyping = false; s.error = a.payload as string; });
  },
});

export const { createNewChat, setActiveChat, deleteChat, addMessage, deleteMessage, setTyping, setRecording, clearAllChats } = chatSlice.actions;
export default chatSlice.reducer;
