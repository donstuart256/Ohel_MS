from django.urls import path, include
from rest_framework.routers import DefaultRouter

from academics.views import (
    AcademicYearViewSet, SubjectViewSet, ClassLevelViewSet,
    SectionViewSet, TimetableViewSet, AssessmentViewSet,
    GradeViewSet, StudentEnrollmentViewSet, AttendanceViewSet,
)
from finance.views import FeeStructureViewSet, InvoiceViewSet, PaymentViewSet
from hr.views import StaffViewSet, PayrollViewSet, PayslipViewSet
from library.views import BookViewSet, LibraryMemberViewSet, BorrowingViewSet
from logistics.api_tools import TransportViewSet, HostelViewSet, RoomViewSet, AllocationViewSet
from communications.views import AnnouncementViewSet, MessageLogViewSet
from users.auth_views import CustomTokenObtainPairView, MFAVerifyView
from users.views import UserViewSet
from core.dashboard_views import DashboardSummaryView

router = DefaultRouter()

# Users
router.register(r'users', UserViewSet)

# Academics
router.register(r'academics/years', AcademicYearViewSet)
router.register(r'academics/subjects', SubjectViewSet)
router.register(r'academics/class-levels', ClassLevelViewSet)
router.register(r'academics/sections', SectionViewSet)
router.register(r'academics/timetable', TimetableViewSet)
router.register(r'academics/assessments', AssessmentViewSet)
router.register(r'academics/grades', GradeViewSet)
router.register(r'academics/enrollments', StudentEnrollmentViewSet)
router.register(r'academics/attendance', AttendanceViewSet)

# Finance
router.register(r'finance/fee-structures', FeeStructureViewSet)
router.register(r'finance/invoices', InvoiceViewSet)
router.register(r'finance/payments', PaymentViewSet)

# HR
router.register(r'hr/staff', StaffViewSet)
router.register(r'hr/payroll', PayrollViewSet)
router.register(r'hr/payslips', PayslipViewSet)

# Library
router.register(r'library/books', BookViewSet)
router.register(r'library/members', LibraryMemberViewSet)
router.register(r'library/borrowing', BorrowingViewSet)

# Logistics
router.register(r'logistics/transport', TransportViewSet)
router.register(r'logistics/hostels', HostelViewSet)
router.register(r'logistics/rooms', RoomViewSet)
router.register(r'logistics/allocations', AllocationViewSet)

# Communications
router.register(r'communications/announcements', AnnouncementViewSet)
router.register(r'communications/logs', MessageLogViewSet)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/mfa-verify/', MFAVerifyView.as_view(), name='mfa_verify'),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('', include(router.urls)),
]
