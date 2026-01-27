from typing import Literal
import stripe
from decouple import config
from datetime import datetime

from django.conf import settings
from django.utils import timezone
from django.http import Http404
from django.utils.html import strip_tags
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string

from common.stripe_utils import get_stripe_product_id

from users.models import User, UserResources

from .models import PricePlan, Payment

def get_object_or_404_with_message(queryset, error_message, **kwargs):
    try:
        return get_object_or_404(queryset, **kwargs)
    except Http404:
        raise Http404(error_message)

def generate_success_url(request):
    try:
        return config('STRIPE_PAYMENT_SUCCESS_LINK')
    except:
        return request.build_absolute_uri("/") + 'api/payment/success/'

def generate_cancel_url(request):
    try:
        return config('STRIPE_PAYMENT_CANCEL_LINK')
    except:
        return request.build_absolute_uri("/") + 'api/payment/cancel/'

def update_user_resources_via_plan(user,
                        plan: PricePlan,
                        stripe_customer_id=None,
                        stripe_subscription_id=None,
                    ):
    user_resource = UserResources.objects.filter(user=user).first()

    subscription_start = timezone.now()
    subscription_end = subscription_start + timezone.timedelta(days=plan.duration_days)
    is_renewal = False if plan.billing_type == 'one_time' else True

    if user_resource:
        user_resource.total_credits = plan.credits + user_resource.remaining_credits()
        user_resource.total_ai_words_limit = plan.ai_words_limit + user_resource.remaining_ai_words()
        user_resource.total_keywords_limit = plan.keywords_limit + user_resource.remaining_keywords()
        user_resource.total_pages_limit = plan.pages_limit + user_resource.remaining_pages()
        user_resource.total_projects = plan.project + user_resource.remaining_projects()

        user_resource.credits_used = 0
        user_resource.ai_words_used = 0
        user_resource.keywords_used = 0
        user_resource.pages_used = 0
        user_resource.projects_created = 0

        user_resource.plan = plan
        user_resource.is_renewal = is_renewal
        user_resource.subscription_start = subscription_start
        user_resource.subscription_end = subscription_end
        user_resource.stripe_customer_id = stripe_customer_id
        user_resource.stripe_subscription_id = stripe_subscription_id
        user_resource.save()

        return user_resource

    user_resource = UserResources.objects.create(
        user=user,
        plan=plan,
        total_credits=plan.credits,
        total_ai_words_limit=plan.ai_words_limit,
        total_keywords_limit=plan.keywords_limit,
        total_pages_limit=plan.pages_limit,
        total_projects=plan.project,
        credits_used=0,
        ai_words_used=0,
        keywords_used=0,
        pages_used=0,
        projects_created=0,
        subscription_start=subscription_start,
        subscription_end=subscription_end,
        stripe_customer_id=stripe_customer_id,
        stripe_subscription_id=stripe_subscription_id,
        is_renewal=is_renewal,
    )

    return user_resource

def cancel_all_stripe_subscriptions_for_user(user, exclude_id=None):

    stripe.api_key = settings.STRIPE_SECRET_KEY

    user_payment = Payment.objects.filter(user=user).last()

    if not user_payment or not user_payment.stripe_customer:
        print(f"No Stripe customer found for user: {user.email}")
        return

    customer_id = user_payment.stripe_customer

    try:
        subscriptions = stripe.Subscription.list(customer=customer_id, limit=100)

        if not subscriptions.data:
            print(f"No active subscriptions found for customer {customer_id}")
            return

        for sub in subscriptions.auto_paging_iter():
            if sub.id == exclude_id:
                continue
            stripe.Subscription.delete(sub.id)
            print(f"Cancelled subscription {sub.id} for customer {customer_id}")

    except stripe.error.StripeError as e:
        print(f"Stripe error occurred while cancelling subscriptions: {e.user_message}")

def handle_subscription_and_one_time_payment(session, metadata):
    """
    Handles the payment for a subscription plan.
    This function is called when a user successfully completes a payment session.
    It sends a success email to the user with the details of the plan and payment.
    """
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    checkout_session_id = session.get('id')
    mode = 'subscription' if subscription_id else 'one_time'
    payment_status = 'completed'

    user_id = metadata.get('user_id')
    plan_id = metadata.get('plan_id')

    if not user_id or not plan_id:
        raise ValueError("User ID or Plan ID not found in session metadata.")

    user = get_object_or_404(User, id=user_id)
    plan = get_object_or_404(PricePlan, id=plan_id)

    if not user.is_active:
        raise ValueError("User is not active.")

    user.is_payment = True
    user.save()

    cancel_all_stripe_subscriptions_for_user(
        user=user,
        exclude_id=subscription_id  # Exclude the current subscription if it exists
    )

    Payment.objects.create(
        user=user,
        email=user.email,
        amount=plan.price,
        plan=plan,
        status=payment_status,
        stripe_customer=customer_id,
        stripe_checkout_id=checkout_session_id,
        stripe_subscription_id=subscription_id,
        stripe_product_id=get_stripe_product_id(plan.stripe_price_id),
        mode=mode,
        currency='usd',  # Assuming USD, adjust as necessary
    )

    update_user_resources_via_plan(
        user=user,
        plan=plan,
        stripe_customer_id=customer_id,
        stripe_subscription_id=subscription_id
    )

    # Send success email
    send_payment_success_email(user, plan, checkout_session_id)

def handle_custom_subscription_and_one_time_payment(session, metadata):
    """
    Handles the payment for a subscription plan.
    This function is called when a user successfully completes a payment session.
    It sends a success email to the user with the details of the plan and payment.
    """
    customer_id = session.get('customer')
    subscription_id = session.get('subscription')
    checkout_session_id = session.get('id')
    mode = 'subscription' if subscription_id else 'one_time'
    payment_status = 'completed'

    user_id = metadata.get('user_id')
    plan_id = metadata.get('plan_id')
    payment_id = metadata.get('internal_payment_id')

    if not user_id or not plan_id:
        raise ValueError("User ID or Plan ID not found in session metadata.")

    user = get_object_or_404(User, id=user_id)
    plan = get_object_or_404(PricePlan, id=plan_id)
    payment_instance = Payment.objects.filter(id=payment_id, status='pending').first()

    if not user.is_active:
        raise ValueError("User is not active.")

    user.is_payment = True
    user.save()

    cancel_all_stripe_subscriptions_for_user(
        user=user,
        exclude_id=subscription_id  # Exclude the current subscription if it exists
    )

    if payment_instance:
        payment_instance.status = payment_status
        payment_instance.mode = mode
        payment_instance.save()
    else:
        Payment.objects.create(
            user=user,
            email=user.email,
            amount=plan.price,
            plan=plan,
            status=payment_status,
            stripe_customer=customer_id,
            stripe_checkout_id=checkout_session_id,
            stripe_subscription_id=subscription_id,
            stripe_product_id=get_stripe_product_id(plan.stripe_price_id),
            mode=mode,
            currency='usd',  # Assuming USD, adjust as necessary
        )

    update_user_resources_via_plan(
        user=user,
        plan=plan,
        stripe_customer_id=customer_id,
        stripe_subscription_id=subscription_id
    )
    # Send success email
    send_payment_success_email(user, plan, checkout_session_id)

def handle_cancelled_subscription(session):
    """
    Handles the cancellation of a subscription.
    This function is called when a user cancels their subscription.
    It updates the user's resources and sends a cancellation email.
    """
    metadata = session.get('metadata', {})

    user_id = metadata.get('user_id')

    cancelled_at = session.get('canceled_at', None)

    user_resource = get_object_or_404_with_message(
        UserResources,
        error_message="User resources not found.",
        user_id=user_id
    )

    user_resource.is_renewal = False
    user_resource.is_cancelled = True
    user_resource.cancellation_date = datetime.fromtimestamp(cancelled_at).date()
    user_resource.save()

def send_payment_success_email(user, plan, payment_intent_id):
    context = {
        'name': user.first_name,
        'user': user,
        'plan': plan,
        'plan_amount': plan.price,
        'date' : timezone.now().strftime("%Y-%m-%d"),
        'payment_date':timezone.now().strftime("%Y-%m-%d"),
        'plan_name': plan.title,
        'plan_cycle': plan.billing_period,
        'transaction_id': payment_intent_id
    }

    # Render the HTML template with context
    html_message = render_to_string('payment/email/payment_reciept.html', context)
    plain_message = strip_tags(html_message)  # Fallback plain text

    send_mail(
        subject='Payment Success',
        message=plain_message,  # Plain text version
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,  # HTML email
        fail_silently=False,
    )

RESOURCE_TYPE = Literal["credits", "ai_words", "keywords", "pages", "projects", "users"]

def validate_user_resource(user, resource_type: RESOURCE_TYPE, resource_amount):

    RESOURCE_TYPE_MAPPING = {
        "credits": "remaining_credits",
        "ai_words": "remaining_ai_words",
        "keywords": "remaining_keywords",
        "pages": "remaining_pages",
        "projects": "remaining_projects",
        "users": "remaining_users",
    }

    user_resource = UserResources.objects.filter(user=user).first()

    if user_resource is None:
        user_resource = UserResources.objects.filter(user=user).first()

    if user_resource is None:
        return False

    if resource_type not in RESOURCE_TYPE_MAPPING:
        return False

    resource_method = RESOURCE_TYPE_MAPPING[resource_type]

    remaining_resource = getattr(user_resource, resource_method)()

    if remaining_resource < resource_amount:
        return False

    return True

def update_user_resource(user, resource_type: RESOURCE_TYPE, resource_amount):

    RESOURCE_TYPE_MAPPING = {
        "credits": "credits_used",
        "ai_words": "ai_words_used",
        "keywords": "keywords_used",
        "pages": "pages_used",
        "projects": "projects_created",
    }

    TOTAL_RESOURCE_MAPPING = {
        "credits": "total_credits",
        "ai_words": "total_ai_words_limit",
        "keywords": "total_keywords_limit",
        "pages": "total_pages_limit",
        "projects": "total_projects",
    }

    user_resource = UserResources.objects.filter(user=user).first()

    if user_resource is None:
        raise ValueError("User resources not found.")

    if resource_type not in RESOURCE_TYPE_MAPPING:
        raise ValueError("Invalid resource type.")

    resource_field = RESOURCE_TYPE_MAPPING[resource_type]

    current_used_resource = getattr(user_resource, resource_field)
    current_used_resource += resource_amount
    total_resource = getattr(user_resource, TOTAL_RESOURCE_MAPPING[resource_type], 0)
    current_used_resource = min(current_used_resource, total_resource)
    setattr(user_resource, resource_field, current_used_resource)
    user_resource.save()

    return user_resource

