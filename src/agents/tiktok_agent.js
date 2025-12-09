import fs from "fs";
import fetch from "node-fetch";

const API_BASE = "https://open.tiktokapis.com";

export async function uploadVideoDraftToTikTok({ accessToken, openId, videoPath }) {
  if (!accessToken || !openId) {
    console.warn("[TIKTOK] missing access token or openId – skipping upload");
    return { ok: false, reason: "missing_credentials" };
  }

  const stats = fs.statSync(videoPath);

  const initResp = await fetch(API_BASE + "/v2/post/publish/inbox/video/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      source_info: {
        source: "FILE_UPLOAD",
        video_size: stats.size,
        chunk_size: stats.size,
        total_chunk_count: 1
      }
    })
  });

  const initJson = await initResp.json();
  if (!initResp.ok) {
    console.error("[TIKTOK] init error", initJson);
    throw new Error("TikTok init upload failed");
  }

  const uploadUrl = initJson.data?.upload_url;
  if (!uploadUrl) throw new Error("Missing upload_url from TikTok");

  const buffer = fs.readFileSync(videoPath);
  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: buffer
  });

  if (!uploadResp.ok) {
    console.error("[TIKTOK] upload error", await uploadResp.text());
    throw new Error("TikTok video upload failed");
  }

  console.log("[TIKTOK] video uploaded to inbox draft");
  return { ok: true };
}
