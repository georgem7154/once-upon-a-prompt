import mongoose from "mongoose";

const SearchSchema = new mongoose.Schema({
  Symbol: String,
  Name: String,
});

export default mongoose.model("StockSearch", SearchSchema, "StockSearch");
