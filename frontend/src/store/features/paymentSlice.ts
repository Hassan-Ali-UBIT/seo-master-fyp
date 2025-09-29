import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface PaymentState {
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    expiryDate: string;
    features: string[];
  } | null;
  paymentHistory: Array<{
    id: string;
    amount: number;
    date: string;
    status: 'success' | 'failed' | 'pending';
    description: string;
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  subscription: null,
  paymentHistory: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSubscription: (state, action: PayloadAction<PaymentState['subscription']>) => {
      state.subscription = action.payload;
    },
    setPaymentHistory: (state, action: PayloadAction<PaymentState['paymentHistory']>) => {
      state.paymentHistory = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setSubscription, setPaymentHistory, setError } = paymentSlice.actions;
export default paymentSlice.reducer;
