import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..", "..");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SORA_MODEL = process.env.OPENAI_MODEL_SORA || "sora-2";
const VIDEO_SIZE = process.env.VIDEO_SIZE || "720x1280";

export async function generateSoraClip({ promptText, seconds = 8 }) {
  if (!promptText) throw new Error("Missing promptText");

  const sec = [4, 8, 12].includes(Number(seconds)) ? String(seconds) : "8";

  console.log("[SORA] create clip", { sec, size: VIDEO_SIZE });

  const job = await client.videos.create({
    model: SORA_MODEL,
    prompt: promptText,
    seconds: sec,
    size: VIDEO_SIZE,
  });

  let videoJob = job;
  let tries = 0;
  while (videoJob.status !== "completed" && videoJob.status !== "failed" && tries < 60) {
    await new Promise((r) => setTimeout(r, 5000));
    videoJob = await client.videos.retrieve(videoJob.id);
    console.log("[SORA] status", videoJob.status, "progress", videoJob.progress);
    tries++;
  }

  if (videoJob.status !== "completed") {
    throw new Error(`Sora job failed: ${videoJob.status}`);
  }

  const response = await client.videos.downloadContent(videoJob.id);
  const buffer = Buffer.from(await response.arrayBuffer());

  const outDir = path.join(projectRoot, "videos", "raw");
  fs.mkdirSync(outDir, { recursive: true });

  const filename = `sora_clip_${Date.now()}_${sec}s.mp4`;
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, buffer);

  return { filePath, seconds: Number(sec), size: VIDEO_SIZE };
}

export async function generateSoraTestClip({ promptText }) {
  return generateSoraClip({ promptText, seconds: 8 });
}
