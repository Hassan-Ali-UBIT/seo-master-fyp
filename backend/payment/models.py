import uuid

from django.db import models

from users.models import User
# Create your models here.
class PricePlan(models.Model):
    BILLING_PERIOD_CHOICES = (
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("other", "Other"),
    )

    BILLING_TYPE_CHOICES = (
        ('one_time', 'One Time'),
        ('subscription', 'Subscription'),
    )

    title = models.CharField(max_length=250)
    sub_title = models.CharField(max_length=150, null=True, blank=True)
    credits = models.PositiveIntegerField(default=0) # General credits for various tools
    ai_words_limit = models.PositiveBigIntegerField(default=0)
    keywords_limit = models.PositiveIntegerField(default=0) # Rank tracking etc
    pages_limit = models.PositiveIntegerField(default=0) # Audit pages etc

    project = models.PositiveIntegerField(default=0)
    max_users = models.PositiveIntegerField(default=0)  # Max users allowed
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_price_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    billing_type = models.CharField(max_length=20, choices=BILLING_TYPE_CHOICES, default='subscription')  # Type of billing
    billing_period = models.CharField(max_length=20, choices=BILLING_PERIOD_CHOICES)  # Related billing cycle
    duration_days = models.PositiveBigIntegerField(blank=True, null=True, default=30)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL,related_name='price_plan_created_by',null=True,blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL,related_name='price_plan_updated_by',null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.sub_title})"

class Payment(models.Model):

    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_MODE = (
        ('setup', 'setup'),
        ('one_time', 'one_time'),
        ('subscription', 'Subscription'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments")
    email = models.EmailField()
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    plan = models.ForeignKey(PricePlan, on_delete=models.CASCADE, blank=True, null=True)
    status = models.CharField(max_length=50, choices=PAYMENT_STATUS)
    stripe_customer = models.CharField(max_length=500, blank=True, null=True)
    stripe_checkout_id = models.CharField(max_length=500, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=500, blank=True, null=True)
    mode = models.CharField(max_length=50, choices=PAYMENT_MODE, blank=True, null=True)
    stripe_product_id = models.CharField(max_length=500, blank=True, null=True)
    stripe_payment_intent = models.CharField(max_length=500, blank=True, null=True)
    confirmation_token = models.UUIDField(default=uuid.uuid4)

    quantity = models.IntegerField(default=1)
    currency = models.CharField(max_length=3, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} {self.currency or ''} - {self.status}"
