import { inngest } from '../client';
import { createServerClient } from '@/lib/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { chat, selectModel, SYSTEM_PROMPTS } from '@/lib/openrouter';
// Force CommonJS require with any cast to avoid TS issues
// eslint-disable-next-line @typescript-eslint/no-require-imports

// POLYFILL: pdf-parse crashes if DOMMatrix is missing (Next.js build environment)
if (typeof global.DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() { return this; }
        translate() { return this; }
        scale() { return this; }
    };
}

const pdf: any = require('pdf-parse');

// Document Processing Function
// Handles: Chunking -> AI Summary -> Knowledge Extraction -> Storage
export const processDocument = inngest.createFunction(
    {
        id: 'process-document',
        name: 'Process Uploaded Document',
        retries: 3,
    },
    { event: 'document/uploaded' },
    async ({ event, step }) => {
        const { documentId, userId, fileUrl, fileName } = event.data;
        const supabase: any = createServerClient();

        // Step 1: Download and extract text from the document
        const textContent = await step.run('extract-text', async () => {
            const response = await fetch(fileUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Check if PDF based on extension
            if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
                try {
                    const data = await pdf(buffer);
                    return data.text;
                } catch (e) {
                    throw new Error(`PDF Parsing failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                }
            } else {
                // Assume text/markdown
                return buffer.toString('utf-8');
            }
        });

        // Step 2: Split into chunks using LangChain
        const chunks = await step.run('split-chunks', async () => {
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 4000,
                chunkOverlap: 200,
                separators: ['\n\n', '\n', '. ', ' ', ''],
            });

            const docs = await splitter.createDocuments([textContent]);
            return docs.map((doc, i) => ({
                content: doc.pageContent,
                index: i,
                metadata: doc.metadata,
            }));
        });

        // Step 3: Store chunks in database
        await step.run('store-chunks', async () => {
            const chunkRecords = chunks.map((chunk) => ({
                document_id: documentId,
                content: chunk.content,
                chunk_index: chunk.index,
                metadata: chunk.metadata,
            }));

            const { error } = await supabase
                .from('document_chunks')
                .insert(chunkRecords as any);

            if (error) throw new Error(`Failed to store chunks: ${error.message}`);
        });

        // Step 4: Generate document summary
        const summary = await step.run('generate-summary', async () => {
            // Take first 3 chunks for summary
            const sampleContent = (chunks as any[]).slice(0, 3).map((c: any) => c.content).join('\n\n');

            const response = await chat(
                [
                    { role: 'system', content: SYSTEM_PROMPTS.DEFAULT },
                    {
                        role: 'user',
                        content: `Generate a comprehensive summary of this document. Include:
1. Main topic and thesis
2. Key concepts covered
3. Important takeaways

Document excerpt:
${sampleContent}`,
                    },
                ],
                { model: selectModel('context'), maxTokens: 2000 }
            );

            return (response as any).choices[0]?.message?.content || 'Summary generation failed';
        });

        // Step 5: Extract knowledge graph
        const knowledgeGraph = await step.run('extract-knowledge', async () => {
            const sampleContent = (chunks as any[]).slice(0, 5).map((c: any) => c.content).join('\n\n');

            const response = await chat(
                [
                    { role: 'system', content: SYSTEM_PROMPTS.KNOWLEDGE_EXTRACTOR },
                    {
                        role: 'user',
                        content: `Extract the knowledge graph from this text:\n\n${sampleContent}`,
                    },
                ],
                { model: selectModel('speed'), maxTokens: 4000 }
            );

            try {
                const content = (response as any).choices[0]?.message?.content || '{}';
                // Extract JSON from response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : { nodes: [], edges: [] };
            } catch {
                return { nodes: [], edges: [] };
            }
        });

        // Step 6: Store knowledge graph
        await step.run('store-knowledge-graph', async () => {
            if (knowledgeGraph.nodes?.length > 0) {
                // Insert nodes
                const nodesWithDocId = knowledgeGraph.nodes.map((node: { id: string; label: string; type: string; description: string }) => ({
                    document_id: documentId,
                    label: node.label,
                    type: node.type,
                    description: node.description,
                }));

                const { data: insertedNodes, error: nodesError } = await supabase
                    .from('knowledge_nodes')
                    .insert(nodesWithDocId as any)
                    .select('id, label');

                if (nodesError) {
                    console.error('Failed to insert nodes:', nodesError);
                    return;
                }

                // Create mapping from original IDs to database IDs
                const idMap = new Map<string, string>();
                (insertedNodes as any[])?.forEach((dbNode, i) => {
                    idMap.set(knowledgeGraph.nodes[i].id, dbNode.id);
                });

                // Insert edges with mapped IDs
                if (knowledgeGraph.edges?.length > 0 && insertedNodes) {
                    const edges = knowledgeGraph.edges
                        .map((edge: { source: string; target: string; relationship: string }) => ({
                            source_id: idMap.get(edge.source),
                            target_id: idMap.get(edge.target),
                            relationship: edge.relationship,
                        }))
                        .filter((e: { source_id: string | undefined; target_id: string | undefined }) => e.source_id && e.target_id);

                    if (edges.length > 0) {
                        await supabase.from('knowledge_edges').insert(edges as any);
                    }
                }
            }
        });

        // Step 7: Update document status to ready
        await step.run('update-status', async () => {
            await supabase
                .from('documents')
                .update({
                    status: 'ready',
                    metadata: {
                        summary,
                        chunkCount: chunks.length,
                        wordCount: textContent.split(/\s+/).length,
                        nodeCount: knowledgeGraph.nodes?.length || 0,
                    },
                } as any)
                .eq('id', documentId);
        });

        return {
            documentId,
            chunkCount: chunks.length,
            summary: summary.substring(0, 200) + '...',
            nodesExtracted: knowledgeGraph.nodes?.length || 0,
        };
    }
);
