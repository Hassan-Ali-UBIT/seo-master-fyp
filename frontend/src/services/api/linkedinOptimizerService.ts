import api from "./axios";

const LINKEDIN_API_BASE = "linkedin/";

/**
 * Profile Snapshot Types
 */
export interface UserProfileSnapshot {
  id: number;
  headline_text?: string;
  about_text?: string;
  experience_text?: string;
  skills_text?: string;
  raw_input_type: "manual" | "oauth";
  linkedin_profile_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileSnapshotPayload {
  headline_text?: string;
  about_text?: string;
  experience_text?: string;
  skills_text?: string;
  linkedin_profile_url?: string;
}

/**
 * LinkedIn OAuth Types
 */
export interface LinkedInOAuthAuthorizationResponse {
  authorization_url: string;
  state: string;
}

export interface LinkedInOAuthCallbackPayload {
  code: string;
  state?: string;
}

/**
 * Optimization Context Types
 */
export interface OptimizationContext {
  id: number;
  target_role: string;
  target_location: string;
  industry: string;
  experience_level: "junior" | "mid" | "senior" | "lead";
  additional_notes?: string;
  created_at: string;
}

export interface CreateOptimizationPayload {
  profile_snapshot_id: number;
  target_role: string;
  target_location: string;
  industry: string;
  experience_level: "junior" | "mid" | "senior" | "lead";
  additional_notes?: string;
}

/**
 * Optimization Job Types
 */
export interface OptimizationJob {
  id: number;
  status: string;
  celery_task_id: string;
  created_at: string;
  updated_at: string;
}

export interface OptimizationJobDetail extends OptimizationJob {
  profile_snapshot: UserProfileSnapshot;
  context: OptimizationContext;
}

/**
 * Optimization Result Types
 */
export interface OptimizationResult {
  id: number;
  profile_snapshot?: UserProfileSnapshot;
  optimized_headline: string;
  optimized_about: string;
  optimized_experience: { bullet: string; type: string }[];
  recommended_skills: { skill: string; action: string; priority: string }[];
  gap_analysis: { keywords: string[]; sections: string[] };
  seo_score: number;
  keyword_relevance_score: number;
  profile_completeness_score: number;
  skill_match_score: number;
  structural_quality_score: number;
  checklist_items: any[];
  created_at: string;
}

/**
 * Profile History Types
 */
export interface ProfileHistory {
  id: number;
  headline_text?: string;
  about_text?: string;
  experience_text?: string;
  skills_text?: string;
  raw_input_type: string;
  linkedin_profile_url?: string;
  created_at: string;
  updated_at: string;
  context?: OptimizationContext;
  optimization_results?: OptimizationResult[];
}

/**
 * ============================================================
 * PROFILE SNAPSHOT ENDPOINTS
 * ============================================================
 */

/**
 * POST /api/linkedin/profile/input
 * Create a new profile snapshot with manual input
 */
export async function createProfileSnapshot(
  payload: CreateProfileSnapshotPayload
) {
  const res = await api.post<{ data: UserProfileSnapshot; message: string }>(
    `${LINKEDIN_API_BASE}profile/input/`,
    payload
  );
  return res.data;
}

/**
 * GET /api/linkedin/profiles
 * Get all user's profile snapshots
 */
export async function getProfileSnapshots() {
  const res = await api.get<{ data: UserProfileSnapshot[]; message: string }>(
    `${LINKEDIN_API_BASE}profiles/`
  );
  return res.data;
}

/**
 * DELETE /api/linkedin/profile/<profile_id>
 * Delete a specific profile snapshot
 */
export async function deleteProfileSnapshot(profileId: number) {
  const res = await api.delete<{ data: null; message: string }>(
    `${LINKEDIN_API_BASE}profile/${profileId}/`
  );
  return res.data;
}

/**
 * POST /api/linkedin/profile/fetch-url
 * Fetch LinkedIn profile data from a specific URL
 */
export async function fetchProfileFromUrl(linkedin_profile_url: string, useCache: boolean) {
  const res = await api.post<{ data: UserProfileSnapshot; message: string }>(
    `${LINKEDIN_API_BASE}profile/fetch-url/`,
    { linkedin_profile_url, useCache }
  );
  return res.data;
}

/**
 * ============================================================
 * LINKEDIN OAUTH ENDPOINTS
 * ============================================================
 */

/**
 * GET /api/linkedin/oauth/authorize
 * Get LinkedIn OAuth authorization URL
 */
export async function getLinkedInAuthorizationUrl() {
  const res = await api.get<{
    data: LinkedInOAuthAuthorizationResponse;
    message: string;
  }>(`${LINKEDIN_API_BASE}oauth/authorize/`);
  return res.data;
}

/**
 * POST /api/linkedin/oauth/callback
 * Handle LinkedIn OAuth callback with authorization code
 */
export async function handleLinkedInOAuthCallback(
  payload: LinkedInOAuthCallbackPayload
) {
  const res = await api.post<{ data: UserProfileSnapshot; message: string }>(
    `${LINKEDIN_API_BASE}oauth/callback/`,
    payload,
    { skipAuth: true }
  );
  return res.data;
}

/**
 * ============================================================
 * OPTIMIZATION ENDPOINTS
 * ============================================================
 */

/**
 * POST /api/linkedin/optimize
 * Start a new optimization job
 */
export async function startOptimization(payload: CreateOptimizationPayload) {
  const res = await api.post<{
    data: { job_id: number; celery_task_id: string; status: string };
    message: string;
  }>(`${LINKEDIN_API_BASE}optimize/`, payload);
  return res.data;
}

/**
 * GET /api/linkedin/job/<job_id>
 * Get optimization job status
 */
export async function getOptimizationJobStatus(jobId: number) {
  const res = await api.get<{ data: OptimizationJobDetail; message: string }>(
    `${LINKEDIN_API_BASE}job/${jobId}/`
  );
  return res.data;
}

/**
 * ============================================================
 * RESULT ENDPOINTS
 * ============================================================
 */

/**
 * GET /api/linkedin/result/<job_id>
 * Get completed optimization result by job ID
 */
export async function getOptimizationResult(jobId: number) {
  const res = await api.get<{ data: { data:  OptimizationResult; message: string } }>(
    `${LINKEDIN_API_BASE}result/${jobId}/`
  );
  return res.data;
}

/**
 * GET /api/linkedin/optimization/<result_id>
 * Get specific optimization result by result ID
 */
export async function getOptimizationDetail(resultId: number) {
  const res = await api.get<{ data: { data:  OptimizationResult; message: string } }>(
    `${LINKEDIN_API_BASE}optimization/${resultId}/`
  );
  return res.data;
}

/**
 * ============================================================
 * HISTORY ENDPOINTS
 * ============================================================
 */

/**
 * GET /api/linkedin/history
 * Get user's profile optimization history
 */
export async function getProfileHistory() {
  const res = await api.get<{ data: { data: ProfileHistory[]; message: string } }>(
    `${LINKEDIN_API_BASE}history/`
  );
  return res.data;
}


/**
 * ============================================================
 * LINKEDIN POST ENDPOINTS
 * ============================================================
 */

export interface LinkedInPost {
  id: number;
  topic: string;
  description: string;
  keywords: string;
  hook: string;
  image: string; // URL or base64
  created_at: string;
  updated_at: string;
}

export interface GeneratePostResponse {
  data: {
    topic: string;
    hook: string;
    body: string;
    keywords: string;
    image_base64: string;
  };
  message: string;
}

/**
 * POST /api/linkedin/posts/generate/
 * Generate content and image for a post
 */
export async function generateLinkedInPost(topic: string) {
  const res = await api.post<GeneratePostResponse>(
    `${LINKEDIN_API_BASE}posts/generate/`,
    { topic }
  );
  return res.data.data;
}

/**
 * GET /api/linkedin/posts/
 * Get all saved posts
 */
export async function getSavedPosts() {
  const res = await api.get(
    `${LINKEDIN_API_BASE}posts/`
  );
  return res.data.data;
}

/**
 * POST /api/linkedin/posts/
 * Save a new post
 */
export async function savePost(data: Partial<LinkedInPost> & { image_base64?: string }) {
  const res = await api.post(
    `${LINKEDIN_API_BASE}posts/`,
    data
  );
  return res.data.data;
}

/**
 * DELETE /api/linkedin/posts/<id>/
 * Delete a post
 */
export async function deletePost(id: number) {
  const res = await api.delete(
    `${LINKEDIN_API_BASE}posts/${id}/`
  );
  return res.data;
}

/**
 * PATCH /api/linkedin/posts/<id>/
 * Update a post
 */
export async function updatePost(id: number, data: Partial<LinkedInPost>) {
    const res = await api.patch(
        `${LINKEDIN_API_BASE}posts/${id}/`,
        data
    );
    return res.data.data;
}
