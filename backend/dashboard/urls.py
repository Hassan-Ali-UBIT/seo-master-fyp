from django.urls import path
from .views import DashboardCountsView, UserSignupsGraphView, ModuleUsageGraphView, AdminUserListView, AdminPaymentListView

urlpatterns = [
    path('counts/', DashboardCountsView.as_view(), name='dashboard-counts'),
    path('signups-graph/', UserSignupsGraphView.as_view(), name='dashboard-signups'),
    path('module-usage/', ModuleUsageGraphView.as_view(), name='dashboard-usage'),
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('payments/', AdminPaymentListView.as_view(), name='admin-payments-list'),
]
