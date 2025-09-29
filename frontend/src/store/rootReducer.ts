import { combineReducers } from '@reduxjs/toolkit';
import userAuthReducer from './features/userAuthSlice';
import adminAuthReducer from './features/adminAuthSlice';
import userDashboardReducer from './features/userDashboardSlice';
import adminDashboardReducer from './features/adminDashboardSlice';
import linkedinReducer from './features/linkedinSlice';
import paymentReducer from './features/paymentSlice';
import seoReducer from './features/seoSlice';

const rootReducer = combineReducers({
  userAuth: userAuthReducer,
  adminAuth: adminAuthReducer,
  userDashboard: userDashboardReducer,
  adminDashboard: adminDashboardReducer,
  linkedin: linkedinReducer,
  payment: paymentReducer,
  seo: seoReducer,
});

export default rootReducer;
