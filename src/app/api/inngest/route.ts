import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { allFunctions } from '@/inngest/functions';

// Create the Inngest serve handler for Next.js
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: allFunctions,
});
