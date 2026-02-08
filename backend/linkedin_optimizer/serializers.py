"""
LinkedIn Optimizer Serializers
API request/response serializers for LinkedIn profile optimization.
"""
from rest_framework import serializers
from common.serializer_utils import get_serialized_or_none
from .models import (
    UserProfileSnapshot,
    OptimizationContext,
    OptimizationJob,
    OptimizationResult,
    ActionableChecklist,
    KeywordCluster,
    LinkedInPost
)


class UserProfileSnapshotSerializer(serializers.ModelSerializer):
    """Serializer for user profile snapshots"""
    raw_input_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = UserProfileSnapshot
        fields = [
            'id',
            'headline_text',
            'about_text',
            'experience_text',
            'skills_text',
            'raw_input_type',
            'linkedin_profile_url',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Ensure at least one field has content"""
        has_content = any([
            data.get('headline_text'),
            data.get('about_text'),
            data.get('experience_text'),
            data.get('skills_text')
        ])

        if not has_content:
            raise serializers.ValidationError(
                "At least one profile field must contain data"
            )

        return data


class OptimizationContextSerializer(serializers.ModelSerializer):
    """Serializer for optimization context"""

    class Meta:
        model = OptimizationContext
        fields = [
            'id',
            'target_role',
            'target_location',
            'industry',
            'experience_level',
            'additional_notes',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_target_role(self, value):
        """Validate target role is not empty"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Target role must be at least 3 characters")
        return value.strip()

    def validate_target_location(self, value):
        """Validate target location is not empty"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Target location must be at least 2 characters")
        return value.strip()


class KeywordClusterSerializer(serializers.ModelSerializer):
    """Serializer for keyword clusters"""

    class Meta:
        model = KeywordCluster
        fields = [
            'id',
            'keyword',
            'category',
            'frequency',
            'importance_score',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ActionableChecklistSerializer(serializers.ModelSerializer):
    """Serializer for actionable checklist items"""

    class Meta:
        model = ActionableChecklist
        fields = [
            'id',
            'action_item',
            'priority',
            'category',
            'is_completed',
            'order',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OptimizationResultSerializer(serializers.ModelSerializer):
    """Serializer for optimization results"""
    checklist_items = ActionableChecklistSerializer(many=True, read_only=True)
    profile_snapshot = UserProfileSnapshotSerializer(read_only=True)

    class Meta:
        model = OptimizationResult
        fields = [
            'id',
            'profile_snapshot',
            'optimized_headline',
            'optimized_about',
            'optimized_experience',
            'recommended_skills',
            'gap_analysis',
            'seo_score',
            'keyword_relevance_score',
            'profile_completeness_score',
            'skill_match_score',
            'structural_quality_score',
            'checklist_items',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OptimizationJobSerializer(serializers.ModelSerializer):
    """Serializer for optimization job status"""
    result = OptimizationResultSerializer(read_only=True)
    profile_snapshot = UserProfileSnapshotSerializer(read_only=True)

    class Meta:
        model = OptimizationJob
        fields = [
            'id',
            'celery_task_id',
            'status',
            'progress_percentage',
            'current_step',
            'error_message',
            'profile_snapshot',
            'result',
            'created_at',
            'completed_at'
        ]
        read_only_fields = ['id', 'celery_task_id', 'created_at', 'completed_at']


class OptimizationJobDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for optimization job (lightweight for polling)"""

    class Meta:
        model = OptimizationJob
        fields = [
            'id',
            'status',
            'progress_percentage',
            'current_step',
            'error_message',
            'created_at',
            'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']


class CreateOptimizationSerializer(serializers.Serializer):
    """Serializer for creating a new optimization job"""
    profile_snapshot_id = serializers.IntegerField(required=True)
    target_role = serializers.CharField(required=True, max_length=255)
    target_location = serializers.CharField(required=True, max_length=255)
    industry = serializers.CharField(required=True, max_length=255)
    experience_level = serializers.ChoiceField(
        required=True,
        choices=['junior', 'mid', 'senior', 'lead']
    )
    additional_notes = serializers.CharField(required=False, allow_blank=True)

    def validate_profile_snapshot_id(self, value):
        """Validate profile snapshot exists and belongs to user"""
        user = self.context.get('request').user
        try:
            snapshot = UserProfileSnapshot.objects.get(id=value, user=user)
            return value
        except UserProfileSnapshot.DoesNotExist:
            raise serializers.ValidationError("Profile snapshot not found or access denied")


class LinkedInOAuthInitSerializer(serializers.Serializer):
    """Serializer for LinkedIn OAuth initialization"""
    state = serializers.CharField(required=False, max_length=255)


class ProfileFetchUrlSerializer(serializers.Serializer):
    """Serializer for fetching LinkedIn profile from URL"""
    linkedin_profile_url = serializers.URLField(required=True)
    use_cache = serializers.BooleanField(required=False, default=True)

    def validate_linkedin_profile_url(self, value):
        """Validate that the URL is a LinkedIn profile URL"""
        if 'linkedin.com/in/' not in value:
            raise serializers.ValidationError("Must be a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username)")
        return value


class LinkedInOAuthCallbackSerializer(serializers.Serializer):
    """Serializer for LinkedIn OAuth callback"""
    code = serializers.CharField(required=True)
    state = serializers.CharField(required=False)

    def validate_code(self, value):
        """Validate authorization code is not empty"""
        if not value:
            raise serializers.ValidationError("Authorization code is required")
        return value


class ProfileHistorySerializer(serializers.ModelSerializer):
    """Serializer for profile optimization history"""
    optimization_results = OptimizationResultSerializer(many=True, read_only=True)
    context = serializers.SerializerMethodField()

    class Meta:
        model = UserProfileSnapshot
        fields = [
            'id',
            'headline_text',
            'raw_input_type',
            'linkedin_profile_url',
            'created_at',
            'context',
            'optimization_results'
        ]
        read_only_fields = ['id', 'created_at']

    def get_context(self, obj):
        # Since relation is now ForeignKey (1-to-many), retrieve the latest context
        latest_context = obj.context.order_by('-created_at').first()
        if latest_context:
            return OptimizationContextSerializer(latest_context).data
        return None

    def get_optimization_count(self, obj):
        """Get total number of optimizations for this profile"""
        return obj.optimization_results.count()


class LinkedInPostSerializer(serializers.ModelSerializer):
    """Serializer for LinkedIn Post Drafts"""

    class Meta:
        model = LinkedInPost
        fields = [
            'id',
            'topic',
            'description',
            'keywords',
            'hook',
            'image',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
