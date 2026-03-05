"""
Dashboard summary API — aggregates KPIs for the admin dashboard.
"""
from datetime import date, timedelta

from django.db.models import Sum, Avg, Count, Q
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from academics.models import (
    AcademicYear, StudentEnrollment, Attendance, Grade, Assessment,
)
from finance.models import Invoice, Payment
from communications.models import Announcement

User = get_user_model()


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        current_year = AcademicYear.objects.filter(is_current=True).first()

        # ── Student counts ───────────────────────────────────────────────
        total_students = User.objects.filter(role='STUDENT', is_active=True).count()
        enrolled_students = 0
        if current_year:
            enrolled_students = StudentEnrollment.objects.filter(
                academic_year=current_year, status='ACTIVE'
            ).count()

        # ── Attendance today ─────────────────────────────────────────────
        attendance_today = Attendance.objects.filter(date=today)
        total_marked = attendance_today.count()
        present_count = attendance_today.filter(
            status__in=['PRESENT', 'LATE']
        ).count()
        attendance_rate = round(present_count / total_marked * 100, 1) if total_marked > 0 else 0

        # ── Attendance this week (for chart) ─────────────────────────────
        week_start = today - timedelta(days=today.weekday())
        weekly_attendance = []
        for i in range(5):  # Mon-Fri
            day = week_start + timedelta(days=i)
            day_records = Attendance.objects.filter(date=day)
            day_total = day_records.count()
            day_present = day_records.filter(status__in=['PRESENT', 'LATE']).count()
            weekly_attendance.append({
                'date': day.isoformat(),
                'day': day.strftime('%a'),
                'total': day_total,
                'present': day_present,
                'rate': round(day_present / day_total * 100, 1) if day_total > 0 else 0,
            })

        # ── Fee collection ───────────────────────────────────────────────
        fee_stats = Invoice.objects.aggregate(
            total_billed=Sum('total_amount'),
            total_collected=Sum('amount_paid'),
        )
        total_billed = fee_stats['total_billed'] or 0
        total_collected = fee_stats['total_collected'] or 0
        collection_rate = round(float(total_collected) / float(total_billed) * 100, 1) if total_billed else 0

        # ── Academic performance ─────────────────────────────────────────
        avg_score = Grade.objects.aggregate(avg=Avg('score'))['avg']
        avg_performance = round(float(avg_score), 1) if avg_score else 0

        # ── Staff ────────────────────────────────────────────────────────
        total_staff = User.objects.filter(
            role__in=['TEACHER', 'ADMIN', 'FINANCE', 'SUPPORT'],
            is_active=True,
        ).count()
        total_teachers = User.objects.filter(role='TEACHER', is_active=True).count()

        # ── Recent announcements ─────────────────────────────────────────
        announcements = Announcement.objects.filter(
            is_published=True
        ).order_by('-created_at')[:5].values(
            'id', 'title', 'content', 'created_at', 'target_roles'
        )

        return Response({
            'students': {
                'total': total_students,
                'enrolled': enrolled_students,
            },
            'attendance': {
                'today_rate': attendance_rate,
                'today_present': present_count,
                'today_total': total_marked,
                'weekly': weekly_attendance,
            },
            'finance': {
                'total_billed': str(total_billed),
                'total_collected': str(total_collected),
                'collection_rate': collection_rate,
            },
            'academics': {
                'avg_performance': avg_performance,
            },
            'staff': {
                'total': total_staff,
                'teachers': total_teachers,
            },
            'announcements': list(announcements),
        })
