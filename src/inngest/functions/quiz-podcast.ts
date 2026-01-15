import { inngest } from '../client';
import { chat, selectModel, SYSTEM_PROMPTS } from '@/lib/openrouter';
import { createServerClient } from '@/lib/supabase';

// Generate Quiz Questions (Dungeon Master)
export const generateQuizBatch = inngest.createFunction(
    {
        id: 'quiz-generate-batch',
        name: 'Dungeon Master Quiz Generator',
        retries: 2,
    },
    { event: 'quiz/generate-batch' },
    async ({ event, step }) => {
        const { sessionId, documentId, difficulty, count } = event.data;
        const supabase: any = createServerClient();

        // Step 1: Fetch document chunks
        const content = await step.run('fetch-content', async () => {
            const { data: chunks, error } = await supabase
                .from('document_chunks')
                .select('content')
                .eq('document_id', documentId)
                .order('chunk_index')
                .limit(10);

            if (error) throw new Error(`Failed to fetch chunks: ${error.message}`);
            // Force cast to expected type
            return (chunks as any[] | null)?.map((c: any) => c.content).join('\n\n') || '';
        });

        // Step 2: Generate quiz questions
        const questions = await step.run('generate-questions', async () => {
            const difficultyInstructions: Record<string, string> = {
                easy: 'Create straightforward questions testing basic recall and understanding.',
                medium: 'Create questions that require application and analysis of concepts.',
                hard: 'Create challenging questions that require synthesis and evaluation. Include edge cases and nuanced scenarios.',
            };

            const response = await chat(
                [
                    { role: 'system', content: SYSTEM_PROMPTS.QUIZ_MASTER },
                    {
                        role: 'user',
                        content: `Generate exactly ${count} ${difficulty} quiz questions based on this content.

${difficultyInstructions[difficulty as string] || difficultyInstructions.medium}

Content:
${content.substring(0, 12000)}

Return a JSON array of questions:
[
  {
    "question": "...",
    "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
    "correct": "A",
    "explanation": "...",
    "difficulty": "${difficulty}"
  }
]`,
                    },
                ],
                { model: selectModel('speed'), maxTokens: 4000 }
            );

            try {
                const content = (response as any).choices[0]?.message?.content || '[]';
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
            } catch {
                return [];
            }
        });

        return {
            sessionId,
            documentId,
            difficulty,
            questions,
            count: questions.length,
        };
    }
);

// Podcast Generation (Deep Dive)
export const generatePodcast = inngest.createFunction(
    {
        id: 'podcast-generate',
        name: 'Deep Dive Podcast Generator',
        retries: 2,
    },
    { event: 'podcast/generate' },
    async ({ event, step }) => {
        const { documentId, userId, content, duration = 180 } = event.data;
        const supabase: any = createServerClient();

        // Step 1: Generate podcast script with two hosts
        const script = await step.run('generate-script', async () => {
            const targetWords = Math.round(duration * 2.5); // ~150 words per minute, 2 hosts

            const response = await chat(
                [
                    {
                        role: 'system',
                        content: `You are a professional podcast script writer. Create realistic, conversational scripts for a two-host educational podcast. 
Host A (Alex) is curious and asks clarifying questions.
Host B (Jordan) provides deep insights and examples.
Make it feel natural - include brief pauses, "hmm"s, and building on each other's points. Do NOT use buzzwords, emojis, or exaggerated enthusiasm.`,
                    },
                    {
                        role: 'user',
                        content: `Create a ${Math.round(duration / 60)}-minute podcast script (~${targetWords} words) discussing this content:

${content.substring(0, 10000)}

Format:
ALEX: [dialogue]
JORDAN: [dialogue]
...

Include:
- An engaging intro hook
- Main discussion points
- Real-world examples
- A memorable conclusion`,
                    },
                ],
                { model: selectModel('roleplay'), maxTokens: 6000 }
            );

            return (response as any).choices[0]?.message?.content || '';
        });

        // Step 2: Parse script into segments
        const segments = await step.run('parse-script', async () => {
            const lines = script.split('\n').filter((line: string) => line.trim());
            const parsed: Array<{ speaker: 'alex' | 'jordan'; text: string }> = [];

            for (const line of lines) {
                if (line.startsWith('ALEX:')) {
                    parsed.push({ speaker: 'alex', text: line.replace('ALEX:', '').trim() });
                } else if (line.startsWith('JORDAN:')) {
                    parsed.push({ speaker: 'jordan', text: line.replace('JORDAN:', '').trim() });
                }
            }

            return parsed;
        });

        // Step 3: Store podcast data
        const podcastData = await step.run('store-podcast', async () => {
            const { data, error } = await (supabase
                .from('generated_media')
                .insert({
                    document_id: documentId,
                    type: 'podcast',
                    url: '',
                    metadata: {
                        script,
                        segments,
                        duration,
                        generatedAt: new Date().toISOString(),
                    },
                } as any) as any) // Double cast to force it through
                .select()
                .single();

            if (error) throw new Error(`Failed to store podcast: ${error.message}`);
            return data;
        });

        return {
            documentId,
            userId,
            podcastId: podcastData.id,
            script,
            segments,
            segmentCount: segments.length,
            estimatedDuration: duration,
        };
    }
);

// Knowledge Graph Extraction
export const extractKnowledge = inngest.createFunction(
    {
        id: 'knowledge-extract',
        name: 'Knowledge Graph Extractor',
        retries: 2,
    },
    { event: 'knowledge/extract' },
    async ({ event, step }) => {
        const { documentId, content } = event.data;
        const supabase: any = createServerClient();

        // Extract entities and relationships
        const knowledgeGraph = await step.run('extract-graph', async () => {
            const response = await chat(
                [
                    { role: 'system', content: SYSTEM_PROMPTS.KNOWLEDGE_EXTRACTOR },
                    {
                        role: 'user',
                        content: `Extract a comprehensive knowledge graph from this text. Focus on:
- Key concepts and their definitions
- People and their contributions
- Events and their causes/effects
- Formulas and their applications
- Relationships between all entities

Text:
${content.substring(0, 15000)}`,
                    },
                ],
                { model: selectModel('speed'), maxTokens: 6000 }
            );

            try {
                const responseContent = (response as any).choices[0]?.message?.content || '{}';
                const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : { nodes: [], edges: [] };
            } catch {
                return { nodes: [], edges: [] };
            }
        });

        // Store nodes
        const storedNodes = await step.run('store-nodes', async () => {
            if (!knowledgeGraph.nodes?.length) return [];

            const nodes = knowledgeGraph.nodes.map((node: { label: string; type: string; description: string }) => ({
                document_id: documentId,
                label: node.label,
                type: node.type || 'concept',
                description: node.description || '',
            }));

            const { data, error } = await supabase
                .from('knowledge_nodes')
                .insert(nodes as any)
                .select();

            if (error) throw new Error(`Failed to store nodes: ${error.message}`);
            return data || [];
        });

        // Store edges
        await step.run('store-edges', async () => {
            if (!knowledgeGraph.edges?.length || !storedNodes.length) return;

            // Create ID mapping
            const idMap = new Map<string, string>();
            (storedNodes as any[]).forEach((node: { id: string; label: string }, i: number) => {
                if (knowledgeGraph.nodes[i]) {
                    idMap.set(knowledgeGraph.nodes[i].id, node.id);
                }
            });

            const edges = knowledgeGraph.edges
                .map((edge: { source: string; target: string; relationship: string }) => ({
                    source_id: idMap.get(edge.source),
                    target_id: idMap.get(edge.target),
                    relationship: edge.relationship,
                }))
                .filter((e: { source_id?: string; target_id?: string }) => e.source_id && e.target_id);

            if (edges.length > 0) {
                await supabase.from('knowledge_edges').insert(edges as any);
            }
        });

        return {
            documentId,
            nodesCreated: storedNodes.length,
            edgesCreated: knowledgeGraph.edges?.length || 0,
        };
    }
);
