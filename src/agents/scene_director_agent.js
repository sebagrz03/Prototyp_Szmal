import { gptJson } from "./openai_client.js";

export async function buildScenePlan({ storyOutline, targetSeconds }) {
  const schema = {
    type: "object",
    properties: {
      total_seconds: { type: "number" },
      scenes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            label: { type: "string" },
            duration_seconds: { type: "number" },
            video_prompt: { type: "string" },
            voiceover_text: { type: "string" },
            fx: { type: "string" }
          },
          required: ["id", "duration_seconds", "video_prompt", "voiceover_text"]
        }
      }
    },
    required: ["scenes"]
  };

  const json = await gptJson({
    system: `You are a cinematic director for AI video model Sora.
Split the surreal micro-sketch into 3–6 very short scenes.
Each scene:
- has a clear camera view
- is visually memorable
- uses glitch / surreal elements tastefully
- contributes to a 15–30 second total duration.
Optimise for TikTok pacing.`,
    user: `Story outline:
${storyOutline}

Target total duration (approx): ${targetSeconds} seconds.
Return scenes with duration_seconds and both video_prompt and voiceover_text for each scene.`,
    schema
  });

  return json;
}
