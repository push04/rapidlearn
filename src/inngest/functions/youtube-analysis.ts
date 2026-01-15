import { inngest } from '../client';
import { chat, selectModel } from '@/lib/openrouter';
import { scrapeYouTubeSearch } from '@/lib/scrapers';

// Quick transcript fetch (Mock/Public API hybrid)
// Since we removed ytsr/ytdl, we use a simplistic approach or fallback
async function fetchYouTubeTranscript(videoId: string): Promise<string> {
    if (videoId.startsWith('mock-')) {
        return "This is a simulated transcript for a mock video. It covers the key concepts of the topic in a clear and concise way. The speaker explains that API keys are important but testing can be done without them.";
    }

    try {
        const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`);
        if (!response.ok) return `[Transcript unavailable for video ${videoId}]`;

        const data = await response.json();
        if (data.events) {
            return data.events
                .filter((e: any) => e.segs)
                .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
                .join(' ');
        }
        return `[Transcript parsing failed for video ${videoId}]`;
    } catch (err) {
        console.error(`Transcript fetch error for ${videoId}`, err);
        return `[Transcript fetch failed]`;
    }
}

// Search YouTube API using custom scraper (Keyless)
async function searchYouTube(query: string, maxResults: number = 10) {
    try {
        const videos = await scrapeYouTubeSearch(query, maxResults);
        return videos;
    } catch (e) {
        console.error("YouTube search failed:", e);
        return [];
    }
}

// Golden Ticket: YouTube Analysis Engine
export const analyzeYouTube = inngest.createFunction(
    {
        id: 'youtube-analyze',
        name: 'Golden Ticket YouTube Analysis',
        retries: 2,
    },
    { event: 'youtube/analyze' },
    async ({ event, step }) => {
        const { sessionId, userId, query, maxResults = 10 } = event.data;

        // Step 1: Search YouTube for top videos
        const videos = await step.run('search-youtube', async () => {
            return await searchYouTube(query, maxResults);
        });

        if (videos.length === 0) {
            return {
                sessionId,
                error: 'No videos found for this query',
                winner: null,
            };
        }

        // Step 2: Fetch transcripts
        const videosWithTranscripts = await step.run('fetch-transcripts', async () => {
            const results = await Promise.all(
                videos.map(async (video: any) => {
                    const transcript = await fetchYouTubeTranscript(video.videoId);
                    return {
                        ...video,
                        transcript: transcript.substring(0, 15000),
                        hasTranscript: !transcript.includes('[Transcript'),
                    };
                })
            );
            return results;
        });

        // Step 3: Use AI to rank all videos
        const rankings = await step.run('rank-videos', async () => {
            const videoSummaries = videosWithTranscripts
                .filter((v: any) => v.hasTranscript)
                .map((v: any, i: number) => `
VIDEO ${i + 1}: "${v.title}" by ${v.channelTitle}
Transcript excerpt: ${v.transcript.substring(0, 3000)}
---`).join('\n');

            if (!videoSummaries) {
                return { winner: null, reason: 'No transcripts available' };
            }

            const response = await chat(
                [
                    {
                        role: 'system',
                        content: `You are an expert educational content evaluator. Analyze YouTube videos and rank them based on:
1. INFORMATION DENSITY (0-10)
2. CLARITY (0-10)
3. ACCURACY (0-10)
4. ENGAGEMENT (0-10)

Return ONLY valid JSON.`,
                    },
                    {
                        role: 'user',
                        content: `Compare these videos about "${query}" and determine the SINGLE BEST one.

${videoSummaries}

Return JSON:
{
  "rankings": [
    {
      "videoIndex": 1,
      "scores": { "informationDensity": 8, "clarity": 9, "accuracy": 8, "engagement": 7 },
      "totalScore": 32
    }
  ],
  "winner": {
    "videoIndex": 1,
    "whyItWon": "Detailed explanation",
    "missingFromOthers": ["Topics covered only in winning video"]
  }
}`,
                    },
                ],
                { model: selectModel('context'), maxTokens: 4000 }
            );

            try {
                const content = (response as any).choices[0]?.message?.content || '{}';
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : { winner: null };
            } catch {
                return { winner: null, reason: 'Failed to parse rankings' };
            }
        });

        // Step 4: Prepare the winner result
        const result = await step.run('prepare-result', async () => {
            if (!rankings.winner) {
                return {
                    sessionId,
                    error: rankings.reason || 'Could not determine a winner',
                    winner: null,
                };
            }

            const winnerIndex = rankings.winner.videoIndex - 1;
            const winnerVideo = videosWithTranscripts[winnerIndex];

            // Generate a detailed summary of the winning video
            const summaryResponse = await chat(
                [
                    { role: 'system', content: 'You are an expert at summarizing educational content.' },
                    {
                        role: 'user',
                        content: `Create a comprehensive study summary of this video transcript. Include:
1. Main concepts covered
2. Key takeaways (bullet points)
3. Recommended follow-up topics

Transcript:
${winnerVideo.transcript.substring(0, 10000)}`,
                    },
                ],
                { model: selectModel('context'), maxTokens: 2000 }
            );

            return {
                sessionId,
                userId,
                query,
                winner: {
                    videoId: winnerVideo.videoId,
                    title: winnerVideo.title,
                    channelTitle: winnerVideo.channelTitle,
                    embedUrl: `https://www.youtube.com/embed/${winnerVideo.videoId}`,
                    whyItWon: rankings.winner.whyItWon,
                    missingFromOthers: rankings.winner.missingFromOthers,
                    summary: (summaryResponse as any).choices[0]?.message?.content || '',
                    scores: rankings.rankings?.find(
                        (r: any) => r.videoIndex === rankings.winner.videoIndex
                    )?.scores,
                },
                allRankings: rankings.rankings,
                totalVideosAnalyzed: videosWithTranscripts.length,
            };
        });

        return result;
    }
);
