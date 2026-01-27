"""
LinkedIn Optimizer URL Configuration
"""
from django.urls import path
from .views import (
    ProfileInputView,
    LinkedInOAuthAuthorizeView,
    LinkedInOAuthCallbackView,
    CreateOptimizationView,
    OptimizationJobStatusView,
    OptimizationResultView,
    ProfileHistoryView,
    OptimizationDetailView,
    UserProfileSnapshotsView,
    DeleteProfileSnapshotView,
    ProfileFetchUrlView,
    LinkedInPostViewSet,
    GeneratePostView
)
from rest_framework.routers import DefaultRouter

app_name = 'linkedin_optimizer'

urlpatterns = [
    # Profile input
    path('profile/input/', ProfileInputView.as_view(), name='profile-input'),
    path('profile/fetch-url/', ProfileFetchUrlView.as_view(), name='profile-fetch-url'),
    path('profiles/', UserProfileSnapshotsView.as_view(), name='profile-list'),
    path('profile/<int:profile_id>/', DeleteProfileSnapshotView.as_view(), name='profile-delete'),

    # LinkedIn OAuth
    path('oauth/authorize/', LinkedInOAuthAuthorizeView.as_view(), name='oauth-authorize'),
    path('oauth/callback/', LinkedInOAuthCallbackView.as_view(), name='oauth-callback'),

    # Optimization
    path('optimize/', CreateOptimizationView.as_view(), name='create-optimization'),
    path('job/<int:job_id>/', OptimizationJobStatusView.as_view(), name='job-status'),
    path('result/<int:job_id>/', OptimizationResultView.as_view(), name='optimization-result'),
    path('optimization/<int:result_id>/', OptimizationDetailView.as_view(), name='optimization-detail'),

    # History
    path('history/', ProfileHistoryView.as_view(), name='profile-history'),

    # LinkedIn Post Generation
    path('posts/generate/', GeneratePostView.as_view(), name='post-generate'),

]

router = DefaultRouter()
router.register(r'posts', LinkedInPostViewSet, basename='linkedin-posts')
urlpatterns += router.urls
