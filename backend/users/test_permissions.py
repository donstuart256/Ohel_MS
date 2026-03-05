from django.test import TestCase
from rest_framework.test import APIClient
from .models import User

class PermissionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username='admin', password='pw', role='ADMIN')
        self.teacher = User.objects.create_user(username='teacher', password='pw', role='TEACHER')
        self.student = User.objects.create_user(username='student', password='pw', role='STUDENT')
        self.finance = User.objects.create_user(username='finance', password='pw', role='FINANCE')

    def test_finance_access(self):
        # Admin
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/v1/finance/invoices/')
        self.assertEqual(res.status_code, 200)

        # Finance
        self.client.force_authenticate(user=self.finance)
        res = self.client.get('/api/v1/finance/invoices/')
        self.assertEqual(res.status_code, 200)

        # Teacher shouldn't see all invoices
        self.client.force_authenticate(user=self.teacher)
        res = self.client.get('/api/v1/finance/invoices/')
        self.assertEqual(res.status_code, 403)

    def test_academics_write_access(self):
        # Teacher can GET academics / write grades/attendance
        self.client.force_authenticate(user=self.teacher)
        res = self.client.get('/api/v1/academics/subjects/')
        self.assertEqual(res.status_code, 200)
        
        # Teacher cannot CREATE subjects
        res2 = self.client.post('/api/v1/academics/subjects/', {'name': 'New Subj'})
        self.assertEqual(res2.status_code, 403)

        # Admin can CREATE subjects
        self.client.force_authenticate(user=self.admin)
        res3 = self.client.post('/api/v1/academics/subjects/', {'name': 'New Subj', 'code': 'NS1'})
        self.assertEqual(res3.status_code, 201)

    def test_student_read_only(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/v1/academics/subjects/')
        self.assertEqual(res.status_code, 200)
        
        # Students shouldn't be generating payroll
        res2 = self.client.post('/api/v1/hr/payroll/process_monthly/', {'month': '2026-03'})
        self.assertEqual(res2.status_code, 403)
