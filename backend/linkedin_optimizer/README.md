# LinkedIn Profile Optimizer - Backend Implementation

## Overview

Complete Django app for LinkedIn profile optimization with async Celery processing, competitor discovery via Tavily API, LLM-powered content generation using Azure VM (Qwen), and comprehensive SEO scoring.

## Architecture

### Models

1. **UserProfileSnapshot** - Stores user's LinkedIn profile data (manual or OAuth)
2. **OptimizationContext** - Target role, location, industry, experience level
3. **CompetitorProfile** - Cached competitor profiles (7-day TTL)
4. **KeywordCluster** - Extracted keywords with frequency and importance scores
5. **OptimizationJob** - Tracks Celery task status and progress
6. **OptimizationResult** - Generated optimizations and SEO scores
7. **ActionableChecklist** - Non-text action items for profile improvement

### Services

- **LinkedInOAuthService** - OAuth flow (placeholder for credentials)
- **TavilyService** - Competitor discovery with intelligent caching
- **KeywordExtractionService** - LLM-based keyword extraction and clustering
- **ProfileAnalysisService** - Gap analysis and profile completeness scoring
- **OptimizationGenerationService** - LLM-powered content generation
- **SEOScoringService** - Weighted scoring (35% keywords, 25% completeness, 25% skills, 15% structure)

### Celery Tasks (Async Chain)

1. **fetch_competitors_task** (10-15s) → Progress: 0-20%
2. **extract_keywords_task** (15-20s) → Progress: 20-40%
3. **analyze_profile_task** (5-10s) → Progress: 40-60%
4. **generate_optimizations_task** (15-20s) → Progress: 60-80%
5. **calculate_seo_score_task** (3-5s) → Progress: 80-100%

### API Endpoints

#### Profile Management

- `POST /api/linkedin/profile/input` - Create profile snapshot (manual input)
- `GET /api/linkedin/profiles` - List all user's profile snapshots
- `DELETE /api/linkedin/profile/<id>` - Delete profile snapshot

#### LinkedIn OAuth

- `GET /api/linkedin/oauth/authorize` - Get OAuth authorization URL
- `POST /api/linkedin/oauth/callback` - Handle OAuth callback and import profile

#### Optimization

- `POST /api/linkedin/optimize` - Start optimization job (returns job_id)
- `GET /api/linkedin/job/<job_id>` - Poll job status (progress updates)
- `GET /api/linkedin/result/<job_id>` - Get completed optimization result
- `GET /api/linkedin/optimization/<result_id>` - Get specific optimization by result ID

#### History

- `GET /api/linkedin/history` - Get all profile optimization history

## Setup Instructions

### 1. Environment Variables

Add to `.env`:

```env
# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Tavily API
TAVILY_API_KEY=your_tavily_api_key_here

# LinkedIn OAuth (optional for MVP)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/linkedin/oauth/callback
```

### 2. Install Dependencies

```bash
cd backend
source env/bin/activate
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py makemigrations linkedin_optimizer
python manage.py migrate
```

### 4. Start Redis (required for Celery)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
sudo apt-get install redis-server
redis-server
```

### 5. Start Celery Worker

```bash
# In a new terminal
cd backend
source env/bin/activate
celery -A seo_master_pro worker -l info
```

### 6. Start Celery Beat (for periodic tasks)

```bash
# In another terminal
cd backend
source env/bin/activate
celery -A seo_master_pro beat -l info
```

### 7. Start Django Development Server

```bash
python manage.py runserver
```

## Usage Flow

### 1. Create Profile Snapshot

```bash
POST /api/linkedin/profile/input
{
  "headline_text": "Senior Software Engineer | Python | Django",
  "about_text": "Passionate developer with 5+ years experience...",
  "experience_text": "Led development of...",
  "skills_text": "Python, Django, React, AWS"
}
```

### 2. Start Optimization

```bash
POST /api/linkedin/optimize
{
  "profile_snapshot_id": 1,
  "target_role": "Senior Backend Engineer",
  "target_location": "San Francisco, CA",
  "industry": "Technology",
  "experience_level": "senior",
  "additional_notes": "Focus on cloud infrastructure"
}

Response:
{
  "success": true,
  "data": {
    "job_id": 123,
    "celery_task_id": "abc-def-ghi",
    "status": "pending"
  }
}
```

### 3. Poll Job Status

```bash
GET /api/linkedin/job/123

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "status": "processing",
    "progress_percentage": 45,
    "current_step": "Analyzing your profile"
  }
}
```

### 4. Get Results (when completed)

```bash
GET /api/linkedin/result/123

Response:
{
  "success": true,
  "data": {
    "optimized_headline": "Senior Backend Engineer | Python | Django | AWS | Building Scalable Systems",
    "optimized_about": "...",
    "optimized_experience": [...],
    "recommended_skills": [...],
    "seo_score": 82.5,
    "keyword_relevance_score": 78.0,
    "profile_completeness_score": 95.0,
    "skill_match_score": 80.0,
    "structural_quality_score": 75.0,
    "checklist_items": [...]
  }
}
```

## Competitor Cache Management

Competitor profiles are automatically cached for 7 days based on `search_query` (role + location).

- **Automatic cleanup**: Celery Beat runs daily at 2 AM to delete expired profiles
- **Cache invalidation**: Manually delete old competitors via Django admin if needed

## SEO Scoring Weights

Configurable in `SEOScoringService.WEIGHTS`:

- **keyword_relevance**: 35% - Keywords from competitor analysis
- **profile_completeness**: 25% - All sections filled
- **skill_match**: 25% - Skills aligned with role
- **structural_quality**: 15% - Formatting, length, bullets

## Testing

### Manual Testing

```bash
# Test Qwen LLM connection
python manage.py shell
>>> from common.qwen_utils import call_qwen
>>> call_qwen("Hello, how are you?")

# Test Tavily API
>>> from linkedin_optimizer.services import TavilyService
>>> service = TavilyService()
>>> competitors = service.search_competitors("Software Engineer", "San Francisco")
```

### Run Celery Task Manually

```bash
python manage.py shell
>>> from linkedin_optimizer.tasks import run_optimization_pipeline
>>> result = run_optimization_pipeline(job_id=1, context_id=1)
>>> result.id  # Celery task ID
```

## Admin Interface

All models are registered in Django admin:

- View optimization jobs and their status
- Monitor competitor cache
- Inspect keyword clusters
- Review optimization results
- Manage action checklists

Access: `http://localhost:8000/admin/`

## LinkedIn OAuth Setup (Optional)

1. Create LinkedIn Developer App: https://www.linkedin.com/developers/apps
2. Add OAuth 2.0 credentials
3. Set redirect URI: `http://localhost:8000/api/linkedin/oauth/callback`
4. Add credentials to `.env`

## Troubleshooting

### Celery worker not processing tasks

- Check Redis is running: `redis-cli ping` (should return PONG)
- Check Celery logs for errors
- Verify `CELERY_BROKER_URL` in settings

### Tavily API errors

- Verify `TAVILY_API_KEY` is set in `.env`
- Check API quota/limits

### LLM errors

- Verify Azure VM is accessible at `http://20.151.57.161:11434`
- Check Qwen model is loaded: `qwen3:32b`

### Job stuck in "processing"

- Check Celery worker logs
- Restart Celery worker if needed
- Failed tasks will retry 3 times with 60s delay

## Performance Notes

- Total pipeline time: ~50-70 seconds
- Competitor search: Cached for 7 days (subsequent searches are instant)
- LLM calls: ~10-20s per generation (headline, about, experience)
- Frontend should poll job status every 2-3 seconds

## Next Steps

1. **Add LinkedIn OAuth credentials** when ready
2. **Configure Redis** for production (persistence, password)
3. **Set up Celery monitoring** (Flower: `pip install flower`)
4. **Add rate limiting** for API endpoints
5. **Implement plan limits** (free vs premium users)
6. **Add more granular progress updates** within each task

## API Response Format

All endpoints follow the `success_response` format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

Errors:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```
