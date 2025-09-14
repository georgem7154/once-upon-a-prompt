import express from "express";
import { generateStructuredStory } from "./storyGen.js"; // adjust path if needed
import { isCleanPrompt } from "../utils/moderation.js";

const storyRouter = express.Router();

storyRouter.post("/genstory", async (req, res) => {
  const { prompt, genre, tone, audience } = req.body;

  try {
    if (!isCleanPrompt(prompt)) {
      return res.status(400).json({
        error: "Prompt contains harmful or inappropriate content.",
        suggestion: "Try a safer, more creative prompt.",
      });
    }
  } catch (error) {
    console.error("❌ Error in request body:", error);
    return res.status(400).json({ error: "Invalid request body." });
  }
  try {
    const story = await generateStructuredStory({
      prompt,
      genre,
      tone,
      audience,
    });
    res.json(story);
  } catch (err) {
    console.error(" Gemini API error:", err);
    res.status(500).json({ error: "Story generation failed." });
  }
});

export default storyRouter;
