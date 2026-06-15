from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FeeInvoiceViewSet, FeePaymentViewSet

router = DefaultRouter()
router.register(r'fees/invoices', FeeInvoiceViewSet, basename='fee-invoice')
router.register(r'fees/payments', FeePaymentViewSet, basename='fee-payment')

urlpatterns = [
    path('', include(router.urls)),
]
