import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface SEOState {
  analysis: {
    url: string;
    score: number;
    issues: Array<{
      type: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
      suggestion: string;
    }>;
    keywords: Array<{
      keyword: string;
      density: number;
      position: number;
    }>;
    competitors: Array<{
      domain: string;
      score: number;
      backlinks: number;
    }>;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: SEOState = {
  analysis: null,
  loading: false,
  error: null,
};

const seoSlice = createSlice({
  name: 'seo',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAnalysis: (state, action: PayloadAction<SEOState['analysis']>) => {
      state.analysis = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAnalysis: (state) => {
      state.analysis = null;
    },
  },
});

export const { setLoading, setAnalysis, setError, clearAnalysis } = seoSlice.actions;
export default seoSlice.reducer;
