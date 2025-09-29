import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AdminDashboardState {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    systemHealth: number;
  };
  userMetrics: Array<{
    id: string;
    name: string;
    email: string;
    lastActive: string;
    subscription: string;
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    systemHealth: 100,
  },
  userMetrics: [],
  loading: false,
  error: null,
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStats: (state, action: PayloadAction<AdminDashboardState['stats']>) => {
      state.stats = action.payload;
    },
    setUserMetrics: (state, action: PayloadAction<AdminDashboardState['userMetrics']>) => {
      state.userMetrics = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setStats, setUserMetrics, setError } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
