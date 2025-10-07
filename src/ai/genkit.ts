import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// WARNING: Hardcoding API keys is not a safe practice.
// This is a temporary solution for testing purposes.
// Remember to replace this with a secure method like environment variables.
const GEMINI_API_KEY = "AIzaSyCUds8QTweaOb5ioY0G3nRIhzVqhwelmgg";

export const ai = genkit({
  plugins: [googleAI({apiKey: GEMINI_API_KEY})],
  model: 'googleai/gemini-2.5-flash',
});
