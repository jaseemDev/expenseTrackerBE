import Expense from "../../models/expenseSchema.js";
import asyncHandler from "express-async-handler";

const getAllExpense = asyncHandler(async (req, res) => {
  try {
    const { category, user } = req.query;

    // Ensure user query parameter is provided
    if (!user) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Build query object dynamically
    const query = { userId: user };
    // Add category to query only if it's valid (not empty)
    if (category && category.trim() !== "") {
      query.category = category;
    }

    // Fetch expenses based on query
    const expenses = await Expense.find(query);

    if (!expenses || expenses.length === 0) {
      if (category && category.trim() !== "") {
        return res
          .status(404)
          .json({ message: "No Expenses found for the specified category" });
      }
      return res.status(404).json({ message: "Expenses not found" });
    }

    // Return the found expenses
    res.status(200).json(expenses);
  } catch (error) {
    // Handle server errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export { getAllExpense };
