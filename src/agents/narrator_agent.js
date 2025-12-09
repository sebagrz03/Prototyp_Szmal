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

const TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";

const VOICES = ["alloy", "nova", "echo", "verse", "shimmer"];

function pickVoiceForScript(scriptText) {
  const lower = (scriptText || "").toLowerCase();

  if (
    lower.includes("glitch") ||
    lower.includes("simulation") ||
    lower.includes("robot") ||
    lower.includes("ai")
  ) {
    return "alloy";
  }

  if (lower.includes("dream") || lower.includes("floating") || lower.includes("portal")) {
    return "shimmer";
  }

  if (lower.includes("office") || lower.includes("meeting") || lower.includes("boss")) {
    return "nova";
  }

  return VOICES[Math.floor(Math.random() * VOICES.length)];
}

export async function generateNarrationForVideo({ scriptText }) {
  if (!scriptText) throw new Error("[NARRATOR] Missing scriptText");

  const voice = pickVoiceForScript(scriptText);
  console.log("[NARRATOR] using voice:", voice);

  const audioDir = path.join(projectRoot, "audio", "narrator");
  fs.mkdirSync(audioDir, { recursive: true });

  const filename = `narration_${Date.now()}.mp3`;
  const filePath = path.join(audioDir, filename);

  const response = await client.audio.speech.create({
    model: TTS_MODEL,
    voice,
    input: scriptText,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  console.log("[NARRATOR] saved mp3 ->", filePath);

  return { filePath, voice, model: TTS_MODEL };
}
