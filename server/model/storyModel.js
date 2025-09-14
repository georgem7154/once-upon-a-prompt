import mongoose from "mongoose";

const sceneSchema = new mongoose.Schema({
  sceneKey: String,           // "meta", "scene1", "scene2", etc.
  text: String,               // scene content or title (if sceneKey === "meta")
  image: String,              // base64 image (cover if sceneKey === "meta")
  title: String,              // ✅ story title (only in meta doc)
  cover: String,              // ✅ base64 cover image (only in meta doc)
  genre: String,
  tone: String,
  audience: String,
  styleTags: [String],
  createdAt: { type: Date, default: Date.now }
});

export default function getStoryModel(userId, storyId) {
  const collectionName = `story_${storyId}`;
  return mongoose.connection.useDb(userId).model(collectionName, sceneSchema);
}