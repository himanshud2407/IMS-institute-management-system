from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel
from students.models import Student


class FeeInvoice(TimeStampedModel):
    class FeeType(models.TextChoices):
        TUITION = 'TUITION', 'Tuition'
        EXAM = 'EXAM', 'Exam'
        LIBRARY = 'LIBRARY', 'Library'
        HOSTEL = 'HOSTEL', 'Hostel'
        TRANSPORT = 'TRANSPORT', 'Transport'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PARTIAL = 'PARTIAL', 'Partial'
        PAID = 'PAID', 'Paid'
        OVERDUE = 'OVERDUE', 'Overdue'
        CANCELLED = 'CANCELLED', 'Cancelled'

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='fee_invoices',
        verbose_name='Student',
    )
    title = models.CharField(max_length=200, verbose_name='Invoice Title')
    fee_type = models.CharField(
        max_length=20,
        choices=FeeType.choices,
        default=FeeType.TUITION,
        verbose_name='Fee Type',
    )
    academic_year = models.CharField(max_length=20, verbose_name='Academic Year')
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Amount',
    )
    due_date = models.DateField(verbose_name='Due Date')
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='Status',
    )
    description = models.TextField(blank=True, verbose_name='Description')

    class Meta:
        ordering = ['-due_date', '-created_at']
        verbose_name = 'Fee Invoice'
        verbose_name_plural = 'Fee Invoices'

    def __str__(self):
        return f"{self.student} - {self.title}"

    @property
    def paid_amount(self):
        paid = self.payments.aggregate(total=models.Sum('amount'))['total']
        return paid or Decimal('0.00')

    @property
    def balance_amount(self):
        balance = self.amount - self.paid_amount
        return max(balance, Decimal('0.00'))

    @property
    def is_overdue(self):
        return self.status not in [self.Status.PAID, self.Status.CANCELLED] and self.due_date < timezone.localdate()

    def refresh_status(self, save=True):
        if self.status == self.Status.CANCELLED:
            return self.status
        if self.paid_amount >= self.amount:
            self.status = self.Status.PAID
        elif self.paid_amount > 0:
            self.status = self.Status.PARTIAL
        elif self.is_overdue:
            self.status = self.Status.OVERDUE
        else:
            self.status = self.Status.PENDING
        if save:
            self.save(update_fields=['status', 'updated_at'])
        return self.status


class FeePayment(TimeStampedModel):
    class Method(models.TextChoices):
        CASH = 'CASH', 'Cash'
        CARD = 'CARD', 'Card'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        UPI = 'UPI', 'UPI'
        CHEQUE = 'CHEQUE', 'Cheque'

    invoice = models.ForeignKey(
        FeeInvoice,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name='Invoice',
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Payment Amount',
    )
    payment_date = models.DateField(default=timezone.localdate, verbose_name='Payment Date')
    method = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.CASH,
        verbose_name='Payment Method',
    )
    reference_number = models.CharField(max_length=100, blank=True, verbose_name='Reference Number')
    notes = models.TextField(blank=True, verbose_name='Notes')
    recorded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_fee_payments',
        verbose_name='Recorded By',
    )

    class Meta:
        ordering = ['-payment_date', '-created_at']
        verbose_name = 'Fee Payment'
        verbose_name_plural = 'Fee Payments'

    def __str__(self):
        return f"{self.invoice} - {self.amount}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.invoice.refresh_status()
