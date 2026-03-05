from django.test import TestCase
from rest_framework.test import APIClient
from datetime import date, timedelta
from .models import AcademicYear, ClassLevel, Section, StudentEnrollment
from users.models import User

class AcademicsTests(TestCase):
    def setUp(self):
        self.year = AcademicYear.objects.create(
            name='2025-2026', start_date=date.today(), end_date=date.today() + timedelta(days=365), is_current=True
        )
        self.level = ClassLevel.objects.create(name='P.1')
        self.section = Section.objects.create(class_level=self.level, name='Blue')
        self.teacher = User.objects.create_user(username='teacher1', password='pw', role='TEACHER')
        self.student = User.objects.create_user(username='student1', password='pw', role='STUDENT')
        self.enrollment = StudentEnrollment.objects.create(
            student=self.student, section=self.section, academic_year=self.year, status='ACTIVE'
        )

    def test_student_enrollment_unique(self):
        # A student can only have one active enrollment per academic year
        from django.db.utils import IntegrityError
        with self.assertRaises(IntegrityError):
            StudentEnrollment.objects.create(
                student=self.student, section=self.section, academic_year=self.year, status='ACTIVE'
            )

    def test_academic_year_auto_current(self):
        new_year = AcademicYear.objects.create(
            name='2026-2027', start_date=date.today(), end_date=date.today() + timedelta(days=365), is_current=True
        )
        self.year.refresh_from_db()
        self.assertFalse(self.year.is_current)
        self.assertTrue(new_year.is_current)

class AcademicsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(username='teacher', password='pw', role='TEACHER')
        self.year = AcademicYear.objects.create(
            name='2025', start_date=date.today(), end_date=date.today(), is_current=True
        )
        self.level = ClassLevel.objects.create(name='P.1')
        self.section = Section.objects.create(class_level=self.level, name='Blue')
        self.student = User.objects.create_user(username='student', password='pw', role='STUDENT')

    def test_bulk_attendance(self):
        self.client.force_authenticate(user=self.teacher)
        res = self.client.post('/api/v1/academics/attendance/bulk-mark/', {
            'section': self.section.id,
            'date': date.today().isoformat(),
            'records': [
                {'student_id': self.student.id, 'status': 'PRESENT', 'remarks': ''}
            ]
        }, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['status'], 'PRESENT')
