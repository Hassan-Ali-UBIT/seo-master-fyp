"""
LinkedIn Optimizer Celery Tasks
Async tasks for optimization pipeline broken into smaller units.
"""
from celery import shared_task, chain
from django.utils import timezone
from django.db import transaction
from datetime import timedelta

from .models import (
    OptimizationJob,
    OptimizationContext,
    CompetitorProfile,
    KeywordCluster,
    OptimizationResult,
    ActionableChecklist,
    UserProfileSnapshot
)
from .services import (
    TavilyService,
    KeywordExtractionService,
    ProfileAnalysisService,
    OptimizationGenerationService,
    SEOScoringService
)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def fetch_competitors_task(self, job_id: int, context_id: int):
    """
    Task 1: Fetch competitor profiles (10-15s)
    Updates progress to 20%
    """
    try:
        job = OptimizationJob.objects.get(id=job_id)
        context = OptimizationContext.objects.get(id=context_id)

        # Update job status
        job.status = 'processing'
        job.current_step = 'Discovering competitor profiles'
        job.progress_percentage = 5
        job.save()

        # Fetch competitors using Tavily
        tavily_service = TavilyService()
        competitors = tavily_service.search_competitors(
            target_role=context.target_role,
            target_location=context.target_location,
            max_results=25
        )

        # Update progress
        job.progress_percentage = 20
        job.current_step = f'Found {len(competitors)} competitor profiles'
        job.save()

        return {
            'job_id': job_id,
            'context_id': context_id,
            'competitor_count': len(competitors),
            'competitor_ids': [c.id for c in competitors]
        }

    except Exception as exc:
        job = OptimizationJob.objects.get(id=job_id)
        job.status = 'failed'
        job.error_message = f"Failed to fetch competitors: {str(exc)}"
        job.save()
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def extract_keywords_task(self, previous_result: dict):
    """
    Task 2: Extract keywords from competitors (15-20s)
    Updates progress to 40%
    """
    try:
        job_id = previous_result['job_id']
        context_id = previous_result['context_id']

        job = OptimizationJob.objects.get(id=job_id)
        context = OptimizationContext.objects.get(id=context_id)

        # Update job status
        job.current_step = 'Extracting keywords from competitors'
        job.progress_percentage = 25
        job.save()

        # Get competitors
        competitors = CompetitorProfile.objects.filter(
            search_query=context.search_query
        )[:25]

        # Extract keywords using LLM
        keywords = KeywordExtractionService.extract_keywords_from_competitors(
            competitors=list(competitors),
            optimization_context=context
        )

        # Update progress
        job.progress_percentage = 40
        job.current_step = f'Extracted {len(keywords)} keywords'
        job.save()

        return {
            'job_id': job_id,
            'context_id': context_id,
            'keyword_count': len(keywords)
        }

    except Exception as exc:
        job = OptimizationJob.objects.get(id=previous_result['job_id'])
        job.status = 'failed'
        job.error_message = f"Failed to extract keywords: {str(exc)}"
        job.save()
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def analyze_profile_task(self, previous_result: dict):
    """
    Task 3: Analyze user profile (5-10s)
    Updates progress to 60%
    """
    try:
        job_id = previous_result['job_id']
        context_id = previous_result['context_id']

        job = OptimizationJob.objects.get(id=job_id)
        context = OptimizationContext.objects.get(id=context_id)
        profile_snapshot = job.profile_snapshot

        # Update job status
        job.current_step = 'Analyzing your profile'
        job.progress_percentage = 45
        job.save()

        # Get extracted keywords
        keywords = list(KeywordCluster.objects.filter(optimization_context=context))

        # Analyze profile
        analysis_data = ProfileAnalysisService.analyze_profile(
            profile_snapshot=profile_snapshot,
            keywords=keywords
        )

        # Update progress
        job.progress_percentage = 60
        job.current_step = 'Profile analysis complete'
        job.save()

        return {
            'job_id': job_id,
            'context_id': context_id,
            'analysis_data': analysis_data
        }

    except Exception as exc:
        job = OptimizationJob.objects.get(id=previous_result['job_id'])
        job.status = 'failed'
        job.error_message = f"Failed to analyze profile: {str(exc)}"
        job.save()
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_optimizations_task(self, previous_result: dict):
    """
    Task 4: Generate optimized content (15-20s)
    Updates progress to 80%
    """
    try:
        job_id = previous_result['job_id']
        context_id = previous_result['context_id']
        analysis_data = previous_result['analysis_data']

        job = OptimizationJob.objects.get(id=job_id)
        context = OptimizationContext.objects.get(id=context_id)
        profile_snapshot = job.profile_snapshot

        # Update job status
        job.current_step = 'Generating optimized content'
        job.progress_percentage = 65
        job.save()

        # Get keywords
        keywords = list(KeywordCluster.objects.filter(optimization_context=context))

        # Generate headline
        optimized_headline = OptimizationGenerationService.generate_headline(
            profile_snapshot=profile_snapshot,
            optimization_context=context,
            keywords=keywords
        )

        job.progress_percentage = 70
        job.save()

        # Generate about
        optimized_about = OptimizationGenerationService.generate_about(
            profile_snapshot=profile_snapshot,
            optimization_context=context,
            keywords=keywords
        )

        job.progress_percentage = 75
        job.save()

        # Generate experience recommendations
        optimized_experience = OptimizationGenerationService.generate_experience_recommendations(
            profile_snapshot=profile_snapshot,
            optimization_context=context,
            keywords=keywords
        )

        # Generate skill recommendations
        recommended_skills = OptimizationGenerationService.generate_skill_recommendations(
            profile_snapshot=profile_snapshot,
            keywords=keywords
        )

        # Update progress
        job.progress_percentage = 80
        job.current_step = 'Content generation complete'
        job.save()

        return {
            'job_id': job_id,
            'context_id': context_id,
            'analysis_data': analysis_data,
            'optimized_headline': optimized_headline,
            'optimized_about': optimized_about,
            'optimized_experience': optimized_experience,
            'recommended_skills': recommended_skills
        }

    except Exception as exc:
        job = OptimizationJob.objects.get(id=previous_result['job_id'])
        job.status = 'failed'
        job.error_message = f"Failed to generate optimizations: {str(exc)}"
        job.save()
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def calculate_seo_score_task(self, previous_result: dict):
    """
    Task 5: Calculate SEO scores and save results (3-5s)
    Updates progress to 100%
    """
    try:
        job_id = previous_result['job_id']
        context_id = previous_result['context_id']

        job = OptimizationJob.objects.get(id=job_id)
        context = OptimizationContext.objects.get(id=context_id)
        profile_snapshot = job.profile_snapshot

        # Update job status
        job.current_step = 'Calculating SEO scores'
        job.progress_percentage = 85
        job.save()

        # Get keywords
        keywords = list(KeywordCluster.objects.filter(optimization_context=context))

        # Calculate scores
        scores = SEOScoringService.calculate_scores(
            profile_snapshot=profile_snapshot,
            analysis_data=previous_result['analysis_data'],
            keywords=keywords
        )

        job.progress_percentage = 90
        job.save()

        # Create OptimizationResult
        with transaction.atomic():
            optimization_result = OptimizationResult.objects.create(
                job=job,
                profile_snapshot=profile_snapshot,
                optimized_headline=previous_result['optimized_headline'],
                optimized_about=previous_result['optimized_about'],
                optimized_experience=previous_result['optimized_experience'],
                recommended_skills=previous_result['recommended_skills'],
                gap_analysis=previous_result['analysis_data'].get('gaps', {}),
                seo_score=scores['seo_score'],
                keyword_relevance_score=scores['keyword_relevance_score'],
                profile_completeness_score=scores['profile_completeness_score'],
                skill_match_score=scores['skill_match_score'],
                structural_quality_score=scores['structural_quality_score']
            )

            # Generate actionable checklist
            checklist_items = _generate_checklist(optimization_result, previous_result['analysis_data'])

            for idx, item in enumerate(checklist_items):
                ActionableChecklist.objects.create(
                    optimization_result=optimization_result,
                    action_item=item['action'],
                    priority=item['priority'],
                    category=item['category'],
                    order=idx
                )

        # Update job to completed
        job.status = 'completed'
        job.progress_percentage = 100
        job.current_step = 'Optimization complete'
        job.completed_at = timezone.now()
        job.save()

        return {
            'job_id': job_id,
            'result_id': optimization_result.id,
            'seo_score': scores['seo_score']
        }

    except Exception as exc:
        job = OptimizationJob.objects.get(id=previous_result['job_id'])
        job.status = 'failed'
        job.error_message = f"Failed to calculate scores: {str(exc)}"
        job.save()
        raise self.retry(exc=exc)


def _generate_checklist(optimization_result: OptimizationResult, analysis_data: dict) -> list:
    """Generate actionable checklist items"""
    checklist = []

    # Profile update items
    checklist.append({
        'action': 'Update your LinkedIn headline with the optimized version',
        'priority': 'high',
        'category': 'profile_update'
    })

    checklist.append({
        'action': 'Replace your About section with the optimized content',
        'priority': 'high',
        'category': 'profile_update'
    })

    # Skill recommendations
    if optimization_result.recommended_skills:
        high_priority_skills = [s for s in optimization_result.recommended_skills if s.get('priority') == 'high']
        if high_priority_skills:
            checklist.append({
                'action': f'Add these high-priority skills: {", ".join([s["skill"] for s in high_priority_skills[:5]])}',
                'priority': 'high',
                'category': 'skill_endorsement'
            })

    # Gap-based recommendations
    completeness = analysis_data.get('completeness', {})
    if not completeness.get('experience_present'):
        checklist.append({
            'action': 'Add detailed work experience with bullet points and metrics',
            'priority': 'high',
            'category': 'profile_update'
        })

    # Engagement recommendations
    checklist.append({
        'action': 'Request recommendations from colleagues and managers',
        'priority': 'medium',
        'category': 'engagement'
    })

    checklist.append({
        'action': 'Connect with professionals in your target industry',
        'priority': 'medium',
        'category': 'network_growth'
    })

    checklist.append({
        'action': 'Post weekly content related to your expertise',
        'priority': 'medium',
        'category': 'activity'
    })

    # Keyword optimization
    missing_keywords = analysis_data.get('missing_keywords', [])
    if missing_keywords:
        top_missing = [k['keyword'] for k in missing_keywords[:3]]
        checklist.append({
            'action': f'Incorporate these keywords naturally: {", ".join(top_missing)}',
            'priority': 'medium',
            'category': 'keyword_optimization'
        })

    return checklist


@shared_task
def cleanup_expired_competitors():
    """
    Periodic task to clean up expired competitor profiles
    Runs daily via Celery Beat
    """
    expiry_date = timezone.now() - timedelta(days=7)

    expired_count = CompetitorProfile.objects.filter(
        extracted_at__lt=expiry_date
    ).delete()[0]

    return f"Deleted {expired_count} expired competitor profiles"


def run_optimization_pipeline(job_id: int, context_id: int):
    """
    Run the full optimization pipeline as a Celery chain
    """
    pipeline = chain(
        fetch_competitors_task.s(job_id, context_id),
        extract_keywords_task.s(),
        analyze_profile_task.s(),
        generate_optimizations_task.s(),
        calculate_seo_score_task.s()
    )

    return pipeline.apply_async()
