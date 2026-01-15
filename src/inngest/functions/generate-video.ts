import { inngest } from '../client';
import { chat, selectModel } from '@/lib/openrouter';
import { createServerClient } from '@/lib/supabase';

// Hyper-Lecturer: PDF-to-Viral-Video Engine
export const generateVideo = inngest.createFunction(
    {
        id: 'hyper-lecturer-generate',
        name: 'Rapid-Lecturer Video Generation',
        retries: 0, // Heavy compute, fail fast and handle manually
        concurrency: 1, // Limit concurrent video renders
    },
    { event: 'video/generate' },
    async ({ event, step }) => {
        const { documentId, userId, content, style = 'viral' } = event.data;

        // Step 1: Generate a Viral Script
        const script = await step.run('generate-script', async () => {
            const response = await chat([
                {
                    role: 'system',
                    content: `You are a professional video scriptwriter. 
          Your goal is to explain the provided academic concept in exactly 60 seconds.
          
          Style Guide (${style}):
          - Hook: Start with a compelling fact or question.
          - Body: Fast-paced, concise, and information-dense.
          - Visuals: Describe the perfect B-roll or animation for each sentence.
          - Tone: Professional, authoritative, and direct. 
          - CRITICAL: DO NOT use hashtags, emojis, or "buzzwords". Write like a human expert, not an AI.
          
          Return JSON format:
          {
            "segments": [
              {
                "text": "Spoken audio text...",
                "duration": 4.5,
                "visualPrompt": "Photorealistic description of..."
              }
            ],
            "title": "Video Title",
            "description": "Video description"
          }`
                },
                {
                    role: 'user',
                    content: `Create a 60-second video script for this content: ${content.substring(0, 5000)}...`
                }
            ], { model: selectModel('speed') });

            try {
                const content = (response as any).choices[0]?.message?.content || '{}';
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            } catch (e) {
                throw new Error('Failed to parse script JSON');
            }
        });

        if (!script) throw new Error('Script generation failed');

        // Step 2: Generate/Fetch Visuals for each segment
        // In a real app, this would call Replicate/Midjourney or Pexels API
        // For this demo, we'll assign placeholder gradients or colors based on prompts
        const segmentsWithVisuals = await step.run('prepare-visuals', async () => {
            return script.segments.map((seg: any, i: number) => ({
                ...seg,
                // Mock visual asset - in prod, use output from Replicate (Stable Diffusion)
                visualUrl: `https://source.unsplash.com/random/1080x1920?sig=${i}&${encodeURIComponent(seg.visualPrompt.split(' ').slice(0, 2).join(','))}`
            }));
        });

        // Step 3: Verify and Update Database
        // We don't actually render the heavy video on the serverless function in this demo
        // instead we store the "Composition" data which the frontend Remotion player will render live.
        // OR we would trigger a separate heavy render service (like Remotion Lambda).

        // For this "Serverless" architecture, we'll store the script/assets and let the Client render it.
        await step.run('save-composition', async () => {
            const supabase = createServerClient();
            await supabase.from('generated_media').insert({
                document_id: documentId,
                type: 'video',
                url: 'generated-on-client', // Client will render this
                metadata: {
                    style,
                    script: script,
                    segments: segmentsWithVisuals,
                    status: 'ready_to_render'
                }
            } as any); // Cast to any to bypass strict type check on Insert
        });

        return { success: true, script: script, segments: segmentsWithVisuals };
    }
);
