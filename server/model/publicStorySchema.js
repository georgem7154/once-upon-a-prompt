import mongoose from "mongoose";

const sceneSchema = new mongoose.Schema({
  sceneKey: String,
  text: String,
  image: String,
  cover: String,
  title: String,
  genre: String,
  tone: String,
  audience: String,
}, { _id: false });

const publicStorySchema = new mongoose.Schema({
  storyId: { type: String, required: true },
  userId: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  scenes: [sceneSchema],
});

export default publicStorySchema;