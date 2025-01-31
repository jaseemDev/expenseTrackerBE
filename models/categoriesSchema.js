import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      required: true,
      trim: true,
    },
    categoryType: {
      type: String,
      required: false,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
