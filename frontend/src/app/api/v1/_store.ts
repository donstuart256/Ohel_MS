/**
 * In-memory data store for demo mode.
 * All API routes share this module-level state so data persists
 * across requests within the same server process (dev or prod).
 * In production, these would be backed by PostgreSQL via Django ORM.
 */

// ─── Auto-incrementing ID generators ────────────────────────────────────────
const counters: Record<string, number> = {}
export function nextId(collection: string): number {
    if (!counters[collection]) counters[collection] = 100
    return ++counters[collection]
}

// ─── SUBJECTS ───────────────────────────────────────────────────────────────
export const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH', category: 'CORE', description: 'Number theory, algebra, geometry and statistics' },
    { id: 2, name: 'English', code: 'ENG', category: 'CORE', description: 'Language arts, grammar, literature and composition' },
    { id: 3, name: 'Science', code: 'SCI', category: 'CORE', description: 'General science and elementary technology' },
    { id: 4, name: 'Social Studies', code: 'SST', category: 'CORE', description: 'History, geography, civics and government' },
    { id: 5, name: 'Physics', code: 'PHY', category: 'SCIENCES', description: 'Mechanics, waves, electricity and modern physics' },
    { id: 6, name: 'Chemistry', code: 'CHEM', category: 'SCIENCES', description: 'Organic, inorganic and physical chemistry' },
    { id: 7, name: 'Biology', code: 'BIO', category: 'SCIENCES', description: 'Cell biology, genetics, ecology and anatomy' },
    { id: 8, name: 'Geography', code: 'GEO', category: 'HUMANITIES', description: 'Physical and human geography' },
    { id: 9, name: 'History', code: 'HIST', category: 'HUMANITIES', description: 'East African, African and world history' },
    { id: 10, name: 'CRE', code: 'CRE', category: 'HUMANITIES', description: 'Christian Religious Education' },
    { id: 11, name: 'Art', code: 'ART', category: 'ELECTIVE', description: 'Fine arts, drawing, painting and sculpture' },
    { id: 12, name: 'Music', code: 'MUS', category: 'ELECTIVE', description: 'Music theory, performance and appreciation' },
]

// ─── SECTIONS (Classes) ─────────────────────────────────────────────────────
export const sections = [
    { id: 1, name: 'P.7 Blue', level: 'PRIMARY', class_teacher: 'Mr. Okello Peter', capacity: 45, enrolled: 38 },
    { id: 2, name: 'S.2 West', level: 'SECONDARY', class_teacher: 'Ms. Nakamya Grace', capacity: 50, enrolled: 42 },
    { id: 3, name: 'Year 1 CS', level: 'TERTIARY', class_teacher: 'Mr. Mugisha James', capacity: 35, enrolled: 28 },
    { id: 4, name: 'P.1 Green', level: 'PRIMARY', class_teacher: 'Ms. Atwine Mercy', capacity: 40, enrolled: 35 },
    { id: 5, name: 'S.6 PCM', level: 'SECONDARY', class_teacher: 'Mr. Nuwagaba David', capacity: 30, enrolled: 25 },
    { id: 6, name: 'S.4 East', level: 'SECONDARY', class_teacher: 'Ms. Namugga Faith', capacity: 45, enrolled: 40 },
    { id: 7, name: 'S.1 South', level: 'SECONDARY', class_teacher: 'Mr. Kabuye Joseph', capacity: 50, enrolled: 48 },
    { id: 8, name: 'P.5 Red', level: 'PRIMARY', class_teacher: 'Ms. Namutebi Hope', capacity: 45, enrolled: 36 },
    { id: 9, name: 'S.3 Blue', level: 'SECONDARY', class_teacher: 'Ms. Ssemwanga Sarah', capacity: 40, enrolled: 32 },
    { id: 10, name: 'S.1 Green', level: 'SECONDARY', class_teacher: 'Fr. Byaruhanga Moses', capacity: 50, enrolled: 44 },
]

// ─── ENROLLMENTS ────────────────────────────────────────────────────────────
export const enrollments = [
    { id: 1, student: 1, student_name: 'Grace Nakamya', section_name: 'P.7 Blue', section: 1, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 2, student: 2, student_name: 'James Mugisha', section_name: 'S.2 West', section: 2, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 3, student: 3, student_name: 'Mercy Atwine', section_name: 'Year 1 CS', section: 3, academic_year: 1, academic_year_name: '2026', status: 'PENDING' },
    { id: 4, student: 4, student_name: 'Patrick Okello', section_name: 'P.1 Green', section: 4, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 5, student: 5, student_name: 'Faith Namugga', section_name: 'S.6 PCM', section: 5, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 6, student: 6, student_name: 'Isaac Kato', section_name: 'S.4 East', section: 6, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 7, student: 7, student_name: 'Namuli Sharon', section_name: 'S.1 South', section: 7, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 8, student: 8, student_name: 'David Ssekandi', section_name: 'P.5 Red', section: 8, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 9, student: 9, student_name: 'Hope Namutebi', section_name: 'S.3 Blue', section: 9, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
    { id: 10, student: 10, student_name: 'Joseph Kabuye', section_name: 'P.7 Blue', section: 1, academic_year: 1, academic_year_name: '2026', status: 'ACTIVE' },
]

// ─── USERS ──────────────────────────────────────────────────────────────────
export const users = [
    { id: 1, username: 'admin@edupro.ug', first_name: 'System', last_name: 'Administrator', email: 'admin@edupro.ug', role: 'ADMIN', phone_number: '+256770000001' },
    { id: 2, username: 't_peter.okello', first_name: 'Peter', last_name: 'Okello', email: 't_peter.okello@school.ac.ug', role: 'TEACHER', phone_number: '+256770112233' },
    { id: 3, username: 't_grace.nakamya', first_name: 'Grace', last_name: 'Nakamya', email: 't_grace.nakamya@school.ac.ug', role: 'TEACHER', phone_number: '+256780223344' },
    { id: 4, username: 't_james.mugisha', first_name: 'James', last_name: 'Mugisha', email: 't_james.mugisha@school.ac.ug', role: 'TEACHER', phone_number: '+256750334455' },
    { id: 5, username: 't_mercy.atwine', first_name: 'Mercy', last_name: 'Atwine', email: 't_mercy.atwine@school.ac.ug', role: 'TEACHER', phone_number: '+256760445566' },
    { id: 6, username: 't_faith.namugga', first_name: 'Faith', last_name: 'Namugga', email: 't_faith.namugga@school.ac.ug', role: 'TEACHER', phone_number: '+256770556677' },
    { id: 7, username: 't_david.nuwagaba', first_name: 'David', last_name: 'Nuwagaba', email: 't_david.nuwagaba@school.ac.ug', role: 'TEACHER', phone_number: '+256780667788' },
    { id: 8, username: 't_joseph.kabuye', first_name: 'Joseph', last_name: 'Kabuye', email: 't_joseph.kabuye@school.ac.ug', role: 'TEACHER', phone_number: '+256750778899' },
    { id: 9, username: 't_hope.namutebi', first_name: 'Hope', last_name: 'Namutebi', email: 't_hope.namutebi@school.ac.ug', role: 'TEACHER', phone_number: '+256760889900' },
    { id: 10, username: 't_sarah.ssemwanga', first_name: 'Sarah', last_name: 'Ssemwanga', email: 't_sarah.ssemwanga@school.ac.ug', role: 'TEACHER', phone_number: '+256770990011' },
]

// ─── INVOICES ───────────────────────────────────────────────────────────────
export const invoices = [
    { id: 1, student: 1, student_name: 'Grace Nakamya', fee_structure: 1, total_amount: '2500000', amount_paid: '2500000', balance: '0', status: 'PAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z' },
    { id: 2, student: 2, student_name: 'James Mugisha', fee_structure: 1, total_amount: '2500000', amount_paid: '0', balance: '2500000', status: 'UNPAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z' },
    { id: 3, student: 3, student_name: 'Mercy Atwine', fee_structure: 1, total_amount: '2500000', amount_paid: '1200000', balance: '1300000', status: 'PARTIAL', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z' },
    { id: 4, student: 4, student_name: 'Patrick Okello', fee_structure: 1, total_amount: '2500000', amount_paid: '0', balance: '2500000', status: 'UNPAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z' },
    { id: 5, student: 5, student_name: 'Faith Namugga', fee_structure: 1, total_amount: '2500000', amount_paid: '2500000', balance: '0', status: 'PAID', due_date: '2026-02-28', created_at: '2026-01-10T08:00:00Z' },
    { id: 6, student: 6, student_name: 'Isaac Kato', fee_structure: 1, total_amount: '1800000', amount_paid: '900000', balance: '900000', status: 'PARTIAL', due_date: '2026-03-15', created_at: '2026-02-01T10:00:00Z' },
    { id: 7, student: 7, student_name: 'Namuli Sharon', fee_structure: 1, total_amount: '2500000', amount_paid: '0', balance: '2500000', status: 'UNPAID', due_date: '2026-03-30', created_at: '2026-02-15T08:00:00Z' },
]

// ─── PAYMENTS ───────────────────────────────────────────────────────────────
export const payments: any[] = []

// ─── ASSESSMENTS ────────────────────────────────────────────────────────────
export const assessments = [
    { id: 1, title: 'Quiz - Mathematics', subject: 1, subject_name: 'Mathematics', section: 1, section_name: 'P.7 Blue', type: 'QUIZ', date: '2026-03-10', max_score: 30 },
    { id: 2, title: 'Test - English', subject: 2, subject_name: 'English', section: 1, section_name: 'P.7 Blue', type: 'TEST', date: '2026-03-12', max_score: 50 },
    { id: 3, title: 'Exam - Science', subject: 3, subject_name: 'Science', section: 2, section_name: 'S.1 Green', type: 'EXAM', date: '2026-03-15', max_score: 100 },
    { id: 4, title: 'Assignment - Social Studies', subject: 4, subject_name: 'Social Studies', section: 3, section_name: 'S.2 Red', type: 'ASSIGNMENT', date: '2026-03-05', max_score: 20 },
    { id: 5, title: 'Exam - Physics', subject: 5, subject_name: 'Physics', section: 4, section_name: 'S.3 Blue', type: 'EXAM', date: '2026-03-18', max_score: 100 },
    { id: 6, title: 'Quiz - Chemistry', subject: 6, subject_name: 'Chemistry', section: 2, section_name: 'S.1 Green', type: 'QUIZ', date: '2026-03-20', max_score: 40 },
    { id: 7, title: 'Test - Biology', subject: 7, subject_name: 'Biology', section: 5, section_name: 'S.4 Green', type: 'TEST', date: '2026-03-22', max_score: 50 },
    { id: 8, title: 'Exam - Geography', subject: 8, subject_name: 'Geography', section: 3, section_name: 'S.2 Red', type: 'EXAM', date: '2026-03-25', max_score: 100 },
]

// ─── GRADES ─────────────────────────────────────────────────────────────────
export const grades = [
    { id: 1, student: 10, student_name: 'Grace Nakamya', assessment: 3, assessment_title: 'Exam - Science', score: '95.00' },
    { id: 2, student: 15, student_name: 'James Mugisha', assessment: 5, assessment_title: 'Exam - Physics', score: '92.50' },
    { id: 3, student: 22, student_name: 'Mercy Atwine', assessment: 1, assessment_title: 'Quiz - Mathematics', score: '28.00' },
    { id: 4, student: 8, student_name: 'Patrick Okello', assessment: 3, assessment_title: 'Exam - Science', score: '88.00' },
    { id: 5, student: 31, student_name: 'Faith Namugga', assessment: 8, assessment_title: 'Exam - Geography', score: '85.50' },
    { id: 6, student: 44, student_name: 'Moses Byaruhanga', assessment: 5, assessment_title: 'Exam - Physics', score: '82.00' },
    { id: 7, student: 19, student_name: 'Esther Nuwagaba', assessment: 2, assessment_title: 'Test - English', score: '44.00' },
    { id: 8, student: 55, student_name: 'Joseph Kabuye', assessment: 7, assessment_title: 'Test - Biology', score: '41.00' },
    { id: 9, student: 3, student_name: 'Sarah Ssemwanga', assessment: 6, assessment_title: 'Quiz - Chemistry', score: '38.00' },
    { id: 10, student: 67, student_name: 'Hope Namutebi', assessment: 1, assessment_title: 'Quiz - Mathematics', score: '26.00' },
]

// ─── ATTENDANCE ─────────────────────────────────────────────────────────────
export const attendance = [
    { id: 1, student: 10, student_name: 'Grace Nakamya', section: 1, section_name: 'P.7 Blue', date: '2026-03-24', status: 'PRESENT', marked_by: 2, remarks: '' },
    { id: 2, student: 15, student_name: 'James Mugisha', section: 1, section_name: 'P.7 Blue', date: '2026-03-24', status: 'PRESENT', marked_by: 2, remarks: '' },
    { id: 3, student: 22, student_name: 'Mercy Atwine', section: 1, section_name: 'P.7 Blue', date: '2026-03-24', status: 'ABSENT', marked_by: 2, remarks: 'Called in sick' },
    { id: 4, student: 8, student_name: 'Patrick Okello', section: 1, section_name: 'P.7 Blue', date: '2026-03-24', status: 'LATE', marked_by: 2, remarks: '' },
    { id: 5, student: 31, student_name: 'Faith Namugga', section: 1, section_name: 'P.7 Blue', date: '2026-03-24', status: 'PRESENT', marked_by: 2, remarks: '' },
    { id: 6, student: 44, student_name: 'Moses Byaruhanga', section: 2, section_name: 'S.1 Green', date: '2026-03-24', status: 'PRESENT', marked_by: 3, remarks: '' },
    { id: 7, student: 19, student_name: 'Esther Nuwagaba', section: 2, section_name: 'S.1 Green', date: '2026-03-24', status: 'EXCUSED', marked_by: 3, remarks: 'Medical visit' },
    { id: 8, student: 55, student_name: 'Joseph Kabuye', section: 2, section_name: 'S.1 Green', date: '2026-03-24', status: 'PRESENT', marked_by: 3, remarks: '' },
    { id: 9, student: 3, student_name: 'Sarah Ssemwanga', section: 2, section_name: 'S.1 Green', date: '2026-03-24', status: 'PRESENT', marked_by: 3, remarks: '' },
    { id: 10, student: 67, student_name: 'Hope Namutebi', section: 2, section_name: 'S.1 Green', date: '2026-03-24', status: 'ABSENT', marked_by: 3, remarks: '' },
]

// ─── TIMETABLE ──────────────────────────────────────────────────────────────
export const timetable = [
    { id: 1, section: 1, section_name: 'P.7 Blue', subject: 1, subject_name: 'Mathematics', teacher: 1, teacher_name: 'Mr. Okello Peter', day: 'MON', start_time: '08:00:00', end_time: '08:40:00' },
    { id: 2, section: 1, section_name: 'P.7 Blue', subject: 2, subject_name: 'English', teacher: 2, teacher_name: 'Ms. Nakamya Grace', day: 'MON', start_time: '08:45:00', end_time: '09:25:00' },
    { id: 3, section: 1, section_name: 'P.7 Blue', subject: 3, subject_name: 'Science', teacher: 3, teacher_name: 'Mr. Mugisha James', day: 'MON', start_time: '09:30:00', end_time: '10:10:00' },
    { id: 4, section: 1, section_name: 'P.7 Blue', subject: 4, subject_name: 'Social Studies', teacher: 4, teacher_name: 'Ms. Atwine Mercy', day: 'MON', start_time: '10:30:00', end_time: '11:10:00' },
    { id: 5, section: 1, section_name: 'P.7 Blue', subject: 5, subject_name: 'Physics', teacher: 5, teacher_name: 'Mr. Nuwagaba David', day: 'MON', start_time: '11:15:00', end_time: '11:55:00' },
    { id: 6, section: 1, section_name: 'P.7 Blue', subject: 6, subject_name: 'Chemistry', teacher: 6, teacher_name: 'Ms. Namugga Faith', day: 'MON', start_time: '14:00:00', end_time: '14:40:00' },
    { id: 7, section: 1, section_name: 'P.7 Blue', subject: 1, subject_name: 'Mathematics', teacher: 1, teacher_name: 'Mr. Okello Peter', day: 'TUE', start_time: '08:00:00', end_time: '08:40:00' },
    { id: 8, section: 1, section_name: 'P.7 Blue', subject: 7, subject_name: 'Biology', teacher: 7, teacher_name: 'Mr. Kabuye Joseph', day: 'TUE', start_time: '08:45:00', end_time: '09:25:00' },
    { id: 9, section: 1, section_name: 'P.7 Blue', subject: 8, subject_name: 'Geography', teacher: 8, teacher_name: 'Ms. Namutebi Hope', day: 'TUE', start_time: '09:30:00', end_time: '10:10:00' },
    { id: 10, section: 1, section_name: 'P.7 Blue', subject: 2, subject_name: 'English', teacher: 2, teacher_name: 'Ms. Nakamya Grace', day: 'TUE', start_time: '10:30:00', end_time: '11:10:00' },
    { id: 11, section: 1, section_name: 'P.7 Blue', subject: 3, subject_name: 'Science', teacher: 3, teacher_name: 'Mr. Mugisha James', day: 'WED', start_time: '08:00:00', end_time: '08:40:00' },
    { id: 12, section: 1, section_name: 'P.7 Blue', subject: 9, subject_name: 'History', teacher: 9, teacher_name: 'Ms. Ssemwanga Sarah', day: 'WED', start_time: '08:45:00', end_time: '09:25:00' },
    { id: 13, section: 1, section_name: 'P.7 Blue', subject: 10, subject_name: 'CRE', teacher: 10, teacher_name: 'Fr. Byaruhanga Moses', day: 'WED', start_time: '09:30:00', end_time: '10:10:00' },
    { id: 14, section: 1, section_name: 'P.7 Blue', subject: 4, subject_name: 'Social Studies', teacher: 4, teacher_name: 'Ms. Atwine Mercy', day: 'THU', start_time: '08:00:00', end_time: '08:40:00' },
    { id: 15, section: 1, section_name: 'P.7 Blue', subject: 5, subject_name: 'Physics', teacher: 5, teacher_name: 'Mr. Nuwagaba David', day: 'THU', start_time: '08:45:00', end_time: '09:25:00' },
    { id: 16, section: 1, section_name: 'P.7 Blue', subject: 6, subject_name: 'Chemistry', teacher: 6, teacher_name: 'Ms. Namugga Faith', day: 'THU', start_time: '09:30:00', end_time: '10:10:00' },
    { id: 17, section: 1, section_name: 'P.7 Blue', subject: 1, subject_name: 'Mathematics', teacher: 1, teacher_name: 'Mr. Okello Peter', day: 'FRI', start_time: '08:00:00', end_time: '08:40:00' },
    { id: 18, section: 1, section_name: 'P.7 Blue', subject: 7, subject_name: 'Biology', teacher: 7, teacher_name: 'Mr. Kabuye Joseph', day: 'FRI', start_time: '08:45:00', end_time: '09:25:00' },
    { id: 19, section: 1, section_name: 'P.7 Blue', subject: 8, subject_name: 'Geography', teacher: 8, teacher_name: 'Ms. Namutebi Hope', day: 'FRI', start_time: '14:00:00', end_time: '14:40:00' },
    { id: 20, section: 1, section_name: 'P.7 Blue', subject: 2, subject_name: 'English', teacher: 2, teacher_name: 'Ms. Nakamya Grace', day: 'FRI', start_time: '14:45:00', end_time: '15:25:00' },
]

// ─── LIBRARY ────────────────────────────────────────────────────────────────
export const books = [
    { id: 1, title: 'Primary Mathematics Pupil\'s Book 7', author: 'MK Publishers', isbn: '978-9970-02-001-1', publisher: 'MK Publishers', published_year: 2022, quantity: 50, available_quantity: 38 },
    { id: 2, title: 'Integrated English for Primary 7', author: 'NCDC Uganda', isbn: '978-9970-02-002-8', publisher: 'Fountain Publishers', published_year: 2021, quantity: 45, available_quantity: 30 },
    { id: 3, title: 'Science and Elementary Technology P.7', author: 'NCDC Uganda', isbn: '978-9970-02-003-5', publisher: 'Longhorn Publishers', published_year: 2022, quantity: 40, available_quantity: 12 },
    { id: 4, title: 'Social Studies for East Africa S.1', author: 'Godfrey Ssemwogerere', isbn: '978-9970-02-004-2', publisher: 'East African Publishers', published_year: 2020, quantity: 35, available_quantity: 0 },
    { id: 5, title: 'A-Level Physics by Nelkon & Parker', author: 'M. Nelkon', isbn: '978-0-273-71969-3', publisher: 'Pearson', published_year: 2019, quantity: 25, available_quantity: 18 },
    { id: 6, title: 'Biology for Senior Secondary Schools', author: 'D.G. Mackean', isbn: '978-0-7195-7882-1', publisher: 'Murray', published_year: 2020, quantity: 30, available_quantity: 22 },
    { id: 7, title: 'Chemistry for East Africa', author: 'G.C. Hill', isbn: '978-0-582-07849-2', publisher: 'Longman', published_year: 2018, quantity: 28, available_quantity: 5 },
    { id: 8, title: 'Understanding Geography for O-Level', author: 'J.B. Bukenya', isbn: '978-9970-02-008-0', publisher: 'Netmedia Publishers', published_year: 2021, quantity: 32, available_quantity: 28 },
]

// ─── NOTICES ────────────────────────────────────────────────────────────────
export const notices = [
    { id: 1, title: 'Welcome Back to Term 1, 2026!', author: 'Principal Okello', date: 'March 10, 2026', preview: 'As we embark on another exciting academic year, let\'s embrace the opportunities that lie ahead...', fullText: 'As we embark on another exciting academic year, let\'s embrace the opportunities that lie ahead. We\'re thrilled to welcome new faces and reunite with returning students. Classes officially commence on Monday 10th March.\n\nPlease ensure all school fees are settled by the end of the first week. Students with outstanding balances will receive individual invoices via the Finance module.', tags: ['School', 'Academic', 'Event'], image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Okello' },
    { id: 2, title: 'Inter-House Sports Day', author: 'Coach Mugisha James', date: 'March 28, 2026', preview: 'Get ready to show your spirit and skills! Inter-house sports competition is next Friday...', fullText: 'Get ready to show your spirit and skills! Inter-house sports competition is next Friday. Events include athletics, football, netball, and volleyball. Students should report to the field by 8:00 AM in their respective house colors.', tags: ['Sports', 'Event'], image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Mugisha' },
    { id: 3, title: 'Library Extended Hours for Exams', author: 'Librarian Namutebi Hope', date: 'March 20, 2026', preview: 'To support your exam preparation, the library will offer extended hours starting next week...', fullText: 'To support your exam preparation, the library will offer extended hours starting next week. Monday to Friday: 6:00 AM - 8:00 PM. Saturday: 9:00 AM - 5:00 PM. Additional study rooms have been prepared on the second floor.', tags: ['Academic', 'Facility'], image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=60', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Hope' },
    { id: 4, title: 'Parent-Teacher Conference', author: 'Deputy Head Atwine', date: 'April 5, 2026', preview: 'All parents and guardians are invited to the term 1 parent-teacher conference...', fullText: 'All parents and guardians are invited to the term 1 parent-teacher conference. The event will take place in the main hall from 2:00 PM to 5:00 PM. Report cards will be distributed during the meeting. Refreshments will be provided.', tags: ['Meeting', 'Important'], image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&auto=format&fit=crop&q=60', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Atwine' },
    { id: 5, title: 'Mid-Term Exam Schedule Released', author: 'Academic Dean Ssemwanga', date: 'March 25, 2026', preview: 'The mid-term examination timetable has been finalized. Exams begin April 14th...', fullText: 'The mid-term examination timetable has been finalized. Exams begin April 14th and end April 18th. Please check the Routine module for your specific class schedule. All students must bring their own stationery. No electronic devices allowed during examinations.', tags: ['Academic', 'Exam'], image: 'https://images.unsplash.com/photo-1593113514676-5927ad010620?w=800&auto=format&fit=crop&q=60', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah' },
]

// ─── MESSAGES ───────────────────────────────────────────────────────────────
export const messages = [
    { id: 1, from: 1, from_name: 'System Administrator', to: 2, to_name: 'Peter Okello', subject: 'Welcome to the new term', body: 'Dear Mr. Okello, welcome back! Please submit your term plan by Friday.', read: true, created_at: '2026-03-10T08:00:00Z' },
    { id: 2, from: 2, from_name: 'Peter Okello', to: 1, to_name: 'System Administrator', subject: 'Re: Welcome to the new term', body: 'Thank you! I will have my term plan ready by Thursday.', read: true, created_at: '2026-03-10T10:30:00Z' },
    { id: 3, from: 1, from_name: 'System Administrator', to: 3, to_name: 'Grace Nakamya', subject: 'Timetable update', body: 'Please note the updated schedule for Tuesday mornings. English has been moved to 09:30.', read: false, created_at: '2026-03-15T14:00:00Z' },
    { id: 4, from: 5, from_name: 'Mercy Atwine', to: 1, to_name: 'System Administrator', subject: 'Request for leave', body: 'I kindly request for 2 days leave on 20th-21st March for a family emergency.', read: false, created_at: '2026-03-18T09:00:00Z' },
    { id: 5, from: 1, from_name: 'System Administrator', to: 5, to_name: 'Mercy Atwine', subject: 'Re: Request for leave', body: 'Approved. Please ensure your classes are covered by a colleague.', read: true, created_at: '2026-03-18T11:00:00Z' },
]
