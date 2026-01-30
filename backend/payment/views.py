import stripe
from decouple import config
from datetime import datetime, timedelta

from django.db import transaction
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView
from django.contrib.auth import PermissionDenied

from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import APIException

from common.stripe_utils import (
    get_or_create_stripe_product, create_stripe_price,
    update_stripe_price_and_product, update_stripe_product_name
)
from common.pagination_utils import CustomPagination, get_pagination_response

# from custom_payment_plan.utility.genrapide import process_sending_payment_confirmation_email

from users.models import UserResources
from users.permissions import IsSuperAdminOrReadOnly, IsSuperAdmin

from .models import *
from .serializers import *
from .utils import *

class StripePublicKeyView(APIView):
    """
    View to return the Stripe public key.
    """
    def get(self, request, *args, **kwargs):
        """
        Returns the Stripe public key.
        """
        stripe_public_key = settings.STRIPE_PUBLISHABLE_KEY  # Replace with your actual Stripe public key
        return Response({"stripe_public_key": stripe_public_key}, status=status.HTTP_200_OK)

class PricePlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing PricePlan objects.
    """
    queryset = PricePlan.objects.all()
    serializer_class = PricePlanSerializer  # Ensure you have a serializer class defined for PricePlan
    required_permission = "subscription"
    permission_classes = [IsSuperAdminOrReadOnly]

    def get_queryset(self):
        """
        Optionally restricts the returned plans to those that are active.
        """
        if self.request.user.is_authenticated and self.request.user.userprofile.role.name in ['superadmin', 'admin']:
            return self.queryset.all().order_by('-created_at')
        else:
            return self.queryset.filter(is_active=True).exclude(billing_period='other').order_by('-created_at')

    def perform_create(self, serializer):
        """
        Override to set the created_by field to the current user.
        """

        user = self.request.user

        if user.userprofile.role.name not in ['superadmin', 'admin']:
            raise PermissionDenied("You are not authorized to perform this action.")

        plan_title = serializer.validated_data.get('title')
        plan_price = serializer.validated_data.get('price')
        plan_billing_type = serializer.validated_data.get('billing_type')
        plan_billing_period = serializer.validated_data.get('billing_period')
        plan_currency = serializer.validated_data.get('currency') or 'usd'

        period_day_mapping = {
            "monthly": 30,
            "yearly": 365,
        }

        serializer.validated_data['duration_days'] = period_day_mapping.get(plan_billing_period, 30)


        stripe_product_id = get_or_create_stripe_product(plan_title)

        stripe_price_id = create_stripe_price(
            amount=plan_price,
            product_id=stripe_product_id,
            billing_type=plan_billing_type,
            billing_period=plan_billing_period,
            currency=plan_currency
        )

        serializer.validated_data['stripe_price_id'] = stripe_price_id

        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        """
        Override to set the updated_by field to the current user.
        """

        user = self.request.user

        if user.userprofile.role.name != 'superadmin':
            raise PermissionDenied("You are not authorized to perform this action.")

        # plan_title = serializer.validated_data.get('title')
        # plan_price = serializer.validated_data.get('price')
        # plan_billing_type = serializer.validated_data.get('billing_type')
        # plan_billing_period = serializer.validated_data.get('billing_period')
        # plan_currency = serializer.validated_data.get('currency') or 'usd'

        # has_major_field_updated = False

        # if plan_title != serializer.instance.title:
        #     update_stripe_product_name(
        #         serializer.instance.stripe_price_id,
        #         new_name=plan_title
        #     )

        # if plan_price != serializer.instance.price:
        #     has_major_field_updated = True

        # if plan_billing_type != serializer.instance.billing_type:
        #     has_major_field_updated = True

        # if plan_billing_period != serializer.instance.billing_period:
        #     has_major_field_updated = True


        # period_day_mapping = {
        #     "monthly": 30,
        #     "yearly": 365,
        # }
        # serializer.validated_data['duration_days'] = period_day_mapping.get(plan_billing_period, 30)

        # if has_major_field_updated:
        #     update_stripe_price_and_product(
        #         stripe_price_id=serializer.instance.stripe_price_id,
        #         new_product_name=plan_title,
        #         new_amount=plan_price,
        #         billing_type=plan_billing_type,
        #         billing_period=plan_billing_period,
        #         currency=plan_currency
        #     )

        serializer.validated_data['updated_by'] = self.request.user
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.userprofile.role.name != 'superadmin':
            raise PermissionDenied("You are not authorized to perform this action.")

        if Payment.objects.filter(plan=instance).exists():
            raise APIException("Plan is associated with payments. Cannot be deleted.")

        if UserResources.objects.filter(plan=instance).exists():
            raise APIException("Plan is associated with user resources. Cannot be deleted.")

        instance.delete()

class PaymentPageView(TemplateView):
    """
    View to render the payment page.
    """
    template_name = "payment/plans.html"

    def get_context_data(self, **kwargs):
        """
        Adds the Stripe public key and auth token to the context.
        """
        context = super().get_context_data(**kwargs)
        context['authorization_token'] = self.request.GET.get('token', None)
        context['stripe_public_key'] = settings.STRIPE_PUBLISHABLE_KEY  # Replace with your actual Stripe public key
        context['all_plans'] = [
            {
                "id": plan.id,
                "title": plan.title,
                "billing_type": plan.billing_type,
                "billing_period": plan.billing_period,
                "price": plan.price,
            }
            for plan in PricePlan.objects.filter(is_active=True)
        ]
        return context

class CreateCheckoutSessionView(APIView):
    required_permission = "subscription"

    def post(self, request, *args, **kwargs):

        plan_id = request.data.get("plan_id")

        plan = get_object_or_404(PricePlan, id=plan_id)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        plan_amount = plan.price
        plan_billing_type = plan.billing_type

        user = request.user
        user_last_payment = Payment.objects.filter(user=user).last()
        user_stripe_customer_id = user_last_payment.stripe_customer if user_last_payment else None

        # Convert amount to cents for Stripe
        amount_in_cents = int(float(plan_amount) * 100)  # Stripe accepts amounts in cents

        SUCCESS_URL = generate_success_url(request)
        CANCEL_URL = generate_cancel_url(request)

        if plan_billing_type == 'one_time':

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",  # Change to your desired currency
                            "product_data": {
                                "name": plan.title,  # Dynamic name based on plan
                            },
                            "unit_amount": amount_in_cents,  # Amount in cents
                        },
                        "quantity": 1,
                    },
                ],
                metadata={
                    "user_id": str(user.id),
                    "plan_id": plan.id,
                    "internal_payment_id": None,
                    "user_email": user.email,
                    "is_subscription": "false",
                    "is_custom_plan": "false",
                    "from": "one_time_metadata",
                    "billing_period": plan.billing_period,
                },
                customer_email=user.email if not user_stripe_customer_id else None,  # Send email to Stripe (optional)
                mode="payment",
                customer=user_stripe_customer_id,  # Will use existing customer if available
                customer_creation='always' if not user_stripe_customer_id else None,  # Create new customer if none exists
                payment_intent_data={
                    'setup_future_usage': 'off_session',  # This enables storing payment method
                },
                success_url=SUCCESS_URL,
                cancel_url=CANCEL_URL,
            )

            return Response({"id": checkout_session.id, "url": checkout_session.url})

        elif plan_billing_type == 'subscription':  # **Recurring Payment (Subscription)**
            print("payemnt is subscription")
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
                metadata={
                    "user_id": str(user.id),
                    "plan_id": plan.id,
                    "internal_payment_id": None,
                    "user_email": user.email,
                    "is_subscription": "true",
                    "is_custom_plan": "false",
                    "from": "metadata",
                    "billing_period": plan.billing_period
                },
                subscription_data={
                    "metadata": {
                        "user_id": str(user.id),
                        "plan_id": str(plan.id),
                        "internal_payment_id": None,
                        "user_email": user.email,
                        "is_subscription": "true",
                        "is_custom_plan": "false",
                        "from": "subscription_metadata",
                        "billing_period": plan.billing_period
                    },
                },
                customer_email=user.email if not user_stripe_customer_id else None,
                customer=user_stripe_customer_id,  # Will use existing customer if available
                # customer_creation='always' if not user_stripe_customer_id else None,  # Create new customer if none exists
                mode="subscription",
                success_url=SUCCESS_URL,
                cancel_url=CANCEL_URL
            )

        return Response({"id": checkout_session.id, "url": checkout_session.url})

class SubscriptionCancelView(APIView):
    def post(self, request, *args, **kwargs):
        # Assume the user model has a stripe_customer_id field
        user = request.user
        user_resource = get_object_or_404_with_message(UserResources,
                                                    error_message= "No subscription exists to cancel.",
                                                    user=user,
                                                    stripe_customer_id__isnull=False,
                                                    stripe_subscription_id__isnull=False
                                                )

        stripe.api_key = settings.STRIPE_SECRET_KEY

        # Cancel the subscription (at period end or immediately)
        canceled_subscription = stripe.Subscription.modify(
            user_resource.stripe_subscription_id,
            cancel_at_period_end=True  # Set to False for immediate cancellation
        )

        # Optionally update your database here (or rely on webhook)
        # Example: Update user model or subscription model
        # user.subscription_status = 'canceled'
        # user.save()

        return Response({'message': 'Subscription scheduled for cancellation', 'subscription': canceled_subscription})

class StripeWebhookView(APIView):
    authentication_classes = []  # Disable DRF auth
    permission_classes = []      # Disable DRF permissions

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        webhook_secret = settings.STRIPE_ENDPOINT_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=webhook_secret
            )
        except ValueError as e:
            # Invalid payload
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        print("Received event: ", event["type"])

        # Order Matters

        # ✅ Handle the event
        if event['type'] == 'invoice.payment_succeeded':
            # handle subscription and subscription renewal
            # Do something with the event
            session = event["data"]["object"]
            subscription_details = session.get('subscription_details', {})
            parent_details = session.get("parent", {}).get("subscription_details", {})
            metadata = subscription_details.get('metadata', {})
            # print("Event: ", event)
            print("Session: ", session)
            print("Subscription Details: ", subscription_details)
            print("Metadata: ", metadata)

            # Added for custom plan details are coming in metadata of
            # session directly in the case of one time payment

            if metadata is None or len(metadata) == 0:
                metadata = session.get('metadata', {})

            if metadata is None or len(metadata) == 0:
                metadata = parent_details.get('metadata', {})

            # print("Invoice payment succeeded: ", session)
            is_custom_plan = metadata.get('is_custom_plan', False)

            if not is_custom_plan or is_custom_plan == 'false':
                handle_subscription_and_one_time_payment(session, metadata)
            else:
                handle_custom_subscription_and_one_time_payment(session, metadata)

        elif event['type'] == 'checkout.session.completed':
            # Handle one time payment
            session = event["data"]["object"]
            metadata = session.get('metadata', {})
            print("Checkout session completed: ", session)
            print("Metadata: ", metadata)
            is_subscription = metadata.get('is_subscription', False)
            print("Is subscription: ", is_subscription)
            print("Condition: ", not is_subscription or is_subscription == 'false')
            print("Sub Condition: 1", not is_subscription)
            print("Sub Condition: 2", is_subscription == 'false')

            if not is_subscription or is_subscription == 'false':
                handle_subscription_and_one_time_payment(session, metadata)
        # Add more event types as needed
        elif event['type'] == 'customer.subscription.created':
            # Handle new subscription creation
            subscription = event['data']['object']

            # print("New subscription created: ", subscription)

            # You can save the subscription details to your database here

        elif event['type'] == 'customer.subscription.updated':
            # Handle subscription updates
            session = event['data']['object']

            cancel_at_period_end = session.get('cancel_at_period_end', False)

            if cancel_at_period_end:
                handle_cancelled_subscription(session)
            # You can update your database here based on the subscription data

        # elif event["type"] == "setup_intent.succeeded":
        #     setup_intent = event["data"]["object"]

        #     print("setup_intent =========== ", setup_intent)

        #     customer_id = setup_intent["metadata"].get("customer_id")
        #     user_email = setup_intent["metadata"].get("user_email")
        #     user_ins = User.objects.get(email=user_email)
        #     payment_method = setup_intent["payment_method"]

        #     if customer_id and payment_method:
        #         # Attach payment method to customer
        #         stripe.PaymentMethod.attach(payment_method, customer=customer_id)

        #         # Set it as the default payment method
        #         stripe.Customer.modify(
        #             customer_id,
        #             invoice_settings={"default_payment_method": payment_method},
        #         )

        #         Payment.objects.create(
        #             user=user_ins,
        #             email=user_email,
        #             amount=0.0,
        #             status="completed",
        #             mode="setup",
        #             stripe_customer=customer_id
        #         )

        #         process_sending_payment_confirmation_email(user_ins)

        #         return Response({"message": "card updated successfully"})

        return Response({'status': 'success'}, status=status.HTTP_200_OK)

class CustomerPortalView(APIView):

    def post(self, request, *args, **kwargs):

        user = request.user

        stripe.api_key = settings.STRIPE_SECRET_KEY

        user_resource = get_object_or_404_with_message(
            UserResources,
            error_message="No subscription exists to access customer portal.",
            user=user,
            stripe_customer_id__isnull=False,
        )
        # Create a portal session
        session = stripe.billing_portal.Session.create(
            customer=user_resource.stripe_customer_id,  # Using 'stripe_customer' directly
            return_url=request.build_absolute_uri("/")  # Redirect back to your website after they finish
        )

        return Response({"url": session.url})  # Send the URL to the frontend

class PaymentSuccessTemplateView(TemplateView):
    """
    View to render the payment success page.
    """
    template_name = "payment/success.html"

class PaymentCancelTemplateView(TemplateView):
    """
    View to render the payment cancel page.
    """
    template_name = "payment/cancel.html"

class PaymentHistoryView(APIView):
    """
    View to retrieve the payment history of the user.
    """
    def get(self, request, *args, **kwargs):
        """
        Returns the payment history for the authenticated user.
        """
        user = request.user
        payments = Payment.objects.filter(user=user).order_by('-created_at')

        paginator = CustomPagination()
        paginated_data = paginator.paginate_queryset(payments, request)

        serializer = PaymentSerializer(paginated_data, many=True)
        return paginator.get_paginated_response(serializer.data)

class SuperAdminPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    def get(self, request, *args, **kwargs):
        payments = Payment.objects.all().order_by('-created_at')
        return get_pagination_response(request, payments, PaymentSerializer)

class SubscribeCustomPlan(APIView):
    """
    View to handle custom plan subscription.
    """
    def post(self, request, *args, **kwargs):
        """
        Handles the subscription to a custom plan.
        """
        user = request.user
        plan_id = request.data.get("plan_id")
        plan = get_object_or_404(PricePlan, id=plan_id)

        # Create a payment record
        payment = Payment.objects.create(
            user=user,
            email=user.email,
            amount=plan.price,
            plan=plan,
            status='pending',
            stripe_customer=None,
            stripe_checkout_id=None
        )

        # Redirect to the payment page with the payment ID
        return Response({"payment_id": payment.id}, status=status.HTTP_200_OK)
