import { GoogleGenAI } from "@google/genai";
import { GOOG } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: GOOG });

export async function generateStructuredStory({
  prompt,
  genre,
  tone,
  audience,
}) {
  const systemPrompt = `
You are a cinematic story formatter. Break the story into 4–5 distinct scenes.
Each scene must be 30–75 words max.

Expand the story into a multi-part narrative, typically:
• Introduction / Setting
• Conflict / Rising Action
• Climax
• Resolution

Respond ONLY as a **valid JSON object** with the following keys:
"title", "scene1", "scene2", "scene3", "scene4", "scene5"

Each scene must be a **single string**, not an object. Do NOT use nested keys like "setting" or "action".

Use the following context:
Genre: ${genre}
Tone: ${tone}
Audience: ${audience}
Prompt: ${prompt}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
  });

  let rawText = response.text.trim();

  // ✅ Strip Markdown formatting if present
  if (rawText.startsWith("```json")) {
    rawText = rawText
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
  }

  try {
    const storyJson = JSON.parse(rawText);
    return storyJson;
  } catch (err) {
    console.error("❌ Failed to parse Gemini response:", rawText);
    throw new Error("Invalid story format from Gemini");
  }
}
