import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  Date: String,
  Price: Number,
  Year: Number,
});

export default mongoose.model("StockPrices", StockSchema, "StockPrices");
