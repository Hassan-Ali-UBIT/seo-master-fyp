"""
LinkedIn Optimizer Views
API endpoints for LinkedIn profile optimization.
"""
import secrets
import json
import re
from datetime import datetime, timedelta, timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.signing import Signer, BadSignature
import requests

from common.exception_utils import CustomAPIException
from users.permissions import HasLinkedInOptimizerPermission

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
from common.qwen_utils import call_qwen
from common.freepik_utils import generate_image_base_64
from rest_framework import viewsets
from django.core.files.base import ContentFile
import base64
import uuid

from .models import (
    UserProfileSnapshot,
    OptimizationContext,
    OptimizationJob,
    OptimizationResult,
    LinkedInPost
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
    ProfileHistorySerializer,
    LinkedInPostSerializer
)

User = get_user_model()


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
    Encodes user ID in state parameter for retrieval in callback
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Encode user ID in state parameter using Django's signing for security
        signer = Signer()
        state = signer.sign(str(request.user.id))

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
    GET /api/linkedin/oauth/callback?code=...&state=...
    POST /api/linkedin/oauth/callback
    Handle LinkedIn OAuth callback
    Decodes user ID from state parameter for secure user association
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """Handle OAuth callback via GET request (LinkedIn redirects here)"""
        code = request.query_params.get('code')
        state = request.query_params.get('state')
        error = request.query_params.get('error')

        if error:
            raise CustomAPIException(
                message=f"LinkedIn OAuth error: {error}",
                status_code=400
            )

        if not code:
            raise CustomAPIException(
                message="Authorization code not provided",
                status_code=400
            )

        if not state:
            raise CustomAPIException(
                message="State parameter not provided",
                status_code=400
            )

        # Decode state to get user ID
        try:
            signer = Signer()
            user_id_str = signer.unsign(state)
            user_id = int(user_id_str)
            user = User.objects.get(id=user_id)
        except (BadSignature, ValueError, User.DoesNotExist):
            raise CustomAPIException(
                message="Invalid or tampered state parameter",
                status_code=400
            )

        return self._handle_oauth_callback(user, code, state)

    def post(self, request):
        """Handle OAuth callback via POST request (for flexibility)"""
        serializer = LinkedInOAuthCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code']
        state = serializer.validated_data.get('state')

        # Get the user from the request (must be authenticated for POST)
        user = request.user
        if not user.is_authenticated:
            raise CustomAPIException(
                message="User not authenticated",
                status_code=401
            )

        return self._handle_oauth_callback(user, code, state)

    def _handle_oauth_callback(self, user, code: str, state: str = None):
        """Common OAuth callback handler"""
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
            user=user,
            headline_text=profile_data.get('headline', ''),
            about_text=profile_data.get('about', ''),
            experience_text=profile_data.get('experience', ''),
            skills_text=profile_data.get('skills', ''),
            linkedin_profile_url=profile_data.get('profile_url', ''),
            raw_input_type='oauth',
            raw_data=profile_data
        )

        return Response(
            {
                "profile": UserProfileSnapshotSerializer(profile_snapshot).data,
                "message": "LinkedIn profile imported successfully"
            },
            status=status.HTTP_201_CREATED
        )



class ProfileFetchUrlView(APIView):
    """
    POST /api/linkedin/profile/fetch-url
    Fetch LinkedIn profile data from a specific URL using Tavily
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .serializers import ProfileFetchUrlSerializer  # Import here to avoid circular imports

        serializer = ProfileFetchUrlSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile_url = serializer.validated_data['linkedin_profile_url']
        use_cache = serializer.validated_data.get('use_cache', True)

        try:
            # Check cache (last 7 days) if enabled
            if use_cache:
                seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
                cached_snapshot = UserProfileSnapshot.objects.filter(
                    user=request.user,
                    linkedin_profile_url=profile_url,
                    created_at__gte=seven_days_ago
                ).order_by('-created_at').first()

                if cached_snapshot:
                    return Response(
                        {
                            "profile": UserProfileSnapshotSerializer(cached_snapshot).data,
                            "message": "LinkedIn profile fetched successfully (Cached)",
                            "is_cached": True
                        },
                        status=status.HTTP_200_OK
                    )

            # Fetch profile data using the URL
            profile_data = LinkedInOAuthService.fetch_profile_from_url(request.user, profile_url)

            # Check if we got valid data
            if not profile_data.get('headline') and not profile_data.get('about'):
                return Response(
                    {
                        "message": "Could not extract profile data from the provided URL. Please check the URL or try entering data manually.",
                        "details": "Tavily returned empty results."
                    },
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY
                )

            # Create profile snapshot
            profile_snapshot = UserProfileSnapshot.objects.create(
                user=request.user,
                headline_text=profile_data.get('headline', ''),
                about_text=profile_data.get('about', ''),
                experience_text=profile_data.get('experience', ''),
                skills_text=profile_data.get('skills', ''),
                linkedin_profile_url=profile_data.get('profile_url', ''),
                raw_input_type='url_crawl',
                raw_data=profile_data
            )

            return Response(
                {
                    "profile": UserProfileSnapshotSerializer(profile_snapshot).data,
                    "message": "LinkedIn profile fetched successfully"
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            # Log the error here
            print(f"Error fetching profile from URL: {str(e)}")
            raise CustomAPIException(
                message=f"Failed to fetch profile: {str(e)}",
                status_code=500
            )


class CreateOptimizationView(APIView):
    """
    POST /api/linkedin/optimize
    Start optimization job (Celery chain)
    """
    permission_classes = [IsAuthenticated, HasLinkedInOptimizerPermission]

    def post(self, request):
        serializer = CreateOptimizationSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        # Check and consume resources (Credits)
        # We only consume if not superuser/staff (who have unlimited access essentially via permission check,
        # but logic here ensures consistency if we want to track their usage too.
        # For now, let's enforce consumption for everyone OR skip for admins.
        # The permission class already allows admins.
        # Let's simple check: if user has resources, consume. If admin has no resources, they pass permission but might fail here if we don't guard.

        user = request.user
        if not (user.is_superuser or user.is_staff):
            # Try to consume 1 credit

            user_resources = user.userresources_set.order_by('-created_at').first()

            if not user_resources or user_resources.remaining_credits() < 1:
                # This should ideally be caught by permission class, but as a safeguard against race conditions:
                return Response(
                    {
                        "message": "Insufficient credits to perform optimization."
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED
                )

            user_resources.consume_credits(1)

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
        ).prefetch_related('optimization_results', 'context')

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


class LinkedInPostViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for LinkedIn Posts
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LinkedInPostSerializer

    def get_queryset(self):
        return LinkedInPost.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        image_data = self.request.data.get('image_base64')

        # Helper to decode base64
        if image_data:
            format, imgstr = image_data.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name=f'{uuid.uuid4()}.{ext}')
            serializer.save(user=self.request.user, image=data)
        else:
            serializer.save(user=self.request.user)


class GeneratePostView(APIView):
    """
    POST /api/linkedin/generate-post
    Generate LinkedIn post content and image
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic')
        if not topic:
            return Response(
                {"message": "Topic is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate Text
        prompt = f"""
        Act as a LinkedIn Influencer. Write a viral LinkedIn post about: {topic}.
        You MUST return the output in valid JSON format with the following keys:
        - "hook": The catchy first line/hook.
        - "body": The main content of the post.
        - "keywords": Relevant keywords and hashtags as a single string.

        Do not include markdown formatting like ```json ... ```. Just return the raw JSON string.
        """

        try:
            generated_text = call_qwen(prompt)

            # cleaning potentially markdown formatted json
            cleaned_text = generated_text.replace("```json", "").replace("```", "").strip()

            try:
                parsed_content = json.loads(cleaned_text)
                hook = parsed_content.get("hook", "")
                body = parsed_content.get("body", "")
                keywords = parsed_content.get("keywords", "")
            except json.JSONDecodeError:
                # Fallback if AI fails to return valid JSON
                print("Failed to parse JSON, falling back to raw text split")
                # Try to regex hook/body/keywords if labels exist, else dump all to body
                hook = "Generated Post"
                body = generated_text
                keywords = ""

            # Generate Image
            image_prompt = f"Professional LinkedIn style illustration about {topic}, minimal, corporate memphis style, high quality"
            image_base64 = generate_image_base_64(image_prompt)

            # Add data URI prefix if not present (freepik usually returns raw base64)
            if image_base64 and not image_base64.startswith('data:image'):
                 # Assuming png or jpg, freepik usually returns binary base64.
                 # Let's assume common format or let frontend handle it.
                 # Actually better to add prefix for frontend usage
                 image_base64 = f"data:image/png;base64,{image_base64}"

            return Response({
                "topic": topic,
                "hook": hook,
                "body": body,
                "keywords": keywords,
                "image_base64": image_base64,
                "message": "Content generated successfully"
            })

        except Exception as e:
            return Response(
                {"message": f"Generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
