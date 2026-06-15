from datetime import date, time
from decimal import Decimal

from django.test import TestCase

from accounts.models import User
from courses.models import Course
from examinations.models import Exam, ExamResult
from students.models import Student
from subjects.models import Subject


class ExamResultModelTests(TestCase):
    def test_result_status_and_grade_are_calculated_from_marks(self):
        user = User.objects.create_user(email='student@example.com', password='pass12345', full_name='Student One', role='STUDENT')
        course = Course.objects.create(name='Computer Science', code='CS', duration=8)
        subject = Subject.objects.create(name='Algorithms', code='ALG101', course=course)
        student = Student.objects.create(
            user=user,
            roll_number='CS001',
            course=course,
            phone_number='1234567890',
            date_of_birth=date(2005, 1, 1),
            gender='OTHER',
            address='Campus',
            admission_date=date(2024, 6, 1),
        )
        exam = Exam.objects.create(
            subject=subject,
            title='Midterm',
            exam_type=Exam.ExamType.MIDTERM,
            exam_date=date(2026, 7, 1),
            start_time=time(10, 0),
            end_time=time(12, 0),
            total_marks=100,
            passing_marks=35,
        )
        result = ExamResult.objects.create(exam=exam, student=student, marks_obtained=Decimal('82'))

        self.assertEqual(result.status, ExamResult.Status.PASS)
        self.assertEqual(result.grade, 'A')
