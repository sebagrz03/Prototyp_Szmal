import { gptJson } from "./openai_client.js";

export async function generatePublishMeta({ niche, scriptText }) {
  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      hashtags: { type: "array", items: { type: "string" } }
    },
    required: ["title", "description"]
  };

  const json = await gptJson({
    system: `You are a professional TikTok growth strategist.
Write viral-ready title, description and hashtags for surreal micro-sketch videos:
- audio-visual memes
- absurd humour
- glitch / simulation vibes
Avoid spam, keep it sharp and clickable.`,
    user: `Niche: ${niche}

Final voiceover script:
${scriptText}

Return title, description and 8–15 concise hashtags (without # sign).`,
    schema
  });

  if (!Array.isArray(json.hashtags)) {
    json.hashtags = ["ai", "tiktok", "microSketch"];
  }
  return json;
}
