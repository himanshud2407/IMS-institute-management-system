# Biometric Attendance

IMS supports a facial-biometric attendance workflow from the teacher attendance screen.

## Flow

1. Teacher opens Attendance Management.
2. Teacher selects a subject and loads students.
3. Teacher clicks `Enroll` beside a student and captures a webcam image.
4. Backend stores a derived face template in `BiometricProfile`.
5. Teacher opens an existing attendance session, clicks `Verify`, captures a webcam image, and submits it.
6. Backend verifies the capture and marks the `AttendanceRecord` as `PRESENT` with `source=BIOMETRIC`.

## API Endpoints

```text
POST /api/attendance/sessions/biometrics/enroll/
POST /api/attendance/sessions/biometrics/check-in/
```

Enrollment payload:

```json
{
  "student": "student-uuid",
  "image": "data:image/jpeg;base64,...",
  "consent_confirmed": true
}
```

Check-in payload:

```json
{
  "session": "attendance-session-uuid",
  "student": "student-uuid",
  "image": "data:image/jpeg;base64,..."
}
```

## Storage Policy

Raw face images are not stored. The backend stores only a derived template, sample size, enrollment metadata, and last verification time.

## Production Matcher

The current matcher is isolated in `backend/attendance/biometrics.py`. Replace `create_face_template` and `compare_face_templates` with a production face-recognition provider when deploying real biometric recognition.

Recommended production requirements:

- Liveness detection
- Multiple enrollment samples per student
- Configurable confidence threshold
- Audit logging for enrollment and verification attempts
- Explicit consent and retention policy
- Encrypted biometric templates at rest
