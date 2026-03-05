from django.db import models
from django.conf import settings

class FeeStructure(models.Model):
    name = models.CharField(max_length=255) # e.g. Term 1 Tuition
    academic_year = models.CharField(max_length=10) # e.g. 2024
    term = models.CharField(max_length=20) # e.g. Term 1
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - {self.academic_year}"

class Invoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PARTIAL = 'PARTIAL', 'Partial'
        PAID = 'PAID', 'Paid'
        VOID = 'VOID', 'Void'

    student = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='invoices')
    fee_structure = models.ForeignKey(FeeStructure, on_delete=models.PROTECT)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def balance(self):
        return self.total_amount - self.amount_paid

    def __str__(self):
        return f"INV-{self.id} - {self.student.get_full_name()}"

class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = 'CASH', 'Cash'
        BANK = 'BANK', 'Bank Transfer'
        MOMO = 'MOMO', 'Mobile Money'
        CARD = 'CARD', 'Credit/Debit Card'

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=20, choices=Method.choices)
    reference = models.CharField(max_length=100, unique=True) # Transaction ID
    received_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    metadata = models.JSONField(default=dict, blank=True) # Full API response for MoMo/Bank

    def __str__(self):
        return f"PAY-{self.id} - {self.amount} ({self.method})"
