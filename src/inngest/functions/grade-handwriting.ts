import { inngest } from '../client';
import { chat, selectModel, analyzeImage, MODELS } from '@/lib/openrouter';
import { createServerClient } from '@/lib/supabase';

export const gradeHandwriting = inngest.createFunction(
    {
        id: 'grade-handwriting',
        name: 'AI Handwriting Grader',
        retries: 0,
    },
    { event: 'handwriting/grade' },
    async ({ event, step }) => {
        const { documentId, imageUrl, correctAnswer, context } = event.data;

        // Step 1: Vision Analysis (Read Handwriting) with Qwen VL
        const transcription = await step.run('read-handwriting', async () => {
            const response = await analyzeImage(imageUrl, "Transcribe this handwritten text exactly. Return only the text.", {
                model: selectModel('vision')
            });
            return (response as any).choices[0]?.message?.content || '';
        });

        // Step 2: Logic Grading with DeepSeek R1
        const grading = await step.run('grade-logic', async () => {
            const response = await chat([
                {
                    role: 'system',
                    content: `You are a strict academic grader. Analyze the student's work step-by-step for logical errors.`
                },
                {
                    role: 'user',
                    content: `Problem Context: ${context || 'General Math/Physics'}
                    
                    Correct Answer: ${correctAnswer || 'Not provided - judge based on logic.'}
                    
                    Student Work (Transcribed): ${transcription}
                    
                    Grade this. Return JSON only:
                    {
                        "score": 0-100,
                        "feedback": "constructive feedback string",
                        "errors": ["list of specific logical errors found"]
                    }`
                }
            ], {
                model: selectModel('reasoning') // DeepSeek R1
            });

            const content = (response as any).choices[0]?.message?.content;
            try {
                // Sanitize and parse JSON
                const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanContent);
            } catch (e) {
                return { score: 0, feedback: "Failed to parse grading response", errors: [] };
            }
        });

        return grading;
    }
);
