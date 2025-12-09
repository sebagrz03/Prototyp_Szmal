import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runFfmpeg } from "../utils/ffmpeg.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..", "..");

export async function mergeVideoClips(clips, { applyGlitchFx = true } = {}) {
  if (!clips || !clips.length) throw new Error("No clips to merge");

  const tmpDir = path.join(projectRoot, "videos", "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });

  const listFile = path.join(tmpDir, `clips_${Date.now()}.txt`);
  const listContent = clips.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join("\n");
  fs.writeFileSync(listFile, listContent);

  const outDir = path.join(projectRoot, "videos", "merged");
  fs.mkdirSync(outDir, { recursive: true });
  const mergedPath = path.join(outDir, `merged_${Date.now()}.mp4`);

  const baseArgs = [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", listFile,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "18"
  ];

  let filterComplex;
  if (applyGlitchFx) {
    filterComplex =
      "format=yuv420p,scale=720:1280:flags=lanczos," +
      "eq=contrast=1.1:saturation=1.15," +
      "unsharp=5:5:0.8:3:3:0.4," +
      "noise=alls=5:allf=t," +
      "lutrgb=r='r(negval)':g='g(negval)':b='b(negval)':enable='lte(mod(t,0.7),0.05)'," +
      "vflip=enable='lte(mod(t,3),0.03)'," +
      "hflip=enable='lte(mod(t,4),0.03)'";
  } else {
    filterComplex = "format=yuv420p,scale=720:1280:flags=lanczos";
  }

  const args = [
    ...baseArgs,
    "-vf", filterComplex,
    "-c:a", "copy",
    mergedPath
  ];

  await runFfmpeg(args);
  console.log("[FFMPEG] merged + FX ->", mergedPath);
  return mergedPath;
}

export async function mergeVideoWithNarration({ videoPath, audioPath, sfxPath = null }) {
  const outDir = path.join(projectRoot, "videos", "final");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `final_${Date.now()}.mp4`);

  const inputs = ["-y", "-i", videoPath, "-i", audioPath];
  let filterComplex = "";
  let mapArgs = ["-map", "0:v:0", "-map", "1:a:0"];

  if (sfxPath) {
    inputs.push("-i", sfxPath);
    filterComplex =
      "[1:a]volume=1.0[a1];[2:a]volume=0.45[a2];" +
      "[a1][a2]amix=inputs=2:duration=shortest, aformat=channel_layouts=stereo[am]";
    mapArgs = ["-map", "0:v:0", "-map", "[am]"];
  }

  const args = [
    ...inputs,
    ...(filterComplex ? ["-filter_complex", filterComplex] : []),
    ...mapArgs,
    "-c:v", "copy",
    "-c:a", "aac",
    "-shortest",
    outPath
  ];

  await runFfmpeg(args);
  console.log("[FFMPEG] final video ->", outPath);
  return outPath;
}
