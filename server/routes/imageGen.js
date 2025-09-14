import { GoogleGenAI } from "@google/genai";
import { GOOG } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: GOOG });

export async function generateImage(
  prompt,
  { userId = "user", storyId = "story", sceneKey = "scene" }
) {
  console.log(GOOG)
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: prompt,
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      return imageData;
    }
  }

  throw new Error("No image returned from Gemini");
}
