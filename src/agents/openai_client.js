import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("[OPENAI] Missing OPENAI_API_KEY in .env");
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = openaiClient;

const DEFAULT_MODEL = process.env.OPENAI_MODEL_GPT || "gpt-4.1-mini";

function extractJson(text) {
  if (!text) throw new Error("Empty model response");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  const jsonStr = text.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

export async function gptText({ system, user, model = DEFAULT_MODEL }) {
  const sysContent = system != null ? String(system) : "";
  const userContent = user != null ? String(user) : "";

  const resp = await openaiClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: sysContent },
      { role: "user", content: userContent },
    ],
  });

  const content = resp.choices?.[0]?.message?.content;
  return content?.trim() || "";
}

export async function gptJson({ system, user, model = DEFAULT_MODEL, schema }) {
  const sysContent = system != null ? String(system) : "";
  const userContent = user != null ? String(user) : "";

  const resp = await openaiClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: sysContent },
      { role: "user", content: userContent },
    ],
    response_format: schema
      ? {
          type: "json_schema",
          json_schema: {
            name: "schema",
            schema,
            strict: true,
          },
        }
      : { type: "json_object" },
  });

  const raw = resp.choices?.[0]?.message?.content;
  return extractJson(raw);
}
