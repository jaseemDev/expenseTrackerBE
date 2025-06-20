import Budget from "../../models/budgetSchema.js";
import asyncHandler from "express-async-handler";
import Category from "../../models/categoriesSchema.js";
const addBudget = asyncHandler(async (req, res) => {
  try {
    const { userId, categoryId, amount, startDate, endDate } = req.body;
    console.log(req.body);
    if (!userId || !categoryId || !amount || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Parse startDate and endDate to check for overlap
    const start = new Date(startDate);
    const end = new Date(endDate);

    const existingCategory = await Category.findOne({ _id: categoryId });
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const categoryIdFromDb = existingCategory._id;

    // Find if a budget exists for the same user, category, and overlapping date range
    const overlappingBudget = await Budget.findOne({
      user: userId,
      category: existingCategory?._id,
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }, // Overlaps start of the new budget
      ],
    });

    // If an overlapping budget exists, return an error
    if (overlappingBudget) {
      return res.status(400).json({
        message: `A budget already exists for the category '${existingCategory?.name}' in the specified date range.`,
      });
    }

    // Create a new budget
    const budget = new Budget({
      user: userId,
      category: categoryIdFromDb,
      amount,
      startDate,
      endDate,
    });

    // Save the budget to the database
    const savedBudget = await budget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: error.message });
  }
});
export { addBudget };
