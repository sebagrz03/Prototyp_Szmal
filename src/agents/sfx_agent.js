import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..", "..");

export function pickRandomSfx() {
  const sfxDir = path.join(projectRoot, "assets", "sfx");
  if (!fs.existsSync(sfxDir)) return null;

  const files = fs.readdirSync(sfxDir).filter((f) => f.toLowerCase().endsWith(".mp3"));
  if (!files.length) return null;

  const chosen = files[Math.floor(Math.random() * files.length)];
  return path.join(sfxDir, chosen);
}
