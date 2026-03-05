const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    res.setHeader('Content-Type', 'application/json');

    if (req.url.includes('/auth/login/')) {
        res.end(JSON.stringify({ mfa_required: true, mfa_token: "mock_mfa_token" }));
    } else if (req.url.includes('/auth/mfa-verify/')) {
        res.end(JSON.stringify({ access: "mock_access", refresh: "mock_refresh" }));
    } else if (req.url.includes('/dashboard/summary/')) {
        setTimeout(() => {
            res.end(JSON.stringify({
                students: { total: 1240, enrolled: 1200 },
                staff: { total: 95, teachers: 80 },
                finance: { total_billed: "500000000", total_collected: "42500000", collection_rate: 85 },
                attendance: {
                    today_rate: 93, today_present: 1150, today_total: 1240, weekly: [
                        { day: 'Mon', date: '2026-03-02', rate: 95 },
                        { day: 'Tue', date: '2026-03-03', rate: 92 },
                        { day: 'Wed', date: '2026-03-04', rate: 94 },
                        { day: 'Thu', date: '2026-03-05', rate: 93 },
                        { day: 'Fri', date: '2026-03-06', rate: 0 },
                    ]
                },
                academics: { average_score: 74 },
                announcements: [
                    { id: 1, title: 'Term 1 Begins', content: 'Welcome to the new academic term. Classes commence immediately.' },
                    { id: 2, title: 'Maintenance Window', content: 'Portal will be down on Saturday night for scheduled upgrades.' }
                ]
            }));
        }, 500);
    } else if (req.url.includes('/academics/enrollments/')) {
        setTimeout(() => {
            res.end(JSON.stringify([
                { id: 1, student: 1, student_name: 'Jordan Smith', section_name: 'P.6 Blue', academic_year_name: '2026', status: 'ACTIVE' },
                { id: 2, student: 2, student_name: 'Sarah Jenkins', section_name: 'S.2 West', academic_year_name: '2026', status: 'ACTIVE' },
                { id: 3, student: 3, student_name: 'Maria Garcia', section_name: 'Year 1 CS', academic_year_name: '2026', status: 'PENDING' },
                { id: 4, student: 4, student_name: 'Donald J. Tom', section_name: 'P.1 Green', academic_year_name: '2026', status: 'ACTIVE' },
                { id: 5, student: 5, student_name: 'Anna Baker', section_name: 'S.6 PCM', academic_year_name: '2026', status: 'ACTIVE' }
            ]));
        }, 500);
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ detail: "Not found" }));
    }
});

server.listen(8000, () => console.log('Mock API running on :8000'));
