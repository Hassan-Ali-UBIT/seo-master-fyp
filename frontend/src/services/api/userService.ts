import api from "./axios";

export interface UserResources {
  id: number;
  user: number;
  total_credits: number;
  credits_used: number;
  total_ai_words_limit: number;
  ai_words_used: number;
  total_keywords_limit: number;
  keywords_used: number;
  total_pages_limit: number;
  pages_used: number;
  total_projects_limit: number;
  projects_used: number;
  subscription_start: string | null;
  subscription_end: string | null;
  is_active: boolean;
  plan_name: string | null; // Assuming backend might send plan name or we derive it
}

export async function getUserResources() {
  const res = await api.get("users/me/user-resource/");
  return res.data.data.user_resource as UserResources | null;
}
