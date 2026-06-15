"""
Common Models
=============
Reusable abstract base models used across all IMS apps.
"""

import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract base model that provides:
    - UUID primary key for production-level security
    - created_at / updated_at timestamps
    
    All IMS models should inherit from this instead of models.Model.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="ID"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']
