import express from "express";
import mongoose from "mongoose";

const publicStoryRouter = express.Router();

publicStoryRouter.get("/publicstory/:storyId", async (req, res) => {
  const { storyId } = req.params;

  try {
    const publicDb = mongoose.connection.useDb("public");
    const collectionName = `story_${storyId}`;

    // Check if the collection exists
    const collections = await publicDb.db
      .listCollections({ name: collectionName })
      .toArray();
    if (collections.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    const StoryModel = publicDb.model(
      collectionName,
      new mongoose.Schema({}, { strict: false })
    );
    const scenes = await StoryModel.find();

    res.json(scenes);
  } catch (err) {
    console.error("❌ Error fetching public story:", err);
    res.status(500).json({ error: "Failed to load story" });
  }
});

export default publicStoryRouter;
