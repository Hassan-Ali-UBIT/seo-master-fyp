import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AdminAuthState {
  admin: {
    id: string;
    email: string;
    name: string;
    role: 'admin';
    permissions: string[];
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAdmin: (state, action: PayloadAction<AdminAuthState['admin']>) => {
      state.admin = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { setLoading, setAdmin, setError, logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
