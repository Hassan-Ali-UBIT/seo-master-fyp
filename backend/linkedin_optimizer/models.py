"""
LinkedIn Optimizer Models
Handles profile snapshots, optimization jobs, competitor data, and results.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class UserProfileSnapshot(models.Model):
    """Stores a snapshot of user's LinkedIn profile data"""

    INPUT_TYPE_CHOICES = [
        ('manual', 'Manual Input'),
        ('oauth', 'LinkedIn OAuth'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile_snapshots'
    )
    headline_text = models.TextField(blank=True, null=True)
    about_text = models.TextField(blank=True, null=True)
    experience_text = models.TextField(blank=True, null=True)
    skills_text = models.TextField(blank=True, null=True)
    raw_input_type = models.CharField(max_length=20, choices=INPUT_TYPE_CHOICES)
    linkedin_profile_url = models.URLField(blank=True, null=True)
    raw_data = models.JSONField(blank=True, null=True)  # Store complete OAuth response
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"Profile Snapshot - {self.user.email} ({self.created_at.strftime('%Y-%m-%d')})"


class OptimizationContext(models.Model):
    """User's target role and context for optimization"""

    EXPERIENCE_LEVEL_CHOICES = [
        ('junior', 'Junior'),
        ('mid', 'Mid-Level'),
        ('senior', 'Senior'),
        ('lead', 'Lead/Principal'),
    ]

    profile_snapshot = models.OneToOneField(
        UserProfileSnapshot,
        on_delete=models.CASCADE,
        related_name='context'
    )
    target_role = models.CharField(max_length=255)
    target_location = models.CharField(max_length=255)
    industry = models.CharField(max_length=255)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES)
    additional_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['target_role', 'target_location']),
        ]

    def __str__(self):
        return f"{self.target_role} in {self.target_location}"

    @property
    def search_query(self):
        """Generate search query for competitor discovery"""
        return f"{self.target_role} {self.target_location}"


class CompetitorProfile(models.Model):
    """Cached competitor profiles from search results"""

    search_query = models.CharField(max_length=500, db_index=True)
    profile_url = models.URLField(unique=True)
    headline_text = models.TextField(blank=True, null=True)
    about_text = models.TextField(blank=True, null=True)
    experience_text = models.TextField(blank=True, null=True)
    skills_text = models.TextField(blank=True, null=True)
    raw_data = models.JSONField(blank=True, null=True)
    extracted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-extracted_at']
        indexes = [
            models.Index(fields=['search_query', '-extracted_at']),
        ]

    def __str__(self):
        return f"Competitor: {self.profile_url}"

    @property
    def is_expired(self):
        """Check if competitor data is older than cache duration"""
        cache_duration = timedelta(days=settings.COMPETITOR_CACHE_DAYS)
        return timezone.now() - self.extracted_at > cache_duration


class KeywordCluster(models.Model):
    """Extracted keywords from competitor analysis"""

    CATEGORY_CHOICES = [
        ('role', 'Role Keyword'),
        ('skill', 'Skill Keyword'),
        ('industry', 'Industry Keyword'),
        ('soft_skill', 'Soft Skill'),
        ('action_verb', 'Action Verb'),
    ]

    optimization_context = models.ForeignKey(
        OptimizationContext,
        on_delete=models.CASCADE,
        related_name='keywords'
    )
    keyword = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    frequency = models.IntegerField(default=1)
    importance_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-importance_score', '-frequency']
        unique_together = ['optimization_context', 'keyword', 'category']
        indexes = [
            models.Index(fields=['optimization_context', '-importance_score']),
        ]

    def __str__(self):
        return f"{self.keyword} ({self.category})"


class OptimizationJob(models.Model):
    """Tracks async Celery optimization job status"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='optimization_jobs'
    )
    profile_snapshot = models.ForeignKey(
        UserProfileSnapshot,
        on_delete=models.CASCADE,
        related_name='optimization_jobs'
    )
    celery_task_id = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress_percentage = models.IntegerField(default=0)
    current_step = models.CharField(max_length=255, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['celery_task_id']),
        ]

    def __str__(self):
        return f"Job {self.celery_task_id[:8]} - {self.status}"


class OptimizationResult(models.Model):
    """Generated optimization recommendations and content"""

    job = models.OneToOneField(
        OptimizationJob,
        on_delete=models.CASCADE,
        related_name='result'
    )
    profile_snapshot = models.ForeignKey(
        UserProfileSnapshot,
        on_delete=models.CASCADE,
        related_name='optimization_results'
    )

    # Generated content
    optimized_headline = models.TextField()
    optimized_about = models.TextField()
    optimized_experience = models.JSONField()  # List of experience bullet recommendations
    recommended_skills = models.JSONField()  # List of skills with priority

    # Gap analysis
    gap_analysis = models.JSONField(blank=True, null=True)  # Missing keywords, skills, etc.

    # SEO Score (0-100)
    seo_score = models.FloatField(default=0.0)
    keyword_relevance_score = models.FloatField(default=0.0)
    profile_completeness_score = models.FloatField(default=0.0)
    skill_match_score = models.FloatField(default=0.0)
    structural_quality_score = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['profile_snapshot', '-created_at']),
            models.Index(fields=['-seo_score']),
        ]

    def __str__(self):
        return f"Result for {self.profile_snapshot.user.email} - Score: {self.seo_score}"


class ActionableChecklist(models.Model):
    """Non-text optimization action items"""

    PRIORITY_CHOICES = [
        ('high', 'High Priority'),
        ('medium', 'Medium Priority'),
        ('low', 'Low Priority'),
    ]

    optimization_result = models.ForeignKey(
        OptimizationResult,
        on_delete=models.CASCADE,
        related_name='checklist_items'
    )
    action_item = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    category = models.CharField(max_length=50)  # e.g., 'profile_update', 'skill_endorsement'
    is_completed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-priority']
        indexes = [
            models.Index(fields=['optimization_result', 'is_completed']),
        ]

    def __str__(self):
        return f"{self.priority} - {self.action_item[:50]}"
