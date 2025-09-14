import mongoose from "mongoose";
import { MONGO_URL } from "./env.js";
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
export default connectDB;
