"""
Custom Pagination
=================
Standard pagination class used across all IMS list endpoints.
"""

from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Pagination with:
    - 10 items per page by default
    - Client can override via ?page_size=N (max 100)
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
