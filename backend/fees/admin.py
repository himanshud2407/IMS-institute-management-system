from django.contrib import admin

from .models import FeeInvoice, FeePayment


class FeePaymentInline(admin.TabularInline):
    model = FeePayment
    extra = 0
    fields = ('amount', 'payment_date', 'method', 'reference_number', 'recorded_by')
    readonly_fields = ('recorded_by',)


@admin.register(FeeInvoice)
class FeeInvoiceAdmin(admin.ModelAdmin):
    list_display = ('student', 'title', 'fee_type', 'amount', 'paid_amount', 'balance_amount', 'due_date', 'status')
    list_filter = ('status', 'fee_type', 'academic_year', 'due_date')
    search_fields = ('title', 'student__user__full_name', 'student__roll_number')
    inlines = [FeePaymentInline]


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'amount', 'payment_date', 'method', 'reference_number')
    list_filter = ('method', 'payment_date')
    search_fields = ('invoice__title', 'invoice__student__user__full_name', 'reference_number')
