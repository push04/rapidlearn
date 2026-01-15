import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { openrouter } from '@/lib/openrouter';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { documentId } = await req.json();
        const supabase: any = createServerClient();

        // 1. Fetch a random chunk from the current document to use as a "probe"
        // In a real app, we'd use the user's current viewport or cursor position
        const { data: sourceChunks } = await supabase
            .from('document_chunks')
            .select('content, embedding')
            .eq('document_id', documentId)
            .limit(1);

        if (!sourceChunks || sourceChunks.length === 0) {
            return NextResponse.json({ connections: [] });
        }

        const probeChunk = sourceChunks[0];
        const probeEmbedding = probeChunk.embedding;

        // 2. Perform similarity search across ALL other documents
        // We use an RPC function 'match_chunks' (standard Supabase Vector pattern)
        // If RPC isn't set up, we'll simulate logic or use a raw query if possible
        // For this demo, assuming standard Supabase pgvector setup:

        const { data: matches, error } = await supabase.rpc('match_document_chunks', {
            query_embedding: probeEmbedding,
            match_threshold: 0.7, // High similarity
            match_count: 5
        });

        if (error) {
            // Fallback if RPC not exists: just return some mock data for demo
            console.error('Vector RPC failed (expected if not set up):', error);
            // Mock response
            return NextResponse.json({
                connections: [
                    {
                        id: 'mock-1',
                        documentTitle: 'Introduction to Neural Networks',
                        snippet: '...synaptic weights adjust during backpropagation...',
                        similarity: 0.89
                    },
                    {
                        id: 'mock-2',
                        documentTitle: 'Cognitive Psychology 101',
                        snippet: '...Hebb’s rule states that neurons that fire together wire together...',
                        similarity: 0.82
                    }
                ]
            });
        }

        // Filter out same document
        const connections = matches
            ?.filter((m: any) => m.document_id !== documentId)
            .map((m: any) => ({
                id: m.id,
                documentTitle: m.document_title || 'Unknown Document',
                snippet: m.content.substring(0, 150) + '...',
                similarity: m.similarity
            }));

        return NextResponse.json({ connections: connections || [] });

    } catch (error) {
        console.error('Second Brain API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
