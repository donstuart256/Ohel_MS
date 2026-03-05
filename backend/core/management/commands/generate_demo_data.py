"""
Generate realistic demo data for client presentations.

Usage:
    python manage.py generate_demo_data
    python manage.py generate_demo_data --flush   # wipe existing data first
"""
import random
from datetime import date, timedelta, time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from academics.models import (
    AcademicYear, Subject, ClassLevel, Section,
    TimetableSlot, Assessment, Grade,
    StudentEnrollment, Attendance,
)
from finance.models import FeeStructure, Invoice, Payment
from hr.models import Staff, PayrollRun, Payslip
from library.models import Book, LibraryMember, Borrowing
from logistics.models import TransportRoute, TransportStop, Hostel, Room, RoomAllocation
from communications.models import Announcement

User = get_user_model()

# ── Name pools ───────────────────────────────────────────────────────────────
FIRST_NAMES_M = [
    'James', 'Robert', 'John', 'David', 'Patrick', 'Moses', 'Emmanuel',
    'Joseph', 'Peter', 'Samuel', 'Andrew', 'Daniel', 'Michael', 'Isaac',
    'Brian', 'Kevin', 'Martin', 'Henry', 'Frank', 'George', 'Steven',
    'Kenneth', 'Dennis', 'Ronald', 'Allan', 'Timothy', 'Paul', 'Charles',
    'Frederick', 'Ivan', 'Oscar', 'Gerald', 'Victor', 'Simon', 'Lawrence',
]
FIRST_NAMES_F = [
    'Sarah', 'Grace', 'Mercy', 'Faith', 'Hope', 'Joy', 'Patience',
    'Esther', 'Ruth', 'Deborah', 'Rebecca', 'Miriam', 'Naomi', 'Hannah',
    'Agnes', 'Dorothy', 'Catherine', 'Jane', 'Rose', 'Irene', 'Stella',
    'Diana', 'Prossy', 'Annet', 'Winnie', 'Juliet', 'Christine', 'Mary',
    'Josephine', 'Brenda', 'Sandra', 'Florence', 'Lillian', 'Patricia', 'Doreen',
]
LAST_NAMES = [
    'Mugisha', 'Nakamya', 'Okello', 'Atwine', 'Namugga', 'Byaruhanga',
    'Nuwagaba', 'Kabuye', 'Ssemwanga', 'Namutebi', 'Katongole', 'Babirye',
    'Muwonge', 'Kiiza', 'Tumwebaze', 'Nalwanga', 'Kiguli', 'Akampurira',
    'Ssekitto', 'Kyagulanyi', 'Kasozi', 'Nabukenya', 'Lubega', 'Wasswa',
    'Namubiru', 'Kyeyune', 'Nansereko', 'Mukasa', 'Nsubuga', 'Tayebwa',
    'Kamoga', 'Mugerwa', 'Ssenyonga', 'Mubiru', 'Opio', 'Oyella',
    'Achola', 'Atim', 'Opolot', 'Ogwal',
]

SUBJECT_DATA = [
    ('MATH', 'Mathematics'), ('ENG', 'English'), ('SCI', 'Science'),
    ('SST', 'Social Studies'), ('PHY', 'Physics'), ('CHEM', 'Chemistry'),
    ('BIO', 'Biology'), ('GEO', 'Geography'), ('HIST', 'History'),
    ('CRE', 'Christian Religious Education'),
]

BOOK_TITLES = [
    ('Introduction to Physics', 'Serway & Jewett', 'Cengage', 2020),
    ('Modern Chemistry', 'Kenneth Whitten', 'Brooks/Cole', 2019),
    ('Biology: A Modern Introduction', 'B.S. Beckett', 'OUP', 2021),
    ('Mathematics Today', 'Janet Crawshaw', 'Nelson', 2020),
    ('English Grammar in Use', 'Raymond Murphy', 'Cambridge', 2019),
    ('History of East Africa', 'B.A. Ogot', 'Longman', 2018),
    ('Geography of Africa', 'John Clements', 'Heinemann', 2020),
    ('Social Studies for Uganda', 'MK Publishers', 'MK', 2021),
    ('ICT for Schools', 'Patrick Kangave', 'Fountain', 2022),
    ('Christian Living Today', 'Fr. Byabamazima', 'Marianum', 2019),
    ('Agriculture for Uganda', 'NCDC', 'NCDC', 2020),
    ('Art & Design', 'John Ruskin', 'Thames', 2018),
    ('Foundation Mathematics', 'A. Saddler', 'OUP', 2019),
    ('Integrated Science', 'NCDC', 'NCDC', 2021),
    ('Physical Education', 'WHO', 'UNESCO', 2020),
]

CLASS_LEVELS = [
    ('P.1', 'National'), ('P.2', 'National'), ('P.3', 'National'),
    ('P.4', 'National'), ('P.5', 'National'), ('P.6', 'National'),
    ('P.7', 'National'),
    ('S.1', 'National'), ('S.2', 'National'), ('S.3', 'National'),
    ('S.4', 'National'), ('S.5', 'National'), ('S.6', 'National'),
]

STREAMS = ['Blue', 'Green', 'Red']

ANNOUNCEMENT_DATA = [
    ('Term 2 Begins Next Monday', 'All students are expected to report by 8:00 AM on Monday. Please ensure all fees are cleared.', ['STUDENT', 'PARENT', 'TEACHER']),
    ('Staff Meeting — Friday 3 PM', 'Mandatory staff meeting in the main hall. All teachers must attend.', ['TEACHER', 'ADMIN']),
    ('Inter-School Sports Day', 'Our school will participate in the regional sports competition on March 15th. Selected students should begin training.', ['STUDENT', 'TEACHER', 'PARENT']),
    ('Fee Payment Reminder', 'Parents are reminded that all outstanding balances should be cleared by end of this month to avoid service interruption.', ['PARENT']),
    ('New Library Books Available', 'We have received new textbooks for S.1-S.4. Students can borrow from the library starting next week.', ['STUDENT', 'TEACHER']),
    ('Parent-Teacher Conference', 'The annual parent-teacher conference will be held on the last Saturday of this month. All parents are welcome.', ['PARENT', 'TEACHER']),
    ('Exam Timetable Released', 'The end-of-term exam timetable has been finalized. Students can view it on their portal.', ['STUDENT', 'TEACHER', 'PARENT']),
    ('COVID-19 Guidelines Update', 'Please continue to observe all health protocols. Hand washing stations are available at all entry points.', ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']),
]


def _random_phone():
    prefix = random.choice(['077', '078', '070', '075', '076'])
    return f'+256{prefix[1:]}{random.randint(1000000, 9999999)}'


def _random_name(gender='M'):
    first = random.choice(FIRST_NAMES_M if gender == 'M' else FIRST_NAMES_F)
    last = random.choice(LAST_NAMES)
    return first, last


class Command(BaseCommand):
    help = 'Generate realistic demo data for the School Management System'

    def add_arguments(self, parser):
        parser.add_argument('--flush', action='store_true', help='Delete all existing data before generating')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['flush']:
            self.stdout.write('Flushing existing data...')
            for Model in [
                Attendance, Grade, Assessment, StudentEnrollment,
                TimetableSlot, Section, ClassLevel, AcademicYear, Subject,
                Payment, Invoice, FeeStructure,
                Payslip, PayrollRun, Staff,
                Borrowing, LibraryMember, Book,
                RoomAllocation, Room, Hostel, TransportStop, TransportRoute,
                Announcement,
            ]:
                Model.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Data flushed.'))

        self._create_academic_structure()
        self._create_staff()
        self._create_students_and_parents()
        self._create_timetable()
        self._create_attendance()
        self._create_assessments_and_grades()
        self._create_finance()
        self._create_library()
        self._create_logistics()
        self._create_announcements()
        self._create_demo_credentials()

        self.stdout.write(self.style.SUCCESS('\n✅ Demo data generated successfully!'))
        self.stdout.write(self.style.SUCCESS('─' * 50))
        self.stdout.write(self.style.SUCCESS('Demo Credentials:'))
        self.stdout.write(f'  Admin:   admin@edupro.ug / DemoAdmin@2026')
        self.stdout.write(f'  Teacher: teacher@edupro.ug / DemoTeacher@2026')
        self.stdout.write(f'  Parent:  parent@edupro.ug / DemoParent@2026')
        self.stdout.write(f'  Student: student@edupro.ug / DemoStudent@2026')

    def _create_academic_structure(self):
        self.stdout.write('Creating academic structure...')

        # Academic year
        self.academic_year = AcademicYear.objects.create(
            name='2025-2026',
            start_date=date(2025, 2, 3),
            end_date=date(2025, 11, 28),
            is_current=True,
        )

        # Subjects
        self.subjects = []
        for code, name in SUBJECT_DATA:
            s = Subject.objects.create(name=name, code=code)
            self.subjects.append(s)

        # Class levels + sections
        self.class_levels = []
        self.sections = []
        for level_name, curriculum in CLASS_LEVELS:
            cl = ClassLevel.objects.create(name=level_name, curriculum=curriculum)
            self.class_levels.append(cl)
            # 1-3 streams per level
            num_streams = random.choice([1, 2, 2, 3])
            for stream_name in STREAMS[:num_streams]:
                sec = Section.objects.create(
                    class_level=cl,
                    name=stream_name,
                    room_number=f'R{random.randint(100, 399)}',
                )
                self.sections.append(sec)

        self.stdout.write(f'  {len(self.subjects)} subjects, {len(self.class_levels)} levels, {len(self.sections)} sections')

    def _create_staff(self):
        self.stdout.write('Creating staff (40 teachers)...')
        self.teachers = []
        for i in range(40):
            gender = random.choice(['M', 'F'])
            first, last = _random_name(gender)
            username = f't_{first.lower()}.{last.lower()}'
            user = User.objects.create_user(
                username=username,
                email=f'{username}@school.ac.ug',
                password='DemoTeacher@2026',
                first_name=first,
                last_name=last,
                role='TEACHER',
                phone_number=_random_phone(),
            )
            staff = Staff.objects.create(
                user=user,
                employee_id=f'EMP-{1001 + i}',
                designation=random.choice([
                    'Senior Teacher', 'Class Teacher', 'Head of Department',
                    'Assistant Teacher', 'Lab Technician',
                ]),
                salary_basis=Decimal(random.randint(800000, 3500000)),
                hire_date=date(2020, 1, 1) + timedelta(days=random.randint(0, 1800)),
                bank_name=random.choice(['Stanbic', 'DFCU', 'Centenary', 'Equity', 'Bank of Africa']),
                account_number=str(random.randint(1000000000, 9999999999)),
                nssf_number=f'NSSF{random.randint(100000, 999999)}',
                tin_number=f'TIN{random.randint(1000000000, 9999999999)}',
            )
            self.teachers.append((user, staff))

    def _create_students_and_parents(self):
        self.stdout.write('Creating 500 students and 200 parents...')
        self.students = []
        self.parents = []

        # Create parents first
        for i in range(200):
            gender = random.choice(['M', 'F'])
            first, last = _random_name(gender)
            username = f'p_{first.lower()}.{last.lower()}_{i}'
            parent = User.objects.create_user(
                username=username,
                email=f'{username}@gmail.com',
                password='DemoParent@2026',
                first_name=first,
                last_name=last,
                role='PARENT',
                phone_number=_random_phone(),
            )
            self.parents.append(parent)

        # Create students and enroll them
        for i in range(500):
            gender = random.choice(['M', 'F'])
            first, last = _random_name(gender)
            username = f's_{first.lower()}.{last.lower()}_{i}'
            student = User.objects.create_user(
                username=username,
                email=f'{username}@student.school.ac.ug',
                password='DemoStudent@2026',
                first_name=first,
                last_name=last,
                role='STUDENT',
                phone_number=_random_phone(),
            )
            self.students.append(student)

            # Enroll in a random section
            section = random.choice(self.sections)
            StudentEnrollment.objects.create(
                student=student,
                section=section,
                academic_year=self.academic_year,
                status='ACTIVE',
            )

        self.stdout.write(f'  {len(self.students)} students, {len(self.parents)} parents')

    def _create_timetable(self):
        self.stdout.write('Creating timetable...')
        days = ['MON', 'TUE', 'WED', 'THU', 'FRI']
        slot_times = [
            (time(8, 0), time(8, 40)),
            (time(8, 45), time(9, 25)),
            (time(9, 30), time(10, 10)),
            (time(10, 30), time(11, 10)),
            (time(11, 15), time(11, 55)),
            (time(14, 0), time(14, 40)),
            (time(14, 45), time(15, 25)),
        ]
        count = 0
        for section in self.sections:
            for day in days:
                for start, end in slot_times:
                    subject = random.choice(self.subjects)
                    teacher_user, _ = random.choice(self.teachers)
                    TimetableSlot.objects.create(
                        section=section,
                        subject=subject,
                        teacher=teacher_user,
                        day=day,
                        start_time=start,
                        end_time=end,
                    )
                    count += 1
        self.stdout.write(f'  {count} timetable slots')

    def _create_attendance(self):
        self.stdout.write('Creating 3 months of attendance history...')
        today = date.today()
        start_date = today - timedelta(days=90)

        # Get enrolled students with their sections
        enrollments = StudentEnrollment.objects.select_related('student', 'section').filter(
            academic_year=self.academic_year, status='ACTIVE',
        )

        attendance_records = []
        current_date = start_date
        count = 0

        while current_date <= today:
            # Skip weekends
            if current_date.weekday() >= 5:
                current_date += timedelta(days=1)
                continue

            for enrollment in enrollments:
                # 90% present, 5% late, 3% absent, 2% excused
                roll = random.random()
                if roll < 0.90:
                    att_status = 'PRESENT'
                elif roll < 0.95:
                    att_status = 'LATE'
                elif roll < 0.98:
                    att_status = 'ABSENT'
                else:
                    att_status = 'EXCUSED'

                attendance_records.append(Attendance(
                    student=enrollment.student,
                    section=enrollment.section,
                    date=current_date,
                    status=att_status,
                    marked_by=random.choice(self.teachers)[0],
                ))
                count += 1

                # Bulk insert every 5000 records
                if len(attendance_records) >= 5000:
                    Attendance.objects.bulk_create(attendance_records, ignore_conflicts=True)
                    attendance_records = []

            current_date += timedelta(days=1)

        if attendance_records:
            Attendance.objects.bulk_create(attendance_records, ignore_conflicts=True)

        self.stdout.write(f'  {count} attendance records')

    def _create_assessments_and_grades(self):
        self.stdout.write('Creating assessments and grades...')
        assessment_count = 0
        grade_count = 0

        for section in self.sections:
            enrolled = StudentEnrollment.objects.filter(
                section=section, academic_year=self.academic_year, status='ACTIVE'
            ).select_related('student')

            if not enrolled.exists():
                continue

            for subject in random.sample(self.subjects, min(6, len(self.subjects))):
                # Create 2-3 assessments per subject per section
                for _ in range(random.randint(2, 3)):
                    a_type = random.choice(['QUIZ', 'TEST', 'EXAM', 'ASSIGNMENT'])
                    max_score = 100 if a_type == 'EXAM' else random.choice([20, 30, 40, 50])
                    assessment = Assessment.objects.create(
                        title=f'{Assessment.Type(a_type).label} - {subject.name}',
                        subject=subject,
                        section=section,
                        type=a_type,
                        date=date.today() - timedelta(days=random.randint(1, 60)),
                        max_score=max_score,
                    )
                    assessment_count += 1

                    # Create grades for enrolled students
                    grades = []
                    for enrollment in enrolled:
                        # Bell curve-ish distribution centered around 65%
                        base = random.gauss(65, 15)
                        score = max(10, min(max_score, round(base * max_score / 100, 2)))
                        grades.append(Grade(
                            student=enrollment.student,
                            assessment=assessment,
                            score=Decimal(str(score)),
                        ))
                    Grade.objects.bulk_create(grades)
                    grade_count += len(grades)

        self.stdout.write(f'  {assessment_count} assessments, {grade_count} grades')

    def _create_finance(self):
        self.stdout.write('Creating fee structures, invoices, and payments...')

        structures = []
        for term in ['Term 1', 'Term 2', 'Term 3']:
            fs = FeeStructure.objects.create(
                name=f'{term} Tuition',
                academic_year='2025-2026',
                term=term,
                amount=Decimal(random.randint(800000, 2500000)),
                description=f'Full tuition fees for {term}',
            )
            structures.append(fs)

        invoice_count = 0
        payment_count = 0

        for student in self.students:
            # Each student gets an invoice for Term 1
            fs = structures[0]
            invoice = Invoice.objects.create(
                student=student,
                fee_structure=fs,
                total_amount=fs.amount,
                due_date=date(2025, 3, 15),
            )
            invoice_count += 1

            # 70% have made some payment
            if random.random() < 0.70:
                paid_pct = random.choice([0.25, 0.5, 0.75, 1.0])
                amount = round(float(fs.amount) * paid_pct, -3)
                payment = Payment.objects.create(
                    invoice=invoice,
                    amount=Decimal(str(amount)),
                    method=random.choice(['CASH', 'BANK', 'MOMO']),
                    reference=f'PAY-{random.randint(100000, 999999)}',
                    received_by=None,
                )
                invoice.amount_paid = Decimal(str(amount))
                if paid_pct >= 1.0:
                    invoice.status = 'PAID'
                else:
                    invoice.status = 'PARTIAL'
                invoice.save()
                payment_count += 1

        self.stdout.write(f'  {len(structures)} fee structures, {invoice_count} invoices, {payment_count} payments')

    def _create_library(self):
        self.stdout.write('Creating library data...')

        books = []
        for title, author, publisher, year in BOOK_TITLES:
            qty = random.randint(3, 15)
            b = Book.objects.create(
                title=title, author=author, publisher=publisher,
                published_year=year, quantity=qty,
                available_quantity=random.randint(1, qty),
                isbn=f'978-{random.randint(1000000000, 9999999999)}',
            )
            books.append(b)

        # Library members — 100 students
        members = []
        for i, student in enumerate(random.sample(self.students, min(100, len(self.students)))):
            m = LibraryMember.objects.create(
                user=student,
                card_number=f'LIB-{5001 + i}',
            )
            members.append(m)

        # Borrowings
        for member in random.sample(members, min(50, len(members))):
            book = random.choice(books)
            Borrowing.objects.create(
                member=member,
                book=book,
                due_date=date.today() + timedelta(days=random.randint(-10, 14)),
            )

        self.stdout.write(f'  {len(books)} books, {len(members)} members')

    def _create_logistics(self):
        self.stdout.write('Creating transport and hostel data...')

        # Transport routes
        route_names = [
            ('Route A — Kampala North', 'UAX 001A'),
            ('Route B — Kampala East', 'UAX 002B'),
            ('Route C — Entebbe Road', 'UAX 003C'),
            ('Route D — Mukono Direction', 'UAX 004D'),
            ('Route E — Jinja Road', 'UAX 005E'),
        ]
        for rname, vehicle in route_names:
            first, last = _random_name('M')
            route = TransportRoute.objects.create(
                name=rname,
                vehicle_number=vehicle,
                driver_name=f'{first} {last}',
                driver_phone=_random_phone(),
                monthly_fee=Decimal(random.randint(100000, 300000)),
            )
            for j, stop in enumerate(['Main Gate', 'Junction A', 'Market', 'Trading Centre', 'Terminal']):
                TransportStop.objects.create(
                    route=route,
                    stop_name=f'{stop} ({rname.split("—")[0].strip()})',
                    pickup_time=time(6, 30 + j * 10),
                )

        # Hostels
        hostels = [
            ('St. Mary\'s Hostel', 'GIRLS'),
            ('St. Joseph\'s Hall', 'BOYS'),
            ('Unity Hostel', 'MIXED'),
        ]
        for hname, gender in hostels:
            first, last = _random_name('F' if gender == 'GIRLS' else 'M')
            hostel = Hostel.objects.create(
                name=hname,
                gender_served=gender,
                warden_name=f'{first} {last}',
            )
            for r in range(1, 11):
                cap = random.randint(4, 8)
                Room.objects.create(
                    hostel=hostel,
                    room_number=f'{r:02d}',
                    capacity=cap,
                    occupancy=random.randint(0, cap),
                    fee_per_term=Decimal(random.randint(200000, 600000)),
                )

        self.stdout.write(f'  {len(route_names)} routes, {len(hostels)} hostels')

    def _create_announcements(self):
        self.stdout.write('Creating announcements...')
        admin_user = User.objects.filter(role='ADMIN').first()
        if not admin_user:
            admin_user = self.teachers[0][0]  # fallback

        for title, content, roles in ANNOUNCEMENT_DATA:
            Announcement.objects.create(
                title=title,
                content=content,
                created_by=admin_user,
                target_roles=roles,
            )

    def _create_demo_credentials(self):
        self.stdout.write('Creating demo login accounts...')

        # Admin
        if not User.objects.filter(username='admin@edupro.ug').exists():
            User.objects.create_user(
                username='admin@edupro.ug',
                email='admin@edupro.ug',
                password='DemoAdmin@2026',
                first_name='System',
                last_name='Administrator',
                role='ADMIN',
                is_staff=True,
                phone_number='+256770000001',
            )

        # Demo teacher
        if not User.objects.filter(username='teacher@edupro.ug').exists():
            teacher = User.objects.create_user(
                username='teacher@edupro.ug',
                email='teacher@edupro.ug',
                password='DemoTeacher@2026',
                first_name='Demo',
                last_name='Teacher',
                role='TEACHER',
                phone_number='+256770000002',
            )
            Staff.objects.create(
                user=teacher,
                employee_id='EMP-DEMO',
                designation='Senior Teacher',
                salary_basis=Decimal('2000000'),
                hire_date=date(2020, 1, 15),
            )

        # Demo parent
        if not User.objects.filter(username='parent@edupro.ug').exists():
            User.objects.create_user(
                username='parent@edupro.ug',
                email='parent@edupro.ug',
                password='DemoParent@2026',
                first_name='Demo',
                last_name='Parent',
                role='PARENT',
                phone_number='+256770000003',
            )

        # Demo student
        if not User.objects.filter(username='student@edupro.ug').exists():
            student = User.objects.create_user(
                username='student@edupro.ug',
                email='student@edupro.ug',
                password='DemoStudent@2026',
                first_name='Demo',
                last_name='Student',
                role='STUDENT',
                phone_number='+256770000004',
            )
            # Enroll the demo student
            if self.sections:
                StudentEnrollment.objects.create(
                    student=student,
                    section=self.sections[0],
                    academic_year=self.academic_year,
                    status='ACTIVE',
                )
