import { NextRequest, NextResponse } from 'next/server';
import { scrapeDuckDuckGo } from '@/lib/scrapers';

// Oracle Search: Live web search using DuckDuckGo (Free, No Key)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: 'Search query required' }, { status: 400 });
        }

        // Use custom Cheerio scraper
        const results = await scrapeDuckDuckGo(query, 5);

        if (!results || results.length === 0) {
            throw new Error('No results found');
        }

        // Format to match expected Oracle output
        const formattedResults = results.map(result => ({
            title: result.title,
            url: result.url,
            content: result.content,
            score: 1.0,
            publishedDate: new Date().toISOString()
        }));

        const answer = `Based on the search results, the top source discusses "${formattedResults[0]?.title}". ${formattedResults[0]?.content}`;

        return NextResponse.json({
            answer,
            results: formattedResults,
            query: query,
        });

    } catch (error) {
        console.error('Oracle (DDG) search error:', error);
        return NextResponse.json(
            { error: 'Failed to perform web search' },
            { status: 500 }
        );
    }
}

// Oracle Search: Augment old content with new information
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, originalDate } = body;

        if (!topic) {
            return NextResponse.json({ error: 'Topic required' }, { status: 400 });
        }

        // Search for recent updates on the topic
        const query = originalDate
            ? `Latest updates and developments in ${topic} after ${originalDate}`
            : `Recent news and updates about ${topic} 2024 2025`;

        const searchResults = await scrapeDuckDuckGo(query, 3);

        // Format as an "Oracle Update" box
        const oracleUpdate = {
            type: 'oracle_update',
            topic,
            originalDate,
            searchedAt: new Date().toISOString(),
            aiSummary: searchResults[0]?.content || "Found improved sources.",
            sources: searchResults.map(result => ({
                title: result.title,
                url: result.url,
                snippet: result.content.substring(0, 200) + '...',
                date: new Date().toISOString(),
            })),
            disclaimer: 'Data sourced from public web search (DuckDuckGo).',
        };

        return NextResponse.json(oracleUpdate);
    } catch (error) {
        console.error('Oracle update error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch oracle update' },
            { status: 500 }
        );
    }
}
