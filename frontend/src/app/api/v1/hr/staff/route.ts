import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json([
        { id: 1, user: 10, full_name: 'Mr. John Kato', employee_id: 'EMP-001', designation: 'Mathematics Teacher', salary_basis: '1800000', hire_date: '2018-02-01' },
        { id: 2, user: 11, full_name: 'Ms. Rose Namuli', employee_id: 'EMP-002', designation: 'Head of Science', salary_basis: '2200000', hire_date: '2015-08-15' },
        { id: 3, user: 12, full_name: 'Mr. Paul Okello', employee_id: 'EMP-003', designation: 'English Teacher', salary_basis: '1700000', hire_date: '2020-01-06' },
        { id: 4, user: 13, full_name: 'Dr. Grace Amara', employee_id: 'EMP-004', designation: 'School Principal', salary_basis: '3500000', hire_date: '2012-05-20' },
    ])
}
