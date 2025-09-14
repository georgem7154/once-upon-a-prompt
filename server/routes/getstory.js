import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/getfullstory/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userDb = mongoose.connection.useDb(userId);
    const collections = await userDb.db.listCollections().toArray();

    const storySummaries = [];

    for (const col of collections) {
      const collectionName = col.name;
      if (!collectionName.startsWith("story_")) continue;

      const storyId = collectionName.replace("story_", ""); // ✅ Extract storyId
      const StoryModel = userDb.model(collectionName, new mongoose.Schema({}, { strict: false }));
      const metaDoc = await StoryModel.findOne({ sceneKey: "meta" });

      if (metaDoc) {
        storySummaries.push({
          storyId, // ✅ Include storyId for frontend routing
          title: metaDoc.title || storyId.replace(/_/g, " "),
          cover: metaDoc.cover || null,
          genre: metaDoc.genre || "unknown",
          tone: metaDoc.tone || "unknown",
          audience: metaDoc.audience || "unknown"
        });
      }
    }

    res.json(storySummaries);
  } catch (err) {
    console.error("❌ Failed to fetch stories:", err);
    res.status(500).json({ error: "Failed to retrieve stories." });
  }
});

export default router;