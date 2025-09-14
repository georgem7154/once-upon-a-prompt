import mongoose, { Mongoose } from "mongoose";
const UsdPriceSchema = new mongoose.Schema(
  {
    price: Number,
  },
  { timestamps: true }
);

export default mongoose.model("UsdToInr", UsdPriceSchema);
