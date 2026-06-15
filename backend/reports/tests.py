from django.test import TestCase

from reports.views import money


class ReportHelperTests(TestCase):
    def test_money_serializes_decimal_like_values(self):
        self.assertEqual(money(None), '0.00')
