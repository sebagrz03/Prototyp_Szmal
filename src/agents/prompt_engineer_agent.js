export function buildSoraPromptForScene(scene, globalStyle) {
  const baseStyle =
    globalStyle ||
    `hyper-detailed, surreal micro-sketch, high contrast lighting,
cinematic camera, smooth handheld movement, subtle RGB glitch, VHS grain, 9:16 vertical frame,
TikTok-ready composition, soft neon accents, stylized but not cartoonish`;

  return `Shot ${scene.id} – ${scene.label || ""}
${scene.video_prompt}

Visual style: ${baseStyle}.
Camera: fast but readable cuts, light motion blur, occasional digital glitch / compression artifact.
Keep character and environment consistent with previous shots.`;
}
