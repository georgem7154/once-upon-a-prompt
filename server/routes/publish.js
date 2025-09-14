import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.post("/publishstory/:userId/:storyId", async (req, res) => {
  const { userId, storyId } = req.params;

  try {
    // 🔹 Connect to user's DB and fetch story
    const userDb = mongoose.connection.useDb(userId);
    const StoryModel = userDb.model(`story_${storyId}`, new mongoose.Schema({}, { strict: false }));
    const scenes = await StoryModel.find();

    if (!scenes || scenes.length === 0) {
      return res.status(404).json({ error: "Story not found or empty" });
    }

    // 🔹 Connect to shared public DB
    const publicDb = mongoose.connection.useDb("public");

    // 🔹 Check if story already published
    const existingCollections = await publicDb.db.listCollections({ name: `story_${storyId}` }).toArray();
    if (existingCollections.length > 0) {
      return res.status(409).json({ error: "Story already published" });
    }

    // 🔹 Create a new collection for this story
    const PublicStoryModel = publicDb.model(`story_${storyId}`, new mongoose.Schema({}, { strict: false }));
    await PublicStoryModel.insertMany(scenes);

    // 🔹 Optionally log metadata in a central index
    const IndexModel = publicDb.model("published_index", new mongoose.Schema({}, { strict: false }));
    const meta = scenes.find(s => s.sceneKey === "meta");

    await IndexModel.updateOne(
      { storyId },
      {
        $set: {
          storyId,
          userId,
          title: meta?.title || storyId,
          genre: meta?.genre || null,
          tone: meta?.tone || null,
          audience: meta?.audience || null,
          cover: meta?.cover || null,
          publishedAt: new Date(),
        }
      },
      { upsert: true }
    );

    res.json({ message: "✅ Story published to its own collection in public DB" });
  } catch (err) {
    console.error("❌ Error publishing story:", err);
    res.status(500).json({ error: "Failed to publish story" });
  }
});

export default router;