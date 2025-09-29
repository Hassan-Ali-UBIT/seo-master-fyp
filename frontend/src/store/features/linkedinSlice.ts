import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface LinkedInState {
  profile: {
    id: string;
    name: string;
    headline: string;
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      duration: string;
    }>;
    skills: string[];
  } | null;
  analysis: {
    score: number;
    suggestions: Array<{
      category: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    strengths: string[];
    weaknesses: string[];
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: LinkedInState = {
  profile: null,
  analysis: null,
  loading: false,
  error: null,
};

const linkedinSlice = createSlice({
  name: 'linkedin',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProfile: (state, action: PayloadAction<LinkedInState['profile']>) => {
      state.profile = action.payload;
    },
    setAnalysis: (state, action: PayloadAction<LinkedInState['analysis']>) => {
      state.analysis = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.analysis = null;
    },
  },
});

export const { setLoading, setProfile, setAnalysis, setError, clearProfile } = linkedinSlice.actions;
export default linkedinSlice.reducer;
