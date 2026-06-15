"""
Biometric matching helpers.

This module isolates face-template creation so a production face-recognition
provider can replace the current lightweight local matcher without changing
attendance views or serializers.
"""

import base64
import hashlib
from dataclasses import dataclass


class BiometricError(ValueError):
    pass


@dataclass(frozen=True)
class FaceTemplate:
    value: str
    sample_size: int


def decode_image_data(image_data):
    if not image_data or not isinstance(image_data, str):
        raise BiometricError('Face image is required.')

    payload = image_data.strip()
    if payload.startswith('data:image/'):
        try:
            payload = payload.split(',', 1)[1]
        except IndexError as exc:
            raise BiometricError('Invalid image data URL.') from exc

    try:
        image_bytes = base64.b64decode(payload, validate=True)
    except Exception as exc:
        raise BiometricError('Face image must be valid base64 data.') from exc

    if len(image_bytes) < 1024:
        raise BiometricError('Face image is too small for biometric enrollment.')
    if len(image_bytes) > 2 * 1024 * 1024:
        raise BiometricError('Face image must be 2MB or smaller.')

    return image_bytes


def create_face_template(image_data):
    image_bytes = decode_image_data(image_data)
    return FaceTemplate(
        value=hashlib.sha256(image_bytes).hexdigest(),
        sample_size=len(image_bytes),
    )


def compare_face_templates(expected, candidate):
    if not expected or not candidate:
        return 0.0
    if expected == candidate:
        return 100.0

    matches = sum(1 for left, right in zip(expected, candidate) if left == right)
    return round((matches / max(len(expected), len(candidate))) * 100, 2)
