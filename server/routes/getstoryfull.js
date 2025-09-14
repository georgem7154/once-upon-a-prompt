import express from "express";
import mongoose from "mongoose";

const storyRouter = express.Router();

storyRouter.get("/getstory/:userId/:storyId", async (req, res) => {
  const { userId, storyId } = req.params;

  try {
    const db = mongoose.connection.useDb(userId);
    const collectionName = `story_${storyId}`;
    const StoryModel = db.model(collectionName, new mongoose.Schema({}, { strict: false }));

    const fullStory = await StoryModel.find().sort({ createdAt: 1 }); // Optional: sort by scene order

    res.json(fullStory);
  } catch (err) {
    console.error("❌ Failed to fetch story:", err);
    res.status(500).json({ error: "Failed to retrieve story." });
  }
});

export default storyRouter;