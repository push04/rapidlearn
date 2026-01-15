import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Invite User API (Protected)
// Allows Admin OR Authenticated Users to invite
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get('admin_session');
        const supabase = createServerClient();

        let isAuthorized = false;
        let inviterId = null; // Admin is null

        // 1. Check Admin Cookie
        if (adminSession && adminSession.value === 'true') {
            isAuthorized = true;
        } else {
            // 2. Check Supabase Auth (User inviting User)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                isAuthorized = true;
                inviterId = user.id;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Add to invited_users table
        const { error } = await supabase
            .from('invited_users')
            .insert({
                email,
                invited_by: inviterId
            });

        if (error) {
            // Ignore duplicate key error, just success
            if (error.code === '23505') {
                return NextResponse.json({ success: true, message: 'User already invited (Duplicate)' });
            }
            throw error;
        }

        // Log for production (in a real app, we might send an email here)
        console.log(`[INVITE] ${email} invited by ${inviterId || 'ADMIN'}. Contact: slidetutorai@gmail.com`);

        return NextResponse.json({ success: true, message: `Invited ${email}` });

    } catch (error) {
        console.error('Invite error:', error);
        return NextResponse.json({ error: 'Invite failed' }, { status: 500 });
    }
}
