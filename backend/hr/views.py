from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime

from users.permissions import IsAdmin, IsAdminOrReadOnly

from .models import Staff, PayrollRun, Payslip
from .serializers import StaffSerializer, PayrollRunSerializer, PayslipSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.select_related('user').all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdminOrReadOnly]


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = PayrollRun.objects.prefetch_related('payslips').all()
    serializer_class = PayrollRunSerializer
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['post'])
    def process_monthly(self, request):
        """
        Triggers payroll processing for all active staff for a given month.
        POST: { "month": "2026-03" }
        """
        month_str = request.data.get('month')
        if not month_str:
            return Response({"error": "Month is required (YYYY-MM)"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            month_date = datetime.strptime(month_str + '-01', '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid month format. Use YYYY-MM."}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate runs
        if PayrollRun.objects.filter(month=month_date).exists():
            return Response(
                {"error": f"Payroll for {month_str} has already been processed."},
                status=status.HTTP_409_CONFLICT,
            )

        # Create the payroll run
        payroll_run = PayrollRun.objects.create(
            month=month_date,
            processed_by=request.user,
        )

        # Generate payslips for all staff
        all_staff = Staff.objects.select_related('user').all()
        payslips = []
        for staff in all_staff:
            payslip = Payslip(
                payroll_run=payroll_run,
                staff=staff,
                base_salary=staff.salary_basis,
                allowances=0,
                overtime=0,
                # These will be auto-calculated in .save()
                paye=0,
                nssf_employee=0,
                nssf_employer=0,
                net_salary=0,
            )
            payslip.save()  # triggers PAYE/NSSF calculation in model
            payslips.append(payslip)

        return Response({
            "message": f"Payroll for {month_str} processed successfully.",
            "payroll_run_id": payroll_run.id,
            "payslips_generated": len(payslips),
            "total_net_salary": str(sum(p.net_salary for p in payslips)),
        }, status=status.HTTP_201_CREATED)


class PayslipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payslip.objects.select_related('staff', 'staff__user', 'payroll_run').all()
    serializer_class = PayslipSerializer
    filterset_fields = ['staff', 'payroll_run', 'is_paid']
