import { gptText } from "./openai_client.js";

export async function generateStory({ niche, trend }) {
  const system = `You are a senior writer for TikTok AI micro-sketches.
You create strange, surreal mini-stories that feel like audiovisual memes:
- absurd characters
- weird logic
- glitch-in-the-matrix moments
- punchy, short scenes
Story must fit into 15–30 seconds and work without showing the creator's face.`;

  const user = `Niche: ${niche}
Trend seed:
${JSON.stringify(trend, null, 2)}

Write a compact story outline (max 120 words) with:
- situation
- main character(s)
- bizarre twist at the end.`;

  return gptText({ system, user });
}
