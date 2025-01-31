import Category from "../../models/categoriesSchema.js";
import asyncHandler from "express-async-handler";

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Category.find();

    // Check if categories exist
    if (categories.length === 0) {
      res.status(404).json({ message: "No categories found" });
    }

    // Return the found categories
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
export { getAllCategories };
