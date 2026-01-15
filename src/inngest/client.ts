import { Inngest, EventSchemas } from 'inngest';

// Event types for type safety
export interface HyperMindEvents {
    // Document Processing
    'document/uploaded': {
        data: {
            documentId: string;
            userId: string;
            fileUrl: string;
            fileName: string;
        };
    };
    'document/process-chunk': {
        data: {
            documentId: string;
            chunkIndex: number;
            content: string;
        };
    };

    // YouTube Analysis (Golden Ticket)
    'youtube/analyze': {
        data: {
            sessionId: string;
            userId: string;
            query: string;
            maxResults?: number;
        };
    };

    // Video Generation (Hyper-Lecturer)
    'video/generate': {
        data: {
            documentId: string;
            userId: string;
            content: string;
            style?: 'viral' | 'educational' | 'cinematic';
        };
    };

    // Podcast Generation (Deep Dive)
    'podcast/generate': {
        data: {
            documentId: string;
            userId: string;
            content: string;
            duration?: number; // in seconds
        };
    };

    // Quiz Generation (Dungeon Master)
    'quiz/generate-batch': {
        data: {
            sessionId: string;
            documentId: string;
            difficulty: 'easy' | 'medium' | 'hard';
            count: number;
        };
    };

    // Knowledge Graph Extraction
    'knowledge/extract': {
        data: {
            documentId: string;
            content: string;
        };
    };

    // Handwriting Analysis
    'handwriting/analyze': {
        data: {
            sessionId: string;
            userId: string;
            imageBase64: string;
        };
    };

    // Exam Prediction
    'exam/predict': {
        data: {
            userId: string;
            documentIds: string[]; // Past exam papers
        };
    };

    // Sleep Learning Audio
    'audio/sleep-learning': {
        data: {
            documentId: string;
            userId: string;
            keywords: string[];
        };
    };
}

// Create the Inngest client
export const inngest = new Inngest({
    id: 'hyper-mind',
    name: 'Hyper Mind',
});

// Helper to send events with type safety (manually enforced)
export const sendEvent = <K extends keyof HyperMindEvents>(
    eventName: K,
    data: HyperMindEvents[K]['data']
) => {
    return inngest.send({
        name: eventName,
        data,
    });
};
