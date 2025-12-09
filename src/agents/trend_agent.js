import fetch from "node-fetch";
import { gptJson } from "./openai_client.js";

const LIVE_PROVIDER = process.env.TRENDS_PROVIDER_URL || "";

async function fetchExternalTrends(niche) {
  if (!LIVE_PROVIDER) return null;
  const url = LIVE_PROVIDER.replace(/\/$/, "") + "/trends?niche=" + encodeURIComponent(niche);
  const resp = await fetch(url);
  if (!resp.ok) {
    console.warn("[TREND] external provider error:", resp.status);
    return null;
  }
  const data = await resp.json().catch(() => null);
  if (!data || !Array.isArray(data.trends)) return null;
  return data.trends;
}

export async function fetchLiveOrAiTrends({ niche }) {
  const external = await fetchExternalTrends(niche).catch(() => null);
  if (external && external.length) return external;

  const schema = {
    type: "object",
    properties: {
      trends: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            hook: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
            vibe: { type: "string" }
          },
          required: ["title", "hook"]
        }
      }
    },
    required: ["trends"]
  };

  const json = await gptJson({
    system: `You are a TikTok trend analyst.
You generate highly clickable ideas for surreal, glitchy micro-sketch videos (15–30s) in the niche: ${niche}.
Each trend should feel like a cross between meme, absurd comedy and AI art.`,
    user: "Return 5 trend ideas with title, hook, vibe and suggested hashtags.",
    schema
  });

  return json.trends || [];
}
