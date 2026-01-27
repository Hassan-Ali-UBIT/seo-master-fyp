from django.contrib import admin
from .models import PricePlan, Payment


@admin.register(PricePlan)
class PricePlanAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "sub_title",
        "price",
        "billing_type",
        "billing_period",
        "duration_days",
        "credits",
        "ai_words_limit",
        "keywords_limit",
        "pages_limit",
        "project",
        "max_users",
        "is_active",
        "created_by",
        "updated_by",
        "created_at",
    )
    list_filter = ("billing_type", "billing_period", "is_active", "created_at", "updated_at")
    search_fields = ("title", "sub_title", "stripe_price_id")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "email",
        "amount",
        "currency",
        "status",
        "mode",
        "plan",
        "created_at",
        "updated_at",
    )
    list_filter = ("status", "mode", "currency", "created_at", "updated_at")
    search_fields = (
        "user__username",
        "email",
        "stripe_customer",
        "stripe_checkout_id",
        "stripe_subscription_id",
        "stripe_product_id",
        "stripe_payment_intent",
    )
    readonly_fields = ("created_at", "updated_at", "confirmation_token")
    ordering = ("-created_at",)
