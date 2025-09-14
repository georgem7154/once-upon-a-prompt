import getStoryModel from "../model/storyModel.js";

export async function saveStoryToDB(
  userId,
  storyId,
  storyJson,
  imageMap,
  genre,
  tone,
  audience
) {
  const Story = getStoryModel(userId, storyId);

  const { title, cover, ...scenes } = storyJson;

  const metaEntry = {
    sceneKey: "meta",
    title,
    cover: imageMap["cover"] || null,
    genre,
    tone,
    audience,
    createdAt: new Date(),
  };

  const sceneEntries = Object.entries(scenes).map(([key, text]) => ({
    sceneKey: key,
    text,
    image: imageMap[key] || null,
    genre,
    tone,
    audience,
    createdAt: new Date(),
  }));

  await Story.insertMany([metaEntry, ...sceneEntries]);
}
