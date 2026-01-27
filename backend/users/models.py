from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _
# Create your models here.
class User(AbstractUser):
    username = models.CharField(max_length=150, null=True, blank=True)
    email = models.EmailField(_('email address'), unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"ID({self.pk}). " + self.email

    @property
    def has_paid(self):
        user_resource = self.userresources_set.order_by('-created_at').first()

        return user_resource is not None and user_resource.subscription_end > timezone.now().date()

class Role(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    AUTH_PROVIDERS = (
        ("email", "Email"),
        ("google", "Google"),
        ("facebook", "Facebook"),
        ("github", "GitHub"),
        ("other", "Other"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    auth_provider = models.CharField(max_length=50, choices=AUTH_PROVIDERS, default="email")
    # Additional signup information
    contact = models.CharField(max_length=50, blank=True, null=True)
    hear_about_us = models.CharField(max_length=255, blank=True, null=True)
    referral_code = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['role']),
        ]

class OTP(models.Model):
    otp_type = (
        ("sign_up", "Sign Up"),
        ("forget_password", "Forget Password"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.IntegerField()
    type = models.CharField(max_length=100, choices=otp_type)
    used = models.BooleanField(default=False)
    expire_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} | {self.otp} | {self.expire_at.time().strftime('%H:%M')}"

class UserPermission(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE,blank=True,null=True)
    permission_obj = models.JSONField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class UserResources(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey("payment.PricePlan", on_delete=models.SET_NULL, null=True, blank=True)

    # Total allocated resources (sum of all plans purchased)
    # Total allocated resources
    total_credits = models.PositiveIntegerField(default=0)
    total_ai_words_limit = models.PositiveBigIntegerField(default=0)
    total_keywords_limit = models.PositiveIntegerField(default=0)
    total_pages_limit = models.PositiveIntegerField(default=0)

    total_projects = models.PositiveBigIntegerField(default=0)

    # Usage tracking
    credits_used = models.PositiveIntegerField(default=0)
    ai_words_used = models.PositiveBigIntegerField(default=0)
    keywords_used = models.PositiveIntegerField(default=0)
    pages_used = models.PositiveIntegerField(default=0)

    projects_created = models.PositiveIntegerField(default=0)

    stripe_customer_id = models.CharField(max_length=200, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=200, blank=True, null=True)

    subscription_start = models.DateField(blank=True, null=True)
    subscription_end = models.DateField(blank=True, null=True)
    is_renewal = models.BooleanField(default=True)
    is_cancelled = models.BooleanField(default=False)
    cancellation_date = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def remaining_credits(self):
        return self.total_credits - self.credits_used

    def remaining_ai_words(self):
        return self.total_ai_words_limit - self.ai_words_used

    def remaining_keywords(self):
        return self.total_keywords_limit - self.keywords_used

    def remaining_pages(self):
        return self.total_pages_limit - self.pages_used

    def remaining_projects(self):
        return self.total_projects - self.projects_created

    def consume_credits(self, amount=1):
        """Consume credits if available"""

        self.credits_used += min(amount, self.remaining_credits())
        self.save()

    def consume_ai_words(self, amount):
        """Consume AI words if available"""
        self.ai_words_used += min(amount, self.remaining_ai_words())
        self.save()

    def consume_keywords(self, amount=1):
        """Consume keywords if available"""
        self.keywords_used += min(amount, self.remaining_keywords())
        self.save()

    def consume_pages(self, amount=1):
        """Consume pages if available"""
        self.pages_used += min(amount, self.remaining_pages())
        self.save()

    def consume_project(self, amount=1):
        """Consume project if available"""
        self.projects_created += min(amount, self.remaining_projects())
        self.save()

    def remaining_users(self):
        if self.plan and self.user.organization is not None:
            return self.plan.max_users - self.user.organization.members.count()
        return 0
