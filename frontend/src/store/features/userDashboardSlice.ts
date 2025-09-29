import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserDashboardState {
  stats: {
    totalAnalyses: number;
    linkedinOptimizations: number;
    seoScore: number;
    monthlyUsage: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: UserDashboardState = {
  stats: {
    totalAnalyses: 0,
    linkedinOptimizations: 0,
    seoScore: 0,
    monthlyUsage: 0,
  },
  recentActivity: [],
  loading: false,
  error: null,
};

const userDashboardSlice = createSlice({
  name: 'userDashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStats: (state, action: PayloadAction<UserDashboardState['stats']>) => {
      state.stats = action.payload;
    },
    setRecentActivity: (state, action: PayloadAction<UserDashboardState['recentActivity']>) => {
      state.recentActivity = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setStats, setRecentActivity, setError } = userDashboardSlice.actions;
export default userDashboardSlice.reducer;
