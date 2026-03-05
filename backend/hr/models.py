from django.db import models
from django.conf import settings
from decimal import Decimal

class Staff(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='staff_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    designation = models.CharField(max_length=100)
    salary_basis = models.DecimalField(max_digits=12, decimal_places=2) # Basic Salary
    hire_date = models.DateField()
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    nssf_number = models.CharField(max_length=20, blank=True)
    tin_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"

class PayrollRun(models.Model):
    month = models.DateField() # Represented by the first day of the month
    processed_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Payroll {self.month.strftime('%B %Y')}"

class Payslip(models.Model):
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='payslips')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    overtime = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Uganda Regulatory Deductions
    paye = models.DecimalField(max_digits=12, decimal_places=2)
    nssf_employee = models.DecimalField(max_digits=12, decimal_places=2)
    nssf_employer = models.DecimalField(max_digits=12, decimal_places=2)
    
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    is_paid = models.BooleanField(default=False)

    def calculate_uganda_paye(self, gross_pay):
        """
        Calculates PAYE based on Uganda Revenue Authority (URA) tiers.
        Slightly simplified for demonstration.
        """
        if gross_pay <= 235000:
            return Decimal('0')
        elif gross_pay <= 335000:
            return (gross_pay - 235000) * Decimal('0.10')
        elif gross_pay <= 410000:
            return Decimal('10000') + (gross_pay - 335000) * Decimal('0.20')
        else:
            tax = Decimal('25000') + (gross_pay - 410000) * Decimal('0.30')
            if gross_pay > 10000000:
                tax += (gross_pay - 10000000) * Decimal('0.10')
            return tax

    def save(self, *args, **kwargs):
        gross = self.base_salary + self.allowances + self.overtime
        # NSSF is typically 5% of gross pay (excluding some allowances)
        self.nssf_employee = gross * Decimal('0.05')
        self.nssf_employer = gross * Decimal('0.10')
        
        # PAYE is calculated on (Gross - NSSF Employee)
        taxable_income = gross - self.nssf_employee
        self.paye = self.calculate_uganda_paye(taxable_income)
        
        self.net_salary = gross - self.nssf_employee - self.paye
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payslip {self.staff.employee_id} - {self.payroll_run.month.strftime('%Y-%m')}"
