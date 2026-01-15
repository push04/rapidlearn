import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple ADMIN Login API
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Hardcoded check as requested by user
        if (username === 'admin' && password === 'rapidlearn2026') {
            const response = NextResponse.json({ success: true });

            // Set secure cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 // 1 day
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
