import * as cheerio from 'cheerio';

// Interfaces
export interface VideoResult {
    videoId: string;
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnail: string;
}

export interface SearchResult {
    title: string;
    url: string;
    content: string;
}

/**
 * Scrape YouTube Search Results (Keyless, Free)
 */
export async function scrapeYouTubeSearch(query: string, maxResults: number = 10): Promise<VideoResult[]> {
    try {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract ytInitialData
        let ytInitialData: any = null;
        $('script').each((_, script) => {
            const content = $(script).html() || '';
            if (content.includes('var ytInitialData =')) {
                const jsonStr = content.split('var ytInitialData =')[1].split(';')[0];
                try {
                    ytInitialData = JSON.parse(jsonStr);
                } catch (e) {
                    console.error('Failed to parse ytInitialData');
                }
            }
        });

        if (!ytInitialData) return [];

        // Traverse JSON to find videos
        const contents = ytInitialData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        if (!contents) return [];

        const videos: VideoResult[] = [];

        contents.forEach((section: any) => {
            const items = section.itemSectionRenderer?.contents;
            if (items) {
                items.forEach((item: any) => {
                    if (item.videoRenderer) {
                        const v = item.videoRenderer;
                        const videoId = v.videoId;
                        const title = v.title?.runs?.[0]?.text || "Unknown Title";
                        const description = v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join('') || v.descriptionSnippet?.runs?.map((r: any) => r.text).join('') || "";
                        const channelTitle = v.ownerText?.runs?.[0]?.text || "Unknown";
                        const publishedAt = v.publishedTimeText?.simpleText || "";
                        const thumbnail = v.thumbnail?.thumbnails?.[0]?.url || "";

                        videos.push({
                            videoId,
                            title,
                            description,
                            channelTitle,
                            publishedAt,
                            thumbnail
                        });
                    }
                });
            }
        });

        return videos.slice(0, maxResults);

    } catch (error) {
        console.error('Scrape YouTube Error:', error);
        return [];
    }
}

/**
 * Scrape DuckDuckGo HTML (Keyless, Free)
 */
export async function scrapeDuckDuckGo(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const results: SearchResult[] = [];

        $('.result').each((i, element) => {
            if (i >= maxResults) return false;

            const title = $(element).find('.result__a').text().trim();
            const url = $(element).find('.result__a').attr('href') || '';
            const content = $(element).find('.result__snippet').text().trim();

            if (title && url) {
                results.push({ title, url, content });
            }
        });

        return results;

    } catch (error) {
        console.error('Scrape DDG Error:', error);
        return [];
    }
}
