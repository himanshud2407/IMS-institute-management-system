from datetime import date
from decimal import Decimal

from django.test import TestCase

from accounts.models import User
from courses.models import Course
from fees.models import FeeInvoice, FeePayment
from students.models import Student


class FeeInvoiceModelTests(TestCase):
    def test_partial_payment_updates_invoice_status_and_balance(self):
        user = User.objects.create_user(email='student2@example.com', password='pass12345', full_name='Student Two', role='STUDENT')
        course = Course.objects.create(name='Business', code='BUS', duration=6)
        student = Student.objects.create(
            user=user,
            roll_number='BUS001',
            course=course,
            phone_number='1234567890',
            date_of_birth=date(2005, 1, 1),
            gender='OTHER',
            address='Campus',
            admission_date=date(2024, 6, 1),
        )
        invoice = FeeInvoice.objects.create(
            student=student,
            title='Semester Fee',
            fee_type=FeeInvoice.FeeType.TUITION,
            academic_year='2026-27',
            amount=Decimal('1000.00'),
            due_date=date(2026, 7, 1),
        )
        FeePayment.objects.create(invoice=invoice, amount=Decimal('400.00'))
        invoice.refresh_from_db()

        self.assertEqual(invoice.status, FeeInvoice.Status.PARTIAL)
        self.assertEqual(invoice.balance_amount, Decimal('600.00'))
