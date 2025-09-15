import express from "express";
import fetch from "node-fetch";
import { Client } from "@gradio/client";
import util from 'util';

const hugRouter = express.Router();

let gradioClient = null;

function sanitizePrompt(text) {
  const bannedWords = ["kill", "blood", "naked", "curse", "violence"];
  let cleanText = text;
  bannedWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleanText = cleanText.replace(regex, "[redacted]");
  });
  return cleanText;
}

/**
 * Generates a high-quality image.
 * @param {string} prompt - The text prompt for the image.
 * @param {number} seed - The seed for consistent image generation.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded image.
 */
async function generateImage(prompt, seed) {
  if (!gradioClient) {
    console.log("Connecting to Gradio client 'tencent/HunyuanImage-2.1'...");
    gradioClient = await Client.connect("tencent/HunyuanImage-2.1");
    console.log("✅ Gradio client connected.");
  }

  try {
    // --- Generate the Image ---
    console.log(`🎨 Generating image for prompt: "${prompt.slice(0, 50)}..."`);
    const result = await gradioClient.predict("/generate_image", {
      prompt: prompt,
      negative_prompt: "ugly, deformed, noisy, blurry, low contrast, text, signature, watermark, username, logo, worst quality, low quality, bad anatomy, bad hands, extra fingers",
      width: 1024,
      height: 1024,
      num_inference_steps: 25,
      guidance_scale: 3.5,
      seed: seed,
      use_reprompt: false,
      use_refiner: false,
    });

    const imageUrl = result.data?.[0]?.url;
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error("API did not return a valid base image URL:", util.inspect(result, { depth: null }));
      throw new Error("API did not return a valid base image URL.");
    }
    
    // --- Fetch the Image ---
    console.log("📥 Fetching generated image...");
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    console.log("👍 Image fetched successfully.");
    return Buffer.from(arrayBuffer).toString("base64");

  } catch (err) {
    console.error("Error during the image generation process:", err);
    throw err;
  }
}

async function generateImageWithRetry(prompt, seed, retries = 2) {
  const safePrompt = sanitizePrompt(prompt);
  for (let i = 0; i <= retries; i++) {
    try {
      return await generateImage(safePrompt, seed);
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, util.inspect(err, {depth: 1}));
      if (i === retries) {
        throw new Error(`Image generation failed after ${retries + 1} attempts.`);
      }
    }
  }
}

// The saveStoryToDB function has been removed.

hugRouter.post("/genimghug/stream", async (req, res) => {
  const payload = req.body;

  res.setHeader("Content-Type", "text-event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!payload) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: "No payload received in POST request." })}\n\n`);
    return res.end();
  }

  const { userId, storyId, genre, tone, audience, story } = payload;
  
  const requiredFields = [userId, storyId, genre, tone, audience, story?.title];
  if (requiredFields.some((f) => typeof f !== "string" || !f.trim()) || typeof story !== "object") {
    res.write(`event: error\ndata: ${JSON.stringify({ error: "Missing or invalid fields in the payload." })}\n\n`);
    return res.end();
  }

  const sceneKeys = Object.keys(story).filter((key) => key.startsWith("scene")).sort();
  if (sceneKeys.length === 0) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: "No scenes found in the story." })}\n\n`);
    return res.end();
  }
  
  const storySeed = Math.floor(Math.random() * 1_000_000_000);
  console.log(`🌱 Using consistent seed for this story: ${storySeed}`);

  try {
    const coverPrompt = `masterpiece book cover, best quality, award-winning digital painting, cinematic, for a ${genre} story titled "${story.title}". Tone: ${tone}.`;
    const coverImage = await generateImageWithRetry(coverPrompt, storySeed);
    // The saveStoryToDB call has been removed.
    res.write(`event: cover\ndata: ${JSON.stringify({ title: story.title, image: coverImage })}\n\n`);
  } catch (err) {
    console.error("❌ Failed to generate cover image:", err.message);
    res.write(`event: error\ndata: ${JSON.stringify({ key: "cover", error: err.message })}\n\n`);
  }

  for (const sceneKey of sceneKeys) {
    const sceneText = story[sceneKey];
    try {
      const scenePrompt = `masterpiece illustration, best quality, cinematic lighting, detailed, for a ${genre} story. Scene: ${sceneText}.`;
      const sceneImage = await generateImageWithRetry(scenePrompt, storySeed);
      // The saveStoryToDB call has been removed.
      res.write(`event: scene\ndata: ${JSON.stringify({ key: sceneKey, text: sceneText, image: sceneImage })}\n\n`);
    } catch (err) {
      console.error(`❌ Failed to generate image for ${sceneKey}:`, err.message);
      res.write(`event: error\ndata: ${JSON.stringify({ key: sceneKey, error: err.message })}\n\n`);
    }
  }

  res.write(`event: done\ndata: ${JSON.stringify({ message: "All scenes processed." })}\n\n`);
  res.end();
});

export default hugRouter;