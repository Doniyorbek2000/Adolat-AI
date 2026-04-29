import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BACKEND_URL } from '../../config/backend';

export type TierType = 'free' | 'pro' | 'ultra' | 'vip';

export interface Tariff {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  queryLimit: number;
  docLimit: number;
  voiceLimit: number;
  active: boolean;
  popular?: boolean;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
  active: boolean;
  maxUses: number;
  timesUsed: number;
  expiresAt: number;
}

export interface PaymentRecord {
  id: string;
  tariffId: string;
  tariffName: string;
  amount: number;
  method: string;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  promoCode?: string;
}

export interface UserSubscription {
  tier: TierType;
  status: 'active' | 'expired' | 'none';
  startDate: string;
  endDate: string;
  isYearly: boolean;
}

const defaultTariffs: Tariff[] = [
  { id: 'free', name: 'Free', description: 'Boshlash uchun', monthlyPrice: 0, yearlyPrice: 0, features: ['Kuniga 5 savol', '1 hujjat tahlili/oy', 'Asosiy ma\'lumotlar'], queryLimit: 5, docLimit: 1, voiceLimit: 0, active: true },
  { id: 'pro', name: 'Pro', description: 'Faol foydalanuvchilar uchun', monthlyPrice: 49000, yearlyPrice: 490000, features: ['Kuniga 50 savol', 'Oyiga 20 hujjat', 'Hujjat yaratish', 'Ovozli maslahat 30 daq'], queryLimit: 50, docLimit: 20, voiceLimit: 30, active: true, popular: true },
  { id: 'ultra', name: 'Ultra', description: 'Professional ishlar uchun', monthlyPrice: 129000, yearlyPrice: 1290000, features: ['Cheksiz savollar', 'Cheksiz hujjatlar', 'GPT-4o modeli', 'Sud amaliyoti tahlili', 'Prioritet yordam'], queryLimit: 0, docLimit: 0, voiceLimit: 0, active: true },
  { id: 'vip', name: 'VIP', description: 'Premium', monthlyPrice: 299000, yearlyPrice: 2990000, features: ['Ultra\'ning hammasi', 'Shaxsiy advokat', 'API kirish', 'Korporativ funksiyalar', '24/7 yordam'], queryLimit: 0, docLimit: 0, voiceLimit: 0, active: true },
];

const defaultPromoCodes: PromoCode[] = [
  { code: 'WELCOME20', discountPercent: 20, description: 'Yangi foydalanuvchilar uchun', active: true, maxUses: 1000, timesUsed: 142, expiresAt: new Date('2026-12-31').getTime() },
  { code: 'NEWUSER10', discountPercent: 10, description: '10% chegirma', active: true, maxUses: 0, timesUsed: 89, expiresAt: 0 },
];

interface SubscriptionState {
  userSubscription: UserSubscription;
  tariffs: Tariff[];
  promoCodes: PromoCode[];
  paymentHistory: PaymentRecord[];
  loading: boolean;
}

const initialState: SubscriptionState = {
  userSubscription: { tier: 'free', status: 'active', startDate: new Date().toISOString(), endDate: '', isYearly: false },
  tariffs: defaultTariffs,
  promoCodes: defaultPromoCodes,
  paymentHistory: [],
  loading: false,
};

const BACKEND = BACKEND_URL;

export const subscribeToTier = createAsyncThunk(
  'subscription/subscribe',
  async (data: { tierId: string; isYearly: boolean; paymentMethod: string; amount: number; promoCode?: string; userId?: string }, { rejectWithValue }) => {
    try {
      const method = data.paymentMethod.toLowerCase();

      // Click — real payment gateway
      if (method === 'click') {
        const response = await fetch(`${BACKEND}/api/payment/click/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: data.amount, userId: data.userId || '1', tierId: data.tierId, isYearly: data.isYearly })
        });
        if (!response.ok) throw new Error("Click to'lov havolasini yaratib bo'lmadi");
        const result = await response.json();
        const { Linking } = require('react-native');
        await Linking.openURL(result.url);
        return data;
      }

      // Payme — real payment gateway
      if (method === 'payme') {
        const response = await fetch(`${BACKEND}/api/payment/payme/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: data.amount, userId: data.userId || '1', tierId: data.tierId, isYearly: data.isYearly })
        });
        if (!response.ok) throw new Error("Payme to'lov havolasini yaratib bo'lmadi");
        const result = await response.json();
        const { Linking } = require('react-native');
        await Linking.openURL(result.url);
        return data;
      }

      // Uzcard / Humo / Visa — route through backend
      const response = await fetch(`${BACKEND}/api/payment/card/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: data.amount, userId: data.userId || '1', method: data.paymentMethod, tierId: data.tierId, isYearly: data.isYearly, promoCode: data.promoCode })
      });
      if (!response.ok) throw new Error("To'lov tizimiga ulanib bo'lmadi");
      const result = await response.json();
      if (result.redirect_url) {
        const { Linking } = require('react-native');
        await Linking.openURL(result.redirect_url);
      }
      return data;
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    updateTariff: (s, a: PayloadAction<Tariff>) => { const i = s.tariffs.findIndex((t) => t.id === a.payload.id); if (i !== -1) s.tariffs[i] = a.payload; },
    addTariff: (s, a: PayloadAction<Tariff>) => { s.tariffs.push(a.payload); },
    deleteTariff: (s, a: PayloadAction<string>) => { s.tariffs = s.tariffs.filter((t) => t.id !== a.payload); },
    addPromoCode: (s, a: PayloadAction<PromoCode>) => { s.promoCodes.unshift(a.payload); },
    updatePromoCode: (s, a: PayloadAction<PromoCode>) => { const i = s.promoCodes.findIndex((p) => p.code === a.payload.code); if (i !== -1) s.promoCodes[i] = a.payload; },
    deletePromoCode: (s, a: PayloadAction<string>) => { s.promoCodes = s.promoCodes.filter((p) => p.code !== a.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeToTier.pending, (s) => { s.loading = true; })
      .addCase(subscribeToTier.fulfilled, (s, a) => {
        s.loading = false;
        const { tierId, isYearly, paymentMethod, amount, promoCode } = a.payload;
        const tariff = s.tariffs.find((t) => t.id === tierId);
        const end = new Date(); end.setMonth(end.getMonth() + (isYearly ? 12 : 1));
        s.userSubscription = { tier: tierId as TierType, status: 'active', startDate: new Date().toISOString(), endDate: end.toISOString(), isYearly };
        s.paymentHistory.unshift({ id: `pay_${Date.now()}`, tariffId: tierId, tariffName: tariff?.name || tierId, amount, method: paymentMethod, status: 'success', createdAt: new Date().toISOString(), promoCode });
        if (promoCode) { const pc = s.promoCodes.find((p) => p.code === promoCode); if (pc) pc.timesUsed++; }
      })
      .addCase(subscribeToTier.rejected, (s) => { s.loading = false; });
  },
});

export const { updateTariff, addTariff, deleteTariff, addPromoCode, updatePromoCode, deletePromoCode } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
