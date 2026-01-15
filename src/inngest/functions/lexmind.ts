import { inngest } from '../client';
import { chat, selectModel, SYSTEM_PROMPTS } from '@/lib/openrouter';

export const runLexMind = inngest.createFunction(
    {
        id: 'lexmind-run',
        name: 'Lex-Mind Legal Analyst',
        retries: 0,
    },
    { event: 'lexmind/run' },
    async ({ event, step }) => {
        const { documentId, mode, input, context } = event.data;
        // mode: 'brief' | 'argue' | 'cite'

        const analysis = await step.run('legal-analysis', async () => {
            let userPrompt = input;
            if (mode === 'brief') {
                userPrompt = `Generate a comprehensive Case Brief for this text:\n\n${input}`;
            } else if (mode === 'argue') {
                userPrompt = `Here is my legal argument:\n"${input}"\n\nCounter this argument aggressively as Opposing Counsel. Focus on weak points in my chain of custody or causation.`;
            }

            const response = await chat([
                { role: 'system', content: SYSTEM_PROMPTS.LEX_MIND },
                { role: 'user', content: userPrompt }
            ] as any, {
                model: selectModel('reasoning'), // DeepSeek R1 for logic
                temperature: 0.3 // Lower temp for precision
            });

            return (response as any).choices[0]?.message?.content || 'Counsel is silent.';
        });

        return { result: analysis };
    }
);
