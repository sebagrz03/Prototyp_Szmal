import { gptText } from "./openai_client.js";

export async function generateScriptFromScenes({ niche, scenePlan }) {
  const system = `You are a professional TikTok scriptwriter.
You write English voiceover scripts for 15–30s surreal micro-sketch videos.
Style:
- very strong 1-second hook
- simple, short sentences
- blend meme logic, absurdity and "glitch in the matrix" vibes
- end on a sharp punchline or weird twist.
Audience scrolls fast – everything must be instantly clear and funny.`;

  const user = `Niche: ${niche}

Scene plan (video only):
${JSON.stringify(scenePlan, null, 2)}

Task:
Write ONE continuous voiceover text that:
- fits into ~15–30 seconds
- aligns with the scene order
- includes pauses where scenes cut (mark pauses with "...").
Return ONLY the script text.`;

  return gptText({ system, user });
}
