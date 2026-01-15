import { inngest } from '../client';
import { chat, selectModel } from '@/lib/openrouter';
import { createServerClient } from '@/lib/supabase';

export const predictExam = inngest.createFunction(
    {
        id: 'exam-predict',
        name: 'Predictive Exam Simulator',
        retries: 2,
    },
    { event: 'exam/predict' },
    async ({ event, step }) => {
        const { documentId, examDate, subject } = event.data;

        // Step 1: Analyze Document Content for Key Topics
        const topics = await step.run('extract-topics', async () => {
            const supabase = createServerClient();
            // Fetch random chunks to sample content
            const { data } = await supabase.from('document_chunks')
                .select('content')
                .eq('document_id', documentId)
                .limit(5);

            const contentSample = (data as any)?.map((d: any) => d.content).join('\n') || '';

            const response = await chat([
                {
                    role: 'system',
                    content: 'Extract the top 5 most likely exam topics from this text. Return as JSON array of strings.'
                },
                {
                    role: 'user',
                    content: contentSample.substring(0, 5000)
                }
            ], { model: selectModel('context') });

            try {
                const text = (response as any).choices[0]?.message?.content;
                const match = text.match(/\[[\s\S]*\]/); // Use [\s\S]* instead of s flag
                return match ? JSON.parse(match[0]) : ['General Knowledge'];
            } catch {
                return ['Core Concepts'];
            }
        });

        // Step 2: Monte Carlo Simulation (Mock)
        // In a real app, this would use historic exam data + current trends
        const prediction = await step.run('run-simulation', async () => {
            return {
                probableTopics: topics.map((t: string) => ({
                    topic: t,
                    probability: Math.floor(Math.random() * 40) + 60 // 60-100%
                })).sort((a: any, b: any) => b.probability - a.probability),
                predictedQuestions: [
                    `Explain the significance of ${topics[0]} in modern contexts.`,
                    `Compare and contrast ${topics[1]} with ${topics[2] || 'traditional methods'}.`,
                    `Solve for X given the constraints of ${topics[0]}.`
                ],
                confidenceScore: 89
            };
        });

        return prediction;
    }
);
