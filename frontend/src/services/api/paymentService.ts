import api from "./axios";

export interface Plan {
  id: number;
  title: string;
  sub_title?: string;
  price: number;
  billing_period: string; // 'monthly', 'yearly', 'other'
  billing_type: string; // 'one_time', 'subscription'
  features?: string[]; // Frontend might expect features list, but backend has specific quotas. We might need to map them or backend sends features list.
  max_users: number;
  credits: number;
  ai_words_limit: number;
  keywords_limit: number;
  pages_limit: number;
  is_active: boolean;
}

export const getPricePlans = async (): Promise<Plan[]> => {
  const response = await api.get('payment/price-plans/');
  return response.data.data; // Assuming DRF generic viewset returns list or paginated list. If paginated, it might be response.data.results
};

export const createPricePlan = async (data: Partial<Plan>): Promise<Plan> => {
  const response = await api.post('payment/price-plans/', data);
  return response.data;
};

export const createCheckoutSession = async (planId: number): Promise<{ url: string }> => {
  const response = await api.post('payment/create-checkout-session/', { plan_id: planId });
  return response.data.data;
};
