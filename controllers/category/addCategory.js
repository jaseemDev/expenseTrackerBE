import asyncHandler from "express-async-handler";
import Category from "../../models/categoriesSchema.js";

const addCategory = asyncHandler(async (req, res) => {
  try {
    // Extract category details from the request body
    const { categoryname, categoryType } = req.body;

    // Check if the category already exists
    const isCategoryExists = await Category.findOne({ categoryname });

    // Check if the category already exists
    if (isCategoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create a new category
    const newCategory = await Category.create({
      categoryname,
      categoryType,
    });

    // Return the newly created category in response
    res
      .status(201)
      .json({ message: "Category created successfully", data: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
export { addCategory };
