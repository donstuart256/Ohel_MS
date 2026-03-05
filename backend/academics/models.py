from django.db import models
from django.conf import settings


class AcademicYear(models.Model):
    name = models.CharField(max_length=20)  # e.g. "2025-2026"
    start_date = models.DateField()
    end_date = models.DateField()
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicYear.objects.filter(is_current=True).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class ClassLevel(models.Model):
    name = models.CharField(max_length=50) # e.g. P.6, S.4, Year 1
    curriculum = models.CharField(max_length=50, default='National')

    def __str__(self):
        return self.name

class Section(models.Model):
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=50) # e.g. Blue, West, Stream A
    room_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.class_level.name} {self.name}"

class TimetableSlot(models.Model):
    DAYS = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'TEACHER'})
    day = models.CharField(max_length=3, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.day} {self.start_time}-{self.end_time} : {self.subject.name}"

class Assessment(models.Model):
    class Type(models.TextChoices):
        QUIZ = 'QUIZ', 'Quiz'
        TEST = 'TEST', 'Test'
        EXAM = 'EXAM', 'Final Exam'
        ASSIGNMENT = 'ASSIGNMENT', 'Assignment'

    title = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=Type.choices)
    date = models.DateField()
    max_score = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.title} - {self.subject.name}"

class Grade(models.Model):
    student = models.ForeignKey('users.User', on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='grades')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.assessment.title}: {self.score}"


class StudentEnrollment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        GRADUATED = 'GRADUATED', 'Graduated'
        TRANSFERRED = 'TRANSFERRED', 'Transferred'
        DROPPED = 'DROPPED', 'Dropped Out'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    student = models.ForeignKey(
        'users.User', on_delete=models.CASCADE,
        related_name='enrollments', limit_choices_to={'role': 'STUDENT'}
    )
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='enrollments')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        unique_together = ('student', 'academic_year')
        ordering = ['-academic_year__start_date']

    def __str__(self):
        return f"{self.student.get_full_name()} → {self.section} ({self.academic_year})"


class Attendance(models.Model):
    class AttendanceStatus(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        LATE = 'LATE', 'Late'
        EXCUSED = 'EXCUSED', 'Excused'

    student = models.ForeignKey(
        'users.User', on_delete=models.CASCADE,
        related_name='attendance_records', limit_choices_to={'role': 'STUDENT'}
    )
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=AttendanceStatus.choices, default=AttendanceStatus.PRESENT)
    marked_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True,
        related_name='marked_attendance', limit_choices_to={'role': 'TEACHER'}
    )
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.date}: {self.status}"
