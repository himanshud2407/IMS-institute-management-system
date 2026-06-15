from decimal import Decimal
from datetime import timedelta

from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin
from assignments.models import Assignment, AssignmentSubmission
from attendance.models import AttendanceRecord, AttendanceSession
from courses.models import Course
from examinations.models import Exam, ExamResult
from fees.models import FeeInvoice
from fees.models import FeePayment
from notifications.models import Notification
from students.models import Student
from subjects.models import Subject
from teachers.models import Teacher


def money(value):
    return str(value or Decimal('0.00'))


def paid_total_for_invoices(invoices):
    invoice_ids = invoices.values('id')
    return FeePayment.objects.filter(invoice_id__in=invoice_ids).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'ADMIN':
            return Response(self.admin_stats())
        if request.user.role == 'TEACHER':
            return Response(self.teacher_stats(request.user))
        if request.user.role == 'STUDENT':
            return Response(self.student_stats(request.user))
        return Response({})

    def admin_stats(self):
        invoices = FeeInvoice.objects.all()
        total_fees = invoices.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_paid = paid_total_for_invoices(invoices)
        return {
            'role': 'ADMIN',
            'stats': {
                'students': Student.objects.count(),
                'teachers': Teacher.objects.count(),
                'courses': Course.objects.count(),
                'subjects': Subject.objects.count(),
                'attendance_sessions': AttendanceSession.objects.count(),
                'assignments': Assignment.objects.count(),
                'exams': Exam.objects.count(),
                'fee_invoiced': money(total_fees),
                'fee_collected': money(total_paid),
                'fee_balance': money(total_fees - total_paid),
                'unread_notifications': Notification.objects.filter(is_published=True).count(),
            },
            'recent_activity': [
                {
                    'label': 'Latest students',
                    'count': Student.objects.filter(created_at__date__gte=timezone.localdate() - timedelta(days=30)).count(),
                },
                {
                    'label': 'Pending fee invoices',
                    'count': invoices.filter(status__in=[FeeInvoice.Status.PENDING, FeeInvoice.Status.PARTIAL, FeeInvoice.Status.OVERDUE]).count(),
                },
                {
                    'label': 'Published exams',
                    'count': Exam.objects.filter(results_published=True).count(),
                },
            ],
        }

    def teacher_stats(self, user):
        try:
            teacher = user.teacher_profile
        except Teacher.DoesNotExist:
            return {'role': 'TEACHER', 'stats': {}, 'recent_activity': []}
        subjects = Subject.objects.filter(Q(teacher=teacher))
        assignments = Assignment.objects.filter(Q(teacher=teacher) | Q(subject__teacher=teacher)).distinct()
        submissions = AssignmentSubmission.objects.filter(assignment__in=assignments)
        sessions = AttendanceSession.objects.filter(Q(teacher=teacher) | Q(subject__teacher=teacher)).distinct()
        exams = Exam.objects.filter(Q(teacher=teacher) | Q(subject__teacher=teacher)).distinct()
        return {
            'role': 'TEACHER',
            'stats': {
                'subjects': subjects.count(),
                'students': Student.objects.filter(course__subjects__in=subjects).distinct().count(),
                'attendance_sessions': sessions.count(),
                'pending_submissions': submissions.exclude(status=AssignmentSubmission.Status.GRADED).count(),
                'exams': exams.count(),
                'results_entered': ExamResult.objects.filter(exam__in=exams).count(),
            },
            'recent_activity': [
                {'label': 'Assignments created', 'count': assignments.count()},
                {'label': 'Attendance sessions', 'count': sessions.count()},
                {'label': 'Results pending publish', 'count': exams.filter(results_published=False).count()},
            ],
        }

    def student_stats(self, user):
        try:
            student = user.student_profile
        except Student.DoesNotExist:
            return {'role': 'STUDENT', 'stats': {}, 'recent_activity': []}
        records = AttendanceRecord.objects.filter(student=student)
        total_records = records.count()
        present = records.filter(status=AttendanceRecord.Status.PRESENT).count()
        attendance_rate = round((present / total_records) * 100, 1) if total_records else 0
        assignments = Assignment.objects.filter(subject__course=student.course, status=Assignment.Status.PUBLISHED)
        submissions = AssignmentSubmission.objects.filter(student=student)
        invoices = FeeInvoice.objects.filter(student=student)
        total_fees = invoices.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_paid = paid_total_for_invoices(invoices)
        return {
            'role': 'STUDENT',
            'stats': {
                'attendance_rate': attendance_rate,
                'subjects': Subject.objects.filter(course=student.course, is_active=True).count(),
                'pending_assignments': assignments.exclude(submissions__student=student).count(),
                'results': ExamResult.objects.filter(student=student, exam__results_published=True).count(),
                'fee_balance': money(total_fees - total_paid),
                'overdue_fees': invoices.filter(status=FeeInvoice.Status.OVERDUE).count(),
            },
            'recent_activity': [
                {'label': 'Submitted assignments', 'count': submissions.count()},
                {'label': 'Published results', 'count': ExamResult.objects.filter(student=student, exam__results_published=True).count()},
                {'label': 'Fee invoices', 'count': invoices.count()},
            ],
        }


class AdminReportsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        attendance_total = AttendanceRecord.objects.count()
        attendance_present = AttendanceRecord.objects.filter(status=AttendanceRecord.Status.PRESENT).count()
        result_average = ExamResult.objects.exclude(marks_obtained__isnull=True).aggregate(avg=Avg('marks_obtained'))['avg'] or 0
        invoices = FeeInvoice.objects.all()
        total_fees = invoices.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_paid = paid_total_for_invoices(invoices)

        courses = Course.objects.annotate(
            students_count=Count('students', distinct=True),
            subjects_count=Count('subjects', distinct=True),
        ).values('id', 'name', 'code', 'students_count', 'subjects_count')

        return Response({
            'overview': {
                'users': User.objects.count(),
                'students': Student.objects.count(),
                'teachers': Teacher.objects.count(),
                'courses': Course.objects.count(),
                'subjects': Subject.objects.count(),
            },
            'academics': {
                'attendance_rate': round((attendance_present / attendance_total) * 100, 1) if attendance_total else 0,
                'assignments': Assignment.objects.count(),
                'submissions': AssignmentSubmission.objects.count(),
                'exams': Exam.objects.count(),
                'results': ExamResult.objects.count(),
                'average_marks': round(float(result_average), 2),
            },
            'finance': {
                'invoiced': money(total_fees),
                'collected': money(total_paid),
                'balance': money(total_fees - total_paid),
                'overdue_invoices': invoices.filter(status=FeeInvoice.Status.OVERDUE).count(),
            },
            'courses': list(courses),
        })
