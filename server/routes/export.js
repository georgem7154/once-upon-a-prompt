import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import os from "os";

const exportRouter = express.Router();

exportRouter.post("/export/:type", async (req, res) => {
  const { userId, storyId } = req.body;
  const { type } = req.params;

  if (!userId || !storyId) {
    return res.status(400).json({ error: "Missing userId or storyId" });
  }

  try {
    const db = mongoose.connection.useDb(userId);
    const collectionName = `story_${storyId}`;
    const StoryModel = db.model(collectionName, new mongoose.Schema({}, { strict: false }));

    const scenes = await StoryModel.find({ sceneKey: { $ne: "meta" } }).sort({ createdAt: 1 });

    const downloadsDir = path.join(os.homedir(), "Downloads");

    if (type === "pdf") {
      const pdfPath = path.join(downloadsDir, `${storyId}.pdf`);
      fs.writeFileSync(pdfPath, `PDF for ${storyId}\n\n` + scenes.map(s => s.text).join("\n\n"));
      return res.json({ message: "PDF saved to Downloads", path: pdfPath });
    }

    if (type === "storybook") {
      const bookPath = path.join(downloadsDir, `${storyId}_storybook.txt`);
      fs.writeFileSync(bookPath, `Storybook for ${storyId}\n\n` + scenes.map(s => s.text).join("\n\n"));
      return res.json({ message: "Storybook saved to Downloads", path: bookPath });
    }

    return res.status(400).json({ error: "Unsupported export type" });
  } catch (err) {
    console.error("❌ Export failed:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

export default exportRouter;