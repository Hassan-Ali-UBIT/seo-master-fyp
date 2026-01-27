from rest_framework import serializers

from .models import PricePlan, Payment


class PricePlanSerializer(serializers.ModelSerializer):
    """
    Serializer for PricePlan model.
    """
    class Meta:
        model = PricePlan
        exclude = ('duration_days', 'created_by', 'updated_by')
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

    def validate_billing_period(self, value):
        if value not in ["monthly", "yearly"]:
            raise serializers.ValidationError("Billing period must be either 'monthly' or 'yearly'.")
        return value

    def validate(self, attrs):
        """
        Custom validation logic for PricePlan.
        """
        if attrs.get('price') <= 0:
            raise serializers.ValidationError("Price cannot be negative.")

        billing_period = attrs.get('billing_period')
        plan_title = attrs.get('title')

        if self.Meta.model.objects.filter(title=plan_title, billing_period=billing_period).exists():
            raise serializers.ValidationError("A plan with this title and billing period already exists.")

        return attrs

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model.
    """
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class AdminPaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    plan_name = serializers.CharField(source='plan.title', read_only=True)
    transaction_id = serializers.CharField(source='stripe_checkout_id', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'user_name', 'user_email', 'plan_name',
            'amount', 'currency', 'status', 'mode',
            'transaction_id', 'created_at'
        ]
