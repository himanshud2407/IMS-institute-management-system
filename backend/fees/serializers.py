from decimal import Decimal

from rest_framework import serializers

from .models import FeeInvoice, FeePayment


class FeePaymentSerializer(serializers.ModelSerializer):
    invoice_title = serializers.CharField(source='invoice.title', read_only=True)
    student_name = serializers.CharField(source='invoice.student.user.full_name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = FeePayment
        fields = [
            'id', 'invoice', 'invoice_title', 'student_name', 'amount',
            'payment_date', 'method', 'reference_number', 'notes',
            'recorded_by', 'recorded_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        invoice = attrs.get('invoice') or getattr(self.instance, 'invoice', None)
        amount = attrs.get('amount')
        if invoice and amount is not None and invoice.status == FeeInvoice.Status.CANCELLED:
            raise serializers.ValidationError('Cannot record payment for a cancelled invoice.')
        if invoice and amount is not None and amount > invoice.balance_amount:
            raise serializers.ValidationError({'amount': 'Payment cannot exceed invoice balance.'})
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['recorded_by'] = request.user
        return super().create(validated_data)


class FeeInvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    course_name = serializers.CharField(source='student.course.name', read_only=True)
    paid_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    payments = FeePaymentSerializer(many=True, read_only=True)

    class Meta:
        model = FeeInvoice
        fields = [
            'id', 'student', 'student_name', 'student_roll', 'course_name',
            'title', 'fee_type', 'academic_year', 'amount', 'due_date',
            'status', 'description', 'paid_amount', 'balance_amount',
            'is_overdue', 'payments', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value


class FeeSummarySerializer(serializers.Serializer):
    total_invoiced = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
