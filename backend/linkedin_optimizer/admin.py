from django.contrib import admin
from .models import (
    UserProfileSnapshot,
    OptimizationContext,
    CompetitorProfile,
    KeywordCluster,
    OptimizationJob,
    OptimizationResult,
    ActionableChecklist
)


@admin.register(UserProfileSnapshot)
class UserProfileSnapshotAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'raw_input_type', 'created_at']
    list_filter = ['raw_input_type', 'created_at']
    search_fields = ['user__email', 'headline_text']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(OptimizationContext)
class OptimizationContextAdmin(admin.ModelAdmin):
    list_display = ['id', 'target_role', 'target_location', 'experience_level', 'created_at']
    list_filter = ['experience_level', 'created_at']
    search_fields = ['target_role', 'target_location', 'industry']


@admin.register(CompetitorProfile)
class CompetitorProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'profile_url', 'search_query', 'extracted_at']
    list_filter = ['extracted_at']
    search_fields = ['profile_url', 'search_query']
    readonly_fields = ['extracted_at']


@admin.register(KeywordCluster)
class KeywordClusterAdmin(admin.ModelAdmin):
    list_display = ['id', 'keyword', 'category', 'frequency', 'importance_score']
    list_filter = ['category', 'created_at']
    search_fields = ['keyword']


@admin.register(OptimizationJob)
class OptimizationJobAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'progress_percentage', 'created_at', 'completed_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'celery_task_id']
    readonly_fields = ['created_at', 'completed_at']


@admin.register(OptimizationResult)
class OptimizationResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'profile_snapshot', 'seo_score', 'created_at']
    list_filter = ['created_at']
    search_fields = ['profile_snapshot__user__email']
    readonly_fields = ['created_at']


@admin.register(ActionableChecklist)
class ActionableChecklistAdmin(admin.ModelAdmin):
    list_display = ['id', 'action_item', 'priority', 'category', 'is_completed', 'order']
    list_filter = ['priority', 'category', 'is_completed']
    search_fields = ['action_item']
