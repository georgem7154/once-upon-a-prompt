import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "express-async-errors";

// Local paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config
import { PORT, MONGO_URI } from "./config/env.js"; // Merge env.js and env1.js if needed
import connectDB from "./config/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import storyRouter from "./routes/story.js";
import imageRouter from "./routes/image.js";
import getstoryRouter from "./routes/getstory.js";
import fullsrouter from "./routes/getstoryfull.js";
import exportRouter from "./routes/export.js";
import publishrouter from "./routes/publish.js";
import getpublicrouter from "./routes/getpublic.js";
import publicStoryRouter from "./routes/publicstory.js";

// Middleware
import errorHandlerMiddleware from "./middleware/errorhandlermiddleware.js";

// Initialize app
const app = express();

// Connect DB
connectDB(); // or use mongoose.connect(MONGO_URI) directly

// Middleware
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/user", userRoutes);
app.use("/api", storyRouter);
app.use("/api", imageRouter);
app.use("/api", getstoryRouter);
app.use("/api", fullsrouter);
app.use("/api", exportRouter);
app.use("/api", publishrouter);
app.use("/api", getpublicrouter);
app.use("/api", publicStoryRouter);

// Serve frontend
app.use(express.static(path.join(__dirname, "client", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Error handling
app.use(errorHandlerMiddleware);
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(process.env.PORT || PORT || 6000, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${process.env.PORT || PORT || 5000}`);
});
