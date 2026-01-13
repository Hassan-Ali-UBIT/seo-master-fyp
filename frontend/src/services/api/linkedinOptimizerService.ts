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
  job_id: number;
  profile_snapshot_id: number;
  optimization_summary?: string;
  keyword_clusters?: string[];
  recommendations?: string[];
  competitor_insights?: string[];
  action_items?: string[];
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
  const res = await api.get<{ data: OptimizationResult; message: string }>(
    `${LINKEDIN_API_BASE}result/${jobId}/`
  );
  return res.data;
}

/**
 * GET /api/linkedin/optimization/<result_id>
 * Get specific optimization result by result ID
 */
export async function getOptimizationDetail(resultId: number) {
  const res = await api.get<{ data: OptimizationResult; message: string }>(
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
  const res = await api.get<{ data: ProfileHistory[]; message: string }>(
    `${LINKEDIN_API_BASE}history/`
  );
  return res.data;
}
