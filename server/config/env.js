import { config } from "dotenv";
config(); // Loads from .env by default

export const {
  GOOG1,
  GOOG,
  MONGO_URI,
  PORT,
  MONGO_URL,
  POLYGON1,
  POLYGON2,
  ALPACA_SECRET,
  ALPACA,
  JWT_SECRET,
  expiresIn,
  NODE_ENV,
  HF_TOKEN,
} = process.env;
