import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendEvent } from '@/inngest/client';

// Generate quiz questions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, documentId, difficulty = 'medium', count = 5 } = body;

        if (!sessionId || !documentId) {
            return NextResponse.json(
                { error: 'Session ID and Document ID required' },
                { status: 400 }
            );
        }

        // Trigger quiz generation via Inngest
        await sendEvent('quiz/generate-batch', {
            sessionId,
            documentId,
            difficulty,
            count,
        });

        return NextResponse.json({
            success: true,
            message: 'Quiz generation started',
            sessionId,
        });
    } catch (error) {
        console.error('Quiz API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz' },
            { status: 500 }
        );
    }
}

// Submit quiz answer and update HP/XP
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, questionId, userAnswer, correctAnswer, isCorrect, difficulty } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const supabase: any = createServerClient();

        // Record the answer
        await supabase.from('quiz_history').insert({
            session_id: sessionId,
            question: questionId,
            user_answer: userAnswer,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            difficulty,
        });

        // Update session HP/XP
        const { data: session, error: sessionError } = await supabase
            .from('study_sessions')
            .select('hp, xp, streak')
            .eq('id', sessionId)
            .single();

        if (sessionError) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Calculate HP/XP changes
        const xpGain = isCorrect
            ? { easy: 10, medium: 25, hard: 50 }[difficulty as string] || 10
            : 0;
        const hpLoss = isCorrect ? 0 : { easy: 5, medium: 10, hard: 15 }[difficulty as string] || 10;
        const newStreak = isCorrect ? (session.streak || 0) + 1 : 0;

        // Streak bonus
        const streakBonus = newStreak >= 3 ? Math.floor(newStreak / 3) * 5 : 0;

        const newHp = Math.max(0, (session.hp || 100) - hpLoss);
        const newXp = (session.xp || 0) + xpGain + streakBonus;

        await supabase
            .from('study_sessions')
            .update({
                hp: newHp,
                xp: newXp,
                streak: newStreak,
            })
            .eq('id', sessionId);

        return NextResponse.json({
            correct: isCorrect,
            xpGained: xpGain + streakBonus,
            hpLost: hpLoss,
            streak: newStreak,
            currentHp: newHp,
            currentXp: newXp,
            streakBonus: streakBonus > 0 ? streakBonus : undefined,
            gameOver: newHp <= 0,
        });
    } catch (error) {
        console.error('Quiz answer API error:', error);
        return NextResponse.json(
            { error: 'Failed to process answer' },
            { status: 500 }
        );
    }
}

// Get quiz history for a session
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const supabase: any = createServerClient();

        const { data: history, error } = await supabase
            .from('quiz_history')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch history: ${error.message}`);
        }

        // Calculate stats
        const total = history?.length || 0;
        const correct = history?.filter((h: any) => h.is_correct).length || 0;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;

        return NextResponse.json({
            history,
            stats: {
                total,
                correct,
                incorrect: total - correct,
                accuracy: accuracy.toFixed(1),
            },
        });
    } catch (error) {
        console.error('Quiz history API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz history' },
            { status: 500 }
        );
    }
}
