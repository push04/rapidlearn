import { NextRequest, NextResponse } from 'next/server';
import { sendEvent } from '@/inngest/client';
import { v4 as uuidv4 } from 'uuid';
import { scrapeYouTubeSearch } from '@/lib/scrapers';

// Direct search (for quick results without full analysis)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const maxResults = parseInt(searchParams.get('maxResults') || '5');

        if (!query) {
            return NextResponse.json({ error: 'Search query required' }, { status: 400 });
        }

        // Use custom Cheerio scraper
        const videos = await scrapeYouTubeSearch(query, maxResults);

        return NextResponse.json({
            videos: videos.map(v => ({
                ...v,
                embedUrl: `https://www.youtube.com/embed/${v.videoId}`
            }))
        });

    } catch (error) {
        console.error('YouTube quick search error (scraper):', error);
        return NextResponse.json(
            { error: 'Failed to search YouTube' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, userId, maxResults = 10 } = body;

        if (!query) {
            return NextResponse.json({ error: 'Search query required' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Generate a session ID for this search
        const sessionId = uuidv4();

        // Trigger the YouTube analysis Inngest function
        await sendEvent('youtube/analyze', {
            sessionId,
            userId,
            query,
            maxResults,
        });

        return NextResponse.json({
            success: true,
            sessionId,
            message: 'YouTube analysis started. Results will be available shortly.',
            status: 'processing',
        });
    } catch (error) {
        console.error('YouTube search API error:', error);
        return NextResponse.json(
            { error: 'Failed to start YouTube analysis' },
            { status: 500 }
        );
    }
}
