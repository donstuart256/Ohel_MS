from rest_framework import serializers
from .models import (
    AcademicYear, Subject, ClassLevel, Section,
    TimetableSlot, Assessment, Grade,
    StudentEnrollment, Attendance,
)


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class ClassLevelSerializer(serializers.ModelSerializer):
    section_count = serializers.IntegerField(source='sections.count', read_only=True)

    class Meta:
        model = ClassLevel
        fields = '__all__'


class SectionSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    student_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = Section
        fields = '__all__'


class TimetableSlotSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    section_name = serializers.SerializerMethodField()

    class Meta:
        model = TimetableSlot
        fields = '__all__'

    def get_section_name(self, obj):
        return str(obj.section)


class AssessmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_name = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = '__all__'

    def get_section_name(self, obj):
        return str(obj.section)


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)

    class Meta:
        model = Grade
        fields = '__all__'


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    section_name = serializers.SerializerMethodField()
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = StudentEnrollment
        fields = '__all__'

    def get_section_name(self, obj):
        return str(obj.section)


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class BulkAttendanceSerializer(serializers.Serializer):
    """For marking attendance for an entire section at once."""
    section = serializers.IntegerField()
    date = serializers.DateField()
    records = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        help_text='List of {student_id, status, remarks}'
    )
