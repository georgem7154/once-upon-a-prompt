import express from "express";
import { isCleanPrompt } from "../utils/moderation.js";
import { generateImage } from "./imageGen.js";
import { saveStoryToDB } from "../config/db1.js";

const imageRouter = express.Router();

imageRouter.post("/genimg", async (req, res) => {
  console.log("📥 Received /genimg request");

  const { userId, storyId, genre, tone, audience, story } = req.body;
  console.log("🔍 Extracted payload:", {
    userId,
    storyId,
    genre,
    tone,
    audience,
    title: story?.title,
  });

  // ✅ Validate required fields
  const requiredFields = [userId, storyId, genre, tone, audience, story?.title];
  const hasMissingValues = requiredFields.some(
    (field) => typeof field !== "string" || !field.trim()
  );

  if (hasMissingValues || typeof story !== "object") {
    console.warn("⚠️ Missing or invalid fields");
    return res.status(400).json({
      error: "One or more required fields are missing or invalid.",
    });
  }

  // ✅ Validate scenes
  const sceneKeys = Object.keys(story).filter((key) => key.startsWith("scene"));
  console.log("🧩 Found scene keys:", sceneKeys);

  if (sceneKeys.length === 0) {
    console.warn("⚠️ No scenes found in story");
    return res.status(400).json({ error: "No scenes found in story." });
  }

  for (const key of sceneKeys) {
    const text = story[key];
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      console.warn(`⚠️ Scene "${key}" is too short or missing`);
      return res.status(400).json({
        error: `Scene "${key}" is too short or missing.`,
      });
    }
  }

  // 🧪 Moderation check
  const combinedText = Object.values(story)
    .filter((v) => typeof v === "string")
    .join(" ");
  console.log(
    "🧪 Combined story text for moderation:",
    combinedText.slice(0, 200) + "..."
  );

  if (!isCleanPrompt(combinedText)) {
    console.warn("🚫 Moderation failed");
    return res.status(400).json({
      error: "Story contains harmful or inappropriate content.",
    });
  }

  console.log("✅ Moderation passed");

  const response = {
    title: story.title,
    cover: null,
  };

  // 🎨 Generate and save cover image
  try {
    const coverPrompt = `
      Create a cinematic cover illustration of size 512x512 for a ${genre} story.
      Tone: ${tone}. Audience: ${audience}.
      Title: ${story.title}
      Summary: ${combinedText.slice(0, 300)}...
    `.trim();

    console.log("🎨 Generating cover image...");
    const coverImage = await generateImage(coverPrompt, {
      userId,
      storyId,
      sceneKey: "cover",
    });
    console.log("✅ Cover image generated");

    await saveStoryToDB(
      userId,
      storyId,
      { title: story.title },
      { cover: coverImage },
      genre,
      tone,
      audience
    );
    console.log("💾 Meta entry saved");

    response.cover = { image: coverImage };
  } catch (err) {
    console.error("❌ Failed to generate or save cover image:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate or save cover image." });
  }

  // 🎨 Generate and save each scene image one-by-one
  for (const sceneKey of sceneKeys) {
    const sceneText = story[sceneKey];
    try {
      const scenePrompt = `
        Create an illustration for the following scene in a ${genre} story.
        Tone: ${tone}. Audience: ${audience}.
        Scene: ${sceneText}
      `.trim();

      console.log(`🎨 Generating image for ${sceneKey}...`);
      const sceneImage = await generateImage(scenePrompt, {
        userId,
        storyId,
        sceneKey,
      });
      console.log(`✅ Image generated for ${sceneKey}`);

      await saveStoryToDB(
        userId,
        storyId,
        { [sceneKey]: sceneText },
        { [sceneKey]: sceneImage },
        genre,
        tone,
        audience
      );
      console.log(`💾 Scene ${sceneKey} saved`);

      response[sceneKey] = {
        text: sceneText,
        image: sceneImage,
      };
    } catch (err) {
      console.error(`❌ Failed to generate or save ${sceneKey}:`, err);
      response[sceneKey] = {
        text: sceneText,
        error: "Failed to generate or save image.",
      };
    }
  }

  console.log("🚀 Sending final response");
  res.json(response);
});

export default imageRouter;
