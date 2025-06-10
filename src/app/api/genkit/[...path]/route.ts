import { genkitNextJSHandler } from '@genkit-ai/next';
import '@/ai/dev'; // Ensure flows are registered

export const POST = genkitNextJSHandler();
