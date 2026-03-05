from django.test import TestCase
from rest_framework.test import APIClient
from academics.models import AcademicYear
from users.models import User
from datetime import date

class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='admin', password='pw', role='ADMIN')
        self.teacher = User.objects.create_user(username='teacher', password='pw', role='TEACHER', is_active=True)
        self.student = User.objects.create_user(username='student', password='pw', role='STUDENT', is_active=True)
        self.year = AcademicYear.objects.create(
            name='2026', start_date=date.today(), end_date=date.today(), is_current=True
        )

    def test_dashboard_summary_requires_auth(self):
        res = self.client.get('/api/v1/dashboard/summary/')
        self.assertEqual(res.status_code, 401)

    def test_dashboard_summary_payload(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/v1/dashboard/summary/')
        self.assertEqual(res.status_code, 200)

        # Check core schema
        self.assertIn('students', res.data)
        self.assertIn('attendance', res.data)
        self.assertIn('finance', res.data)
        self.assertIn('academics', res.data)
        self.assertIn('staff', res.data)
        self.assertIn('announcements', res.data)

        # Check correct counts based on setup
        self.assertEqual(res.data['students']['total'], 1)
        self.assertEqual(res.data['staff']['total'], 2) # admin + teacher
        self.assertEqual(res.data['staff']['teachers'], 1)
        
        # Finance should return string zeroes if no invoices
        self.assertEqual(res.data['finance']['total_billed'], '0')
        self.assertEqual(res.data['finance']['total_collected'], '0')
