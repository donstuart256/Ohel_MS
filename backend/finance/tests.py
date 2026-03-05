from django.test import TestCase
from django.utils import timezone
from datetime import date, timedelta
from rest_framework.test import APIClient
from decimal import Decimal

from .models import Invoice, Payment, FeeStructure
from users.models import User

class FinanceTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='pw', role='STUDENT'
        )
        self.finance_user = User.objects.create_user(
            username='fin1', password='pw', role='FINANCE'
        )
        self.fee_structure = FeeStructure.objects.create(
            name='Term 1 Fees',
            academic_year='2025-2026',
            term='Term 1',
            amount=Decimal('500000.00'),
            description='Test Fees'
        )
        self.invoice = Invoice.objects.create(
            student=self.student,
            fee_structure=self.fee_structure,
            total_amount=self.fee_structure.amount,
            due_date=date.today() + timedelta(days=30)
        )

    def test_invoice_creation(self):
        self.assertEqual(self.invoice.status, Invoice.Status.UNPAID)
        self.assertEqual(self.invoice.amount_paid, Decimal('0.00'))
        self.assertEqual(self.invoice.balance(), Decimal('500000.00'))

    def test_payment_updates_invoice_status_to_partial(self):
        Payment.objects.create(
            invoice=self.invoice,
            amount=Decimal('200000.00'),
            method='CASH',
            received_by=self.finance_user
        )
        
        # We need to refresh the invoice to get the updated amount_paid logic which happens in the API View.
        # However, for pure model testing, it's best if the model itself handles it, 
        # but right now it's in the View perform_create. So let's test the API view instead.
        pass

class FinanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='student1', password='pw', role='STUDENT'
        )
        self.finance_user = User.objects.create_user(
            username='fin1', password='pw', role='FINANCE'
        )
        self.fee_structure = FeeStructure.objects.create(
            name='Term 1 Fees',
            academic_year='2025-2026',
            term='Term 1',
            amount=Decimal('500000.00'),
            description='Test Fees'
        )
        self.invoice = Invoice.objects.create(
            student=self.student,
            fee_structure=self.fee_structure,
            total_amount=self.fee_structure.amount,
            due_date=date.today() + timedelta(days=30)
        )

    def test_payment_updates_invoice(self):
        self.client.force_authenticate(user=self.finance_user)
        response = self.client.post('/api/v1/finance/payments/', {
            'invoice': self.invoice.id,
            'amount': '250000.00',
            'method': 'CASH',
            'reference': 'RCPT-001'
        })
        self.assertEqual(response.status_code, 201)
        
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.amount_paid, Decimal('250000.00'))
        self.assertEqual(self.invoice.status, 'PARTIAL')

        # Full payment
        response2 = self.client.post('/api/v1/finance/payments/', {
            'invoice': self.invoice.id,
            'amount': '250000.00',
            'method': 'BANK',
            'reference': 'RCPT-002'
        })
        self.assertEqual(response2.status_code, 201)
        
        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.amount_paid, Decimal('500000.00'))
        self.assertEqual(self.invoice.status, 'PAID')

    def test_unauthorized_payment_creation(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/v1/finance/payments/', {
            'invoice': self.invoice.id,
            'amount': '1000.00',
            'method': 'CASH'
        })
        self.assertEqual(response.status_code, 403)
