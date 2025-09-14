import express from "express";
import mongoose from "mongoose";

const getpublicrouter = express.Router();

getpublicrouter.get("/publicstories", async (req, res) => {
  try {
    const publicDb = mongoose.connection.useDb("public");

    // 🔍 List all collections that start with "story_"
    const collections = await publicDb.db.listCollections().toArray();
    const storyCollections = collections
      .filter(col => col.name.startsWith("story_"))
      .map(col => col.name);

    const results = [];

    for (const collectionName of storyCollections) {
      const StoryModel = publicDb.model(collectionName, new mongoose.Schema({}, { strict: false }));

      // 🧠 Find the meta scene
      const meta = await StoryModel.findOne({ sceneKey: "meta" });
      if (!meta) continue;

      results.push({
        storyId: collectionName.replace("story_", ""),
        title: meta.title || collectionName,
        genre: meta.genre || null,
        tone: meta.tone || null,
        audience: meta.audience || null,
        cover: meta.cover || null,
        publishedAt: meta.createdAt || null,
      });
    }

    // 🧹 Sort by publish date (newest first)
    results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching public stories:", err);
    res.status(500).json({ error: "Failed to load public stories" });
  }
});

export default getpublicrouter;