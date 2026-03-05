from rest_framework import serializers
from .models import Staff, PayrollRun, Payslip

class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    class Meta:
        model = Staff
        fields = '__all__'

class PayslipSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)
    staff_id = serializers.CharField(source='staff.employee_id', read_only=True)
    class Meta:
        model = Payslip
        fields = '__all__'

class PayrollRunSerializer(serializers.ModelSerializer):
    payslips = PayslipSerializer(many=True, read_only=True)
    class Meta:
        model = PayrollRun
        fields = '__all__'
