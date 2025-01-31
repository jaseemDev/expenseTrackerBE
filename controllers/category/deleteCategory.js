import asyncHandler from "express-async-handler";
import Category from "../../models/categoriesSchema.js";

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    // Get categoryId from request body
    const { categoryId } = req.body;

    // Check if category exists
    const category = await Category.findById(categoryId);

    // If category doesn't exist, return error
    if (!category) {
      res.status(404).json({ message: "Category not found" });
    }

    // Delete category
    await category.deleteOne();

    // Return success message
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    // Handle server errors
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
});
export { deleteCategory };
