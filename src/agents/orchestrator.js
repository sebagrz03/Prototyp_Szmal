import { fetchLiveOrAiTrends } from "./trend_agent.js";
import { generateStory } from "./story_agent.js";
import { buildScenePlan } from "./scene_director_agent.js";
import { buildSoraPromptForScene } from "./prompt_engineer_agent.js";
import { generateScriptFromScenes } from "./script_agent.js";
import { polishScript } from "./editor_agent.js";
import { generateSoraClip } from "../video/sora_client.js";
import { mergeVideoClips, mergeVideoWithNarration } from "./video_edit_agent.js";
import { generateNarrationForVideo } from "./narrator_agent.js";
import { pickRandomSfx } from "./sfx_agent.js";
import { generatePublishMeta } from "./publish_meta_agent.js";
import { uploadVideoDraftToTikTok } from "./tiktok_agent.js";

function planSegments(minSec, maxSec) {
  const target = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
  const segments = [];
  let remaining = target;

  while (remaining > 0) {
    let seg;
    if (remaining > 20) seg = 12;
    else if (remaining > 10) seg = 8;
    else if (remaining >= 4) seg = 4;
    else break;

    segments.push(seg);
    remaining -= seg;
  }

  const total = segments.reduce((a, b) => a + b, 0);
  return { segments, total };
}

export async function runAutopublishOnce({ niche }) {
  const minSec = Number(process.env.VIDEO_TARGET_MIN_SECONDS || 15);
  const maxSec = Number(process.env.VIDEO_TARGET_MAX_SECONDS || 30);

  console.log("[ORCH] 1) trends");
  const trends = await fetchLiveOrAiTrends({ niche });
  const chosenTrend = trends[0] || { title: "Glitch in the office", hook: "NPC coworker breaks reality" };

  console.log("[ORCH] 2) story");
  const storyOutline = await generateStory({ niche, trend: chosenTrend });

  console.log("[ORCH] 3) scene plan");
  const { segments, total } = planSegments(minSec, maxSec);
  const approxSeconds = total || Math.max(minSec, 20);
  const scenePlan = await buildScenePlan({ storyOutline, targetSeconds: approxSeconds });

  console.log("[ORCH] 4) Sora clips");
  const soraClips = [];
  for (const scene of scenePlan.scenes || []) {
    const soraPrompt = buildSoraPromptForScene(scene, null);
    const segDuration = segments[Math.min(scene.id - 1, segments.length - 1)] || 8;
    const clip = await generateSoraClip({
      promptText: soraPrompt,
      seconds: segDuration,
    });
    soraClips.push(clip.filePath);
  }

  console.log("[ORCH] 5) merge video + glitch FX");
  const mergedVideoPath = await mergeVideoClips(soraClips, { applyGlitchFx: true });

  console.log("[ORCH] 6) script");
  const rawScript = await generateScriptFromScenes({ niche, scenePlan });
  const finalScript = await polishScript({ rawScript });

  console.log("[ORCH] 7) narration after video");
  const narration = await generateNarrationForVideo({ scriptText: finalScript });

  console.log("[ORCH] 8) optional SFX");
  const sfxPath = pickRandomSfx();

  console.log("[ORCH] 9) final merge video + audio");
  const finalVideoPath = await mergeVideoWithNarration({
    videoPath: mergedVideoPath,
    audioPath: narration.filePath,
    sfxPath,
  });

  console.log("[ORCH] 10) meta");
  const meta = await generatePublishMeta({ niche, scriptText: finalScript });

  console.log("[ORCH] 11) optional TikTok upload");
  let tiktokUpload = { ok: false, reason: "not_configured" };
  if (process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_OPEN_ID) {
    try {
      tiktokUpload = await uploadVideoDraftToTikTok({
        accessToken: process.env.TIKTOK_ACCESS_TOKEN,
        openId: process.env.TIKTOK_OPEN_ID,
        videoPath: finalVideoPath,
      });
    } catch (err) {
      console.error("[ORCH] TikTok upload error", err);
      tiktokUpload = { ok: false, reason: "upload_error", error: String(err.message || err) };
    }
  }

  return {
    finalVideoPath,
    narration,
    meta,
    tiktokUpload,
    debug: {
      chosenTrend,
      storyOutline,
      approxSeconds,
      soraSegments: segments,
      sceneCount: (scenePlan.scenes || []).length,
    },
  };
}
