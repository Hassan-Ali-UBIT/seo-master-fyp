"""
LinkedIn Optimizer Views
API endpoints for LinkedIn profile optimization.
"""
import secrets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction

from common.exception_utils import CustomAPIException

from .models import (
    UserProfileSnapshot,
    OptimizationContext,
    OptimizationJob,
    OptimizationResult
)
from .serializers import (
    UserProfileSnapshotSerializer,
    OptimizationContextSerializer,
    OptimizationJobSerializer,
    OptimizationJobDetailSerializer,
    OptimizationResultSerializer,
    CreateOptimizationSerializer,
    LinkedInOAuthInitSerializer,
    LinkedInOAuthCallbackSerializer,
    ProfileHistorySerializer
)
from .services import LinkedInOAuthService
from .tasks import run_optimization_pipeline


class ProfileInputView(APIView):
    """
    POST /api/linkedin/profile/input
    Accept manual LinkedIn profile input
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserProfileSnapshotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create profile snapshot
        profile_snapshot = serializer.save(
            user=request.user,
            raw_input_type='manual'
        )

        return Response(
            {
                "data": UserProfileSnapshotSerializer(profile_snapshot).data,
                "message": "Profile snapshot created successfully"
            }
        )


class LinkedInOAuthAuthorizeView(APIView):
    """
    GET /api/linkedin/oauth/authorize
    Redirect to LinkedIn OAuth authorization
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Generate random state for CSRF protection
        state = secrets.token_urlsafe(32)

        # Store state in session (or cache with user ID)
        request.session['linkedin_oauth_state'] = state

        # Get authorization URL
        auth_url = LinkedInOAuthService.get_authorization_url(state)

        return Response(
            {
                'authorization_url': auth_url,
                'state': state,
                "message": "Redirect to LinkedIn authorization"
            },
            status=status.HTTP_200_OK
        )


class LinkedInOAuthCallbackView(APIView):
    """
    POST /api/linkedin/oauth/callback
    Handle LinkedIn OAuth callback
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LinkedInOAuthCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code']
        state = serializer.validated_data.get('state')

        # Verify state (CSRF protection)
        stored_state = request.session.get('linkedin_oauth_state')
        if state and stored_state and state != stored_state:
            raise CustomAPIException(
                message="Invalid state parameter",
                status_code=400
            )

        # Exchange code for token
        token_data = LinkedInOAuthService.exchange_code_for_token(code)
        access_token = token_data.get('access_token')

        if not access_token:
            raise CustomAPIException(
                message="Failed to obtain access token",
                status_code=400
            )

        # Fetch profile data (includes Tavily search for complete details)
        profile_data = LinkedInOAuthService.fetch_profile_data(access_token)

        # Create profile snapshot with complete data
        profile_snapshot = UserProfileSnapshot.objects.create(
            user=request.user,
            headline_text=profile_data.get('headline', ''),
            about_text=profile_data.get('about', ''),
            experience_text=profile_data.get('experience', ''),
            skills_text=profile_data.get('skills', ''),
            linkedin_profile_url=profile_data.get('profile_url', ''),
            raw_input_type='oauth',
            raw_data=profile_data
        )

        # Clean up session
        if 'linkedin_oauth_state' in request.session:
            del request.session['linkedin_oauth_state']

        return Response(
            {
                "profile": UserProfileSnapshotSerializer(profile_snapshot).data,
                "message": "LinkedIn profile imported successfully"
            },
            status=status.HTTP_201_CREATED
        )


class CreateOptimizationView(APIView):
    """
    POST /api/linkedin/optimize
    Start optimization job (Celery chain)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateOptimizationSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        profile_snapshot_id = serializer.validated_data['profile_snapshot_id']
        profile_snapshot = get_object_or_404(
            UserProfileSnapshot,
            id=profile_snapshot_id,
            user=request.user
        )

        with transaction.atomic():
            # Create optimization context
            context = OptimizationContext.objects.create(
                profile_snapshot=profile_snapshot,
                target_role=serializer.validated_data['target_role'],
                target_location=serializer.validated_data['target_location'],
                industry=serializer.validated_data['industry'],
                experience_level=serializer.validated_data['experience_level'],
                additional_notes=serializer.validated_data.get('additional_notes', '')
            )

            # Create optimization job
            job = OptimizationJob.objects.create(
                user=request.user,
                profile_snapshot=profile_snapshot,
                celery_task_id='',  # Will be updated after task creation
                status='pending'
            )

            # Start Celery chain
            result = run_optimization_pipeline(job.id, context.id)

            # Update job with task ID
            job.celery_task_id = result.id
            job.save()

        return Response(
            {

                'job_id': job.id,
                'celery_task_id': job.celery_task_id,
                'status': job.status,
                "message": "Optimization job started"
            },
            status=status.HTTP_202_ACCEPTED
        )


class OptimizationJobStatusView(APIView):
    """
    GET /api/linkedin/job/<job_id>
    Poll optimization job status
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        job = get_object_or_404(
            OptimizationJob,
            id=job_id,
            user=request.user
        )

        serializer = OptimizationJobDetailSerializer(job)

        return Response(
            {
                "data": serializer.data,
                "message": "Job status retrieved"
            },
            status=status.HTTP_200_OK
        )


class OptimizationResultView(APIView):
    """
    GET /api/linkedin/result/<job_id>
    Get completed optimization result
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        job = get_object_or_404(
            OptimizationJob,
            id=job_id,
            user=request.user
        )

        if job.status != 'completed':
            raise CustomAPIException(
                message=f"Job is not completed yet. Current status: {job.status}",
                status_code=400
            )

        if not hasattr(job, 'result'):
            raise CustomAPIException(
                message="Optimization result not found",
                status_code=404
            )

        serializer = OptimizationResultSerializer(job.result)

        return Response(
            {
                "data": serializer.data,
                "message": "Optimization result retrieved"
            },
            status=status.HTTP_200_OK
        )


class ProfileHistoryView(APIView):
    """
    GET /api/linkedin/history
    Get user's profile optimization history
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = UserProfileSnapshot.objects.filter(
            user=request.user
        ).prefetch_related('optimization_results')

        serializer = ProfileHistorySerializer(profiles, many=True)

        return Response(
            {
                "data": serializer.data,
                "message": "Profile history retrieved"
            },
            status=status.HTTP_200_OK
        )


class OptimizationDetailView(APIView):
    """
    GET /api/linkedin/optimization/<result_id>
    Get specific optimization result by result ID
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, result_id):
        result = get_object_or_404(
            OptimizationResult,
            id=result_id,
            profile_snapshot__user=request.user
        )

        serializer = OptimizationResultSerializer(result)

        return Response(
            {
                "data": serializer.data,
                "message": "Optimization details retrieved"
            },
            status=status.HTTP_200_OK
        )


class UserProfileSnapshotsView(APIView):
    """
    GET /api/linkedin/profiles
    Get all user's profile snapshots
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = UserProfileSnapshot.objects.filter(user=request.user)
        serializer = UserProfileSnapshotSerializer(profiles, many=True)

        return Response(
            data=serializer.data,
            message="Profile snapshots retrieved"
        )


class DeleteProfileSnapshotView(APIView):
    """
    DELETE /api/linkedin/profile/<profile_id>
    Delete a profile snapshot
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, profile_id):
        profile = get_object_or_404(
            UserProfileSnapshot,
            id=profile_id,
            user=request.user
        )

        profile.delete()

        return Response(
            {
                "data": None,
                "message": "Profile snapshot deleted successfully"
            },
            status=status.HTTP_200_OK
        )
