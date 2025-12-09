import { gptText } from "./openai_client.js";

export async function polishScript({ rawScript }) {
  const system = `You are a ruthless short-form editor.
Tighten the script while keeping:
- surreal / glitch / meme humour
- clear story arc
- timing for 15–30 seconds of fast narration.
Rules:
- sentences max 10–12 words when possible
- cut filler words
- keep only lines that directly support the joke or twist.
Output ONLY the improved script text.`;

  const user = `Raw script:
${rawScript}`;

  return gptText({ system, user });
}
