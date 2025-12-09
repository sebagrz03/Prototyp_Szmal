import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { runAutopublishOnce } from "./src/agents/orchestrator.js";
import { generateSoraTestClip } from "./src/video/sora_client.js";
import { fetchLiveOrAiTrends } from "./src/agents/trend_agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/dashboard", express.static(path.join(__dirname, "dashboard")));

app.get("/health", (req, res) => {
  res.json({ ok: true, status: "healthy" });
});

app.post("/api/trends/live", async (req, res) => {
  try {
    const niche = req.body?.niche || "ai micro sketches";
    const trends = await fetchLiveOrAiTrends({ niche });
    res.json({ ok: true, niche, trends });
  } catch (err) {
    console.error("[/api/trends/live] error", err);
    res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/video/sora-test", async (req, res) => {
  try {
    const promptText = req.body?.prompt || "A glitchy office where every time the worker blinks, the room changes style.";
    const clip = await generateSoraTestClip({ promptText });
    res.json({ ok: true, clip });
  } catch (err) {
    console.error("[/api/video/sora-test] error", err);
    res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/autopublish/run-once", async (req, res) => {
  try {
    const niche = req.body?.niche || "AI, absurd memes, surreal micro sketches";
    const result = await runAutopublishOnce({ niche });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("[/api/autopublish/run-once] error", err);
    res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`[SERVER] listening on http://localhost:${PORT}`);
});
