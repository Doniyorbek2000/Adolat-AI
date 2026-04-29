import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BACKEND_URL } from '../../config/backend';

export interface AdminUser {
  id: string; fullName: string; email: string; phone?: string;
  role: 'user' | 'admin'; tier: 'free' | 'pro' | 'ultra' | 'vip';
  createdAt: string; lastActive: string; blocked: boolean;
  totalChats: number; totalDocs: number; totalSpent: number;
}

export interface DashboardStats {
  totalUsers: number; activeSubscriptions: number; totalRevenue: number; totalQueries: number;
  newUsersToday: number; revenueChangePercent: number; queriesChangePercent: number;
  tierDistribution: { free: number; pro: number; ultra: number; vip: number };
  revenueChart: { labels: string[]; values: number[] };
  userGrowth: { labels: string[]; values: number[] };
}

interface AdminState { dashboardStats: DashboardStats | null; users: AdminUser[]; loading: boolean; }

const BACKEND = BACKEND_URL;

export const fetchDashboardStats = createAsyncThunk('admin/stats', async () => {
  const response = await fetch(`${BACKEND}/api/admin/stats`);
  const data = await response.json();
  return data as DashboardStats;
});

export const fetchUsers = createAsyncThunk('admin/users', async () => {
  const response = await fetch(`${BACKEND}/api/admin/users`);
  const data = await response.json();
  return data as AdminUser[];
});

export const blockUser = createAsyncThunk('admin/block', async (id: string) => {
  await fetch(`${BACKEND}/api/admin/users/${id}/block`, { method: 'POST' });
  return id;
});
export const unblockUser = createAsyncThunk('admin/unblock', async (id: string) => {
  await fetch(`${BACKEND}/api/admin/users/${id}/unblock`, { method: 'POST' });
  return id;
});

const adminSlice = createSlice({
  name: 'admin', initialState: { dashboardStats: null, users: [], loading: false } as AdminState, reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (s) => { s.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (s, a) => { s.loading = false; s.dashboardStats = a.payload; })
      .addCase(fetchDashboardStats.rejected, (s) => { s.loading = false; })
      .addCase(fetchUsers.pending, (s) => { s.loading = true; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.users = a.payload; })
      .addCase(fetchUsers.rejected, (s) => { s.loading = false; })
      .addCase(blockUser.fulfilled, (s, a) => { const u = s.users.find((u) => u.id === a.payload); if (u) u.blocked = true; })
      .addCase(unblockUser.fulfilled, (s, a) => { const u = s.users.find((u) => u.id === a.payload); if (u) u.blocked = false; });
  },
});

export default adminSlice.reducer;
