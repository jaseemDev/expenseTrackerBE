import Expense from "../../models/expenseSchema.js";
import asyncHandler from "express-async-handler";
import Budget from "../../models/budgetSchema.js";
const addExpense = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      amount,
      date,
      category,
      description,
      isRecurring,
      recurringInterval,
    } = req.body;

    // Validate the request body
    if (!userId || !amount || !date || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user has a budget
    const budget = await Budget.findOne({ user: userId });
    if (!budget) {
      return res
        .status(404)
        .json({ message: "Budget not found. please set your budget" });
    }

    const newBudget = budget.amount - amount;

    if (newBudget < 0) {
      return res
        .status(400)
        .json({ message: "Insufficient budget. Please increase your budget" });
    }

    budget.amount = newBudget;
    await budget.save();

    // Create a new expense
    const expense = new Expense({
      userId,
      amount,
      date,
      category,
      description,
      isRecurring,
      recurringInterval,
    });
    const savedExpense = await expense.save();
    res.status(201).json({
      data: savedExpense,
      message: "New expense added and budget updated suuccessfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
export { addExpense };
