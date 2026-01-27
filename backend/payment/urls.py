from django.urls import path, include
from django.conf import settings

from rest_framework.routers import DefaultRouter

from .views import *

router = DefaultRouter()
router.register(r'price-plans', PricePlanViewSet, basename='priceplan')

urlpatterns = [
    path('success/', PaymentSuccessTemplateView.as_view(), name='success'),
    path('cancel/', PaymentCancelTemplateView.as_view(), name='cancel'),
    path('stripe-public-key/', StripePublicKeyView.as_view(), name='stripe_public_key'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create_checkout_session'),
    path('cancel-subscription/', SubscriptionCancelView.as_view(), name='cancel_subscription'),
    path('webhooks/stripe/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('customer-portal/', CustomerPortalView.as_view(), name='customer_portal'),
    path('my-payments/', PaymentHistoryView.as_view(), name='my_payments'),
    path('superadmin/payments/', SuperAdminPaymentAPIView.as_view(), name='superadmin-payments'),
    path('', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += [
        path('test-payment-page/', PaymentPageView.as_view(), name='payment_page'),
    ]
