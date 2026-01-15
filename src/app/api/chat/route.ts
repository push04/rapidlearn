import { NextRequest } from 'next/server';
import { streamChat, selectModel, SYSTEM_PROMPTS } from '@/lib/openrouter';

export const runtime = 'edge'; // Use edge runtime for lower latency

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages, mode = 'default', documentContext } = body;

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages array required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Select system prompt based on mode
        const systemPrompts: Record<string, string> = {
            default: SYSTEM_PROMPTS.DEFAULT,
            feynman: SYSTEM_PROMPTS.FEYNMAN,
            debate: SYSTEM_PROMPTS.DEBATE_ADVERSARY,
            ghost_nerd: SYSTEM_PROMPTS.GHOST_NERD,
            ghost_slacker: SYSTEM_PROMPTS.GHOST_SLACKER,
            ghost_curious: SYSTEM_PROMPTS.GHOST_CURIOUS,
        };

        const systemPrompt = systemPrompts[mode] || SYSTEM_PROMPTS.DEFAULT;

        // Build messages array with system prompt and context
        const fullMessages = [
            { role: 'system' as const, content: systemPrompt },
        ];

        // Add document context if provided
        if (documentContext) {
            fullMessages.push({
                role: 'system' as const,
                content: `Here is the relevant document content for reference:\n\n${documentContext}`,
            });
        }

        // Add user/assistant message history
        fullMessages.push(...messages);

        // Create streaming response
        // Determine model based on mode
        let model = selectModel('context');
        if (mode === 'debate') model = selectModel('reasoning');
        if (mode.startsWith('ghost_')) model = selectModel('roleplay');

        const stream = await streamChat(fullMessages, {
            model,
            temperature: mode === 'feynman' ? 0.8 : 0.7,
            maxTokens: 4096,
        });

        // Create a readable stream for the response
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content || '';
                        if (text) {
                            // SSE format
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process chat request' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
