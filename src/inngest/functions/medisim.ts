import { inngest } from '../client';
import { chat, selectModel, SYSTEM_PROMPTS } from '@/lib/openrouter';
import { createServerClient } from '@/lib/supabase';

export const runMediSim = inngest.createFunction(
    {
        id: 'medisim-run',
        name: 'Medi-Sim Virtual Patient',
        retries: 0,
    },
    { event: 'medisim/run' },
    async ({ event, step }) => {
        const { documentId, history, action } = event.data;

        // Step 1: Process User Action & Generate Response
        const simulationResponse = await step.run('simulate-patient', async () => {
            const messages = [
                { role: 'system', content: SYSTEM_PROMPTS.MEDI_SIM },
                ...history,
                { role: 'user', content: action }
            ];

            const response = await chat(messages as any, {
                model: selectModel('roleplay'), // DeepSeek R1 for persona adherence
                temperature: 0.7
            });

            return (response as any).choices[0]?.message?.content || '...';
        });

        // Step 2: (Optional) Analyze Clinical Reasoning if session ends
        if (action.includes('DIAGNOSIS:') || action.includes('FINISH_CASE')) {
            await step.run('grade-performance', async () => {
                // Logic to grade the student's diagnosis against the "Ground Truth" of the generated case
                // Use Reasoning Engine for grading
                const gradingResponse = await chat([
                    { role: 'system', content: 'You are a Senior Attending Physician. Grade the student diagnosis.' },
                    ...history,
                    { role: 'user', content: action }
                ], { model: selectModel('reasoning') });

                return (gradingResponse as any).choices[0]?.message?.content;
            });
        }

        return { response: simulationResponse };
    }
);
