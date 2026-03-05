/**
 * API client for the School Management System.
 * Handles JWT auth, token refresh, and base URL configuration.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ── Token management ─────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
}

export function clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export function isLoggedIn(): boolean {
    return !!getAccessToken();
}

// ── Core fetch helper ────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

export async function fetchAPI<T = any>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const { skipAuth = false, headers: extraHeaders, ...rest } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((extraHeaders as Record<string, string>) || {}),
    };

    if (!skipAuth) {
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${API_BASE}/${endpoint}`, {
        headers,
        ...rest,
    });

    // Handle 401 — redirect to login
    if (res.status === 401) {
        clearTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new Error('Session expired');
    }

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.error || errorBody?.detail || `API error: ${res.status}`);
    }

    // Handle 204 No Content
    if (res.status === 204) return {} as T;

    return res.json();
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

interface LoginResponse {
    access?: string;
    refresh?: string;
    mfa_required?: boolean;
    mfa_token?: string;
    message?: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    return fetchAPI<LoginResponse>('auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        skipAuth: true,
    });
}

export async function verifyMFA(mfaToken: string, otp: string): Promise<{ access: string; refresh: string }> {
    return fetchAPI('auth/mfa-verify/', {
        method: 'POST',
        body: JSON.stringify({ mfa_token: mfaToken, otp }),
        skipAuth: true,
    });
}

export function logout(): void {
    clearTokens();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
    students: { total: number; enrolled: number };
    attendance: {
        today_rate: number;
        today_present: number;
        today_total: number;
        weekly: Array<{ date: string; day: string; total: number; present: number; rate: number }>;
    };
    finance: {
        total_billed: string;
        total_collected: string;
        collection_rate: number;
    };
    academics: { avg_performance: number };
    staff: { total: number; teachers: number };
    announcements: Array<{ id: number; title: string; content: string; created_at: string; target_roles: string[] }>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    return fetchAPI<DashboardSummary>('dashboard/summary/');
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getCurrentUser() {
    return fetchAPI('users/me/');
}

export async function getStudents(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`users/${query}`);
}
