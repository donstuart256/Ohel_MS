from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from users.permissions import IsAdminOrReadOnly, IsTeacherOrAdmin

from .models import (
    AcademicYear, Subject, ClassLevel, Section,
    TimetableSlot, Assessment, Grade,
    StudentEnrollment, Attendance,
)
from .serializers import (
    AcademicYearSerializer, SubjectSerializer, ClassLevelSerializer,
    SectionSerializer, TimetableSlotSerializer, AssessmentSerializer,
    GradeSerializer, StudentEnrollmentSerializer, AttendanceSerializer,
    BulkAttendanceSerializer,
)


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAdminOrReadOnly]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminOrReadOnly]


class ClassLevelViewSet(viewsets.ModelViewSet):
    queryset = ClassLevel.objects.prefetch_related('sections').all()
    serializer_class = ClassLevelSerializer
    permission_classes = [IsAdminOrReadOnly]


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.select_related('class_level').prefetch_related('enrollments').all()
    serializer_class = SectionSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['class_level']


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = TimetableSlot.objects.select_related('section', 'subject', 'teacher').all()
    serializer_class = TimetableSlotSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['section', 'day', 'teacher']


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.select_related('subject', 'section').all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['subject', 'section', 'type']


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.select_related('student', 'assessment').all()
    serializer_class = GradeSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['student', 'assessment', 'assessment__section']


class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = StudentEnrollment.objects.select_related(
        'student', 'section', 'section__class_level', 'academic_year'
    ).all()
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['section', 'academic_year', 'status', 'student']


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('student', 'section', 'marked_by').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['section', 'date', 'status', 'student']

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        """Mark attendance for an entire section at once."""
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_id = serializer.validated_data['section']
        date = serializer.validated_data['date']
        records = serializer.validated_data['records']

        created = []
        for record in records:
            obj, _ = Attendance.objects.update_or_create(
                student_id=record['student_id'],
                date=date,
                defaults={
                    'section_id': section_id,
                    'status': record.get('status', 'PRESENT'),
                    'marked_by': request.user,
                    'remarks': record.get('remarks', ''),
                },
            )
            created.append(obj)

        return Response(
            AttendanceSerializer(created, many=True).data,
            status=status.HTTP_201_CREATED,
        )
