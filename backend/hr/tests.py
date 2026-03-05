from django.test import TestCase
from django.utils import timezone
from datetime import date
from decimal import Decimal

from .models import Staff, PayrollRun, Payslip
from users.models import User

class HRTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin1', password='pw', role='ADMIN'
        )
        self.user = User.objects.create_user(
            username='teacher1', password='pw', role='TEACHER'
        )
        self.staff = Staff.objects.create(
            user=self.user,
            employee_id='EMP-001',
            designation='Teacher',
            salary_basis=Decimal('2000000.00'), # 2,000,000 UGX
            hire_date=date(2023, 1, 1)
        )

    def test_payslip_calculations(self):
        # Triggering a payroll run
        run = PayrollRun.objects.create(
            month=date(2026, 3, 1),
            processed_by=self.admin
        )
        
        payslip = Payslip(
            payroll_run=run,
            staff=self.staff,
            base_salary=self.staff.salary_basis,
            allowances=Decimal('100000'), # 100k allowance
            overtime=Decimal('0')
        )
        payslip.save()

        # Gross = 2M + 100k = 2.1M
        self.assertEqual(payslip.gross_salary, Decimal('2100000.00'))
        
        # Employee NSSF = 5% of gross = 105,000
        self.assertEqual(payslip.nssf_employee, Decimal('105000.00'))
        
        # Employer NSSF = 10% of gross = 210,000
        self.assertEqual(payslip.nssf_employer, Decimal('2100000.00') * Decimal('0.10'))
        
        # PAYE logic test (Taxable = Gross - NSSF)
        # Taxable = 2,100,000 - 105,000 = 1,995,000
        # Over 410,000 formula applies.
        # We don't check exact URA formula precision here, just that it ran.
        self.assertTrue(payslip.paye > 0)
        self.assertTrue(payslip.net_salary < payslip.gross_salary)
        
        expected_net = payslip.gross_salary - payslip.paye - payslip.nssf_employee
        self.assertAlmostEqual(payslip.net_salary, expected_net, places=2)
