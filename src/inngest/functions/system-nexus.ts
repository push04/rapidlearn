import { inngest } from '../client';
import { chat, selectModel } from '@/lib/openrouter';

export const generateSystemArchitecture = inngest.createFunction(
    {
        id: 'system-arch-gen',
        name: 'System-Nexus Architect',
        retries: 0,
    },
    { event: 'system/generate' },
    async ({ event, step }) => {
        const { requirements, constraints } = event.data;

        // Step 1: Generate Architecture
        const architecture = await step.run('generate-architecture', async () => {
            // Prompt for the AI
            const prompt = `
            Design a robust system architecture for: "${requirements}".
            
            Constraints: "${constraints || 'None'}"
            
            Focus on scalability, fault tolerance, and modern best practices (Microservices vs Monolith).
            
            Output JSON format:
            {
              "diagram": "MERMAID_CODE_HERE",
              "stack": [
                { "component": "Frontend", "tech": "React", "reason": "..." },
                { "component": "DB", "tech": "Postgres", "reason": "..." }
              ],
              "analysis": "Brief trade-off analysis...",
              "chaosScenario": "Describe a failure mode and mitigation..."
            }`;

            const response = await chat([
                {
                    role: 'system',
                    content: 'You are a Senior Principal Software Architect. Return valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ], {
                model: selectModel('reasoning') // DeepSeek R1 for architectural logic
            });

            try {
                const text = (response as any).choices[0]?.message?.content || '{}';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            } catch (e) {
                return { error: 'Failed to parse architecture JSON', raw: (response as any).choices[0]?.message?.content };
            }
        });

        return architecture;
    }
);
