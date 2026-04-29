import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { BACKEND_URL } from '../../config/backend';

const setToken = async (token: string) => {
  if (Platform.OS === 'web') await AsyncStorage.setItem('token', token);
  else await SecureStore.setItemAsync('token', token);
};

const deleteToken = async () => {
  if (Platform.OS === 'web') await AsyncStorage.removeItem('token');
  else await SecureStore.deleteItemAsync('token');
};

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: { login: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || "Login yoki parol noto'g'ri");
      }
      const result = await response.json();
      await setToken(result.token);
      return result;
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { fullName: string; email: string; phone: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Registering with:', BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) {
        return rejectWithValue(result.error || "Xatolik yuz berdi");
      }
      await setToken(result.token);
      return result;
    } catch (e: any) {
      console.error('Registration fetch error:', e);
      return rejectWithValue(e.message || "Server bilan bog'lanib bo'lmadi");
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await deleteToken();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { fullName?: string; phone?: string; avatarUrl?: string }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const userId = state.auth?.user?.id;
      const token = state.auth?.token;
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName: data.fullName, phone: data.phone, avatarUrl: data.avatarUrl })
      });
      if (!response.ok) throw new Error("Profilni yangilashda xatolik");
      return data;
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: { oldPassword?: string; currentPassword?: string; newPassword: string }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth?.token;
      const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: data.currentPassword || data.oldPassword, newPassword: data.newPassword })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Parolni o'zgartirishda xatolik");
      return { success: true };
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; s.isAuthenticated = true; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; s.token = null; s.isAuthenticated = false; })
      .addCase(updateProfile.fulfilled, (s, a) => { if (s.user) { Object.assign(s.user, a.payload); } })
      .addCase(changePassword.rejected, (s, a) => { s.error = a.payload as string; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
