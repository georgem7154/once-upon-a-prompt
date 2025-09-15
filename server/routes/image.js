import express from "express";
import { isCleanPrompt } from "../utils/moderation.js";
import { generateImage } from "./imageGen.js";
// REMOVED: The database import is no longer needed.
// import { saveStoryToDB } from "../config/db1.js";

const imageRouter = express.Router();

imageRouter.post("/genimg", async (req, res) => {
  console.log("📥 Received streaming /genimg request");

  // 1. Set Headers for Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Send headers to the client immediately

  const { userId, storyId, genre, tone, audience, story } = req.body;

  // 2. Perform Validations
  const requiredFields = [userId, storyId, genre, tone, audience, story?.title];
  if (requiredFields.some((f) => !f || typeof f !== "string") || !story) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: "Missing or invalid fields." })}\n\n`);
    return res.end();
  }
  
  const sceneKeys = Object.keys(story).filter((key) => key.startsWith("scene")).sort();
  if (sceneKeys.length === 0) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: "No scenes found in story." })}\n\n`);
    return res.end();
  }

  const combinedText = Object.values(story).filter((v) => typeof v === "string").join(" ");
  if (!isCleanPrompt(combinedText)) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: "Story contains harmful content." })}\n\n`);
    return res.end();
  }

  console.log("✅ Validation passed, starting stream...");

  // 3. Generate and Stream Cover Image
  try {
    const coverPrompt = `Create a cinematic cover illustration for a ${genre} story titled "${story.title}". Tone: ${tone}. Summary: ${combinedText.slice(0, 300)}...`;
    
    console.log("🎨 Generating cover image...");
    const coverImage = await generateImage(coverPrompt, { userId, storyId, sceneKey: "cover" });
    console.log("✅ Cover image generated");
    
    // REMOVED: The call to saveStoryToDB is gone.

    // Immediately write the cover data to the stream
    res.write(`event: cover\ndata: ${JSON.stringify({ title: story.title, image: coverImage })}\n\n`);
  } catch (err) {
    console.error("❌ Failed to generate cover image:", err.message);
    res.write(`event: error\ndata: ${JSON.stringify({ key: "cover", error: err.message })}\n\n`);
  }

  // 4. Generate and Stream Scene Images Sequentially
  for (const sceneKey of sceneKeys) {
    const sceneText = story[sceneKey];
    try {
      const scenePrompt = `Create an illustration for a scene in a ${genre} story. Tone: ${tone}. Scene: ${sceneText}`;
      
      console.log(`🎨 Generating image for ${sceneKey}...`);
      const sceneImage = await generateImage(scenePrompt, { userId, storyId, sceneKey });
      console.log(`✅ Image generated for ${sceneKey}`);

      // REMOVED: The call to saveStoryToDB is gone.

      // Immediately write the scene data to the stream
      res.write(`event: scene\ndata: ${JSON.stringify({ key: sceneKey, text: sceneText, image: sceneImage })}\n\n`);
    } catch (err) {
      console.error(`❌ Failed to generate image for ${sceneKey}:`, err.message);
      res.write(`event: error\ndata: ${JSON.stringify({ key: sceneKey, error: err.message })}\n\n`);
    }
  }

  // 5. Signal the End of the Stream and Close the Connection
  console.log("🚀 All processing finished, sending done event.");
  res.write(`event: done\ndata: ${JSON.stringify({ message: "All scenes processed." })}\n\n`);
  res.end();
});

export default imageRouter;