import api from "./axios";

export interface DashboardCounts {
  total_users: number;
  total_modules: number;
  total_plans: number;
  total_revenue: number;
}

export interface SignupData {
  month: string;
  count: number;
}

export interface ModuleUsageData {
  module: string;
  usage: number;
}

export const getDashboardCounts = async (): Promise<DashboardCounts> => {
  const response = await api.get('dashboard/counts/');
  return response.data.data;
};

export const getSignupsGraph = async (): Promise<SignupData[]> => {
  const response = await api.get('dashboard/signups-graph/');
  return response.data.data;
};

export const getModuleUsage = async (): Promise<ModuleUsageData[]> => {
  const response = await api.get('dashboard/module-usage/');
  return response.data.data;
};
