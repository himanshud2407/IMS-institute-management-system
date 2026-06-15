from decimal import Decimal

from django.db.models import Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from .models import FeeInvoice, FeePayment
from .serializers import FeeInvoiceSerializer, FeePaymentSerializer, FeeSummarySerializer


class FeeInvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = FeeInvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'fee_type', 'status', 'academic_year', 'due_date']
    search_fields = ['title', 'student__user__full_name', 'student__roll_number', 'description']
    ordering_fields = ['due_date', 'amount', 'created_at']

    def get_queryset(self):
        queryset = FeeInvoice.objects.select_related(
            'student', 'student__user', 'student__course'
        ).prefetch_related('payments', 'payments__recorded_by')
        user = self.request.user
        if user.role == 'ADMIN':
            return queryset
        if user.role == 'STUDENT':
            try:
                return queryset.filter(student=user.student_profile)
            except Exception:
                return queryset.none()
        return queryset.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'record_payment']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        invoice = serializer.save()
        invoice.refresh_status()

    def perform_update(self, serializer):
        invoice = serializer.save()
        invoice.refresh_status()

    @action(detail=True, methods=['post'], url_path='record-payment')
    def record_payment(self, request, pk=None):
        invoice = self.get_object()
        serializer = FeePaymentSerializer(
            data={**request.data, 'invoice': invoice.id},
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        return Response(FeePaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        invoices = self.get_queryset()
        total_invoiced = invoices.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_paid = FeePayment.objects.filter(invoice_id__in=invoices.values('id')).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        data = {
            'total_invoiced': total_invoiced,
            'total_paid': total_paid,
            'total_balance': total_invoiced - total_paid,
            'pending_count': invoices.filter(status__in=[FeeInvoice.Status.PENDING, FeeInvoice.Status.PARTIAL]).count(),
            'overdue_count': invoices.filter(status=FeeInvoice.Status.OVERDUE).count(),
        }
        return Response(FeeSummarySerializer(data).data)


class FeePaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FeePaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['invoice', 'method', 'payment_date']
    search_fields = ['invoice__title', 'invoice__student__user__full_name', 'reference_number']
    ordering_fields = ['payment_date', 'amount', 'created_at']

    def get_queryset(self):
        queryset = FeePayment.objects.select_related(
            'invoice', 'invoice__student', 'invoice__student__user', 'recorded_by'
        )
        user = self.request.user
        if user.role == 'ADMIN':
            return queryset
        if user.role == 'STUDENT':
            try:
                return queryset.filter(invoice__student=user.student_profile)
            except Exception:
                return queryset.none()
        return queryset.none()

    def get_permissions(self):
        return [IsAuthenticated()]
