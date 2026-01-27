from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from users.models import User, UserResources
from payment.models import PricePlan, Payment
from users.permissions import IsAdminOrSuperAdmin

class DashboardCountsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def get(self, request, *args, **kwargs):
        total_users = User.objects.count()

        # Modules: LinkedIn, Keywords, Competitor, Pages, AI
        total_modules = 5

        total_plans = PricePlan.objects.count()

        total_revenue_agg = Payment.objects.filter(status='completed').aggregate(total=Sum('amount'))
        total_revenue = total_revenue_agg['total'] if total_revenue_agg['total'] else 0

        return Response({
            "total_users": total_users,
            "total_modules": total_modules,
            "total_plans": total_plans,
            "total_revenue": total_revenue
        })

class UserSignupsGraphView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def get(self, request, *args, **kwargs):
        # Last 12 months
        one_year_ago = timezone.now() - timedelta(days=365)

        signups_by_month = (
            User.objects
            .filter(date_joined__gte=one_year_ago)
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        data = [
            {
                "month": item['month'].strftime("%Y-%m"),
                "count": item['count']
            }
            for item in signups_by_month
        ]

        return Response(data)

class ModuleUsageGraphView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def get(self, request, *args, **kwargs):
        # Aggregate usage from UserResources
        # Note: We updated UserResources to use: credits_used, ai_words_used, keywords_used, pages_used

        usage_agg = UserResources.objects.aggregate(
            total_credits=Sum('credits_used'), # Assuming credits map largely to LinkedIn or generic
            total_ai_words=Sum('ai_words_used'),
            total_keywords=Sum('keywords_used'),
            total_pages=Sum('pages_used'),
            total_projects=Sum('projects_created')
        )

        # Structure for graph
        data = [
            {"module": "Credits/General", "usage": usage_agg['total_credits'] or 0},
            {"module": "AI Writer", "usage": usage_agg['total_ai_words'] or 0},
            {"module": "Keyword Research", "usage": usage_agg['total_keywords'] or 0},
            {"module": "Page Audits", "usage": usage_agg['total_pages'] or 0},
            {"module": "Projects", "usage": usage_agg['total_projects'] or 0},
        ]

        return Response(data)

from users.serializers import AdminUserSerializer
from payment.serializers import AdminPaymentSerializer

class AdminUserListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

class AdminPaymentListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def get(self, request):
        # Filter payments (e.g., exclude setup intents if needed, or show all)
        payments = Payment.objects.exclude(status='pending').order_by('-created_at')
        serializer = AdminPaymentSerializer(payments, many=True)
        return Response(serializer.data)
