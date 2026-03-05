from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsFinanceOrAdmin

from .models import Invoice, Payment, FeeStructure
from .serializers import InvoiceSerializer, PaymentSerializer, FeeStructureSerializer
from .utils import MoMoIntegration


class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsFinanceOrAdmin]
    filterset_fields = ['academic_year', 'term']


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('student', 'fee_structure').prefetch_related('payments').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsFinanceOrAdmin]
    filterset_fields = ['student', 'status', 'fee_structure']

    @action(detail=True, methods=['post'])
    def initiate_payment(self, request, pk=None):
        invoice = self.get_object()
        phone_number = request.data.get('phone_number')
        amount = request.data.get('amount')

        if not phone_number or not amount:
            return Response(
                {"error": "Phone number and amount required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        momo = MoMoIntegration(provider='MTN')
        res_code, res_body = momo.initiate_collection(phone_number, amount, invoice.id)

        if res_code == 202:
            return Response({
                "message": "Payment initiated. Please check your phone for the PIN prompt.",
                "transaction_id": res_body.get('transaction_id'),
            })

        return Response(
            {"error": "Failed to initiate payment"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('invoice', 'invoice__student', 'received_by').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsFinanceOrAdmin]
    filterset_fields = ['invoice', 'method']

    def perform_create(self, serializer):
        """After recording a payment, update the invoice totals."""
        payment = serializer.save(received_by=self.request.user)
        invoice = payment.invoice
        invoice.amount_paid += payment.amount
        if invoice.amount_paid >= invoice.total_amount:
            invoice.status = Invoice.Status.PAID
        elif invoice.amount_paid > 0:
            invoice.status = Invoice.Status.PARTIAL
        invoice.save()
